import { supabase } from "@/integrations/supabase/client";

export const adminService = {
  // Dashboard stats
  async getDashboardStats() {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
    
    if (error) {
      console.error("Error fetching admin stats:", error);
      // Fallback to manual count
      const [students, faculty, departments, courses, reports, announcements] = await Promise.all([
        supabase.from('student_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('faculty_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('departments').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('announcements').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      return {
        total_students: students.count || 0,
        active_students: students.count || 0,
        pending_students: 0,
        total_faculty: faculty.count || 0,
        total_departments: departments.count || 0,
        total_courses: courses.count || 0,
        pending_reports: reports.count || 0,
        active_announcements: announcements.count || 0,
      };
    }
    
    return data;
  },

  // User management
  async getAllStudents() {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllFaculty() {
    const { data, error } = await supabase
      .from('faculty_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateStudentStatus(userId: string, status: 'pending' | 'active' | 'suspended') {
    const { error } = await supabase
      .from('student_profiles')
      .update({ status })
      .eq('user_id', userId);

    if (error) throw error;
  },

  async updateFacultyStatus(userId: string, status: 'pending' | 'active' | 'suspended') {
    const { error } = await supabase
      .from('faculty_profiles')
      .update({ status })
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Create faculty account (admin-created)
  async createFacultyAccount(data: {
    email: string;
    password: string;
    name: string;
    department?: string;
    designation?: string;
  }) {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    // Create role
    await supabase
      .from('user_roles')
      .insert({ user_id: authData.user.id, role: 'faculty' });

    // Create profile
    await supabase
      .from('faculty_profiles')
      .insert({
        user_id: authData.user.id,
        email: data.email,
        name: data.name,
        department: data.department,
        designation: data.designation,
        status: 'active',
      });

    return authData.user;
  },

  // Academics management
  async getDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async createDepartment(data: { name: string; code: string; description?: string }) {
    const { data: dept, error } = await supabase
      .from('departments')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return dept;
  },

  async updateDepartment(id: string, updates: { name?: string; code?: string; description?: string }) {
    const { error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteDepartment(id: string) {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        departments(name, code)
      `)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async createCourse(data: { name: string; code: string; department_id?: string; duration_years?: number }) {
    const { data: course, error } = await supabase
      .from('courses')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return course;
  },

  async updateCourse(id: string, updates: { name?: string; code?: string; department_id?: string; duration_years?: number }) {
    const { error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCourse(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getBatches() {
    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        courses(name, code)
      `)
      .order('year', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createBatch(data: { name: string; year: number; section?: string; course_id?: string }) {
    const { data: batch, error } = await supabase
      .from('batches')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return batch;
  },

  async deleteBatch(id: string) {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Announcements
  async getAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createAnnouncement(userId: string, data: {
    title: string;
    content: string;
    type: 'normal' | 'emergency';
  }) {
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        ...data,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return announcement;
  },

  async updateAnnouncement(id: string, updates: {
    title?: string;
    content?: string;
    type?: 'normal' | 'emergency';
    is_active?: boolean;
  }) {
    const { error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAnnouncement(id: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Reports / Moderation
  async getReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateReportStatus(reportId: string, adminId: string, status: 'reviewed' | 'resolved' | 'dismissed', notes?: string) {
    const { error } = await supabase
      .from('reports')
      .update({
        status,
        admin_notes: notes,
        resolved_by: adminId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) throw error;
  }
};
