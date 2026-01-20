import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CounselorAppointment {
  id: string;
  student_id: string;
  counselor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  counselor?: {
    name: string;
    avatar_url: string | null;
    specialization: string | null;
    email: string;
  };
}

export interface CounselorProfile {
  user_id: string;
  name: string;
  avatar_url: string | null;
  specialization: string | null;
  qualifications: string | null;
  office_hours: string | null;
  availability_status: string | null;
  email: string;
}

// Get assigned counselor for the student
export function useAssignedCounselor() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['assignedCounselor', user?.id],
    queryFn: async (): Promise<CounselorProfile | null> => {
      if (!user?.id) return null;
      
      // First get the assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('counselor_assignments')
        .select('counselor_id')
        .eq('student_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (assignmentError || !assignment) {
        console.log('No counselor assigned:', assignmentError?.message);
        return null;
      }
      
      // Then get the counselor profile
      const { data: counselor, error: counselorError } = await supabase
        .from('counselor_profiles')
        .select('user_id, name, avatar_url, specialization, qualifications, office_hours, availability_status, email')
        .eq('user_id', assignment.counselor_id)
        .maybeSingle();
      
      if (counselorError) {
        console.error('Error fetching counselor profile:', counselorError);
        return null;
      }
      
      return counselor;
    },
    enabled: !!user?.id,
  });
}

// Get all available counselors
export function useAvailableCounselors() {
  return useQuery({
    queryKey: ['availableCounselors'],
    queryFn: async (): Promise<CounselorProfile[]> => {
      const { data, error } = await supabase
        .from('counselor_profiles')
        .select('user_id, name, avatar_url, specialization, qualifications, office_hours, availability_status, email')
        .eq('status', 'active')
        .eq('availability_status', 'available');
      
      if (error) {
        console.error('Error fetching counselors:', error);
        return [];
      }
      
      return data || [];
    },
  });
}

// Get student's appointments
export function useStudentAppointments() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['studentAppointments', user?.id],
    queryFn: async (): Promise<CounselorAppointment[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('counselor_appointments')
        .select('*')
        .eq('student_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
      
      // Fetch counselor details for each appointment
      const appointmentsWithCounselor = await Promise.all(
        (data || []).map(async (apt) => {
          const { data: counselor } = await supabase
            .from('counselor_profiles')
            .select('name, avatar_url, specialization, email')
            .eq('user_id', apt.counselor_id)
            .maybeSingle();
          
          return {
            ...apt,
            counselor: counselor || undefined,
          } as CounselorAppointment;
        })
      );
      
      return appointmentsWithCounselor;
    },
    enabled: !!user?.id,
  });
}

// Book an appointment
export function useBookAppointment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      counselor_id: string;
      appointment_date: string;
      start_time: string;
      end_time: string;
      reason?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: result, error } = await supabase
        .from('counselor_appointments')
        .insert({
          student_id: user.id,
          counselor_id: data.counselor_id,
          appointment_date: data.appointment_date,
          start_time: data.start_time,
          end_time: data.end_time,
          reason: data.reason || null,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAppointments'] });
      toast.success('Appointment booked successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to book appointment: ${error.message}`);
    },
  });
}

// Cancel an appointment
export function useCancelAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from('counselor_appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAppointments'] });
      toast.success('Appointment cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel: ${error.message}`);
    },
  });
}

// Generate available time slots
export function generateTimeSlots(startHour = 9, endHour = 17, intervalMinutes = 30): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
}
