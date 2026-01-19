import { supabase } from "@/integrations/supabase/client";

export const facultyService = {
  // Profile operations
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('faculty_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: {
    name?: string;
    avatar_url?: string;
    department?: string;
    designation?: string;
    subjects?: string[];
    office_hours?: string;
  }) {
    const { data, error } = await supabase
      .from('faculty_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Dashboard stats
  async getDashboardStats(userId: string) {
    // Get chat count
    const { count: chatCount } = await supabase
      .from('chat_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get notices count created by this faculty
    const { count: noticeCount } = await supabase
      .from('notices')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId);

    // Get student count (all active students)
    const { count: studentCount } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return {
      chats: chatCount || 0,
      notices: noticeCount || 0,
      students: studentCount || 0,
    };
  },

  // Notice operations
  async getNotices(userId: string) {
    const { data, error } = await supabase
      .from('notices')
      .select(`
        *,
        departments(name),
        batches(name)
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createNotice(userId: string, data: {
    title: string;
    content: string;
    department_id?: string;
    batch_id?: string;
  }) {
    const { data: notice, error } = await supabase
      .from('notices')
      .insert({
        ...data,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return notice;
  },

  async updateNotice(noticeId: string, updates: {
    title?: string;
    content?: string;
    is_active?: boolean;
  }) {
    const { data, error } = await supabase
      .from('notices')
      .update(updates)
      .eq('id', noticeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteNotice(noticeId: string) {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', noticeId);

    if (error) throw error;
  },

  // Get all students for viewing
  async getAllStudents() {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get departments and batches for notice targeting
  async getDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
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
  }
};
