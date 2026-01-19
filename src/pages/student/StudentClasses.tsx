import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { studentNavItems } from "@/config/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, User, BookOpen, AlertCircle, Radio, CheckCircle2, ArrowRight, LayoutGrid, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { 
  useStudentClasses, 
  filterClasses, 
  formatTimeForDisplay, 
  formatScheduleDays,
  type ClassFilter,
  type EnrolledClass 
} from "@/hooks/useStudentClasses";
import { WeeklyTimetable } from "@/components/student/WeeklyTimetable";

type ViewMode = 'cards' | 'timetable';

const FILTER_OPTIONS: { value: ClassFilter; label: string }[] = [
  { value: 'all', label: 'All Classes' },
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
];

function getStatusBadge(status: EnrolledClass['status']) {
  switch (status) {
    case 'live':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white animate-pulse">
          <Radio className="w-3 h-3 mr-1" />
          Live
        </Badge>
      );
    case 'upcoming':
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
          <ArrowRight className="w-3 h-3 mr-1" />
          Upcoming
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    default:
      return null;
  }
}

function getAttendanceColor(percentage: number | null): string {
  if (percentage === null) return "bg-muted";
  if (percentage >= 75) return "bg-green-500";
  if (percentage >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function getAttendanceTextColor(percentage: number | null): string {
  if (percentage === null) return "text-muted-foreground";
  if (percentage >= 75) return "text-green-600";
  if (percentage >= 60) return "text-amber-600";
  return "text-red-600";
}

function ClassCardSkeleton() {
  return (
    <Card className="p-6 border-border/50">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-3 mb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="pt-4 border-t border-border/50">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-2 w-full" />
      </div>
    </Card>
  );
}

function EmptyState({ filter }: { filter: ClassFilter }) {
  const messages: Record<ClassFilter, { title: string; description: string }> = {
    all: {
      title: "No Classes Enrolled",
      description: "You haven't been enrolled in any classes yet. Contact your administrator for enrollment."
    },
    today: {
      title: "No Classes Today",
      description: "You don't have any scheduled classes for today. Enjoy your free time!"
    },
    upcoming: {
      title: "No Upcoming Classes",
      description: "All your classes for the week have been completed."
    },
    completed: {
      title: "No Completed Classes",
      description: "You haven't completed any classes yet this week."
    },
  };

  const { title, description } = messages[filter];

  return (
    <Card className="p-12 text-center border-dashed">
      <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
    </Card>
  );
}

export default function StudentClasses() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ClassFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const { data, isLoading, error } = useStudentClasses();

  const classes = data?.classes || [];
  const currentDay = data?.currentDay || '';
  const filteredClasses = filterClasses(classes, filter, currentDay);

  return (
    <DashboardLayout role="student" navItems={studentNavItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">My Classes</h1>
            <p className="text-muted-foreground">
              Manage your academic schedule and track attendance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="h-8 px-3"
              >
                <LayoutGrid className="w-4 h-4 mr-1.5" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'timetable' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('timetable')}
                className="h-8 px-3"
              >
                <CalendarDays className="w-4 h-4 mr-1.5" />
                Timetable
              </Button>
            </div>
          </div>
        </div>

        {/* Filters - Only show in cards view */}
        {viewMode === 'cards' && (
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value)}
                className={filter === option.value ? "shadow-md" : ""}
            >
                {option.label}
                {option.value === 'all' && classes.length > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">({classes.length})</span>
                )}
              </Button>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 border-destructive/50 bg-destructive/5">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>Failed to load classes. Please try again.</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <ClassCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State - Only in cards view */}
        {viewMode === 'cards' && !isLoading && !error && filteredClasses.length === 0 && (
          <EmptyState filter={filter} />
        )}

        {/* Timetable View */}
        {viewMode === 'timetable' && !isLoading && !error && classes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WeeklyTimetable classes={classes} currentDay={currentDay} />
          </motion.div>
        )}

        {/* Classes Grid - Cards View */}
        {viewMode === 'cards' && !isLoading && !error && filteredClasses.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((cls, index) => {
              // Get primary schedule for display
              const primarySchedule = cls.schedules[0];
              const timeDisplay = primarySchedule 
                ? `${formatTimeForDisplay(primarySchedule.startTime)} - ${formatTimeForDisplay(primarySchedule.endTime)}`
                : 'No schedule';

              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 group relative overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/student/classes/${cls.id}`)}
                  >
                    {/* Course Code Badge */}
                    <div className="absolute top-0 right-0 p-3 rounded-bl-2xl text-xs font-bold bg-primary/10 text-primary border-l border-b border-primary/20">
                      {cls.courseCode}
                    </div>

                    {/* Class Info */}
                    <div className="mb-4 pr-16">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {cls.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{cls.courseName}</p>
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cls.facultyName}</span>
                      </div>
                    </div>

                    {/* Schedule Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{timeDisplay}</span>
                        </div>
                        {getStatusBadge(cls.status)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>{formatScheduleDays(cls.schedules)}</span>
                        {cls.room && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{cls.room}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Attendance Section */}
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Attendance</span>
                        <span className={`text-sm font-bold ${getAttendanceTextColor(cls.attendancePercentage)}`}>
                          {cls.attendancePercentage !== null ? `${cls.attendancePercentage}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getAttendanceColor(cls.attendancePercentage)}`}
                          style={{ width: cls.attendancePercentage !== null ? `${cls.attendancePercentage}%` : '0%' }}
                        />
                      </div>
                      {cls.attendanceStats && (
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="text-green-600">{cls.attendanceStats.presentCount} present</span>
                          <span className="text-red-600">{cls.attendanceStats.absentCount} absent</span>
                          {cls.attendanceStats.lateCount > 0 && (
                            <span className="text-amber-600">{cls.attendanceStats.lateCount} late</span>
                          )}
                        </div>
                      )}
                      {cls.attendancePercentage !== null && cls.attendancePercentage < 75 && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3" />
                          <span>Attendance below 75% - improvement needed!</span>
                        </div>
                      )}
                      {cls.attendancePercentage === null && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          No attendance records yet
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-2 flex gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full text-xs font-semibold h-9"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Resources action - placeholder for now
                        }}
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-2" />
                        Resources
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
