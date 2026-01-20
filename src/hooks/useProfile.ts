import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

// Types
export interface UserSkill {
  id: string;
  user_id: string;
  skill: string;
  created_at: string;
}

export interface UserProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tech_stack: string[] | null;
  project_url: string | null;
  created_at: string;
}

export interface UserCertificate {
  id: string;
  user_id: string;
  title: string;
  issuer: string | null;
  issue_date: string | null;
  credential_url: string | null;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  semester: string | null;
  skills: string[] | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface FacultyProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  department: string | null;
  designation: string | null;
  subjects: string[] | null;
  office_hours: string | null;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

// Avatar upload configuration
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface AvatarUploadProgress {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

// Helper to validate avatar file
export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image (JPEG, PNG, GIF, or WebP)' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Image must be smaller than 5MB' };
  }
  return { valid: true };
}

// Helper to upload avatar to storage
export async function uploadAvatar(
  userId: string, 
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
  
  // Simulate progress since Supabase doesn't provide upload progress
  onProgress?.(10);
  
  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { 
      upsert: true,
      cacheControl: '3600',
    });

  onProgress?.(70);

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  onProgress?.(100);
  
  return publicUrl;
}

// Helper to sync auth metadata (name/username) with profile
async function syncAuthMetadata(updates: { name?: string; username?: string }) {
  const metadataUpdates: Record<string, string> = {};
  if (updates.name) metadataUpdates.name = updates.name;
  if (updates.username) metadataUpdates.username = updates.username;
  
  if (Object.keys(metadataUpdates).length > 0) {
    const { error } = await supabase.auth.updateUser({
      data: metadataUpdates,
    });
    if (error) {
      console.warn('Failed to sync auth metadata:', error.message);
      // Don't throw - this is a secondary sync, profile is source of truth
    }
  }
}

// ============ STUDENT PROFILE HOOKS ============

export function useStudentFullProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Set up realtime subscription for profile updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`student-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidate query to refetch on any profile change
          queryClient.invalidateQueries({ queryKey: ['studentFullProfile', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
  
  return useQuery({
    queryKey: ['studentFullProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      // Fetch profile, skills, projects, and certificates in parallel
      const [profileRes, skillsRes, projectsRes, certificatesRes] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_skills').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('user_projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_certificates').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      if (profileRes.error) throw profileRes.error;

      return {
        profile: profileRes.data as StudentProfile | null,
        skills: (skillsRes.data || []) as UserSkill[],
        projects: (projectsRes.data || []) as UserProject[],
        certificates: (certificatesRes.data || []) as UserCertificate[],
      };
    },
    enabled: !!user?.id,
  });
}

// Avatar upload mutation hook
export function useUploadAvatar() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) => {
      if (!user?.id) throw new Error('No user');
      
      // Validate file
      const validation = validateAvatarFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Upload to storage
      const publicUrl = await uploadAvatar(user.id, file, onProgress);
      
      // Update profile with new avatar URL
      const { data, error } = await supabase
        .from('student_profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      return { avatarUrl: publicUrl, profile: data };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['studentFullProfile'] });
      // Sync with AuthContext
      updateUser?.({ avatar: data.avatarUrl });
      toast.success('Avatar updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateStudentProfile() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<StudentProfile>) => {
      if (!user?.id) throw new Error('No user');
      
      // Update profile in DB
      const { data, error } = await supabase
        .from('student_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Sync name/username with auth metadata (non-blocking)
      if (updates.name || updates.username) {
        syncAuthMetadata({ name: updates.name, username: updates.username });
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['studentFullProfile'] });
      // Sync with AuthContext
      updateUser?.({
        name: data.name,
        username: data.username,
        avatar: data.avatar_url || undefined,
        college: data.college || undefined,
        course: data.course || undefined,
        year: data.year || undefined,
      });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
}

// Skills mutations
export function useAddSkill() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (skill: string) => {
      if (!user?.id) throw new Error('No user');
      
      // Normalize skill to prevent duplicates with different casing
      const normalizedSkill = skill.trim();
      if (!normalizedSkill) throw new Error('Skill cannot be empty');
      
      const { data, error } = await supabase
        .from('user_skills')
        .insert({ user_id: user.id, skill: normalizedSkill })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          throw new Error('This skill already exists');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentFullProfile'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add skill: ${error.message}`);
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentFullProfile'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete skill: ${error.message}`);
    },
  });
}

// Projects mutations
export function useAddProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (project: { title: string; description?: string; tech_stack?: string[]; project_url?: string }) => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('user_projects')
        .insert({ 
          user_id: user.id, 
          title: project.title,
          description: project.description || null,
          tech_stack: project.tech_stack || [],
          project_url: project.project_url || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentFullProfile'] });
      toast.success('Project added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add project: ${error.message}`);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('user_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentFullProfile'] });
      toast.success('Project deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });
}

// Certificates mutations
export function useAddCertificate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cert: { title: string; issuer?: string; issue_date?: string; credential_url?: string }) => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('user_certificates')
        .insert({ 
          user_id: user.id, 
          title: cert.title,
          issuer: cert.issuer || null,
          issue_date: cert.issue_date || null,
          credential_url: cert.credential_url || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentFullProfile'] });
      toast.success('Certificate added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add certificate: ${error.message}`);
    },
  });
}

export function useDeleteCertificate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (certId: string) => {
      const { error } = await supabase
        .from('user_certificates')
        .delete()
        .eq('id', certId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentFullProfile'] });
      toast.success('Certificate deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete certificate: ${error.message}`);
    },
  });
}

// ============ FACULTY PROFILE HOOKS ============

export function useFacultyFullProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['facultyFullProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('faculty_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as FacultyProfile | null;
    },
    enabled: !!user?.id,
  });
}

export function useUpdateFacultyProfile() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<FacultyProfile>) => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('faculty_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Sync name with auth metadata if updated (non-blocking)
      if (updates.name) {
        syncAuthMetadata({ name: updates.name });
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['facultyFullProfile'] });
      // Sync with AuthContext
      updateUser?.({
        name: data.name,
        avatar: data.avatar_url || undefined,
        department: data.department || undefined,
        designation: data.designation || undefined,
      });
      // Toast is handled by the component to avoid double toasts
    },
    onError: (error: Error) => {
      // Toast is handled by the component
      console.error('Failed to update profile:', error.message);
    },
  });
}
