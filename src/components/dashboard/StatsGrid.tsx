import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatItem {
    label: string;
    value: string;
    icon: LucideIcon;
    colorClass?: string; // For colorful card style (card-indigo, etc.)
    bg?: string; // For minimal style background
    color?: string; // For minimal style icon color
    sub?: string; // Subtext (e.g. "this month")
    trend?: string; // Trend badge (e.g. "+12%")
}

interface StatsGridProps {
    stats: StatItem[];
    variant?: "colorful" | "minimal"; // "colorful" uses the vibrant card style, "minimal" uses the subtle style
}

export function StatsGrid({ stats, variant = "minimal" }: StatsGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    {variant === "colorful" ? (
                        <div className={cn("premium-card p-6 group cursor-pointer", stat.colorClass)}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="icon-box">
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <TrendingUp className="w-4 h-4 text-foreground/70 group-hover:text-foreground transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold tracking-tight group-hover:text-foreground transition-colors">{stat.value}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/70 group-hover:text-foreground transition-colors">{stat.label}</p>
                            </div>
                            {stat.sub && (
                                <p className="text-[10px] font-medium text-foreground/60 mt-4 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                    {stat.sub}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className={cn("premium-card p-6 group cursor-default", stat.bg || stat.colorClass)}>
                            <div className="flex items-start justify-between mb-4">
                                {stat.bg ? (
                                    // Minimal style with colored background icon box
                                    <div className={cn("p-3 rounded-2xl transition-colors", stat.bg)}>
                                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                                    </div>
                                ) : (
                                    // Fallback
                                    <div className="icon-box">
                                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                                    </div>
                                )}

                                {stat.trend ? (
                                    <div className={cn("px-2 py-1 rounded-lg text-[10px] font-bold bg-secondary/50", stat.color)}>
                                        {stat.trend}
                                    </div>
                                ) : (
                                    <ArrowUpRight className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors" />
                                )}
                            </div>
                            <p className="text-3xl font-black mb-1 tracking-tighter text-foreground/90">{stat.value}</p>
                            <p className="text-sm text-foreground/70 font-bold">{stat.label}</p>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
