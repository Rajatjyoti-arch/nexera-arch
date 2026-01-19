import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type EnrolledClass, formatTimeForDisplay } from "@/hooks/useStudentClasses";

interface WeeklyTimetableProps {
  classes: EnrolledClass[];
  currentDay: string;
}

// Monday to Friday only (Saturday is holiday)
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TIME_SLOTS = [
  { start: '09:30', end: '10:15', label: '9:30 AM' },
  { start: '10:15', end: '11:00', label: '10:15 AM' },
  { start: '11:00', end: '11:45', label: '11:00 AM' },
  { start: '11:45', end: '12:30', label: '11:45 AM' },
  { start: '12:30', end: '14:00', label: '12:30 PM', isLunch: true },
  { start: '14:00', end: '14:45', label: '2:00 PM' },
  { start: '14:45', end: '15:30', label: '2:45 PM' },
  { start: '15:30', end: '16:15', label: '3:30 PM' },
  { start: '16:15', end: '17:00', label: '4:15 PM' },
];

// Color palette for classes
const CLASS_COLORS = [
  'bg-blue-500/20 border-blue-500/50 text-blue-300',
  'bg-purple-500/20 border-purple-500/50 text-purple-300',
  'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
  'bg-amber-500/20 border-amber-500/50 text-amber-300',
  'bg-rose-500/20 border-rose-500/50 text-rose-300',
  'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
  'bg-orange-500/20 border-orange-500/50 text-orange-300',
];

function getClassColor(index: number): string {
  return CLASS_COLORS[index % CLASS_COLORS.length];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function WeeklyTimetable({ classes, currentDay }: WeeklyTimetableProps) {
  // Create a map of class positions
  const timetableData = useMemo(() => {
    const data: Map<string, { class: EnrolledClass; colorIndex: number; startSlot: number; spanSlots: number }[]> = new Map();
    
    // Initialize all day slots
    DAYS.forEach(day => {
      data.set(day, []);
    });
    
    // Assign color indices to classes
    const classColorMap = new Map<string, number>();
    classes.forEach((cls, idx) => {
      classColorMap.set(cls.id, idx);
    });
    
    // Place classes in their slots
    classes.forEach(cls => {
      cls.schedules.forEach(schedule => {
        const day = schedule.dayOfWeek;
        const dayData = data.get(day);
        if (!dayData) return;
        
        const startMinutes = timeToMinutes(schedule.startTime);
        const endMinutes = timeToMinutes(schedule.endTime);
        
        // Find which slot this starts at
        const startSlotIndex = TIME_SLOTS.findIndex(slot => {
          const slotStart = timeToMinutes(slot.start);
          return Math.abs(slotStart - startMinutes) < 15;
        });
        
        if (startSlotIndex === -1) return;
        
        // Calculate how many slots this class spans
        let spanSlots = 1;
        for (let i = startSlotIndex + 1; i < TIME_SLOTS.length; i++) {
          const slotEnd = timeToMinutes(TIME_SLOTS[i].end);
          if (slotEnd <= endMinutes + 15) {
            spanSlots++;
          } else {
            break;
          }
        }
        
        dayData.push({
          class: cls,
          colorIndex: classColorMap.get(cls.id) || 0,
          startSlot: startSlotIndex,
          spanSlots,
        });
      });
    });
    
    return data;
  }, [classes]);

  // Get class at specific day and slot
  const getClassAtSlot = (day: string, slotIndex: number) => {
    const dayData = timetableData.get(day) || [];
    return dayData.find(item => 
      item.startSlot === slotIndex
    );
  };

  // Check if slot is occupied by a spanning class
  const isSlotOccupied = (day: string, slotIndex: number) => {
    const dayData = timetableData.get(day) || [];
    return dayData.some(item => 
      slotIndex > item.startSlot && slotIndex < item.startSlot + item.spanSlots
    );
  };

  return (
    <Card className="border-border/50 overflow-hidden">
      <ScrollArea className="w-full">
        <div className="min-w-[900px]">
          {/* Header Row - Days */}
          <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-border/50 bg-muted/30">
            <div className="p-3 text-xs font-medium text-muted-foreground border-r border-border/30">
              Time
            </div>
            {DAYS.map(day => (
              <div 
                key={day} 
                className={cn(
                  "p-3 text-center font-semibold text-sm border-r border-border/30 last:border-r-0",
                  day === currentDay && "bg-primary/10 text-primary"
                )}
              >
                {day.slice(0, 3)}
                {day === currentDay && (
                  <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                    Today
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {TIME_SLOTS.map((slot, slotIndex) => (
            <div 
              key={slot.start} 
              className={cn(
                "grid grid-cols-[80px_repeat(6,1fr)] border-b border-border/30 last:border-b-0",
                slot.isLunch && "bg-muted/20"
              )}
            >
              {/* Time Label */}
              <div className="p-2 text-xs text-muted-foreground border-r border-border/30 flex items-center justify-center">
                <span className="font-medium">{slot.label}</span>
              </div>

              {/* Day Cells */}
              {DAYS.map(day => {
                const classItem = getClassAtSlot(day, slotIndex);
                const isOccupied = isSlotOccupied(day, slotIndex);

                if (isOccupied) {
                  return null; // This cell is covered by a rowSpan
                }

                if (slot.isLunch && !classItem) {
                  return (
                    <div 
                      key={`${day}-${slotIndex}`}
                      className="p-2 border-r border-border/30 last:border-r-0 flex items-center justify-center min-h-[60px]"
                    >
                      <span className="text-xs text-muted-foreground/50">Lunch Break</span>
                    </div>
                  );
                }

                if (classItem) {
                  return (
                    <div 
                      key={`${day}-${slotIndex}`}
                      className="p-1.5 border-r border-border/30 last:border-r-0"
                      style={{ 
                        gridRow: `span ${classItem.spanSlots}`,
                        minHeight: `${classItem.spanSlots * 60}px`
                      }}
                    >
                      <div 
                        className={cn(
                          "h-full rounded-lg border p-2 flex flex-col transition-all hover:scale-[1.02] cursor-pointer",
                          getClassColor(classItem.colorIndex)
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-bold opacity-80">
                            {classItem.class.courseCode}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold leading-tight mt-1 line-clamp-2">
                          {classItem.class.name}
                        </h4>
                        <div className="mt-auto pt-1 space-y-0.5">
                          <p className="text-[10px] opacity-70 truncate">
                            {classItem.class.facultyName}
                          </p>
                          <p className="text-[10px] opacity-60 truncate">
                            {classItem.class.room}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={`${day}-${slotIndex}`}
                    className={cn(
                      "p-1.5 border-r border-border/30 last:border-r-0 min-h-[60px]",
                      day === currentDay && "bg-primary/5"
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
}