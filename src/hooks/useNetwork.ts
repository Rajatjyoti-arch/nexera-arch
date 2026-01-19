import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  course: string | null;
  college: string | null;
}

export interface PostProject {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[] | null;
  project_url: string | null;
}

export interface PostCertificate {
  id: string;
  title: string;
  issuer: string | null;
  issue_date: string | null;
}

export interface PostComment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  author: PostAuthor | null;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  type: 'post' | 'project' | 'certificate';
  created_at: string;
  author: PostAuthor | null;
  project: PostProject | null;
  certificate: PostCertificate | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
}

// Fetch posts feed with pagination
export function usePosts(limit = 20) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['posts', user?.id],
    queryFn: async (): Promise<Post[]> => {
      // Fetch posts with author info
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      if (!posts?.length) return [];
      
      const postIds = posts.map(p => p.id);
      const userIds = [...new Set(posts.map(p => p.user_id))];
      const projectIds = posts.filter(p => p.project_id).map(p => p.project_id!);
      const certificateIds = posts.filter(p => p.certificate_id).map(p => p.certificate_id!);
      
      // Fetch all related data in parallel
      const [
        studentProfiles,
        projects,
        certificates,
        likeCounts,
        commentCounts,
        userLikes,
        userSaves
      ] = await Promise.all([
        // Get author profiles
        supabase.from('student_profiles').select('user_id, name, username, avatar_url, course, college').in('user_id', userIds),
        // Get linked projects
        projectIds.length > 0 
          ? supabase.from('user_projects').select('*').in('id', projectIds)
          : Promise.resolve({ data: [] }),
        // Get linked certificates
        certificateIds.length > 0
          ? supabase.from('user_certificates').select('*').in('id', certificateIds)
          : Promise.resolve({ data: [] }),
        // Get like counts
        supabase.from('post_likes').select('post_id').in('post_id', postIds),
        // Get comment counts
        supabase.from('post_comments').select('post_id').in('post_id', postIds),
        // Get user's likes (if logged in)
        user?.id
          ? supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('user_id', user.id)
          : Promise.resolve({ data: [] }),
        // Get user's saves (if logged in)
        user?.id
          ? supabase.from('saved_posts').select('post_id').in('post_id', postIds).eq('user_id', user.id)
          : Promise.resolve({ data: [] })
      ]);
      
      // Build lookup maps
      const profileMap = new Map((studentProfiles.data || []).map(p => [p.user_id, p]));
      const projectMap = new Map((projects.data || []).map(p => [p.id, p]));
      const certMap = new Map((certificates.data || []).map(c => [c.id, c]));
      
      // Count likes and comments per post
      const likeCountMap = new Map<string, number>();
      (likeCounts.data || []).forEach(l => {
        likeCountMap.set(l.post_id, (likeCountMap.get(l.post_id) || 0) + 1);
      });
      
      const commentCountMap = new Map<string, number>();
      (commentCounts.data || []).forEach(c => {
        commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
      });
      
      const userLikeSet = new Set((userLikes.data || []).map(l => l.post_id));
      const userSaveSet = new Set((userSaves.data || []).map(s => s.post_id));
      
      // Transform posts
      return posts.map(post => {
        const profile = profileMap.get(post.user_id);
        const project = post.project_id ? projectMap.get(post.project_id) : null;
        const cert = post.certificate_id ? certMap.get(post.certificate_id) : null;
        
        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          type: post.type as 'post' | 'project' | 'certificate',
          created_at: post.created_at,
          author: profile ? {
            id: profile.user_id,
            name: profile.name,
            username: profile.username,
            avatar_url: profile.avatar_url,
            course: profile.course,
            college: profile.college,
          } : null,
          project: project ? {
            id: project.id,
            title: project.title,
            description: project.description,
            tech_stack: project.tech_stack,
            project_url: project.project_url,
          } : null,
          certificate: cert ? {
            id: cert.id,
            title: cert.title,
            issuer: cert.issuer,
            issue_date: cert.issue_date,
          } : null,
          likes_count: likeCountMap.get(post.id) || 0,
          comments_count: commentCountMap.get(post.id) || 0,
          is_liked: userLikeSet.has(post.id),
          is_saved: userSaveSet.has(post.id),
        };
      });
    },
    enabled: true,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Create a new post
