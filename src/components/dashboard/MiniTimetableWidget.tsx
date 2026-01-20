import { Clock, MapPin, User, ChevronRight, CalendarOff } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EnrolledClass, formatTimeForDisplay, getClassStatus } from "@/hooks/useStudentClasses";

interface MiniTimetableWidgetProps {
  classes: EnrolledClass[];
  currentDay: string;
}

interface TodayClass {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  room: string | null;
  facultyName: string;
  status: 'completed' | 'live' | 'upcoming';
}

export function MiniTimetableWidget({ classes, currentDay }: MiniTimetableWidgetProps) {
  // Get today's classes with their schedules
  const todaysClasses: TodayClass[] = [];
  
  classes.forEach(cls => {
    cls.schedules
      .filter(s => s.dayOfWeek === currentDay)
      .forEach(schedule => {
        const status = getClassStatus(schedule.startTime, schedule.endTime, currentDay);
        if (status !== 'not-today') {
          todaysClasses.push({
            id: `${cls.id}-${schedule.startTime}`,
            name: cls.name,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            room: cls.room,
            facultyName: cls.facultyName,
            status: status as 'completed' | 'live' | 'upcoming',
          });
        }
      });
  });

  // Sort by start time
  todaysClasses.sort((a, b) => {
    const [aH, aM] = a.startTime.split(':').map(Number);
    const [bH, bM] = b.startTime.split(':').map(Number);
    return (aH * 60 + aM) - (bH * 60 + bM);
  });

  // Filter to show only remaining classes (live + upcoming)
  const remainingClasses = todaysClasses.filter(c => c.status === 'live' || c.status === 'upcoming');

  if (remainingClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CalendarOff className="w-10 h-10 text-foreground/30 mb-3" />
        <p className="text-sm font-medium text-foreground/60">No more classes today</p>
        <p className="text-xs text-foreground/40 mt-1">Enjoy your free time!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {remainingClasses.slice(0, 4).map((cls, index) => {
        const isLive = cls.status === 'live';
        const displayTime = formatTimeForDisplay(cls.startTime);
        const endDisplayTime = formatTimeForDisplay(cls.endTime);

        return (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              isLive 
                ? "bg-emerald-500/10 border-emerald-500/30" 
                : "bg-secondary/5 border-border/50 hover:border-border"
            )}
          >
            {/* Time indicator */}
            <div className={cn(
              "flex-shrink-0 w-14 text-center py-1.5 px-2 rounded-lg",
              isLive ? "bg-emerald-500/20" : "bg-secondary/10"
            )}>
              <p className={cn(
                "text-xs font-bold",
                isLive ? "text-emerald-500" : "text-foreground/80"
              )}>
                {displayTime.split(' ')[0]}
              </p>
              <p className={cn(
                "text-[9px] font-semibold uppercase",
                isLive ? "text-emerald-500/70" : "text-foreground/50"
              )}>
                {displayTime.split(' ')[1]}
              </p>
            </div>

            {/* Class info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "text-sm font-semibold truncate",
                  isLive ? "text-emerald-600 dark:text-emerald-400" : "text-foreground/90"
                )}>
                  {cls.name}
                </h4>
                {isLive && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[8px] font-black text-white uppercase tracking-wider animate-pulse">
                    Live
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-foreground/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {displayTime.split(' ')[0]} - {endDisplayTime.split(' ')[0]}
                </span>
                {cls.room && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{cls.room}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Arrow indicator */}
            <ChevronRight className={cn(
              "w-4 h-4 flex-shrink-0",
              isLive ? "text-emerald-500" : "text-foreground/30"
            )} />
          </motion.div>
        );
      })}

      {remainingClasses.length > 4 && (
        <p className="text-center text-xs text-foreground/50 font-medium pt-1">
          +{remainingClasses.length - 4} more classes
        </p>
      )}
    </div>
  );
}
