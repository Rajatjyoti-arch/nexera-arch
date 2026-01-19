import { supabase } from "@/integrations/supabase/client";

export const studentService = {
  // Profile operations
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: {
    name?: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
    college?: string;
    course?: string;
    year?: string;
    semester?: string;
    skills?: string[];
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
  }) {
    const { data, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Network - fetch all active student profiles
  async getAllStudents(filters?: {
    search?: string;
    course?: string;
    year?: string;
    skills?: string[];
  }) {
    let query = supabase
      .from('student_profiles')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,username.ilike.%${filters.search}%`);
    }

    if (filters?.course) {
      query = query.eq('course', filters.course);
    }

    if (filters?.year) {
      query = query.eq('year', filters.year);
    }

    if (filters?.skills && filters.skills.length > 0) {
      query = query.overlaps('skills', filters.skills);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Dashboard stats
  async getDashboardStats(userId: string) {
    // Get chat count
    const { count: chatCount } = await supabase
      .from('chat_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get unread messages count (messages in chats after last_read_at)
    const { data: participations } = await supabase
      .from('chat_participants')
      .select('chat_id, last_read_at')
      .eq('user_id', userId);

    let unreadCount = 0;
    if (participations) {
      for (const p of participations) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', p.chat_id)
          .neq('sender_id', userId)
          .gt('created_at', p.last_read_at || '1970-01-01');
        
        unreadCount += count || 0;
      }
    }

    // Get announcements count
    const { count: announcementCount } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get network count (other students)
    const { count: networkCount } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .neq('user_id', userId);

    return {
      chats: chatCount || 0,
      unreadMessages: unreadCount,
      announcements: announcementCount || 0,
      networkSize: networkCount || 0,
    };
  },

  // Wellness logs
  async createWellnessLog(userId: string, data: {
    mood?: string;
    stress_level?: number;
    notes?: string;
  }) {
    const { error } = await supabase
      .from('wellness_logs')
      .insert({
        user_id: userId,
        ...data,
      });

    if (error) throw error;
  },

  async getWellnessLogs(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('wellness_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get announcements for student
  async getAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get notices for student
  async getNotices() {
    const { data, error } = await supabase
      .from('notices')
      .select(`
        *,
        departments(name),
        batches(name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
