import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string | null;
  content: string;
  created_at: string;
  sender?: {
    name: string;
    avatar_url: string | null;
  };
}

export interface ChatWithParticipants {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  created_at: string;
  updated_at: string;
  participants: {
    user_id: string;
    profile: {
      name: string;
      avatar_url: string | null;
    } | null;
  }[];
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string | null;
  };
  unreadCount?: number;
}

// Fetch messages for a specific chat - optimized batch query
export function useChatMessages(chatId: string | null) {
  return useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: async (): Promise<Message[]> => {
      if (!chatId) return [];
      
      // Fetch messages
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (!messages?.length) return [];
      
      // Get unique sender IDs
      const senderIds = [...new Set(messages.filter(m => m.sender_id).map(m => m.sender_id!))];
      
      if (senderIds.length === 0) {
        return messages.map(m => ({ ...m, sender: undefined }));
      }
      
      // Fetch profiles in parallel
      const [studentProfiles, facultyProfiles] = await Promise.all([
        supabase
          .from('student_profiles')
          .select('user_id, name, avatar_url')
          .in('user_id', senderIds),
        supabase
          .from('faculty_profiles')
          .select('user_id, name, avatar_url')
          .in('user_id', senderIds)
      ]);
      
      const profileMap = new Map<string, { name: string; avatar_url: string | null }>();
      (studentProfiles.data || []).forEach(p => profileMap.set(p.user_id, { name: p.name, avatar_url: p.avatar_url }));
      (facultyProfiles.data || []).forEach(p => profileMap.set(p.user_id, { name: p.name, avatar_url: p.avatar_url }));
      
      return messages.map(msg => ({
        ...msg,
        sender: msg.sender_id ? profileMap.get(msg.sender_id) : undefined,
      }));
    },
    enabled: !!chatId,
    staleTime: 1000 * 10, // 10 seconds
  });
}

// Send a message
export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ chatId, content }: { chatId: string; content: string }) => {
      if (!user?.id) throw new Error('No user');
      
      // Insert message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update chat's updated_at
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
      
      return data;
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chatsWithUnread'] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });
}

// Create a new chat (via backend function to avoid RLS edge cases)
export function useCreateChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      type,
      participantIds,
      name,
    }: {
      type: 'direct' | 'group';
      participantIds: string[];
      name?: string;
    }) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase.functions.invoke('chat-create', {
        body:
          type === 'direct'
            ? { type: 'direct', otherUserId: participantIds[0] }
            : { type: 'group', participantIds, name: name || '' },
      });

      if (error) throw error;
      return data as { id: string; type: string; name: string | null; created_at: string; updated_at: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatsWithUnread'] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });
}

// Find or create direct chat between two users (via backend function)
export function useFindOrCreateDirectChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase.functions.invoke('chat-create', {
        body: { type: 'direct', otherUserId },
      });

      if (error) throw error;
      return data as { id: string; type: string; name: string | null; created_at: string; updated_at: string; created_by?: string | null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatsWithUnread'] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });
}

// Mark chat as read (kept for backwards compatibility)
export function useMarkChatAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (chatId: string) => {
      if (!user?.id) throw new Error('No user');
      
      const { error } = await supabase
        .from('chat_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatsWithUnread'] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });
}

// Realtime subscription for a specific chat
export function useRealtimeMessages(chatId: string | null, onNewMessage: (message: Message) => void) {
  useEffect(() => {
    if (!chatId) return;
    
    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          onNewMessage(payload.new as Message);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, onNewMessage]);
}
