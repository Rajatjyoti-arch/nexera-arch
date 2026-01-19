import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface MeditationSession {
  id: string;
  user_id: string;
  duration_seconds: number;
  completed_at: string;
  session_type: string;
  notes: string | null;
  created_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  focus_duration_seconds: number;
  break_duration_seconds: number;
  completed_at: string;
  session_count: number;
  task_label: string | null;
  created_at: string;
}

export interface BreathingSession {
  id: string;
  user_id: string;
  duration_seconds: number;
  pattern: string;
  completed_at: string;
  created_at: string;
}

export interface WellnessStats {
  totalFocusMinutes: number;
  totalMeditationMinutes: number;
  totalBreathingMinutes: number;
  meditationStreak: number;
  focusSessionsToday: number;
  sessionsThisWeek: number;
}

// ============ WELLNESS STATS ============

export function useWellnessStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['wellnessStats', user?.id],
    queryFn: async (): Promise<WellnessStats> => {
      if (!user?.id) throw new Error('No user');
      
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Fetch all sessions in parallel
      const [meditationRes, focusRes, breathingRes, focusTodayRes] = await Promise.all([
        supabase
          .from('meditation_sessions')
          .select('duration_seconds, completed_at')
          .eq('user_id', user.id)
          .gte('completed_at', weekAgo)
          .order('completed_at', { ascending: false }),
        supabase
          .from('focus_sessions')
          .select('focus_duration_seconds, completed_at')
          .eq('user_id', user.id)
          .gte('completed_at', weekAgo),
        supabase
          .from('breathing_sessions')
          .select('duration_seconds, completed_at')
          .eq('user_id', user.id)
          .gte('completed_at', weekAgo),
        supabase
          .from('focus_sessions')
          .select('id')
          .eq('user_id', user.id)
          .gte('completed_at', todayStart),
      ]);

      const meditationSessions = meditationRes.data || [];
      const focusSessions = focusRes.data || [];
      const breathingSessions = breathingRes.data || [];
      
      // Calculate totals
      const totalFocusSeconds = focusSessions.reduce((sum, s) => sum + (s.focus_duration_seconds || 0), 0);
      const totalMeditationSeconds = meditationSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      const totalBreathingSeconds = breathingSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      
      // Calculate meditation streak (consecutive days)
      const meditationStreak = calculateStreak(meditationSessions.map(s => s.completed_at));
      
      return {
        totalFocusMinutes: Math.round(totalFocusSeconds / 60),
        totalMeditationMinutes: Math.round(totalMeditationSeconds / 60),
        totalBreathingMinutes: Math.round(totalBreathingSeconds / 60),
        meditationStreak,
        focusSessionsToday: focusTodayRes.data?.length || 0,
        sessionsThisWeek: meditationSessions.length + focusSessions.length + breathingSessions.length,
      };
    },
    enabled: !!user?.id,
    staleTime: 60000, // Cache for 1 minute
  });
}

// Calculate consecutive days streak
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  const uniqueDays = new Set(
    dates.map(d => new Date(d).toDateString())
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDay = new Date(today);
  
  // Check if there's a session today or yesterday to start the streak
  const hasToday = uniqueDays.has(currentDay.toDateString());
  if (!hasToday) {
    currentDay.setDate(currentDay.getDate() - 1);
    if (!uniqueDays.has(currentDay.toDateString())) {
      return 0;
    }
  }
  
  // Count consecutive days
  while (uniqueDays.has(currentDay.toDateString())) {
    streak++;
    currentDay.setDate(currentDay.getDate() - 1);
  }
  
  return streak;
}

// ============ RECENT SESSIONS ============

export function useRecentSessions(limit = 10) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recentWellnessSessions', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const [meditationRes, focusRes, breathingRes] = await Promise.all([
        supabase
          .from('meditation_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(limit),
        supabase
          .from('focus_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(limit),
        supabase
          .from('breathing_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(limit),
      ]);

      // Combine and sort by date
      const allSessions = [
        ...(meditationRes.data || []).map(s => ({ ...s, type: 'meditation' as const })),
        ...(focusRes.data || []).map(s => ({ ...s, type: 'focus' as const })),
        ...(breathingRes.data || []).map(s => ({ ...s, type: 'breathing' as const })),
      ].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
       .slice(0, limit);

      return allSessions;
    },
    enabled: !!user?.id,
  });
}

// ============ SAVE SESSION MUTATIONS ============

export function useSaveMeditationSession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { duration_seconds: number; session_type?: string; notes?: string }) => {
      if (!user?.id) throw new Error('No user');
      
      const { data: result, error } = await supabase
        .from('meditation_sessions')
        .insert({
          user_id: user.id,
          duration_seconds: data.duration_seconds,
          session_type: data.session_type || 'meditation',
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellnessStats'] });
      queryClient.invalidateQueries({ queryKey: ['recentWellnessSessions'] });
      toast.success('Meditation session saved!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save session: ${error.message}`);
    },
  });
}

export function useSaveFocusSession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      focus_duration_seconds: number; 
      break_duration_seconds?: number;
      session_count?: number;
      task_label?: string;
    }) => {
      if (!user?.id) throw new Error('No user');
      
      const { data: result, error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          focus_duration_seconds: data.focus_duration_seconds,
          break_duration_seconds: data.break_duration_seconds || 0,
          session_count: data.session_count || 1,
          task_label: data.task_label || null,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellnessStats'] });
      queryClient.invalidateQueries({ queryKey: ['recentWellnessSessions'] });
      toast.success('Focus session saved!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save session: ${error.message}`);
    },
  });
}

export function useSaveBreathingSession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { duration_seconds: number; pattern?: string }) => {
      if (!user?.id) throw new Error('No user');
      
      const { data: result, error } = await supabase
        .from('breathing_sessions')
        .insert({
          user_id: user.id,
          duration_seconds: data.duration_seconds,
          pattern: data.pattern || 'box',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellnessStats'] });
      queryClient.invalidateQueries({ queryKey: ['recentWellnessSessions'] });
      toast.success('Breathing session completed!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save session: ${error.message}`);
    },
  });
}

// ============ TIMER HOOK ============

export interface UseTimerOptions {
  initialSeconds?: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useTimer(options: UseTimerOptions = {}) {
  const { initialSeconds = 0, onComplete, autoStart = false } = options;
  
  return {
    // This is a placeholder - actual timer state is managed in the component
    // to avoid hook state persistence issues with SSR
    initialSeconds,
    onComplete,
    autoStart,
  };
}
