import { useState, useMemo } from "react";
import FacultyLayout from "@/components/layouts/FacultyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  Check, 
  X, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Save,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFacultyClasses } from "@/hooks/useFacultyDashboard";
import { useClassStudents, useMarkAttendance, useClassAttendance } from "@/hooks/useFacultyAttendance";
import { toast } from "sonner";

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface StudentAttendance {
  student_id: string;
  status: AttendanceStatus;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; icon: typeof Check; bgColor: string }> = {
  present: { 
    label: 'Present', 
    color: 'text-green-500', 
    icon: CheckCircle2,
    bgColor: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
  },
  absent: { 
    label: 'Absent', 
    color: 'text-red-500', 
    icon: XCircle,
    bgColor: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
  },
  late: { 
    label: 'Late', 
    color: 'text-amber-500', 
    icon: Clock,
    bgColor: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
  },
  excused: { 
    label: 'Excused', 
    color: 'text-blue-500', 
    icon: AlertCircle,
    bgColor: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
  },
};

function AttendanceButton({ 
  status, 
  isSelected, 
  onClick 
}: { 
  status: AttendanceStatus; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg border transition-all duration-200",
        isSelected ? config.bgColor : "border-border/50 hover:bg-secondary/50",
        isSelected && "ring-2 ring-offset-2 ring-offset-background",
        isSelected && status === 'present' && "ring-green-500/50",
        isSelected && status === 'absent' && "ring-red-500/50",
        isSelected && status === 'late' && "ring-amber-500/50",
        isSelected && status === 'excused' && "ring-blue-500/50",
      )}
      title={config.label}
    >
      <Icon className={cn("w-5 h-5", isSelected ? config.color : "text-muted-foreground")} />
    </button>
  );
}

export default function FacultyAttendance() {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceMap, setAttendanceMap] = useState<Map<string, AttendanceStatus>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);
  
  const { data: classes, isLoading: classesLoading } = useFacultyClasses();
  const { data: students, isLoading: studentsLoading } = useClassStudents(selectedClassId);
  const { data: existingAttendance, isLoading: attendanceLoading, refetch: refetchAttendance } = useClassAttendance(
    selectedClassId, 
    format(selectedDate, 'yyyy-MM-dd')
  );
  const markAttendanceMutation = useMarkAttendance();

  // Initialize attendance map when existing attendance is loaded
  useMemo(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const newMap = new Map<string, AttendanceStatus>();
      existingAttendance.forEach(record => {
        newMap.set(record.student_id, record.status as AttendanceStatus);
      });
      setAttendanceMap(newMap);
      setHasChanges(false);
    } else if (students && students.length > 0 && !existingAttendance?.length) {
      // Default all to present if no existing records
      const newMap = new Map<string, AttendanceStatus>();
      students.forEach(student => {
        newMap.set(student.user_id, 'present');
      });
      setAttendanceMap(newMap);
      setHasChanges(false);
    }
  }, [existingAttendance, students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => {
      const newMap = new Map(prev);
      newMap.set(studentId, status);
      return newMap;
    });
    setHasChanges(true);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (!students) return;
    const newMap = new Map<string, AttendanceStatus>();
    students.forEach(student => {
      newMap.set(student.user_id, status);
    });
    setAttendanceMap(newMap);
    setHasChanges(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || attendanceMap.size === 0) return;

    const attendanceData: StudentAttendance[] = [];
    attendanceMap.forEach((status, student_id) => {
      attendanceData.push({ student_id, status });
    });

    try {
      await markAttendanceMutation.mutateAsync({
        classId: selectedClassId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        attendance: attendanceData,
      });
      
      toast.success('Attendance saved successfully!', {
        description: `Marked ${attendanceData.length} students for ${format(selectedDate, 'MMMM d, yyyy')}`,
      });
      setHasChanges(false);
      refetchAttendance();
    } catch (error) {
      toast.error('Failed to save attendance', {
        description: 'Please try again',
      });
    }
  };

  const selectedClass = classes?.find(c => c.id === selectedClassId);
  
  // Stats
  const stats = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, excused: 0 };
    attendanceMap.forEach(status => {
      counts[status]++;
    });
    return counts;
  }, [attendanceMap]);

  return (
    <FacultyLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mark Attendance</h1>
            <p className="text-muted-foreground">Record student attendance for your classes</p>
          </div>
        </div>

        {/* Selection Controls */}
        <Card className="p-6 border-border/50">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Class Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Class</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a class..." />
                </SelectTrigger>
                <SelectContent>
                  {classesLoading ? (
                    <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                  ) : classes && classes.length > 0 ? (
                    classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        <span className="font-medium">{cls.name}</span>
                        <span className="text-muted-foreground ml-2">({cls.course?.code})</span>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No classes assigned</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Class Info */}
          {selectedClass && (
            <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {students?.length || 0} Students
              </Badge>
              <Badge variant="outline" className="text-xs">
                {selectedClass.course?.code}
              </Badge>
              {selectedClass.room && (
                <Badge variant="outline" className="text-xs">
                  {selectedClass.room}
                </Badge>
              )}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        {selectedClassId && students && students.length > 0 && (
          <Card className="p-4 border-border/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Quick Actions:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleMarkAll('present')}
                  className="text-green-600 border-green-500/30 hover:bg-green-500/10"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  All Present
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleMarkAll('absent')}
                  className="text-red-600 border-red-500/30 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  All Absent
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-500 font-medium">{stats.present} Present</span>
                <span className="text-red-500 font-medium">{stats.absent} Absent</span>
                <span className="text-amber-500 font-medium">{stats.late} Late</span>
                <span className="text-blue-500 font-medium">{stats.excused} Excused</span>
              </div>
            </div>
          </Card>
        )}

        {/* Students List */}
        {selectedClassId && (
          <Card className="border-border/50 overflow-hidden">
            {studentsLoading || attendanceLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : students && students.length > 0 ? (
              <div className="divide-y divide-border/50">
                <AnimatePresence>
                  {students.map((student, index) => {
                    const currentStatus = attendanceMap.get(student.user_id) || 'present';
                    
                    return (
                      <motion.div
                        key={student.user_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{student.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map(status => (
                            <AttendanceButton
                              key={status}
                              status={status}
                              isSelected={currentStatus === status}
                              onClick={() => handleStatusChange(student.user_id, status)}
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No students enrolled in this class</p>
              </div>
            )}
          </Card>
        )}

        {/* Empty State */}
        {!selectedClassId && (
          <Card className="p-12 text-center border-dashed">
            <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Class</h3>
            <p className="text-muted-foreground">Choose a class and date to start marking attendance</p>
          </Card>
        )}

        {/* Save Button */}
        {selectedClassId && students && students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-4"
          >
            <Card className="p-4 border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {hasChanges ? (
                    <span className="text-amber-500 font-medium">You have unsaved changes</span>
                  ) : existingAttendance && existingAttendance.length > 0 ? (
                    <span className="text-green-500">Attendance already recorded for this date</span>
                  ) : (
                    <span>Ready to save attendance</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => refetchAttendance()}
                    disabled={markAttendanceMutation.isPending}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleSaveAttendance}
                    disabled={markAttendanceMutation.isPending || !hasChanges}
                    className="min-w-32"
                  >
                    {markAttendanceMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Attendance
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </FacultyLayout>
  );
}