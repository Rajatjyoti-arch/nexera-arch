import AdminLayout from "@/components/layouts/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  Plus,
  Settings,
  Shield,
  Database,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { StatsGrid, StatItem } from "@/components/dashboard/StatsGrid";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { SectionContainer } from "@/components/dashboard/SectionContainer";

const stats: StatItem[] = [
  { icon: Users, label: "Total Users", value: "2,543", colorClass: "card-violet", sub: "+12% this month" },
  { icon: GraduationCap, label: "Departments", value: "8", colorClass: "card-teal", sub: "All active" },
  { icon: AlertTriangle, label: "Pending Reports", value: "5", colorClass: "card-rose", sub: "Requires attention" },
  { icon: Activity, label: "System Status", value: "98.9%", colorClass: "card-emerald", sub: "Optimal performance" },
];

const quickActions = [
  { icon: Plus, label: "Add User", path: "/admin/users", color: "text-violet-500", bg: "bg-violet-500/10" },
  { icon: GraduationCap, label: "Manage Academics", path: "/admin/academics", color: "text-teal-500", bg: "bg-teal-500/10" },
  { icon: Shield, label: "Security Logs", path: "/admin/reports", color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: Database, label: "Backup Data", path: "/admin/settings", color: "text-amber-500", bg: "bg-amber-500/10" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header - Renovated */}
        <WelcomeHeader
          role="admin"
          title={
            <span className="flex flex-col gap-1">
              <span className="text-2xl font-medium text-foreground/80">System Overview</span>
              <span className="text-4xl font-bold gradient-text">Admin Control Center</span>
            </span>
          }
          subtitle="Manage campus operations and monitor system health."
        >
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-xs font-bold text-foreground/90">Jan 08, 2026</p>
              <div className="flex items-center justify-end gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">System Online</p>
              </div>
            </div>
            <Button className="rounded-xl h-12 px-6 bg-admin hover:bg-admin/90 text-primary-foreground border-0 shadow-lg shadow-admin/20 btn-press">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>
        </WelcomeHeader>

        {/* Stats Grid */}
        <StatsGrid stats={stats} variant="colorful" />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions - Renovated Grid */}
            <SectionContainer title="Quick Actions" icon={Activity}>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(action.path)}
                    className="premium-card p-5 flex items-center gap-5 hover:bg-secondary text-left group transition-all"
                  >
                    <div className={cn("p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-lg", action.bg)}>
                      <action.icon className={cn("w-6 h-6", action.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-foreground/90 group-hover:text-foreground transition-colors">{action.label}</p>
                      <p className="text-[10px] text-foreground/80 uppercase tracking-wider font-medium mt-0.5 group-hover:text-foreground">Access Module</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <ArrowUpRight className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </SectionContainer>

            {/* System Health - Enhanced Bars */}
            <SectionContainer
              title="System Health"
              icon={Server}
              action={
                <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <Activity className="w-3 h-3" />
                  All Systems Operational
                </span>
              }
            >
              <div className="space-y-6">
                {[
                  { label: "Database Latency", value: "24ms", percent: "24%", status: "Optimal", color: "bg-emerald-500", glow: "shadow-[0_0_10px_rgba(16,185,129,0.4)]" },
                  { label: "Server Load", value: "42%", percent: "42%", status: "Normal", color: "bg-blue-500", glow: "shadow-[0_0_10px_rgba(59,130,246,0.4)]" },
                  { label: "Storage Usage", value: "68%", percent: "68%", status: "Warning", color: "bg-amber-500", glow: "shadow-[0_0_10px_rgba(245,158,11,0.4)]" },
                ].map((item, i) => (
                  <div key={i} className="space-y-2 group">
                    <div className="flex justify-between text-xs font-bold items-end">
                      <span className="text-foreground/80 group-hover:text-foreground transition-colors">{item.label}</span>
                      <div className="text-right">
                        <span className="text-foreground/90 text-sm">{item.value}</span>
                        <span className={cn("ml-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary/5",
                          item.status === "Optimal" ? "text-emerald-500" : item.status === "Warning" ? "text-amber-500" : "text-blue-500"
                        )}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-secondary/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: item.percent }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                        className={cn("h-full rounded-full transition-all duration-1000 relative", item.color, item.glow)}
                      >
                        <div className="absolute inset-0 bg-foreground/10 animate-[shimmer_2s_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionContainer>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-8">
            <div className="premium-card p-6 space-y-6 bg-secondary/5">
              <h3 className="font-bold text-foreground/90 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Recent Alerts
              </h3>
              <div className="space-y-3">
                {[
                  { title: "High Traffic Detected", time: "10m ago", type: "warning" },
                  { title: "Failed Login Attempt", time: "1h ago", type: "error" },
                  { title: "Backup Completed", time: "4h ago", type: "success" },
                ].map((alert, i) => (
                  <div key={i} className="flex gap-4 items-center p-3 rounded-xl bg-secondary/5 border border-border hover:bg-secondary/10 transition-colors group cursor-pointer">
                    <div className={cn(
                      "w-2 h-2 rounded-full ring-4 ring-opacity-20",
                      alert.type === "warning" ? "bg-amber-500 ring-amber-500" : alert.type === "error" ? "bg-rose-500 ring-rose-500" : "bg-emerald-500 ring-emerald-500"
                    )} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground/80 group-hover:text-foreground transition-colors">{alert.title}</p>
                      <p className="text-[10px] text-foreground/60 font-medium mt-0.5">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full rounded-xl border-border text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/5 btn-press">
                View All Logs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