export function useCreatePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      content, 
      type = 'post',
      projectData,
      certificateData
    }: { 
      content: string; 
      type?: 'post' | 'project' | 'certificate';
      projectData?: { title: string; description: string; technologies: string; link: string };
      certificateData?: { title: string; issuer: string; date: string };
    }) => {
      if (!user?.id) throw new Error('No user');
      
      let project_id: string | null = null;
      let certificate_id: string | null = null;
      
      // Create project if provided
      if (type === 'project' && projectData) {
        const { data: project, error: projectError } = await supabase
          .from('user_projects')
          .insert({
            user_id: user.id,
            title: projectData.title,
            description: projectData.description,
            tech_stack: projectData.technologies.split(',').map(t => t.trim()).filter(Boolean),
            project_url: projectData.link || null,
          })
          .select()
          .single();
        
        if (projectError) throw projectError;
        project_id = project.id;
      }
      
      // Create certificate if provided
      if (type === 'certificate' && certificateData) {
        const { data: cert, error: certError } = await supabase
          .from('user_certificates')
          .insert({
            user_id: user.id,
            title: certificateData.title,
            issuer: certificateData.issuer,
            issue_date: certificateData.date || null,
          })
          .select()
          .single();
        
        if (certError) throw certError;
        certificate_id = cert.id;
      }
      
      // Create the post
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          type,
          project_id,
          certificate_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Toggle like on a post
export function useToggleLike() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user?.id) throw new Error('No user');
      
      if (isLiked) {
        // Unlike - delete the like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Like - insert new like
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    // Optimistic update
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData<Post[]>(['posts', user?.id]);
      
      queryClient.setQueryData<Post[]>(['posts', user?.id], (old) =>
        old?.map(post =>
          post.id === postId
            ? {
                ...post,
                is_liked: !isLiked,
                likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
              }
            : post
        )
      );
      
      return { previousPosts };
    },
    onError: (_, __, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts', user?.id], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Toggle save/bookmark on a post
export function useToggleSave() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, isSaved }: { postId: string; isSaved: boolean }) => {
      if (!user?.id) throw new Error('No user');
      
      if (isSaved) {
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_posts')
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onMutate: async ({ postId, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData<Post[]>(['posts', user?.id]);
      
      queryClient.setQueryData<Post[]>(['posts', user?.id], (old) =>
        old?.map(post =>
          post.id === postId ? { ...post, is_saved: !isSaved } : post
        )
      );
      
      return { previousPosts };
    },
    onError: (_, __, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts', user?.id], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Get comments for a post
export function usePostComments(postId: string | null) {
  return useQuery({
    queryKey: ['postComments', postId],
    queryFn: async (): Promise<PostComment[]> => {
      if (!postId) return [];
      
      const { data: comments, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (!comments?.length) return [];
      
      const userIds = [...new Set(comments.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('student_profiles')
        .select('user_id, name, username, avatar_url, course, college')
        .in('user_id', userIds);
      
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      
      return comments.map(c => ({
        id: c.id,
        content: c.content,
        user_id: c.user_id,
        created_at: c.created_at,
        author: profileMap.get(c.user_id) ? {
          id: profileMap.get(c.user_id)!.user_id,
          name: profileMap.get(c.user_id)!.name,
          username: profileMap.get(c.user_id)!.username,
          avatar_url: profileMap.get(c.user_id)!.avatar_url,
          course: profileMap.get(c.user_id)!.course,
          college: profileMap.get(c.user_id)!.college,
        } : null,
      }));
    },
    enabled: !!postId,
  });
}

// Add a comment to a post
export function useAddComment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Realtime subscription for posts feed
export function useRealtimePosts(onUpdate: () => void) {
  
  useEffect(() => {
    const channel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, onUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, onUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, onUpdate)
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}

// Fetch students for network people tab
export function useNetworkStudents() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['networkStudents', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('status', 'active')
        .neq('user_id', user?.id || '')
        .limit(50);
      
      if (error) throw error;
      
      // Fetch skills for each student
      if (!data?.length) return [];
      
      const userIds = data.map(s => s.user_id);
      const { data: skills } = await supabase
        .from('user_skills')
        .select('user_id, skill')
        .in('user_id', userIds);
      
      const skillsMap = new Map<string, string[]>();
      (skills || []).forEach(s => {
        if (!skillsMap.has(s.user_id)) skillsMap.set(s.user_id, []);
        skillsMap.get(s.user_id)!.push(s.skill);
      });
      
      return data.map(student => ({
        id: student.user_id,
        name: student.name,
        username: student.username,
        avatar_url: student.avatar_url,
        college: student.college,
        course: student.course,
        year: student.year,
        skills: student.skills || skillsMap.get(student.user_id) || [],
        bio: student.bio,
      }));
    },
    enabled: !!user?.id,
  });
}
