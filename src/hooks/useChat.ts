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

// Create a new chat
export function useCreateChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ type, participantIds, name }: { type: 'direct' | 'group'; participantIds: string[]; name?: string }) => {
      if (!user?.id) throw new Error('No user');
      
      // Create the chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          type,
          name: type === 'group' ? name : null,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (chatError) throw chatError;
      
      // Add participants (including creator)
      const allParticipantIds = [...new Set([user.id, ...participantIds])];
      const participantInserts = allParticipantIds.map(participantId => ({
        chat_id: chat.id,
        user_id: participantId,
        last_read_at: participantId === user.id ? new Date().toISOString() : null,
      }));
      
      const { error: partError } = await supabase
        .from('chat_participants')
        .insert(participantInserts);
      
      if (partError) throw partError;
      
      return chat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatsWithUnread'] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });
}

// Find or create direct chat between two users
export function useFindOrCreateDirectChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user?.id) throw new Error('No user');
      
      // Find existing direct chat
      const { data: user1Chats } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', user.id);
      
      const { data: user2Chats } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', otherUserId);
      
      if (user1Chats && user2Chats) {
        const user1ChatIds = new Set(user1Chats.map(c => c.chat_id));
        const commonChatIds = user2Chats.filter(c => user1ChatIds.has(c.chat_id)).map(c => c.chat_id);
        
        for (const chatId of commonChatIds) {
          const { data: chat } = await supabase
            .from('chats')
            .select('*')
            .eq('id', chatId)
            .eq('type', 'direct')
            .maybeSingle();
          
          if (chat) {
            // Check if it's only these two users
            const { count } = await supabase
              .from('chat_participants')
              .select('*', { count: 'exact', head: true })
              .eq('chat_id', chatId);
            
            if (count === 2) {
              return chat;
            }
          }
        }
      }
      
      // Create new direct chat
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({
          type: 'direct',
          created_by: user.id,
        })
        .select()
        .single();
      
      if (chatError) throw chatError;
      
      // Add both participants
      const { error: partError } = await supabase
        .from('chat_participants')
        .insert([
          { chat_id: newChat.id, user_id: user.id, last_read_at: new Date().toISOString() },
          { chat_id: newChat.id, user_id: otherUserId },
        ]);
      
      if (partError) throw partError;
      
      return newChat;
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
