import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Get students enrolled in a specific class
export function useClassStudents(classId: string) {
  return useQuery({
    queryKey: ['classStudents', classId],
    queryFn: async () => {
      if (!classId) return [];
      
      // Get student enrollments for this class
      const { data: enrollments, error } = await supabase
        .from('student_enrollments')
        .select('student_id')
        .eq('class_id', classId)
        .eq('status', 'active');
      
      if (error) throw error;
      if (!enrollments || enrollments.length === 0) {
        // If no enrollments, return demo students for testing
        return getDemoStudents();
      }
      
      // Get student profiles
      const studentIds = enrollments.map(e => e.student_id);
      const { data: students, error: profilesError } = await supabase
        .from('student_profiles')
        .select('user_id, name, email, avatar_url')
        .in('user_id', studentIds)
        .order('name');
      
      if (profilesError) throw profilesError;
      return students || [];
    },
    enabled: !!classId,
  });
}

// Demo students for testing when no real enrollments exist
function getDemoStudents() {
  return [
    { user_id: 'demo-student-1', name: 'Aarav Sharma', email: 'aarav.sharma@cujammu.ac.in', avatar_url: null },
    { user_id: 'demo-student-2', name: 'Priya Patel', email: 'priya.patel@cujammu.ac.in', avatar_url: null },
    { user_id: 'demo-student-3', name: 'Rahul Verma', email: 'rahul.verma@cujammu.ac.in', avatar_url: null },
    { user_id: 'demo-student-4', name: 'Ananya Singh', email: 'ananya.singh@cujammu.ac.in', avatar_url: null },
    { user_id: 'demo-student-5', name: 'Vikram Gupta', email: 'vikram.gupta@cujammu.ac.in', avatar_url: null },
    { user_id: 'demo-student-6', name: 'Neha Kapoor', email: 'neha.kapoor@cujammu.ac.in', avatar_url: null },
    { user_id: 'demo-student-7', name: 'Arjun Mehta', email: 'arjun.mehta@cujammu.ac.in', avatar_url: null },
    { user_id: 'demo-student-8', name: 'Kavya Reddy', email: 'kavya.reddy@cujammu.ac.in', avatar_url: null },
    { user_id: 'demo-student-9', name: 'Rohit Kumar', email: 'rohit.kumar@cujammu.ac.in', avatar_url: null },
    { user_id: 'demo-student-10', name: 'Simran Kaur', email: 'simran.kaur@cujammu.ac.in', avatar_url: null },
  ];
}

// Get existing attendance for a class on a specific date
export function useClassAttendance(classId: string, date: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['classAttendance', classId, date],
    queryFn: async () => {
      if (!classId || !date) return [];
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', classId)
        .eq('date', date);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!classId && !!date && !!user?.id,
  });
}

// Mark attendance for multiple students
export function useMarkAttendance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      classId, 
      date, 
      attendance 
    }: { 
      classId: string; 
      date: string; 
      attendance: { student_id: string; status: string }[] 
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // First, delete existing attendance for this class and date
      const { error: deleteError } = await supabase
        .from('attendance')
        .delete()
        .eq('class_id', classId)
        .eq('date', date);
      
      if (deleteError) throw deleteError;
      
      // Insert new attendance records
      const records = attendance.map(a => ({
        class_id: classId,
        student_id: a.student_id,
        date: date,
        status: a.status,
        marked_by: user.id,
      }));
      
      const { data, error } = await supabase
        .from('attendance')
        .insert(records)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['classAttendance', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['studentClasses'] });
      queryClient.invalidateQueries({ queryKey: ['studentAttendanceSummary'] });
    },
  });
}

// Get attendance statistics for faculty dashboard
export function useFacultyAttendanceStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['facultyAttendanceStats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Get all attendance marked by this faculty
      const { data, error } = await supabase
        .from('attendance')
        .select('status, date')
        .eq('marked_by', user.id);
      
      if (error) throw error;
      
      const stats = {
        totalRecords: data?.length || 0,
        presentCount: data?.filter(a => a.status === 'present').length || 0,
        absentCount: data?.filter(a => a.status === 'absent').length || 0,
        lateCount: data?.filter(a => a.status === 'late').length || 0,
        uniqueDates: new Set(data?.map(a => a.date)).size,
      };
      
      return stats;
    },
    enabled: !!user?.id,
  });
}