import FacultyLayout from "@/components/layouts/FacultyLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MessageCircle, 
  ChevronRight, 
  MapPin, 
  Clock,
  GraduationCap,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { useFacultyClasses } from "@/hooks/useFacultyDashboard";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// Format schedule for display
function formatScheduleDisplay(schedules: { day_of_week: string; start_time: string; end_time: string }[]): string {
  if (schedules.length === 0) return 'No schedule set';
  
  const grouped: Record<string, string[]> = {};
  schedules.forEach(s => {
    const timeStr = `${formatTime(s.start_time)} - ${formatTime(s.end_time)}`;
    if (!grouped[timeStr]) grouped[timeStr] = [];
    grouped[timeStr].push(s.day_of_week.slice(0, 3));
  });

  return Object.entries(grouped)
    .map(([time, days]) => `${days.join(', ')} ${time}`)
    .join(' | ');
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export default function FacultyClasses() {
  const navigate = useNavigate();
  const { data: classes, isLoading } = useFacultyClasses();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = (classes || []).filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.course?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.course?.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FacultyLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">My Classes</h1>
              <p className="text-foreground/70">Manage your assigned classes and connect with students</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <Input
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 rounded-xl bg-secondary/10 border-border"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : filteredClasses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="premium-card p-6 group card-indigo"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground/90 group-hover:text-foreground transition-colors line-clamp-1">
                      {cls.name}
                    </h3>
                    <p className="text-sm text-foreground/60 mt-0.5">
                      {cls.course?.name || 'Unknown Course'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 ml-2 bg-faculty/10 text-faculty border-faculty/20">
                    {cls.year}
                  </Badge>
                </div>

                {/* Course Code */}
                {cls.course?.code && (
                  <div className="mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50 bg-secondary/50 px-2 py-1 rounded">
                      {cls.course.code}
                    </span>
                  </div>
                )}

                {/* Info Grid */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Users className="w-4 h-4 text-violet-500" />
                    <span className="font-medium">{cls.studentCount} students enrolled</span>
                  </div>
                  
                  {cls.room && (
                    <div className="flex items-center gap-2 text-sm text-foreground/70">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <span className="font-medium">{cls.room}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-sm text-foreground/70">
                    <Clock className="w-4 h-4 text-indigo-500 mt-0.5" />
                    <span className="font-medium text-xs leading-relaxed">
                      {formatScheduleDisplay(cls.schedules)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl btn-press text-xs font-bold"
                    onClick={() => navigate("/faculty/chats")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-xl btn-press"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 mx-auto text-foreground/20 mb-6" />
            {searchQuery ? (
              <>
                <p className="text-xl font-bold text-foreground/60 mb-2">No classes found</p>
                <p className="text-foreground/40">Try adjusting your search query</p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-foreground/60 mb-2">No classes assigned</p>
                <p className="text-foreground/40">You don't have any classes assigned yet</p>
              </>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {!isLoading && filteredClasses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <div className="premium-card p-5 text-center card-indigo">
              <p className="text-3xl font-bold text-indigo-500">{filteredClasses.length}</p>
              <p className="text-[10px] text-foreground/60 uppercase tracking-widest mt-1">Total Classes</p>
            </div>
            <div className="premium-card p-5 text-center card-violet">
              <p className="text-3xl font-bold text-violet-500">
                {filteredClasses.reduce((sum, c) => sum + c.studentCount, 0)}
              </p>
              <p className="text-[10px] text-foreground/60 uppercase tracking-widest mt-1">Total Students</p>
            </div>
            <div className="premium-card p-5 text-center card-amber">
              <p className="text-3xl font-bold text-amber-500">
                {new Set(filteredClasses.map(c => c.course?.code)).size}
              </p>
              <p className="text-[10px] text-foreground/60 uppercase tracking-widest mt-1">Courses</p>
            </div>
            <div className="premium-card p-5 text-center card-emerald">
              <p className="text-3xl font-bold text-emerald-500">
                {filteredClasses.reduce((sum, c) => sum + c.schedules.length, 0)}
              </p>
              <p className="text-[10px] text-foreground/60 uppercase tracking-widest mt-1">Weekly Sessions</p>
            </div>
          </motion.div>
        )}
      </div>
    </FacultyLayout>
  );
}
