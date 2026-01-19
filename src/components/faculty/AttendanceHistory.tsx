import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { useFacultyClasses } from "@/hooks/useFacultyDashboard";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceRecord {
  id: string;
  student_id: string;
  status: string;
  date: string;
  class_id: string;
}

interface DayAttendance {
  date: Date;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

const STATUS_COLORS = {
  present: 'bg-green-500',
  absent: 'bg-red-500',
  late: 'bg-amber-500',
  excused: 'bg-blue-500',
};

function useAttendanceHistory(classId: string, startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['attendanceHistory', classId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', classId)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!classId,
  });
}

export function AttendanceHistory() {
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { data: classes, isLoading: classesLoading } = useFacultyClasses();
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const { data: attendanceRecords, isLoading: attendanceLoading } = useAttendanceHistory(
    selectedClassId,
    monthStart,
    monthEnd
  );

  // Process attendance data by day
  const dailyAttendance = useMemo(() => {
    if (!attendanceRecords) return [];
    
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return days.map(day => {
      const dayRecords = attendanceRecords.filter(r => 
        isSameDay(new Date(r.date), day)
      );
      
      return {
        date: day,
        present: dayRecords.filter(r => r.status === 'present').length,
        absent: dayRecords.filter(r => r.status === 'absent').length,
        late: dayRecords.filter(r => r.status === 'late').length,
        excused: dayRecords.filter(r => r.status === 'excused').length,
        total: dayRecords.length,
      } as DayAttendance;
    }).filter(d => d.total > 0);
  }, [attendanceRecords, monthStart, monthEnd]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return { present: 0, absent: 0, late: 0, excused: 0, total: 0, percentage: 0 };
    }
    
    const stats = {
      present: attendanceRecords.filter(r => r.status === 'present').length,
      absent: attendanceRecords.filter(r => r.status === 'absent').length,
      late: attendanceRecords.filter(r => r.status === 'late').length,
      excused: attendanceRecords.filter(r => r.status === 'excused').length,
      total: attendanceRecords.length,
      percentage: 0,
    };
    
    stats.percentage = Math.round(((stats.present + stats.late + stats.excused) / stats.total) * 100);
    return stats;
  }, [attendanceRecords]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectedClass = classes?.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Attendance History</h2>
          <p className="text-muted-foreground">View past attendance records and trends</p>
        </div>
      </div>

      {/* Class Selection */}
      <Card className="p-4 border-border/50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class to view history..." />
              </SelectTrigger>
              <SelectContent>
                {classesLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : classes && classes.length > 0 ? (
                  classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.course?.code})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No classes</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[140px] text-center font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateMonth('next')}
              disabled={currentMonth >= new Date()}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      {selectedClassId && !attendanceLoading && attendanceRecords && attendanceRecords.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 border-border/50 text-center">
            <div className="text-3xl font-bold text-primary">{overallStats.percentage}%</div>
            <div className="text-xs text-muted-foreground mt-1">Attendance Rate</div>
          </Card>
          <Card className="p-4 border-border/50 text-center">
            <div className="text-3xl font-bold text-green-500">{overallStats.present}</div>
            <div className="text-xs text-muted-foreground mt-1">Present</div>
          </Card>
          <Card className="p-4 border-border/50 text-center">
            <div className="text-3xl font-bold text-red-500">{overallStats.absent}</div>
            <div className="text-xs text-muted-foreground mt-1">Absent</div>
          </Card>
          <Card className="p-4 border-border/50 text-center">
            <div className="text-3xl font-bold text-amber-500">{overallStats.late}</div>
            <div className="text-xs text-muted-foreground mt-1">Late</div>
          </Card>
          <Card className="p-4 border-border/50 text-center">
            <div className="text-3xl font-bold text-blue-500">{overallStats.excused}</div>
            <div className="text-xs text-muted-foreground mt-1">Excused</div>
          </Card>
        </div>
      )}

      {/* Daily Records */}
      {selectedClassId && (
        <Card className="border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Daily Records</h3>
            {selectedClass && (
              <Badge variant="secondary" className="ml-auto">
                {selectedClass.name}
              </Badge>
            )}
          </div>
          
          {attendanceLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : dailyAttendance.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border/50">
                {dailyAttendance.map((day, index) => {
                  const attendanceRate = Math.round(((day.present + day.late + day.excused) / day.total) * 100);
                  
                  return (
                    <motion.div
                      key={day.date.toISOString()}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-secondary/50 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold">{format(day.date, 'd')}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">
                              {format(day.date, 'EEE')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{format(day.date, 'MMMM d, yyyy')}</p>
                            <p className="text-sm text-muted-foreground">
                              {day.total} students marked
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          {/* Status breakdown */}
                          <div className="hidden sm:flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-green-500">
                              <CheckCircle2 className="w-4 h-4" />
                              {day.present}
                            </span>
                            <span className="flex items-center gap-1 text-red-500">
                              <XCircle className="w-4 h-4" />
                              {day.absent}
                            </span>
                            <span className="flex items-center gap-1 text-amber-500">
                              <Clock className="w-4 h-4" />
                              {day.late}
                            </span>
                            {day.excused > 0 && (
                              <span className="flex items-center gap-1 text-blue-500">
                                <AlertCircle className="w-4 h-4" />
                                {day.excused}
                              </span>
                            )}
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-24">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className={cn(
                                "font-bold",
                                attendanceRate >= 75 ? "text-green-500" : 
                                attendanceRate >= 50 ? "text-amber-500" : "text-red-500"
                              )}>
                                {attendanceRate}%
                              </span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                              <div 
                                className="h-full bg-green-500" 
                                style={{ width: `${(day.present / day.total) * 100}%` }} 
                              />
                              <div 
                                className="h-full bg-amber-500" 
                                style={{ width: `${(day.late / day.total) * 100}%` }} 
                              />
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${(day.excused / day.total) * 100}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No attendance records for this month</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Start marking attendance to see history here
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Empty State */}
      {!selectedClassId && (
        <Card className="p-12 text-center border-dashed">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">View Attendance History</h3>
          <p className="text-muted-foreground">Select a class to view attendance records and trends</p>
        </Card>
      )}
    </div>
  );
}