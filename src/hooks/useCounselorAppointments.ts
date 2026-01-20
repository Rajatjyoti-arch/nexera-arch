import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CounselorAppointment } from './useCounselorBooking';

export interface CounselorAppointmentWithStudent extends CounselorAppointment {
  student?: {
    name: string;
    email: string;
    avatar_url: string | null;
    course: string | null;
    year: string | null;
  };
}

// Get counselor's appointments
export function useCounselorAppointments() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['counselorAppointments', user?.id],
    queryFn: async (): Promise<CounselorAppointmentWithStudent[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('counselor_appointments')
        .select('*')
        .eq('counselor_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
      
      // Fetch student details for each appointment
      const appointmentsWithStudents = await Promise.all(
        (data || []).map(async (apt) => {
          const { data: student } = await supabase
            .from('student_profiles')
            .select('name, email, avatar_url, course, year')
            .eq('user_id', apt.student_id)
            .maybeSingle();
          
          return {
            ...apt,
            student: student || undefined,
          } as CounselorAppointmentWithStudent;
        })
      );
      
      return appointmentsWithStudents;
    },
    enabled: !!user?.id,
  });
}

// Confirm an appointment
export function useConfirmAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from('counselor_appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselorAppointments'] });
      toast.success('Appointment confirmed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to confirm: ${error.message}`);
    },
  });
}

// Reschedule an appointment
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      appointmentId: string;
      appointment_date: string;
      start_time: string;
      end_time: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('counselor_appointments')
        .update({
          appointment_date: data.appointment_date,
          start_time: data.start_time,
          end_time: data.end_time,
          notes: data.notes,
          status: 'confirmed',
        })
        .eq('id', data.appointmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselorAppointments'] });
      toast.success('Appointment rescheduled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reschedule: ${error.message}`);
    },
  });
}

// Complete an appointment
export function useCompleteAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { appointmentId: string; notes?: string }) => {
      const { error } = await supabase
        .from('counselor_appointments')
        .update({ 
          status: 'completed',
          notes: data.notes,
        })
        .eq('id', data.appointmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselorAppointments'] });
      toast.success('Session marked as complete');
    },
    onError: (error: Error) => {
      toast.error(`Failed to complete: ${error.message}`);
    },
  });
}

// Cancel an appointment (by counselor)
export function useCounselorCancelAppointment() {
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
      queryClient.invalidateQueries({ queryKey: ['counselorAppointments'] });
      toast.success('Appointment cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel: ${error.message}`);
    },
  });
}
