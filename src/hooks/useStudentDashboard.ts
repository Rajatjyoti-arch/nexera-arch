import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types for dashboard data
export interface TodayClass {
  id: string;
  name: string;
  room: string | null;
  facultyName: string;
  startTime: string;
  endTime: string;
  status: 'completed' | 'live' | 'upcoming';
}

export interface DashboardStats {
  totalClasses: number;
  todaysClasses: number;
  unreadMessages: number;
  unreadNotices: number;
  attendancePercentage: number | null;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

// Helper to get current day of week
function getCurrentDayOfWeek(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

// Helper to parse time string (HH:MM:SS) and compare with current time
function getClassStatus(startTime: string, endTime: string): 'completed' | 'live' | 'upcoming' {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Parse time strings (format: "HH:MM:SS" or "HH:MM")
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  if (currentMinutes < startMinutes) return 'upcoming';
  if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return 'live';
  return 'completed';
}

// Helper to format time for display (12-hour format)
function formatTimeForDisplay(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Main dashboard data hook
export function useStudentDashboard() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['studentDashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const currentDay = getCurrentDayOfWeek();
      
      // Fetch all dashboard data in parallel
      const [
        enrollmentsRes,
        noticesRes,
        noticeReadsRes,
        chatParticipantsRes,
        profileRes,
        attendanceRes,
      ] = await Promise.all([
        // Get enrolled classes with schedules and faculty info
        supabase
          .from('student_enrollments')
          .select(`
            id,
            class_id,
            classes (
              id,
              name,
              room,
              faculty_id,
              class_schedules (
                id,
                day_of_week,
                start_time,
                end_time
              )
            )
          `)
          .eq('student_id', user.id),
        
        // Get active notices
        supabase
          .from('notices')
          .select('id, title, content, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Get notice read states for current user
        supabase
          .from('notice_reads')
          .select('notice_id')
          .eq('user_id', user.id),
        
        // Get chat participations for unread count
        supabase
          .from('chat_participants')
          .select('id, chat_id, last_read_at')
          .eq('user_id', user.id),
        
        // Get student profile for department/course info
        supabase
          .from('student_profiles')
          .select('college, course, semester, year')
          .eq('user_id', user.id)
          .maybeSingle(),
        
        // Get attendance records for overall percentage
        supabase
          .from('attendance')
          .select('status')
          .eq('student_id', user.id),
      ]);
      
      // Process enrollments to get class data
      const enrollments = enrollmentsRes.data || [];
      const totalClasses = enrollments.length;
      
      // Extract today's classes with schedules
      const todaysClasses: TodayClass[] = [];
      const facultyIds: string[] = [];
      
      for (const enrollment of enrollments) {
        const classData = enrollment.classes as any;
        if (!classData) continue;
        
        const schedules = classData.class_schedules || [];
        const todaySchedule = schedules.find((s: any) => s.day_of_week === currentDay);
        
        if (todaySchedule) {
          facultyIds.push(classData.faculty_id);
          todaysClasses.push({
            id: classData.id,
            name: classData.name,
            room: classData.room,
            facultyName: '', // Will be populated after faculty fetch
            startTime: todaySchedule.start_time,
            endTime: todaySchedule.end_time,
            status: getClassStatus(todaySchedule.start_time, todaySchedule.end_time),
          });
        }
      }
      
      // Fetch faculty names for today's classes
      if (facultyIds.length > 0) {
        const { data: facultyData } = await supabase
          .from('faculty_profiles')
          .select('user_id, name')
          .in('user_id', facultyIds);
        
        const facultyMap = new Map((facultyData || []).map(f => [f.user_id, f.name]));
        
        // Map faculty names back to classes
        let facultyIndex = 0;
        for (const enrollment of enrollments) {
          const classData = enrollment.classes as any;
          if (!classData) continue;
          
          const schedules = classData.class_schedules || [];
          const todaySchedule = schedules.find((s: any) => s.day_of_week === currentDay);
          
          if (todaySchedule && todaysClasses[facultyIndex]) {
            todaysClasses[facultyIndex].facultyName = 
              facultyMap.get(classData.faculty_id) || 'Unknown Faculty';
            facultyIndex++;
          }
        }
      }
      
      // Sort today's classes by start time
      todaysClasses.sort((a, b) => {
        const [aH, aM] = a.startTime.split(':').map(Number);
        const [bH, bM] = b.startTime.split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });
      
      // Process notice read states
      const readNoticeIds = new Set((noticeReadsRes.data || []).map(r => r.notice_id));
      
      // Process notices with read state
      const notices: Notice[] = (noticesRes.data || []).map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        createdAt: n.created_at,
        isRead: readNoticeIds.has(n.id),
      }));
      
      // Count unread notices
      const unreadNotices = notices.filter(n => !n.isRead).length;
      
      // Count unread messages accurately
      let unreadMessages = 0;
      const chatParticipants = chatParticipantsRes.data || [];
      
      if (chatParticipants.length > 0) {
        // For each chat, count messages after last_read_at (not from current user)
        for (const participant of chatParticipants) {
          let query = supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', participant.chat_id)
            .neq('sender_id', user.id);
          
          if (participant.last_read_at) {
            query = query.gt('created_at', participant.last_read_at);
          }
          
          const { count } = await query;
          unreadMessages += count || 0;
        }
      }
      
      // Calculate overall attendance percentage
      const attendanceRecords = attendanceRes.data || [];
      let attendancePercentage: number | null = null;
      if (attendanceRecords.length > 0) {
        const attended = attendanceRecords.filter(r => 
          r.status === 'present' || r.status === 'late' || r.status === 'excused'
        ).length;
        attendancePercentage = Math.round((attended / attendanceRecords.length) * 100);
      }
      
      // Build stats
      const stats: DashboardStats = {
        totalClasses,
        todaysClasses: todaysClasses.length,
        unreadMessages,
        unreadNotices,
        attendancePercentage,
      };
      
      // Student profile data
      const profile = profileRes.data;
      
      return {
        stats,
        todaysClasses,
        notices,
        profile: profile ? {
          college: profile.college,
          course: profile.course,
          semester: profile.semester,
          year: profile.year,
        } : null,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Export helper for formatting
export { formatTimeForDisplay };
