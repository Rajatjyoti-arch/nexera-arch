import { motion } from "framer-motion";
import { Flame, Clock, Target, Wind, Moon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWellnessStats, useRecentSessions } from "@/hooks/useWellness";
import { formatDistanceToNow } from "date-fns";

export default function WellnessProgress() {
  const { data: stats, isLoading: statsLoading } = useWellnessStats();
  const { data: recentSessions, isLoading: sessionsLoading } = useRecentSessions(5);
  
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  
  const statCards = [
    {
      label: 'Focus Time',
      value: `${stats?.totalFocusMinutes || 0}`,
      unit: 'min',
      icon: Target,
      colorClass: 'card-teal',
      iconColor: 'text-teal-500',
    },
    {
      label: 'Meditation',
      value: `${stats?.totalMeditationMinutes || 0}`,
      unit: 'min',
      icon: Moon,
      colorClass: 'card-violet',
      iconColor: 'text-violet-500',
    },
    {
      label: 'Breathing',
      value: `${stats?.totalBreathingMinutes || 0}`,
      unit: 'min',
      icon: Wind,
      colorClass: 'card-indigo',
      iconColor: 'text-indigo-500',
    },
    {
      label: 'Streak',
      value: `${stats?.meditationStreak || 0}`,
      unit: 'days',
      icon: Flame,
      colorClass: 'card-amber',
      iconColor: 'text-amber-500',
    },
  ];

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'focus': return Target;
      case 'meditation': return Moon;
      case 'breathing': return Wind;
      default: return Clock;
    }
  };

  const getSessionColor = (type: string) => {
    switch (type) {
      case 'focus': return 'text-teal-500';
      case 'meditation': return 'text-violet-500';
      case 'breathing': return 'text-indigo-500';
      default: return 'text-foreground/60';
    }
  };

  const formatDuration = (session: any) => {
    const seconds = session.duration_seconds || session.focus_duration_seconds || 0;
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };
  
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <section>
        <h3 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          This Week
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn("premium-card p-4", stat.colorClass)}
            >
              <div className="flex items-center gap-3">
                <div className="icon-box">
                  <stat.icon className={cn("w-4 h-4", stat.iconColor)} />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">{stat.value}</span>
                    <span className="text-[10px] text-foreground/60 uppercase">{stat.unit}</span>
                  </div>
                  <p className="text-[9px] text-foreground/60 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Recent Sessions */}
      <section>
        <h3 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-4">
          Recent Sessions
        </h3>
        
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-foreground/40" />
          </div>
        ) : recentSessions && recentSessions.length > 0 ? (
          <div className="space-y-2">
            {recentSessions.map((session, i) => {
              const Icon = getSessionIcon(session.type);
              const colorClass = getSessionColor(session.type);
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4 h-4", colorClass)} />
                    <div>
                      <p className="text-xs font-bold capitalize">{session.type}</p>
                      <p className="text-[10px] text-foreground/60">
                        {formatDistanceToNow(new Date(session.completed_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground/70">
                    {formatDuration(session)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-foreground/60">No sessions yet</p>
            <p className="text-xs text-foreground/40 mt-1">Start a focus or meditation session to track your progress</p>
          </div>
        )}
      </section>
    </div>
  );
}
