import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface ChatPreview {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  participants: {
    userId: string;
    name: string;
    avatarUrl: string | null;
  }[];
}

// Fetch all chats with unread counts - optimized batch queries
export function useChatsWithUnread() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['chatsWithUnread', user?.id],
    queryFn: async (): Promise<ChatPreview[]> => {
      if (!user?.id) return [];
      
      // Get user's chat participations with last_read_at
      const { data: participations, error: partError } = await supabase
        .from('chat_participants')
        .select('chat_id, last_read_at')
        .eq('user_id', user.id);
      
      if (partError) throw partError;
      if (!participations?.length) return [];
      
      const chatIds = participations.map(p => p.chat_id);
      const lastReadMap = new Map(participations.map(p => [p.chat_id, p.last_read_at]));
      
      // Fetch chats, participants, and profiles in parallel
      const [chatsResult, allParticipantsResult, messagesResult] = await Promise.all([
        supabase
          .from('chats')
          .select('id, name, type, updated_at')
          .in('id', chatIds)
          .order('updated_at', { ascending: false }),
        supabase
          .from('chat_participants')
          .select('chat_id, user_id')
          .in('chat_id', chatIds),
        // Fetch all messages for unread count and last message
        supabase
          .from('messages')
          .select('id, chat_id, content, created_at, sender_id')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: false })
      ]);
      
      if (chatsResult.error) throw chatsResult.error;
      if (!chatsResult.data?.length) return [];
      
      const allParticipants = allParticipantsResult.data || [];
      const allMessages = messagesResult.data || [];
      
      // Get user profiles for participants
      const otherUserIds = [...new Set(allParticipants
        .filter(p => p.user_id !== user.id)
        .map(p => p.user_id))];
      
      // Fetch student and faculty profiles in parallel
      const [studentProfiles, facultyProfiles] = await Promise.all([
        supabase
          .from('student_profiles')
          .select('user_id, name, avatar_url')
          .in('user_id', otherUserIds),
        supabase
          .from('faculty_profiles')
          .select('user_id, name, avatar_url')
          .in('user_id', otherUserIds)
      ]);
      
      const profileMap = new Map<string, { name: string; avatarUrl: string | null }>();
      (studentProfiles.data || []).forEach(p => profileMap.set(p.user_id, { name: p.name, avatarUrl: p.avatar_url }));
      (facultyProfiles.data || []).forEach(p => profileMap.set(p.user_id, { name: p.name, avatarUrl: p.avatar_url }));
      
      // Group messages by chat_id for efficient lookup
      const messagesByChat = new Map<string, typeof allMessages>();
      for (const msg of allMessages) {
        if (!messagesByChat.has(msg.chat_id)) {
          messagesByChat.set(msg.chat_id, []);
        }
        messagesByChat.get(msg.chat_id)!.push(msg);
      }
      
      // Build results
      const results: ChatPreview[] = chatsResult.data.map(chat => {
        const lastReadAt = lastReadMap.get(chat.id);
        const chatMessages = messagesByChat.get(chat.id) || [];
        
        // Calculate unread count (messages after last_read_at that aren't from current user)
        const unreadCount = chatMessages.filter(msg => {
          if (msg.sender_id === user.id) return false;
          if (!lastReadAt) return true;
          return new Date(msg.created_at) > new Date(lastReadAt);
        }).length;
        
        // Get last message (first in sorted array)
        const lastMsg = chatMessages[0];
        
        // Build participants list
        const chatParticipants = allParticipants
          .filter(p => p.chat_id === chat.id && p.user_id !== user.id)
          .map(p => {
            const profile = profileMap.get(p.user_id);
            return {
              userId: p.user_id,
              name: profile?.name || 'Unknown',
              avatarUrl: profile?.avatarUrl || null,
            };
          });
        
        // For direct chats, use participant name as chat name
        let chatName = chat.name;
        if (chat.type === 'direct' && !chatName && chatParticipants.length > 0) {
          chatName = chatParticipants[0].name;
        }
        
        return {
          id: chat.id,
          name: chatName,
          type: chat.type as 'direct' | 'group',
          lastMessage: lastMsg?.content || null,
          lastMessageAt: lastMsg?.created_at || chat.updated_at,
          unreadCount,
          participants: chatParticipants,
        };
      });
      
      return results;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute as backup
  });
}

// Get total unread message count
export function useTotalUnreadMessages() {
  const { data: chats } = useChatsWithUnread();
  return chats?.reduce((sum, chat) => sum + chat.unreadCount, 0) || 0;
}

// Mark chat as read
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
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });
}

// Realtime subscription for messages - optimized with callback memoization
export function useRealtimeMessages(onUpdate: () => void) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
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

// Realtime subscription for a specific chat
export function useRealtimeChatMessages(chatId: string | null, onNewMessage: () => void) {
  useEffect(() => {
    if (!chatId) return;
    
    const channel = supabase
      .channel(`chat-messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          onNewMessage();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, onNewMessage]);
}
