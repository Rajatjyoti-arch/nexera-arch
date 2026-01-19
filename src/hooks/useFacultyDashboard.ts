import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FacultyClass {
  id: string;
  name: string;
  room: string | null;
  year: string;
  course: {
    id: string;
    name: string;
    code: string;
  } | null;
  schedules: {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
  }[];
  studentCount: number;
}

export interface TodayScheduleItem {
  id: string;
  className: string;
  room: string | null;
  startTime: string;
  endTime: string;
  status: 'completed' | 'ongoing' | 'upcoming';
  courseName: string;
  studentCount: number;
}

export interface FacultyDashboardStats {
  totalClasses: number;
  totalStudents: number;
  todayClasses: number;
  pendingMessages: number;
  recentNotices: number;
}

// Get current day of week
function getCurrentDayOfWeek(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

// Parse time string to minutes since midnight
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Get current time in minutes
function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Determine class status based on current time
function getClassStatus(startTime: string, endTime: string): 'completed' | 'ongoing' | 'upcoming' {
  const currentMins = getCurrentMinutes();
  const startMins = parseTimeToMinutes(startTime);
  const endMins = parseTimeToMinutes(endTime);

  if (currentMins >= endMins) return 'completed';
  if (currentMins >= startMins && currentMins < endMins) return 'ongoing';
  return 'upcoming';
}

// Format time for display (24h to 12h)
function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Demo CCS-II classes for faculty (when no real classes assigned)
const DEMO_FACULTY_CLASSES: FacultyClass[] = [
  {
    id: 'demo-class-1',
    name: 'Introduction to Data Science',
    room: 'Fabricated Building II-CCS',
    year: '1st Year',
    course: { id: 'course-1', name: 'Introduction to Data Science', code: 'BCCS2C01' },
    schedules: [
      { id: 's1', day_of_week: 'Monday', start_time: '09:30', end_time: '10:15' },
      { id: 's2', day_of_week: 'Wednesday', start_time: '09:30', end_time: '10:15' },
      { id: 's3', day_of_week: 'Friday', start_time: '09:30', end_time: '10:15' },
    ],
    studentCount: 45,
  },
  {
    id: 'demo-class-2',
    name: 'Probability and Statistics',
    room: 'Fabricated Building II-CCS',
    year: '1st Year',
    course: { id: 'course-2', name: 'Probability and Statistics for Computer Engineers', code: 'IMAT2E01' },
    schedules: [
      { id: 's4', day_of_week: 'Monday', start_time: '10:15', end_time: '11:00' },
      { id: 's5', day_of_week: 'Tuesday', start_time: '10:15', end_time: '11:00' },
      { id: 's6', day_of_week: 'Thursday', start_time: '10:15', end_time: '11:00' },
    ],
    studentCount: 42,
  },
  {
    id: 'demo-class-3',
    name: 'Introduction to Cyber Security',
    room: 'Fabricated Building II-CCS',
    year: '1st Year',
    course: { id: 'course-3', name: 'Introduction to Cyber Security', code: 'BCCS2C03' },
    schedules: [
      { id: 's7', day_of_week: 'Tuesday', start_time: '11:00', end_time: '11:45' },
      { id: 's8', day_of_week: 'Wednesday', start_time: '11:00', end_time: '11:45' },
    ],
    studentCount: 38,
  },
  {
    id: 'demo-class-4',
    name: 'Introduction to Data Structures',
    room: 'Fabricated Building II-CCS',
    year: '1st Year',
    course: { id: 'course-4', name: 'Introduction to Data Structures', code: 'BCCS2C04' },
    schedules: [
      { id: 's9', day_of_week: 'Tuesday', start_time: '11:45', end_time: '12:30' },
      { id: 's10', day_of_week: 'Thursday', start_time: '09:30', end_time: '10:15' },
    ],
    studentCount: 40,
  },
  {
    id: 'demo-class-5',
    name: 'Quantum Physics for Computer Engineers',
    room: 'Fabricated Building II-CCS',
    year: '1st Year',
    course: { id: 'course-5', name: 'Quantum Physics for Computer Engineers', code: 'IPHY2E02' },
    schedules: [
      { id: 's11', day_of_week: 'Monday', start_time: '11:00', end_time: '11:45' },
      { id: 's12', day_of_week: 'Thursday', start_time: '11:00', end_time: '11:45' },
    ],
    studentCount: 44,
  },
  {
    id: 'demo-class-6',
    name: 'Fundamentals of Artificial Intelligence',
    room: 'Fabricated Building II-CCS',
    year: '1st Year',
    course: { id: 'course-6', name: 'Fundamentals of Artificial Intelligence', code: 'BCCS2C02' },
    schedules: [
      { id: 's13', day_of_week: 'Tuesday', start_time: '14:45', end_time: '15:30' },
      { id: 's14', day_of_week: 'Friday', start_time: '14:00', end_time: '14:45' },
    ],
    studentCount: 41,
  },
  {
    id: 'demo-class-7',
    name: 'Project',
    room: 'Fabricated Building II-CCS',
    year: '1st Year',
    course: { id: 'course-7', name: 'Project', code: 'BCCS2C05' },
    schedules: [
      { id: 's15', day_of_week: 'Monday', start_time: '14:00', end_time: '15:30' },
      { id: 's16', day_of_week: 'Friday', start_time: '14:45', end_time: '16:15' },
    ],
    studentCount: 35,
  },
];

export function useFacultyClasses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['facultyClasses', user?.id],
    queryFn: async (): Promise<FacultyClass[]> => {
      if (!user?.id) throw new Error('No user');

      // First get classes where faculty_id matches OR from faculty_classes table
      const { data: directClasses, error: directError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          room,
          year,
          courses:course_id (
            id,
            name,
            code
          )
        `)
        .eq('faculty_id', user.id);

      if (directError) throw directError;

      // Get class IDs from faculty_classes junction table
      const { data: junctionClasses, error: junctionError } = await supabase
        .from('faculty_classes')
        .select('class_id')
        .eq('faculty_id', user.id);

      if (junctionError) throw junctionError;

      // Combine unique class IDs
      const directIds = (directClasses || []).map(c => c.id);
      const junctionIds = (junctionClasses || []).map(c => c.class_id);
      const allClassIds = [...new Set([...directIds, ...junctionIds])];

      // If no real classes, return demo classes
      if (allClassIds.length === 0) {
        return DEMO_FACULTY_CLASSES;
      }

      // Get full class details including schedules
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          room,
          year,
          courses:course_id (
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
        `)
        .in('id', allClassIds);

      if (classesError) throw classesError;

      // Get student counts for each class
      const { data: enrollments, error: enrollError } = await supabase
        .from('student_enrollments')
        .select('class_id')
        .in('class_id', allClassIds);

      if (enrollError) throw enrollError;

      // Count students per class
      const studentCounts: Record<string, number> = {};
      (enrollments || []).forEach(e => {
        studentCounts[e.class_id] = (studentCounts[e.class_id] || 0) + 1;
      });

      return (classesData || []).map(cls => ({
        id: cls.id,
        name: cls.name,
        room: cls.room,
        year: cls.year,
        course: cls.courses as FacultyClass['course'],
        schedules: (cls.class_schedules || []).map(s => ({
          id: s.id,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
        studentCount: studentCounts[cls.id] || 0,
      }));
    },
    enabled: !!user?.id,
  });
}

export function useTodaySchedule() {
  const { data: classes, isLoading, error } = useFacultyClasses();
  const today = getCurrentDayOfWeek();

  const todaySchedule: TodayScheduleItem[] = [];

  if (classes) {
    classes.forEach(cls => {
      cls.schedules
        .filter(s => s.day_of_week === today)
        .forEach(schedule => {
          todaySchedule.push({
            id: `${cls.id}-${schedule.id}`,
            className: cls.name,
            room: cls.room,
            startTime: formatTime(schedule.start_time),
            endTime: formatTime(schedule.end_time),
            status: getClassStatus(schedule.start_time, schedule.end_time),
            courseName: cls.course?.name || 'Unknown Course',
            studentCount: cls.studentCount,
          });
        });
    });

    // Sort by start time
    todaySchedule.sort((a, b) => {
      const aTime = parseTimeToMinutes(a.startTime.replace(' AM', '').replace(' PM', ''));
      const bTime = parseTimeToMinutes(b.startTime.replace(' AM', '').replace(' PM', ''));
      return aTime - bTime;
    });
  }

  return { data: todaySchedule, isLoading, error };
}

export function useFacultyDashboardStats() {
  const { user } = useAuth();
  const { data: classes } = useFacultyClasses();
  const { data: todaySchedule } = useTodaySchedule();

  return useQuery({
    queryKey: ['facultyDashboardStats', user?.id, classes?.length],
    queryFn: async (): Promise<FacultyDashboardStats> => {
      if (!user?.id) throw new Error('No user');

      // Get unread messages count (chats where user is participant with unread)
      const { data: chats } = await supabase
        .from('chat_participants')
        .select(`
          id,
          last_read_at,
          chats:chat_id (
            updated_at
          )
        `)
        .eq('user_id', user.id);

      let pendingMessages = 0;
      (chats || []).forEach(chat => {
        const chatData = chat.chats as { updated_at: string } | null;
        if (chatData && chat.last_read_at) {
          if (new Date(chatData.updated_at) > new Date(chat.last_read_at)) {
            pendingMessages++;
          }
        } else if (chatData && !chat.last_read_at) {
          pendingMessages++;
        }
      });

      // Get recent notices by this faculty
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: noticeCount } = await supabase
        .from('notices')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .gte('created_at', weekAgo);

      // Calculate total students across all classes
      const totalStudents = (classes || []).reduce((sum, cls) => sum + cls.studentCount, 0);

      return {
        totalClasses: classes?.length || 0,
        totalStudents,
        todayClasses: todaySchedule?.length || 0,
        pendingMessages,
        recentNotices: noticeCount || 0,
      };
    },
    enabled: !!user?.id && classes !== undefined,
  });
}

export function useRecentFacultyNotices(limit = 4) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recentFacultyNotices', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('notices')
        .select(`
          id,
          title,
          content,
          created_at,
          is_active,
          departments:department_id (name),
          batches:batch_id (name)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}
