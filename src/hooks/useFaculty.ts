import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '@/services/faculty.service';
import { useAuth } from '@/contexts/AuthContext';

export function useFacultyProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['facultyProfile', user?.id],
    queryFn: () => facultyService.getProfile(user!.id),
    enabled: !!user?.id,
  });
}

export function useFacultyDashboardStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['facultyDashboardStats', user?.id],
    queryFn: () => facultyService.getDashboardStats(user!.id),
    enabled: !!user?.id,
  });
}

export function useUpdateFacultyProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Parameters<typeof facultyService.updateProfile>[1]) =>
      facultyService.updateProfile(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facultyProfile'] });
    },
  });
}

export function useFacultyNotices() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['facultyNotices', user?.id],
    queryFn: () => facultyService.getNotices(user!.id),
    enabled: !!user?.id,
  });
}

export function useCreateFacultyNotice() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { title: string; content: string; department_id?: string; batch_id?: string }) =>
      facultyService.createNotice(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facultyNotices'] });
    },
  });
}

export function useUpdateFacultyNotice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noticeId, updates }: { noticeId: string; updates: { title?: string; content?: string; is_active?: boolean } }) =>
      facultyService.updateNotice(noticeId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facultyNotices'] });
    },
  });
}

export function useDeleteFacultyNotice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (noticeId: string) => facultyService.deleteNotice(noticeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facultyNotices'] });
    },
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => facultyService.getDepartments(),
  });
}

export function useBatches() {
  return useQuery({
    queryKey: ['batches'],
    queryFn: () => facultyService.getBatches(),
  });
}

export function useFacultyStudents() {
  return useQuery({
    queryKey: ['facultyStudents'],
    queryFn: () => facultyService.getAllStudents(),
  });
}
