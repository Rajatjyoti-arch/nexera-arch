import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type EnrolledClass, formatTimeForDisplay } from "@/hooks/useStudentClasses";
import { Progress } from "@/components/ui/progress";

interface ClassRoutineDashboardProps {
  classes: EnrolledClass[];
  currentDay: string;
}

// Days of the week (Mon-Fri)
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Color palette for subjects
const SUBJECT_COLORS = [
  { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-400", accent: "#3b82f6" },
  { bg: "bg-purple-500/20", border: "border-purple-500/40", text: "text-purple-400", accent: "#a855f7" },
  { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-400", accent: "#10b981" },
  { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-400", accent: "#f59e0b" },
  { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-400", accent: "#f43f5e" },
  { bg: "bg-cyan-500/20", border: "border-cyan-500/40", text: "text-cyan-400", accent: "#06b6d4" },
  { bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-400", accent: "#f97316" },
];

function getSubjectColor(index: number) {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

export function ClassRoutineDashboard({ classes, currentDay }: ClassRoutineDashboardProps) {
  const analytics = useMemo(() => {
    // Count classes per day
    const classesPerDay: Record<string, number> = {};
    WEEKDAYS.forEach(day => {
      classesPerDay[day] = 0;
    });

    // Count total hours and classes per subject
    const subjectStats: Record<string, { name: string; hours: number; sessionsPerWeek: number; color: ReturnType<typeof getSubjectColor> }> = {};
    let totalWeeklyHours = 0;

    classes.forEach((cls, idx) => {
      const color = getSubjectColor(idx);
      
      cls.schedules.forEach(schedule => {
        if (WEEKDAYS.includes(schedule.dayOfWeek)) {
          classesPerDay[schedule.dayOfWeek]++;
          
          // Calculate duration in hours
          const [startH, startM] = schedule.startTime.split(':').map(Number);
          const [endH, endM] = schedule.endTime.split(':').map(Number);
          const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
          const durationHours = durationMinutes / 60;
          totalWeeklyHours += durationHours;

          if (!subjectStats[cls.id]) {
            subjectStats[cls.id] = {
              name: cls.name,
              hours: 0,
              sessionsPerWeek: 0,
              color
            };
          }
          subjectStats[cls.id].hours += durationHours;
          subjectStats[cls.id].sessionsPerWeek++;
        }
      });
    });

    // Find busiest and lightest days
    const busiestDay = WEEKDAYS.reduce((a, b) => classesPerDay[a] > classesPerDay[b] ? a : b);
    const lightestDay = WEEKDAYS.reduce((a, b) => classesPerDay[a] < classesPerDay[b] ? a : b);
    const todayClasses = classesPerDay[currentDay] || 0;
    const maxClasses = Math.max(...Object.values(classesPerDay), 1);

    // Sort subjects by hours
    const sortedSubjects = Object.values(subjectStats)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    return {
      classesPerDay,
      totalSubjects: classes.length,
      totalWeeklyHours: Math.round(totalWeeklyHours * 10) / 10,
      busiestDay,
      lightestDay,
      todayClasses,
      maxClasses,
      sortedSubjects,
      avgClassesPerDay: Math.round((Object.values(classesPerDay).reduce((a, b) => a + b, 0) / 5) * 10) / 10
    };
  }, [classes, currentDay]);

  return (
    <div className="space-y-4">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Total Subjects</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.totalSubjects}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-violet-500" />
            <span className="text-xs text-muted-foreground">Weekly Hours</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.totalWeeklyHours}h</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.todayClasses} <span className="text-sm font-normal text-muted-foreground">classes</span></p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Daily Avg</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.avgClassesPerDay}</p>
        </motion.div>
      </div>

      {/* Weekly Load Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card p-4"
      >
        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Weekly Class Distribution
        </h4>
        <div className="flex items-end justify-between gap-2 h-24">
          {WEEKDAYS.map((day, index) => {
            const count = analytics.classesPerDay[day];
            const heightPercent = (count / analytics.maxClasses) * 100;
            const isToday = day === currentDay;
            
            return (
              <motion.div
                key={day}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex-1 flex flex-col items-center gap-2"
                style={{ originY: 1 }}
              >
                <div className="relative w-full flex justify-center">
                  <div
                    className={cn(
                      "w-full max-w-[40px] rounded-t-lg transition-all",
                      isToday 
                        ? "bg-gradient-to-t from-violet-600 to-violet-400 shadow-lg shadow-violet-500/30" 
                        : "bg-gradient-to-t from-secondary/60 to-secondary/30"
                    )}
                    style={{ height: `${Math.max(heightPercent, 8)}px` }}
                  />
                  {count > 0 && (
                    <span className={cn(
                      "absolute -top-5 text-xs font-bold",
                      isToday ? "text-violet-400" : "text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isToday ? "text-violet-400" : "text-muted-foreground"
                )}>
                  {day.slice(0, 3)}
                </span>
              </motion.div>
            );
          })}
        </div>
        
        {/* Insights */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
            <span className="text-muted-foreground">Busiest: <span className="text-foreground font-medium">{analytics.busiestDay}</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-muted-foreground">Lightest: <span className="text-foreground font-medium">{analytics.lightestDay}</span></span>
          </div>
        </div>
      </motion.div>

      {/* Subject Hours Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border border-border bg-card p-4"
      >
        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Subject Hours (Weekly)
        </h4>
        <div className="space-y-3">
          {analytics.sortedSubjects.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-medium truncate max-w-[60%]">
                  {subject.name}
                </span>
                <span className="text-muted-foreground">
                  {subject.hours.toFixed(1)}h • {subject.sessionsPerWeek} sessions
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-secondary/30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(subject.hours / analytics.totalWeeklyHours) * 100}%` }}
                  transition={{ delay: 0.4 + index * 0.05, duration: 0.5 }}
                  className={cn("absolute inset-y-0 left-0 rounded-full", subject.color.bg)}
                  style={{ backgroundColor: subject.color.accent }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
