import StudentLayout from "@/components/layouts/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Users,
  Heart,
  Bell,
  Calendar,
  MapPin,
  ArrowRight,
  BookOpen,
  User,
  LifeBuoy,
  Sparkles,
  TrendingUp,
  Loader2,
  BarChart3,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatsGrid, StatItem } from "@/components/dashboard/StatsGrid";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { SectionContainer } from "@/components/dashboard/SectionContainer";
import { ClassRoutineDashboard } from "@/components/dashboard/ClassRoutineDashboard";
import { MiniTimetableWidget } from "@/components/dashboard/MiniTimetableWidget";
import { useStudentDashboard, formatTimeForDisplay, TodayClass } from "@/hooks/useStudentDashboard";
import { useStudentClasses } from "@/hooks/useStudentClasses";
import { useNavigate } from "react-router-dom";

// Map class status to visual styling
const statusConfig = {
  live: {
    label: "Live",
    dotClass: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
    badgeClass: "px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse",
    buttonVariant: "default" as const,
    buttonClass: "bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20 border-0",
    buttonLabel: "Join Now",
  },
  upcoming: {
    label: "Upcoming",
    dotClass: "bg-amber-500",
    badgeClass: "px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest",
    buttonVariant: "outline" as const,
    buttonClass: "border-border hover:bg-secondary/5 text-foreground/80 hover:text-foreground",
    buttonLabel: "Details",
  },
  completed: {
    label: "Completed",
    dotClass: "bg-secondary/40",
    badgeClass: "px-2 py-0.5 rounded-full bg-secondary/10 border border-border text-[9px] font-black text-foreground/50 uppercase tracking-widest",
    buttonVariant: "outline" as const,
    buttonClass: "border-border hover:bg-secondary/5 text-foreground/60",
    buttonLabel: "View",
  },
};

const colorClasses = ["card-indigo", "card-amber", "card-teal", "card-rose", "card-violet"];

