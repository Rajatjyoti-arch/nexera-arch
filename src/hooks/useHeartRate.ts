import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { subDays, subMonths } from 'date-fns';

export interface HeartRateReading {
  id: string;
  user_id: string;
  bpm: number;
  measurement_method: string;
  signal_quality: string | null;
  notes: string | null;
  measured_at: string;
  created_at: string;
}

export interface HeartRateStats {
  averageBpm: number;
  minBpm: number;
  maxBpm: number;
  readingsCount: number;
  latestReading: HeartRateReading | null;
}

// Get heart rate readings for the current user
export function useHeartRateReadings(limit = 50) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['heartRateReadings', user?.id, limit],
    queryFn: async (): Promise<HeartRateReading[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('heart_rate_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching heart rate readings:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });
}

// Get heart rate history for trends chart
export function useHeartRateHistory(timeRange: 'week' | 'month' | '3months' = 'week') {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['heartRateHistory', user?.id, timeRange],
    queryFn: async (): Promise<HeartRateReading[]> => {
      if (!user?.id) return [];
      
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'week':
          startDate = subDays(now, 7);
          break;
        case 'month':
          startDate = subDays(now, 30);
          break;
        case '3months':
          startDate = subMonths(now, 3);
          break;
      }
      
      const { data, error } = await supabase
        .from('heart_rate_readings')
        .select('*')
        .eq('user_id', user.id)
        .gte('measured_at', startDate.toISOString())
        .order('measured_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching heart rate history:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });
}

// Get heart rate stats
export function useHeartRateStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['heartRateStats', user?.id],
    queryFn: async (): Promise<HeartRateStats> => {
      if (!user?.id) {
        return {
          averageBpm: 0,
          minBpm: 0,
          maxBpm: 0,
          readingsCount: 0,
          latestReading: null,
        };
      }
      
      // Fetch last 7 days of readings
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('heart_rate_readings')
        .select('*')
        .eq('user_id', user.id)
        .gte('measured_at', weekAgo)
        .order('measured_at', { ascending: false });
      
      if (error || !data || data.length === 0) {
        return {
          averageBpm: 0,
          minBpm: 0,
          maxBpm: 0,
          readingsCount: 0,
          latestReading: null,
        };
      }
      
      const bpmValues = data.map(r => r.bpm);
      const averageBpm = Math.round(bpmValues.reduce((a, b) => a + b, 0) / bpmValues.length);
      const minBpm = Math.min(...bpmValues);
      const maxBpm = Math.max(...bpmValues);
      
      return {
        averageBpm,
        minBpm,
        maxBpm,
        readingsCount: data.length,
        latestReading: data[0],
      };
    },
    enabled: !!user?.id,
  });
}

// Save a heart rate reading
export function useSaveHeartRateReading() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      bpm: number;
      measurement_method?: string;
      signal_quality?: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: result, error } = await supabase
        .from('heart_rate_readings')
        .insert({
          user_id: user.id,
          bpm: data.bpm,
          measurement_method: data.measurement_method || 'webcam',
          signal_quality: data.signal_quality || null,
          notes: data.notes || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heartRateReadings'] });
      queryClient.invalidateQueries({ queryKey: ['heartRateStats'] });
      toast.success('Heart rate saved!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });
}

// Get heart rate classification
export function getHeartRateZone(bpm: number): { zone: string; color: string; description: string } {
  if (bpm < 60) {
    return { zone: 'Resting', color: 'blue', description: 'Below normal resting rate' };
  } else if (bpm < 100) {
    return { zone: 'Normal', color: 'green', description: 'Healthy resting heart rate' };
  } else if (bpm < 140) {
    return { zone: 'Elevated', color: 'yellow', description: 'Moderate activity or stress' };
  } else if (bpm < 170) {
    return { zone: 'High', color: 'orange', description: 'Vigorous activity' };
  } else {
    return { zone: 'Max', color: 'red', description: 'Maximum effort zone' };
  }
}
