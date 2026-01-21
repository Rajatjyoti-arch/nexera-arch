import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Calendar,
  Clock,
  MapPin,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type EnrolledClass, formatTimeForDisplay } from "@/hooks/useStudentClasses";
import { format, startOfWeek, addDays } from "date-fns";

interface WeeklyRoutineViewProps {
  classes: EnrolledClass[];
  currentDay: string;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DAY_COLORS: Record<string, { bg: string; border: string; accent: string }> = {
  Monday: { bg: "bg-blue-500/10", border: "border-blue-500/30", accent: "text-blue-400" },
  Tuesday: { bg: "bg-purple-500/10", border: "border-purple-500/30", accent: "text-purple-400" },
  Wednesday: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", accent: "text-emerald-400" },
  Thursday: { bg: "bg-amber-500/10", border: "border-amber-500/30", accent: "text-amber-400" },
  Friday: { bg: "bg-rose-500/10", border: "border-rose-500/30", accent: "text-rose-400" },
};

export function WeeklyRoutineView({ classes, currentDay }: WeeklyRoutineViewProps) {
  // Get dates for current week (Monday to Friday)
  const weekDates = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    
    return WEEKDAYS.map((day, index) => {
      const date = addDays(weekStart, index);
      return {
        day,
        date,
        dateNum: format(date, 'd'),
        month: format(date, 'MMM'),
        fullDate: format(date, 'EEE, MMM d'),
        isToday: day === currentDay,
      };
    });
  }, [currentDay]);

  // Group classes by day
  const classesByDay = useMemo(() => {
    const grouped: Record<string, Array<{
      id: string;
      name: string;
      courseCode: string;
      startTime: string;
      endTime: string;
      room: string;
      facultyName: string;
    }>> = {};

    WEEKDAYS.forEach(day => {
      grouped[day] = [];
    });

    classes.forEach(cls => {
      cls.schedules.forEach(schedule => {
        if (WEEKDAYS.includes(schedule.dayOfWeek)) {
          grouped[schedule.dayOfWeek].push({
            id: cls.id,
            name: cls.name,
            courseCode: cls.courseCode,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            room: cls.room,
            facultyName: cls.facultyName,
          });
        }
      });
    });

    // Sort by start time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [classes]);

  return (
    <div className="space-y-4">
      {weekDates.map((dayInfo, dayIndex) => {
        const dayClasses = classesByDay[dayInfo.day];
        const colors = DAY_COLORS[dayInfo.day];

        return (
          <motion.div
            key={dayInfo.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.05 }}
            className={cn(
              "rounded-xl border p-4",
              dayInfo.isToday 
                ? "border-primary/50 bg-primary/5" 
                : "border-border bg-card"
            )}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex flex-col items-center justify-center w-12 h-12 rounded-xl border",
                  colors.bg, colors.border
                )}>
                  <span className={cn("text-lg font-bold leading-none", colors.accent)}>
                    {dayInfo.dateNum}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {dayInfo.month}
                  </span>
                </div>
                <div>
                  <h4 className={cn(
                    "font-semibold",
                    dayInfo.isToday ? "text-primary" : "text-foreground"
                  )}>
                    {dayInfo.day}
                    {dayInfo.isToday && (
                      <span className="ml-2 text-xs font-medium text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                  </p>
                </div>
              </div>
            </div>

            {/* Classes List */}
            {dayClasses.length > 0 ? (
              <div className="space-y-2 pl-2 border-l-2 border-border/50 ml-5">
                {dayClasses.map((cls, index) => (
                  <motion.div
                    key={`${cls.id}-${index}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: dayIndex * 0.05 + index * 0.02 }}
                    className={cn(
                      "relative rounded-lg border p-3 transition-all hover:border-primary/30",
                      "bg-secondary/20 border-border/50"
                    )}
                  >
                    {/* Timeline Dot */}
                    <div className={cn(
                      "absolute -left-[9px] top-4 w-3 h-3 rounded-full border-2 border-background",
                      colors.bg.replace('/10', '/50')
                    )} 
                    style={{ backgroundColor: `hsl(var(--${dayInfo.isToday ? 'primary' : 'muted'}))` }}
                    />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                            {cls.courseCode}
                          </span>
                        </div>
                        <h5 className="font-medium text-sm text-foreground truncate">
                          {cls.name}
                        </h5>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeForDisplay(cls.startTime)} - {formatTimeForDisplay(cls.endTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {cls.room}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {cls.facultyName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground/60 ml-5 pl-2 border-l-2 border-border/30">
                No classes scheduled
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}