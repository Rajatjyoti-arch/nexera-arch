import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Activity,
  Heart,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import { useHeartRateHistory } from '@/hooks/useHeartRate';
import { cn } from '@/lib/utils';
import { format, parseISO, subDays, subMonths, startOfDay, eachDayOfInterval, eachWeekOfInterval } from 'date-fns';

type TimeRange = 'week' | 'month' | '3months';

export default function HeartRateTrends() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const { data: readings = [], isLoading } = useHeartRateHistory(timeRange);

  // Process data for chart
  const chartData = processChartData(readings, timeRange);
  
  // Calculate trends
  const trend = calculateTrend(readings);
  
  // Get min/max/avg for display
  const stats = calculateStats(readings);

  return (
    <section className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.2em] flex items-center gap-3">
          <TrendingUp className="w-4 h-4" />
          Heart Rate Trends
        </h2>
        
        <div className="flex gap-1">
          {(['week', 'month', '3months'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={cn(
                'text-xs h-7 px-3',
                timeRange === range && 'bg-rose-500 hover:bg-rose-600 text-black'
              )}
            >
              {range === 'week' ? '7D' : range === 'month' ? '30D' : '90D'}
            </Button>
          ))}
        </div>
      </div>

      <div className="premium-card card-rose p-6 lg:p-8 space-y-6 flex-1 flex flex-col">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-5 rounded-xl bg-foreground/5">
            <p className="text-4xl font-bold text-rose-500">{stats.avg || '--'}</p>
            <p className="text-xs text-foreground/60 uppercase tracking-widest mt-2">Avg BPM</p>
          </div>
          <div className="text-center p-5 rounded-xl bg-foreground/5">
            <p className="text-4xl font-bold text-blue-500">{stats.min || '--'}</p>
            <p className="text-xs text-foreground/60 uppercase tracking-widest mt-2">Min</p>
          </div>
          <div className="text-center p-5 rounded-xl bg-foreground/5">
            <p className="text-4xl font-bold text-orange-500">{stats.max || '--'}</p>
            <p className="text-xs text-foreground/60 uppercase tracking-widest mt-2">Max</p>
          </div>
          <div className="text-center p-5 rounded-xl bg-foreground/5">
            <div className="flex items-center justify-center gap-2">
              {trend.direction === 'up' && <ArrowUp className="w-6 h-6 text-orange-500" />}
              {trend.direction === 'down' && <ArrowDown className="w-6 h-6 text-blue-500" />}
              {trend.direction === 'stable' && <Minus className="w-6 h-6 text-emerald-500" />}
              <span className={cn(
                'text-4xl font-bold',
                trend.direction === 'up' && 'text-orange-500',
                trend.direction === 'down' && 'text-blue-500',
                trend.direction === 'stable' && 'text-emerald-500'
              )}>
                {Math.abs(trend.change)}%
              </span>
            </div>
            <p className="text-xs text-foreground/60 uppercase tracking-widest mt-2">Trend</p>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-[250px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-foreground/50">
              <Heart className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No heart rate data for this period</p>
              <p className="text-xs mt-1">Start measuring to see trends</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={['dataMin - 10', 'dataMax + 10']}
                  tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value} BPM`, 'Heart Rate']}
                />
                <ReferenceLine y={60} stroke="hsl(var(--chart-3))" strokeDasharray="5 5" opacity={0.5} />
                <ReferenceLine y={100} stroke="hsl(var(--chart-4))" strokeDasharray="5 5" opacity={0.5} />
                <Area
                  type="monotone"
                  dataKey="avgBpm"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fill="url(#heartRateGradient)"
                  dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-foreground/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-blue-500 border-dashed" style={{ borderTopStyle: 'dashed' }} />
            <span>Resting (60 BPM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-orange-500 border-dashed" style={{ borderTopStyle: 'dashed' }} />
            <span>Elevated (100 BPM)</span>
          </div>
        </div>

        {/* Health Insights */}
        {readings.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20"
          >
            <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Health Insight
            </h4>
            <p className="text-sm text-foreground/80">
              {getHealthInsight(stats, trend)}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// Helper functions
function processChartData(readings: any[], timeRange: TimeRange) {
  if (readings.length === 0) return [];

  const now = new Date();
  let startDate: Date;
  let groupBy: 'day' | 'week';

  switch (timeRange) {
    case 'week':
      startDate = subDays(now, 7);
      groupBy = 'day';
      break;
    case 'month':
      startDate = subDays(now, 30);
      groupBy = 'day';
      break;
    case '3months':
      startDate = subMonths(now, 3);
      groupBy = 'week';
      break;
  }

  // Group readings by date
  const grouped: Record<string, number[]> = {};
  
  readings.forEach((reading) => {
    const date = startOfDay(parseISO(reading.measured_at));
    const key = format(date, groupBy === 'day' ? 'MMM d' : "'W'w");
    
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(reading.bpm);
  });

  // Calculate averages for each group
  return Object.entries(grouped)
    .map(([date, bpms]) => ({
      date,
      avgBpm: Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length),
      readings: bpms.length,
    }))
    .slice(-14); // Limit to last 14 data points for readability
}

function calculateStats(readings: any[]) {
  if (readings.length === 0) {
    return { avg: 0, min: 0, max: 0 };
  }

  const bpms = readings.map((r) => r.bpm);
  return {
    avg: Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length),
    min: Math.min(...bpms),
    max: Math.max(...bpms),
  };
}

function calculateTrend(readings: any[]): { direction: 'up' | 'down' | 'stable'; change: number } {
  if (readings.length < 4) {
    return { direction: 'stable', change: 0 };
  }

  // Compare first half average to second half average
  const mid = Math.floor(readings.length / 2);
  const recentBpms = readings.slice(0, mid).map((r) => r.bpm);
  const olderBpms = readings.slice(mid).map((r) => r.bpm);

  const recentAvg = recentBpms.reduce((a, b) => a + b, 0) / recentBpms.length;
  const olderAvg = olderBpms.reduce((a, b) => a + b, 0) / olderBpms.length;

  const change = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);

  if (Math.abs(change) < 5) {
    return { direction: 'stable', change: 0 };
  }

  return {
    direction: change > 0 ? 'up' : 'down',
    change: Math.abs(change),
  };
}

function getHealthInsight(stats: { avg: number; min: number; max: number }, trend: { direction: string; change: number }) {
  const avgBpm = stats.avg;

  if (avgBpm === 0) return 'Keep measuring to get personalized insights.';

  let insight = '';

  if (avgBpm < 60) {
    insight = 'Your resting heart rate is below average. This could indicate excellent cardiovascular fitness, or consult a healthcare provider if you feel symptoms.';
  } else if (avgBpm >= 60 && avgBpm <= 80) {
    insight = 'Your heart rate is within the optimal resting range. This indicates good cardiovascular health.';
  } else if (avgBpm > 80 && avgBpm <= 100) {
    insight = 'Your heart rate is on the higher end of normal. Regular exercise and stress management can help lower it.';
  } else {
    insight = 'Your average heart rate is elevated. Consider consulting a healthcare provider and focusing on relaxation techniques.';
  }

  if (trend.direction === 'down' && trend.change > 5) {
    insight += ' Your heart rate has been trending lower, which is generally positive.';
  } else if (trend.direction === 'up' && trend.change > 10) {
    insight += ' Your heart rate has been trending upward. Monitor for stress or other factors.';
  }

  return insight;
}
