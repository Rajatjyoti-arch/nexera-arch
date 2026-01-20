import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PresenceState {
  onlineUsers: Set<string>;
  typingUsers: Map<string, { name: string; timestamp: number }>;
}

interface PresencePayload {
  user_id: string;
  user_name: string;
  is_typing?: boolean;
  last_seen: string;
}

export function useChatPresence(chatId: string | null) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, { name: string; timestamp: number }>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Clean up stale typing indicators (> 3 seconds old)
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => {
        const now = Date.now();
        const newMap = new Map(prev);
        let changed = false;
        
        for (const [userId, data] of newMap) {
          if (now - data.timestamp > 3000) {
            newMap.delete(userId);
            changed = true;
          }
        }
        
        return changed ? newMap : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Subscribe to presence channel for the chat
  useEffect(() => {
    if (!chatId || !user?.id) return;

    const channel = supabase.channel(`chat-presence:${chatId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresencePayload>();
        const online = new Set<string>();
        const typing = new Map<string, { name: string; timestamp: number }>();

        Object.values(state).forEach(presences => {
          presences.forEach((presence) => {
            if (presence.user_id !== user.id) {
              online.add(presence.user_id);
              if (presence.is_typing) {
                typing.set(presence.user_id, {
                  name: presence.user_name,
                  timestamp: Date.now(),
                });
              }
            }
          });
        });

        setOnlineUsers(online);
        setTypingUsers(typing);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        (newPresences as unknown as PresencePayload[]).forEach((presence) => {
          if (presence.user_id !== user.id) {
            setOnlineUsers(prev => new Set([...prev, presence.user_id]));
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        (leftPresences as unknown as PresencePayload[]).forEach((presence) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(presence.user_id);
            return newSet;
          });
          setTypingUsers(prev => {
            const newMap = new Map(prev);
            newMap.delete(presence.user_id);
            return newMap;
          });
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Get user name from profiles
          const [studentResult, facultyResult] = await Promise.all([
            supabase.from('student_profiles').select('name').eq('user_id', user.id).single(),
            supabase.from('faculty_profiles').select('name').eq('user_id', user.id).single(),
          ]);
          
          const userName = studentResult.data?.name || facultyResult.data?.name || 'Unknown';
          
          await channel.track({
            user_id: user.id,
            user_name: userName,
            is_typing: false,
            last_seen: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [chatId, user?.id]);

  // Function to send typing status
  const sendTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!channelRef.current || !user?.id) return;
    if (isTypingRef.current === isTyping) return; // No change
    
    isTypingRef.current = isTyping;
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Get user name
    const [studentResult, facultyResult] = await Promise.all([
      supabase.from('student_profiles').select('name').eq('user_id', user.id).single(),
      supabase.from('faculty_profiles').select('name').eq('user_id', user.id).single(),
    ]);
    
    const userName = studentResult.data?.name || facultyResult.data?.name || 'Unknown';

    await channelRef.current.track({
      user_id: user.id,
      user_name: userName,
      is_typing: isTyping,
      last_seen: new Date().toISOString(),
    });

    // Auto-clear typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        channelRef.current?.track({
          user_id: user.id,
          user_name: userName,
          is_typing: false,
          last_seen: new Date().toISOString(),
        });
      }, 3000);
    }
  }, [user?.id]);

  // Get typing indicator text
  const getTypingIndicator = useCallback((): string | null => {
    if (typingUsers.size === 0) return null;
    
    const names = Array.from(typingUsers.values()).map(t => t.name);
    
    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    } else {
      return `${names.length} people are typing...`;
    }
  }, [typingUsers]);

  return {
    onlineUsers,
    typingUsers,
    sendTypingStatus,
    getTypingIndicator,
    isUserOnline: (userId: string) => onlineUsers.has(userId),
  };
}

// Hook for global online status (used in chat list)
export function useGlobalPresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel('global-presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = new Set<string>();

        Object.keys(state).forEach(userId => {
          if (userId !== user.id) {
            online.add(userId);
          }
        });

        setOnlineUsers(online);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  return {
    onlineUsers,
    isUserOnline: (userId: string) => onlineUsers.has(userId),
  };
}
