import { supabase } from "@/integrations/supabase/client";

// Re-export types from hooks for backwards compatibility
export type { Message, ChatWithParticipants } from "@/hooks/useChat";

/**
 * Chat Service
 * 
 * This service provides utility functions for chat operations.
 * Most chat functionality is now handled by React hooks in:
 * - src/hooks/useChat.ts (messages, sending, creating chats)
 * - src/hooks/useMessages.ts (chat previews, unread counts, realtime)
 * 
 * This file is kept for backwards compatibility and edge cases.
 */
export const chatService = {
  // Subscribe to new messages for a specific chat
  subscribeToMessages(chatId: string, callback: (message: any) => void) {
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
          callback(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Mark chat as read
  async markAsRead(chatId: string, userId: string) {
    const { error } = await supabase
      .from('chat_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
