import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles, Shield } from "lucide-react";

interface WelcomeHeaderProps {
    title: ReactNode;
    subtitle: string;
    role?: "student" | "faculty" | "admin";
    children?: ReactNode; // For right-side content (buttons, date, etc.)
}

export function WelcomeHeader({ title, subtitle, role = "student", children }: WelcomeHeaderProps) {
    const roleLabel = {
        student: "Student Dashboard",
        faculty: "Faculty Portal",
        admin: "Administrator Access",
    };

    const roleIcon = {
        student: Sparkles,
        faculty: Sparkles, // Or GraduationCap if preferred
        admin: Shield,
    };

    const Icon = roleIcon[role];

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
            >
                <div className="flex items-center gap-2 text-primary">
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{roleLabel[role]}</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight font-display">
                    {title}
                </h1>
                <p className="text-foreground/70 font-medium text-lg">{subtitle}</p>
            </motion.div>
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}
