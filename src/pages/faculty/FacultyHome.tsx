import FacultyLayout from "@/components/layouts/FacultyLayout";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Bell,
  Plus,
  MessageSquare,
  GraduationCap,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { StatsGrid, StatItem } from "@/components/dashboard/StatsGrid";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { SectionContainer } from "@/components/dashboard/SectionContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useFacultyDashboardStats, 
  useTodaySchedule, 
  useRecentFacultyNotices 
} from "@/hooks/useFacultyDashboard";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";

export default function FacultyHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: stats, isLoading: statsLoading } = useFacultyDashboardStats();
  const { data: todaySchedule, isLoading: scheduleLoading } = useTodaySchedule();
  const { data: recentNotices, isLoading: noticesLoading } = useRecentFacultyNotices(4);

  const now = new Date();
  const formattedDate = format(now, "MMM dd, yyyy");
  const formattedTime = format(now, "EEEE, hh:mm a");

  const dashboardStats: StatItem[] = [
    { 
      icon: GraduationCap, 
      label: "Active Classes", 
      value: statsLoading ? "..." : String(stats?.totalClasses || 0), 
      colorClass: "card-indigo", 
      sub: `${stats?.todayClasses || 0} today` 
    },
    { 
      icon: Users, 
      label: "Total Students", 
      value: statsLoading ? "..." : String(stats?.totalStudents || 0), 
      colorClass: "card-violet", 
      sub: "Across all classes" 
    },
    { 
      icon: MessageSquare, 
      label: "Unread Chats", 
      value: statsLoading ? "..." : String(stats?.pendingMessages || 0), 
      colorClass: "card-amber", 
      sub: stats?.pendingMessages ? "Action required" : "All caught up" 
    },
    { 
      icon: Bell, 
      label: "Recent Notices", 
      value: statsLoading ? "..." : String(stats?.recentNotices || 0), 
      colorClass: "card-emerald", 
      sub: "Posted this week" 
    },
  ];

  return (
    <FacultyLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Welcome Header */}
        <WelcomeHeader
          role="faculty"
          title={
            <span className="flex flex-col gap-1">
              <span className="text-2xl font-medium text-foreground/60">Welcome back,</span>
              <span className="text-4xl font-bold gradient-text">Prof. {user?.name?.split(" ")[0]}</span>
            </span>
          }
          subtitle="Monitor your classes and stay connected with your students."
        >
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-xs font-bold text-foreground/90">{formattedDate}</p>
              <p className="text-[10px] text-foreground/60 font-medium uppercase tracking-wider">{formattedTime}</p>
            </div>
            <Button
              onClick={() => navigate("/faculty/notices")}
              className="rounded-xl h-12 px-6 bg-faculty hover:bg-faculty/90 text-black border-0 shadow-lg shadow-faculty/20 btn-press"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Notice
            </Button>
          </div>
        </WelcomeHeader>

        {/* Stats Grid */}
        <StatsGrid stats={dashboardStats} variant="colorful" />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <SectionContainer
              title="Today's Schedule"
              icon={Calendar}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/faculty/classes")}
                  className="text-faculty hover:text-faculty hover:bg-faculty/10 text-[10px] font-black uppercase tracking-widest"
                >
                  View All Classes
                </Button>
              }
            >
              {scheduleLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                  ))}
                </div>
              ) : todaySchedule && todaySchedule.length > 0 ? (
                <div className="space-y-4 relative">
                  <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-secondary/10 rounded-full" />

                  {todaySchedule.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="relative pl-16 group"
                    >
                      <div className={cn(
                        "absolute left-5 top-6 w-4 h-4 rounded-full border-[3px] border-background z-10 transition-colors duration-300",
                        item.status === "ongoing" 
                          ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                          : item.status === "completed"
                          ? "bg-foreground/30"
                          : "bg-secondary/20 group-hover:bg-secondary/40"
                      )} />

                      <div className={cn(
                        "premium-card p-5 flex items-center justify-between gap-6 group-hover:border-primary/30 transition-all",
                        item.status === "ongoing" ? "card-emerald border-emerald-500/30" : 
                        item.status === "completed" ? "opacity-60" : "card-indigo"
                      )}>
                        <div className="flex items-center gap-6">
                          <div className="text-center min-w-[70px] py-1 px-3 rounded-lg bg-secondary/5 border border-border/50">
                            <p className="text-sm font-bold text-foreground/90">{item.startTime.split(" ")[0]}</p>
                            <p className="text-[9px] font-black text-foreground/70 uppercase">{item.startTime.split(" ")[1]}</p>
                          </div>

                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-bold text-foreground/90 group-hover:text-foreground transition-colors">{item.className}</h4>
                              {item.status === "ongoing" && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                                  Live
                                </span>
                              )}
                              {item.status === "completed" && (
                                <span className="px-2 py-0.5 rounded-full bg-foreground/10 border border-foreground/20 text-[9px] font-black text-foreground/60 uppercase tracking-widest">
                                  Done
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-xs text-foreground/60 flex items-center gap-1.5 font-medium">
                                <MapPin className="w-3.5 h-3.5" /> {item.room || 'TBA'}
                              </p>
                              <p className="text-xs text-foreground/60 flex items-center gap-1.5 font-medium">
                                <Users className="w-3.5 h-3.5" /> {item.studentCount} students
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/faculty/classes")}
                          className="rounded-xl border-border hover:bg-secondary/5 text-[10px] font-bold uppercase tracking-widest btn-press"
                        >
                          Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                  <p className="text-foreground/60 font-medium">No classes scheduled for today</p>
                  <p className="text-xs text-foreground/40 mt-1">Enjoy your day off!</p>
                </div>
              )}
            </SectionContainer>

            {/* Recent Notices */}
            <SectionContainer
              title="Recent Notices"
              icon={Bell}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/faculty/notices")}
                  className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground"
                >
                  View All
                </Button>
              }
            >
              {noticesLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                  ))}
                </div>
              ) : recentNotices && recentNotices.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {recentNotices.map((notice, i) => (
                    <motion.div
                      key={notice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate("/faculty/notices")}
                      className={cn(
                        "premium-card p-5 cursor-pointer group flex flex-col justify-between h-full",
                        i % 2 === 0 ? "card-violet" : "card-indigo"
                      )}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-sm font-bold text-foreground/90 group-hover:text-foreground transition-colors line-clamp-1">
                            {notice.title}
                          </p>
                          <span className="text-[9px] font-black text-foreground/60 bg-secondary/50 px-2 py-1 rounded-lg uppercase tracking-wider shrink-0 ml-2">
                            {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed font-medium line-clamp-2">
                          {notice.content}
                        </p>
                      </div>
                      {(notice.departments || notice.batches) && (
                        <div className="mt-3 flex gap-2">
                          {notice.departments && (
                            <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                              {(notice.departments as { name: string }).name}
                            </span>
                          )}
                          {notice.batches && (
                            <span className="text-[9px] px-2 py-0.5 rounded bg-faculty/10 text-faculty font-bold">
                              {(notice.batches as { name: string }).name}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                  <p className="text-foreground/60 font-medium">No notices posted yet</p>
                  <Button
                    onClick={() => navigate("/faculty/notices")}
                    className="mt-4 bg-faculty hover:bg-faculty/90 text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Notice
                  </Button>
                </div>
              )}
            </SectionContainer>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="premium-card p-6 space-y-4 bg-secondary/5 border-border">
              <h3 className="font-bold flex items-center gap-2 text-foreground/90">
                <Clock className="w-5 h-5 text-faculty" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/faculty/classes")}
                  className="w-full justify-start rounded-xl border-border text-xs font-bold btn-press"
                >
                  <GraduationCap className="w-4 h-4 mr-3 text-indigo-500" />
                  View All Classes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/faculty/chats")}
                  className="w-full justify-start rounded-xl border-border text-xs font-bold btn-press"
                >
                  <MessageSquare className="w-4 h-4 mr-3 text-violet-500" />
                  Student Messages
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/faculty/notices")}
                  className="w-full justify-start rounded-xl border-border text-xs font-bold btn-press"
                >
                  <Bell className="w-4 h-4 mr-3 text-amber-500" />
                  Manage Notices
                </Button>
              </div>
            </div>

            {/* Classes Overview */}
            <div className="premium-card p-6 space-y-4 bg-secondary/5 border-border">
              <h3 className="font-bold flex items-center gap-2 text-foreground/90">
                <GraduationCap className="w-5 h-5 text-indigo-500" />
                This Week
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-2xl font-bold text-indigo-500">{stats?.totalClasses || 0}</p>
                  <p className="text-[10px] text-foreground/60 uppercase tracking-widest mt-1">Classes</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <p className="text-2xl font-bold text-violet-500">{stats?.totalStudents || 0}</p>
                  <p className="text-[10px] text-foreground/60 uppercase tracking-widest mt-1">Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
}
