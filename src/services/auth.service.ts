import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/contexts/AuthContext";

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  username: string;
  role: UserRole;
  college?: string;
  course?: string;
  year?: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: data.name,
          username: data.username,
          role: data.role,
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    // Create role entry
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: authData.user.id, role: data.role });

    if (roleError) {
      console.error("Error creating role:", roleError);
    }

    // Create profile based on role
    if (data.role === 'student') {
      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: authData.user.id,
          email: data.email,
          name: data.name,
          username: data.username,
          college: data.college || '',
          course: data.course || '',
          year: data.year || '',
        });
      
      if (profileError) {
        console.error("Error creating student profile:", profileError);
      }
    } else if (data.role === 'faculty') {
      const { error: profileError } = await supabase
        .from('faculty_profiles')
        .insert({
          user_id: authData.user.id,
          email: data.email,
          name: data.name,
        });
      
      if (profileError) {
        console.error("Error creating faculty profile:", profileError);
      }
    } else if (data.role === 'admin') {
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert({
          user_id: authData.user.id,
          email: data.email,
          name: data.name,
        });
      
      if (profileError) {
        console.error("Error creating admin profile:", profileError);
      }
    }

    return authData;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUserRole(userId: string): Promise<UserRole | null> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
    
    return data?.role as UserRole | null;
  },

  async getStudentProfile(userId: string) {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching student profile:", error);
      return null;
    }
    
    return data;
  },

  async getFacultyProfile(userId: string) {
    const { data, error } = await supabase
      .from('faculty_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching faculty profile:", error);
      return null;
    }
    
    return data;
  },

  async getAdminProfile(userId: string) {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching admin profile:", error);
      return null;
    }
    
    return data;
  },

  async getCounselorProfile(userId: string) {
    const { data, error } = await supabase
      .from('counselor_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching counselor profile:", error);
      return null;
    }
    
    return data;
  }
};
