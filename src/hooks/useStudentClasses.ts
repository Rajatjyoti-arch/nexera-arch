import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

// Types for class data
export interface ClassSchedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface AttendanceStats {
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  percentage: number;
}

export interface EnrolledClass {
  id: string;
  name: string;
  courseName: string;
  courseCode: string;
  room: string | null;
  facultyName: string;
  schedules: ClassSchedule[];
  attendancePercentage: number | null;
  attendanceStats: AttendanceStats | null;
  status: 'completed' | 'live' | 'upcoming' | 'not-today';
}

export type ClassFilter = 'all' | 'today' | 'upcoming' | 'completed';

// Day order for sorting
const DAY_ORDER: Record<string, number> = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 7,
};

// Helper to get current day of week
function getCurrentDayOfWeek(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

// Helper to parse time string (HH:MM:SS) and compare with current time
export function getClassStatus(startTime: string, endTime: string, dayOfWeek: string): 'completed' | 'live' | 'upcoming' | 'not-today' {
  const currentDay = getCurrentDayOfWeek();
  
  // If not today, determine if it's a future or past day this week
  if (dayOfWeek !== currentDay) {
    const todayOrder = DAY_ORDER[currentDay];
    const classOrder = DAY_ORDER[dayOfWeek];
    
    // If class day is after today, it's upcoming
    if (classOrder > todayOrder) return 'upcoming';
    // If class day is before today, it's completed for this week
    return 'completed';
  }
  
  // Today's class - check time
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  if (currentMinutes < startMinutes) return 'upcoming';
  if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return 'live';
  return 'completed';
}

// Helper to format time for display (12-hour format)
export function formatTimeForDisplay(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Format schedule days for display
export function formatScheduleDays(schedules: ClassSchedule[]): string {
  const days = schedules.map(s => s.dayOfWeek.slice(0, 3));
  return days.join(', ');
}

// Get the next/current schedule for status calculation
function getRelevantSchedule(schedules: ClassSchedule[]): { schedule: ClassSchedule; status: 'completed' | 'live' | 'upcoming' | 'not-today' } | null {
  if (schedules.length === 0) return null;
  
  const currentDay = getCurrentDayOfWeek();
  
  // First, check if there's a schedule for today
  const todaySchedule = schedules.find(s => s.dayOfWeek === currentDay);
  if (todaySchedule) {
    return {
      schedule: todaySchedule,
      status: getClassStatus(todaySchedule.startTime, todaySchedule.endTime, todaySchedule.dayOfWeek)
    };
  }
  
  // Find next upcoming day
  const todayOrder = DAY_ORDER[currentDay];
  const sortedSchedules = [...schedules].sort((a, b) => {
    const aOrder = DAY_ORDER[a.dayOfWeek];
    const bOrder = DAY_ORDER[b.dayOfWeek];
    return aOrder - bOrder;
  });
  
  // Find the next schedule after today
  const nextSchedule = sortedSchedules.find(s => DAY_ORDER[s.dayOfWeek] > todayOrder);
  if (nextSchedule) {
    return {
      schedule: nextSchedule,
      status: 'upcoming'
    };
  }
  
  // All schedules are earlier in the week, return the first one as completed
  return {
    schedule: sortedSchedules[0],
    status: 'completed'
  };
}

// Calculate attendance stats from records
function calculateAttendanceStats(records: { status: string }[]): AttendanceStats | null {
  if (!records || records.length === 0) return null;
  
  const stats: AttendanceStats = {
    totalClasses: records.length,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    percentage: 0
  };
  
  for (const record of records) {
    switch (record.status) {
      case 'present':
        stats.presentCount++;
        break;
      case 'absent':
        stats.absentCount++;
        break;
      case 'late':
        stats.lateCount++;
        break;
      case 'excused':
        stats.excusedCount++;
        break;
    }
  }
  
  // Calculate percentage (present + late + excused count as attended)
  const attendedCount = stats.presentCount + stats.lateCount + stats.excusedCount;
  stats.percentage = Math.round((attendedCount / stats.totalClasses) * 100);
  
  return stats;
}

// Main hook for student classes
export function useStudentClasses() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute to refresh class statuses
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return useQuery({
    queryKey: ['studentClasses', user?.id, currentTime.getMinutes()],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      // Fetch enrolled classes with all related data
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select(`
          id,
          class_id,
          classes (
            id,
            name,
            room,
            faculty_id,
            course_id,
            courses (
              id,
              name,
              code
            ),
            class_schedules (
              id,
              day_of_week,
              start_time,
              end_time
            )
          )
        `)
        .eq('student_id', user.id);
      
      if (enrollmentsError) throw enrollmentsError;
      if (!enrollments || enrollments.length === 0) {
        return { classes: [], currentDay: getCurrentDayOfWeek() };
      }
      
      // Collect unique faculty IDs and class IDs
      const facultyIds: string[] = [];
      const classIds: string[] = [];
      for (const enrollment of enrollments) {
        const classData = enrollment.classes as any;
        if (classData?.faculty_id) {
          facultyIds.push(classData.faculty_id);
        }
        if (classData?.id) {
          classIds.push(classData.id);
        }
      }
      
      // Fetch faculty names and attendance data in parallel
      const [facultyResult, attendanceResult] = await Promise.all([
        facultyIds.length > 0 
          ? supabase
              .from('faculty_profiles')
              .select('user_id, name')
              .in('user_id', [...new Set(facultyIds)])
          : Promise.resolve({ data: [] }),
        classIds.length > 0
          ? supabase
              .from('attendance')
              .select('class_id, status')
              .eq('student_id', user.id)
              .in('class_id', classIds)
          : Promise.resolve({ data: [] })
      ]);
      
      const facultyMap = new Map((facultyResult.data || []).map(f => [f.user_id, f.name]));
      
      // Group attendance by class_id
      const attendanceByClass = new Map<string, { status: string }[]>();
      for (const record of (attendanceResult.data || [])) {
        const existing = attendanceByClass.get(record.class_id) || [];
        existing.push({ status: record.status });
        attendanceByClass.set(record.class_id, existing);
      }
      
      // Transform data
      const classes: EnrolledClass[] = enrollments.map(enrollment => {
        const classData = enrollment.classes as any;
        const courseData = classData?.courses as any;
        const scheduleData = classData?.class_schedules || [];
        const classId = classData?.id || enrollment.class_id;
        
        // Build schedules array
        const schedules: ClassSchedule[] = scheduleData.map((s: any) => ({
          dayOfWeek: s.day_of_week,
          startTime: s.start_time,
          endTime: s.end_time,
        }));
        
        // Get relevant schedule and status
        const relevantInfo = getRelevantSchedule(schedules);
        
        // Calculate attendance
        const attendanceRecords = attendanceByClass.get(classId);
        const attendanceStats = calculateAttendanceStats(attendanceRecords || []);
        
        return {
          id: classId,
          name: classData?.name || 'Unknown Class',
          courseName: courseData?.name || 'Unknown Course',
          courseCode: courseData?.code || 'N/A',
          room: classData?.room,
          facultyName: facultyMap.get(classData?.faculty_id) || 'Unknown Faculty',
          schedules,
          attendancePercentage: attendanceStats?.percentage ?? null,
          attendanceStats,
          status: relevantInfo?.status || 'not-today',
        };
      });
      
      // Sort classes by day of week, then by start time
      classes.sort((a, b) => {
        const aSchedule = a.schedules[0];
        const bSchedule = b.schedules[0];
        
        if (!aSchedule && !bSchedule) return 0;
        if (!aSchedule) return 1;
        if (!bSchedule) return -1;
        
        const aDayOrder = DAY_ORDER[aSchedule.dayOfWeek] || 8;
        const bDayOrder = DAY_ORDER[bSchedule.dayOfWeek] || 8;
        
        if (aDayOrder !== bDayOrder) return aDayOrder - bDayOrder;
        
        // Same day, sort by start time
        const [aH, aM] = aSchedule.startTime.split(':').map(Number);
        const [bH, bM] = bSchedule.startTime.split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });
      
      return { 
        classes, 
        currentDay: getCurrentDayOfWeek() 
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute - shorter for status updates
    refetchInterval: 1000 * 60, // Refetch every minute for live status
  });
}

// Filter helper
export function filterClasses(classes: EnrolledClass[], filter: ClassFilter, currentDay: string): EnrolledClass[] {
  switch (filter) {
    case 'today':
      return classes.filter(c => 
        c.schedules.some(s => s.dayOfWeek === currentDay)
      );
    case 'upcoming':
      return classes.filter(c => c.status === 'upcoming' || c.status === 'live');
    case 'completed':
      return classes.filter(c => c.status === 'completed');
    case 'all':
    default:
      return classes;
  }
}

// Hook to get attendance summary for dashboard
export function useStudentAttendanceSummary() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['studentAttendanceSummary', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', user.id);
      
      if (error) throw error;
      
      const stats = calculateAttendanceStats(data || []);
      return stats;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}