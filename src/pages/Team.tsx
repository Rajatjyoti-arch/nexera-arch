import { StaticLayout } from "@/components/layouts/StaticLayout";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";

const team = [
    { name: "Abhinav Kumar", role: "Lead Architect", bio: "Specializing in distributed systems and high-availability campus infrastructure." },
    { name: "Harsh Saxena", role: "UI/UX Visionary", bio: "Pioneering interactive design systems that prioritize cognitive clarity and user delight." },
    { name: "Rajat Gupta", role: "Full Stack Engineer", bio: "Expert in bridging complex backend logic with fluid, high-performance frontend experiences." },
    { name: "Sakshi", role: "Product Strategist", bio: "Translating institutional requirements into actionable, user-centric product roadmaps." },
    { name: "Mehak", role: "Quality Assurance Lead", bio: "Ensuring flawless user experiences through rigorous testing and quality standards." }
];

export default function Team() {
    return (
        <StaticLayout
            title="Our Team"
            subtitle="The Nexera Innovators behind the platform."
        >
            <div className="grid md:grid-cols-2 gap-8">
                {team.map((member, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-8 rounded-[2.5rem] border-border hover:border-primary/30 transition-all group relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-black text-black mb-6 shadow-glow group-hover:scale-110 transition-transform">
                                {member.name[0]}
                            </div>
                            <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                            <p className="text-primary font-bold uppercase tracking-widest text-xs mb-4">{member.role}</p>
                            <p className="text-foreground/70 text-sm leading-relaxed mb-8">
                                {member.bio}
                            </p>
                            <div className="flex gap-4">
                                {[Github, Linkedin, Twitter].map((Icon, j) => (
                                    <button key={j} className="p-2 rounded-xl bg-secondary hover:bg-primary/20 text-foreground/70 hover:text-primary transition-all">
                                        <Icon className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </StaticLayout>
    );
}