export default function StudentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = useStudentDashboard();
  const { data: classesData, isLoading: classesLoading } = useStudentClasses();

  // Build stats from real data
  const stats: StatItem[] = [
    { 
      label: "Messages", 
      value: String(dashboardData?.stats.unreadMessages || 0), 
      sub: "unread messages", 
      icon: MessageSquare, 
      colorClass: "card-indigo",
      path: "/student/chats"
    },
    { 
      label: "Classes", 
      value: String(dashboardData?.stats.totalClasses || 0), 
      sub: `${dashboardData?.stats.todaysClasses || 0} today`, 
      icon: BookOpen, 
      colorClass: "card-teal",
      path: "/student/classes"
    },
    { 
      label: "Wellness", 
      value: "Check", 
      sub: "Track your mood", 
      icon: Heart, 
      colorClass: "card-rose",
      path: "/student/wellness"
    },
    { 
      label: "Notices", 
      value: String(dashboardData?.stats.unreadNotices || 0), 
      sub: "unread notices", 
      icon: Bell, 
      colorClass: "card-amber"
    },
  ];

  const quickActions = [
    { label: "Attendance", icon: Calendar, colorClass: "card-indigo", path: "/student/classes" },
    { label: "Library", icon: BookOpen, colorClass: "card-teal", path: "/student" },
    { label: "Support", icon: LifeBuoy, colorClass: "card-violet", path: "/wellness" },
    { label: "Profile", icon: User, colorClass: "card-rose", path: "/student/profile" },
  ];

  // Get semester display text
  const semesterText = dashboardData?.profile?.semester 
    ? `Semester ${dashboardData.profile.semester}` 
    : dashboardData?.profile?.year 
      ? `Year ${dashboardData.profile.year}` 
      : "Current Semester";

  const courseText = dashboardData?.profile?.course || "Your Course";

  // Get the latest notice for display
  const latestNotice = dashboardData?.notices?.[0];

  return (
    <StudentLayout>
      <div className="space-y-10 pb-10 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <WelcomeHeader
          role="student"
          title={
            <span className="flex flex-col gap-1">
              <span className="text-2xl font-medium text-foreground/60">Welcome back,</span>
              <span className="text-4xl font-bold gradient-text">
                {user?.name || "Student"}
              </span>
            </span>
          }
          subtitle="Ready to continue your learning journey?"
        >
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-xs font-bold text-foreground/90">{courseText}</p>
              <p className="text-[10px] text-foreground/60 font-medium uppercase tracking-wider">{semesterText}</p>
            </div>
            <Button 
              onClick={() => navigate('/student/profile')}
              className="rounded-xl h-12 px-6 bg-secondary/10 hover:bg-secondary/20 border border-border text-foreground text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-md btn-press"
            >
              View Profile
            </Button>
          </div>
        </WelcomeHeader>

        {/* Stats Grid Section */}
        <SectionContainer title="Overview" icon={TrendingUp}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <StatsGrid stats={stats} variant="colorful" />
          )}
        </SectionContainer>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Schedule Section - Timeline Style */}
          <SectionContainer
            className="lg:col-span-8"
            title="Today's Timeline"
            icon={Calendar}
            action={
              <button 
                onClick={() => navigate('/student/classes')}
                className="text-[10px] font-black text-foreground/70 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 group"
              >
                Full Schedule <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            }
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !dashboardData?.todaysClasses?.length ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                <p className="text-foreground/60 font-medium">No classes scheduled for today</p>
                <p className="text-xs text-foreground/40 mt-1">Enjoy your free day!</p>
              </div>
            ) : (
              <div className="space-y-4 relative">
                {/* Timeline Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-secondary/10 rounded-full" />

                {dashboardData.todaysClasses.map((classItem, i) => {
                  const config = statusConfig[classItem.status];
                  const colorClass = colorClasses[i % colorClasses.length];
                  const displayTime = formatTimeForDisplay(classItem.startTime);
                  const [time, period] = displayTime.split(' ');

                  return (
                    <motion.div
                      key={classItem.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="relative pl-16 group"
                    >
                      {/* Timeline Dot */}
                      <div className={cn(
                        "absolute left-5 top-6 w-4 h-4 rounded-full border-[3px] border-background z-10 transition-colors duration-300",
                        config.dotClass
                      )} />

                      <div className={cn(
                        "premium-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group-hover:border-primary/30 transition-all",
                        colorClass
                      )}>
                        <div className="flex items-center gap-6">
                          <div className="text-center min-w-[70px] py-1 px-3 rounded-lg bg-secondary/5 border border-border/50">
                            <p className="text-sm font-bold text-foreground/90">{time}</p>
                            <p className="text-[9px] font-black text-foreground/70 uppercase">{period}</p>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-bold text-foreground/90 group-hover:text-foreground transition-colors">
                                {classItem.name}
                              </h4>
                              {classItem.status === 'live' && (
                                <span className={config.badgeClass}>Live</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-foreground/70 font-medium">
                              <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-foreground/70" /> 
                                {classItem.facultyName}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-foreground/70" /> 
                                {classItem.room || "TBA"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant={config.buttonVariant}
                          className={cn(
                            "rounded-xl h-10 px-6 text-[10px] font-bold uppercase tracking-widest btn-press transition-all",
                            config.buttonClass
                          )}
                        >
                          {config.buttonLabel}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </SectionContainer>

          {/* Right Column: Mini Timetable + Quick Actions */}
          <div className="lg:col-span-4 space-y-8">
            {/* Mini Timetable Widget */}
            <SectionContainer 
              title="Remaining Today" 
              icon={Clock}
              action={
                <button 
                  onClick={() => navigate('/student/classes')}
                  className="text-[10px] font-black text-foreground/70 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  View All <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              }
            >
              {classesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : classesData?.classes ? (
                <MiniTimetableWidget 
                  classes={classesData.classes} 
                  currentDay={classesData.currentDay} 
                />
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 mx-auto text-foreground/30 mb-3" />
                  <p className="text-sm text-foreground/60">No schedule data</p>
                </div>
              )}
            </SectionContainer>

            {/* Quick Actions Section */}
            <SectionContainer title="Quick Access" icon={Sparkles}>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, i) => (
                  <motion.button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className={cn(
                      "premium-card p-5 flex flex-col items-center justify-center gap-3 group text-center relative overflow-hidden",
                      action.colorClass
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="icon-box w-12 h-12 mb-1">
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-foreground/80 group-hover:text-foreground transition-colors">
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </SectionContainer>
          </div>
        </div>

        {/* Class Routine Dashboard */}
        <SectionContainer 
          title="Class Routine Analytics" 
          icon={BarChart3}
          action={
            <button 
              onClick={() => navigate('/student/classes')}
              className="text-[10px] font-black text-foreground/70 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 group"
            >
              View Timetable <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          }
        >
          {classesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : classesData?.classes ? (
            <ClassRoutineDashboard 
              classes={classesData.classes} 
              currentDay={classesData.currentDay} 
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
              <p className="text-foreground/60 font-medium">No class data available</p>
            </div>
          )}
        </SectionContainer>

        {/* Footer Resources Section */}
        <SectionContainer title="Updates & Resources" icon={BookOpen}>
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => navigate('/student/classes')}
              className="premium-card p-6 flex items-center justify-between group cursor-pointer card-teal"
            >
              <div className="flex items-center gap-5">
                <div className="icon-box w-12 h-12">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground/90 group-hover:text-foreground transition-colors">
                    Classes
                  </p>
                  <p className="text-xs text-foreground/60 font-medium mt-1">
                    {dashboardData?.stats.totalClasses || 0} enrolled classes
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary/5 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                <ArrowRight className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="premium-card p-6 flex items-center justify-between group cursor-pointer card-rose"
            >
              <div className="flex items-center gap-5">
                <div className="icon-box w-12 h-12">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground/90 group-hover:text-foreground transition-colors">
                    Notices
                  </p>
                  <p className="text-xs text-foreground/60 font-medium mt-1 line-clamp-1">
                    {latestNotice?.title || "No new notices"}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary/5 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                <ArrowRight className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors" />
              </div>
            </motion.div>
          </div>
        </SectionContainer>
      </div>
    </StudentLayout>
  );
}
