import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string | null;
  departmentId: string | null;
  batchId: string | null;
  isRead: boolean;
}

// Fetch all active notices with read state for the current user
export function useNotices() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['notices', user?.id],
    queryFn: async (): Promise<Notice[]> => {
      if (!user?.id) return [];
      
      // Fetch active notices
      const { data: notices, error: noticesError } = await supabase
        .from('notices')
        .select('id, title, content, created_at, created_by, department_id, batch_id')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (noticesError) throw noticesError;
      if (!notices?.length) return [];
      
      // Fetch read states for current user
      const { data: readStates, error: readError } = await supabase
        .from('notice_reads')
        .select('notice_id')
        .eq('user_id', user.id);
      
      if (readError) throw readError;
      
      const readNoticeIds = new Set((readStates || []).map(r => r.notice_id));
      
      return notices.map(notice => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        createdAt: notice.created_at,
        createdBy: notice.created_by,
        departmentId: notice.department_id,
        batchId: notice.batch_id,
        isRead: readNoticeIds.has(notice.id),
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get unread notice count
export function useUnreadNoticeCount() {
  const { data: notices } = useNotices();
  return notices?.filter(n => !n.isRead).length || 0;
}

// Mark a notice as read
export function useMarkNoticeAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (noticeId: string) => {
      if (!user?.id) throw new Error('No user');
      
      const { error } = await supabase
        .from('notice_reads')
        .upsert(
          { notice_id: noticeId, user_id: user.id },
          { onConflict: 'notice_id,user_id' }
        );
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    },
  });
}

// Mark multiple notices as read
export function useMarkAllNoticesAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (noticeIds: string[]) => {
      if (!user?.id) throw new Error('No user');
      
      const inserts = noticeIds.map(noticeId => ({
        notice_id: noticeId,
        user_id: user.id,
      }));
      
      const { error } = await supabase
        .from('notice_reads')
        .upsert(inserts, { onConflict: 'notice_id,user_id' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    },
  });
}

// Realtime subscription for notice updates
export function useRealtimeNotices(onUpdate: () => void) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('notices-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notices',
        },
        () => {
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notice_reads',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, onUpdate]);
}
