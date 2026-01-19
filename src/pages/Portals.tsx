import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    GraduationCap,
    Building2,
    ShieldCheck,
    ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Portals() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full -z-10" />

            {/* Header */}
            <header className="p-4 md:p-6 flex items-center justify-between z-10">
                <div className="md:hidden">
                    <Logo size="sm" showText={false} />
                </div>
                <div className="hidden md:block">
                    <Logo />
                </div>
                <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="text-foreground/70 hover:text-foreground gap-2"
                >
                    <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Home</span>
                </Button>
            </header>

            {/* Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-display font-black mb-4 tracking-tight">
                        Choose Your <span className="gradient-text">Gateway</span>
                    </h1>
                    <p className="text-foreground/80 text-lg max-w-xl mx-auto">
                        Select the portal that matches your role to access the Nexera Learn ecosystem.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
                    {[
                        {
                            title: "Student Portal",
                            desc: "Access your cognitive learning path, academic records, and peer network.",
                            icon: GraduationCap,
                            color: "from-blue-500/20 to-cyan-500/20",
                            iconColor: "text-blue-400",
                            role: "student"
                        },
                        {
                            title: "Faculty Portal",
                            desc: "Orchestrate pedagogy, manage student performance, and lead academic innovation.",
                            icon: Building2,
                            color: "from-purple-500/20 to-pink-500/20",
                            iconColor: "text-purple-400",
                            role: "faculty"
                        },
                        {
                            title: "Admin Portal",
                            desc: "Govern institutional operations, monitor system health, and secure campus data.",
                            icon: ShieldCheck,
                            color: "from-emerald-500/20 to-teal-500/20",
                            iconColor: "text-emerald-400",
                            role: "admin"
                        }
                    ].map((portal, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => navigate(`/${portal.role}/login`)}
                            className="glass-card p-8 rounded-[2.5rem] border-border hover:border-primary/30 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full"
                        >
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity", portal.color)} />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl">
                                    <portal.icon className={cn("w-10 h-10", portal.iconColor)} />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">{portal.title}</h3>
                                <p className="text-foreground/70 mb-10 text-base leading-relaxed flex-1">
                                    {portal.desc}
                                </p>
                                <Button className="w-full h-14 rounded-2xl gradient-primary border-0 shadow-glow group-hover:shadow-primary/20 transition-all">
                                    Enter Portal <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="p-8 text-center text-foreground/70 text-sm">
                <p>© 2026 NEXERA INNOVATORS. All rights reserved.</p>
            </footer>
        </div>
    );
}
