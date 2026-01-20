import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/contexts/AuthContext';

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminService.getDashboardStats(),
  });
}

export function useAllStudentsAdmin() {
  return useQuery({
    queryKey: ['allStudentsAdmin'],
    queryFn: () => adminService.getAllStudents(),
  });
}

export function useAllFacultyAdmin() {
  return useQuery({
    queryKey: ['allFacultyAdmin'],
    queryFn: () => adminService.getAllFaculty(),
  });
}

export function useUpdateStudentStatus() {
  // Note: Status can only be 'active' or 'suspended' now
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'pending' | 'active' | 'suspended' }) =>
      adminService.updateStudentStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStudentsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

export function useUpdateFacultyStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'pending' | 'active' | 'suspended' }) =>
      adminService.updateFacultyStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allFacultyAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

export function useCreateFacultyAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string; department?: string; designation?: string }) =>
      adminService.createFacultyAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allFacultyAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

// Departments
export function useAdminDepartments() {
  return useQuery({
    queryKey: ['adminDepartments'],
    queryFn: () => adminService.getDepartments(),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; code: string; description?: string }) =>
      adminService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDepartments'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; code?: string; description?: string } }) =>
      adminService.updateDepartment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDepartments'] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDepartments'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

// Courses
export function useAdminCourses() {
  return useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => adminService.getCourses(),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; code: string; department_id?: string; duration_years?: number }) =>
      adminService.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

// Batches
export function useAdminBatches() {
  return useQuery({
    queryKey: ['adminBatches'],
    queryFn: () => adminService.getBatches(),
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; year: number; section?: string; course_id?: string }) =>
      adminService.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBatches'] });
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBatches'] });
    },
  });
}

// Announcements
export function useAdminAnnouncements() {
  return useQuery({
    queryKey: ['adminAnnouncements'],
    queryFn: () => adminService.getAnnouncements(),
  });
}

export function useCreateAnnouncement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { title: string; content: string; type: 'normal' | 'emergency' }) =>
      adminService.createAnnouncement(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { title?: string; content?: string; type?: 'normal' | 'emergency'; is_active?: boolean } }) =>
      adminService.updateAnnouncement(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}

// Reports
export function useAdminReports() {
  return useQuery({
    queryKey: ['adminReports'],
    queryFn: () => adminService.getReports(),
  });
}

export function useUpdateReportStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reportId, status, notes }: { reportId: string; status: 'reviewed' | 'resolved' | 'dismissed'; notes?: string }) =>
      adminService.updateReportStatus(reportId, user!.id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}
