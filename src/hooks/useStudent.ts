import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';
import { useAuth } from '@/contexts/AuthContext';

export function useStudentProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['studentProfile', user?.id],
    queryFn: () => studentService.getProfile(user!.id),
    enabled: !!user?.id,
  });
}

export function useStudentDashboardStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['studentDashboardStats', user?.id],
    queryFn: () => studentService.getDashboardStats(user!.id),
    enabled: !!user?.id,
  });
}

export function useAllStudents(filters?: {
  search?: string;
  course?: string;
  year?: string;
  skills?: string[];
}) {
  return useQuery({
    queryKey: ['allStudents', filters],
    queryFn: () => studentService.getAllStudents(filters),
  });
}

export function useUpdateStudentProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Parameters<typeof studentService.updateProfile>[1]) =>
      studentService.updateProfile(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
    },
  });
}

export function useStudentAnnouncements() {
  return useQuery({
    queryKey: ['studentAnnouncements'],
    queryFn: () => studentService.getAnnouncements(),
  });
}

export function useStudentNotices() {
  return useQuery({
    queryKey: ['studentNotices'],
    queryFn: () => studentService.getNotices(),
  });
}

export function useWellnessLogs() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['wellnessLogs', user?.id],
    queryFn: () => studentService.getWellnessLogs(user!.id),
    enabled: !!user?.id,
  });
}

export function useCreateWellnessLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { mood?: string; stress_level?: number; notes?: string }) =>
      studentService.createWellnessLog(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellnessLogs'] });
    },
  });
}
