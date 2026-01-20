import { motion } from "framer-motion";
import { TrendingUp, Users, Award, Briefcase } from "lucide-react";

interface NetworkStatsProps {
  postsCount: number;
  studentsCount: number;
  projectsCount?: number;
  certificatesCount?: number;
}

export function NetworkStats({ 
  postsCount, 
  studentsCount, 
  projectsCount = 0, 
  certificatesCount = 0 
}: NetworkStatsProps) {
  const stats = [
    { label: "Posts Today", value: postsCount, icon: TrendingUp, color: "text-teal-500", bg: "from-teal-500/20 to-emerald-500/20" },
    { label: "Active Members", value: studentsCount, icon: Users, color: "text-indigo-500", bg: "from-indigo-500/20 to-violet-500/20" },
    { label: "Projects Shared", value: projectsCount, icon: Briefcase, color: "text-violet-500", bg: "from-violet-500/20 to-purple-500/20" },
    { label: "Certificates", value: certificatesCount, icon: Award, color: "text-emerald-500", bg: "from-emerald-500/20 to-green-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 rounded-2xl bg-secondary/10 border border-border/50 hover:border-border transition-all duration-300"
        >
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-3`}>
            <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-[10px] font-medium text-foreground/50 uppercase tracking-wider">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
