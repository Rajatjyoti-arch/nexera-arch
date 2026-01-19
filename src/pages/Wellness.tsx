import { StaticLayout } from "@/components/layouts/StaticLayout";
import { Heart, Brain, Zap, Moon, Sun, Users } from "lucide-react";

export default function Wellness() {
    return (
        <StaticLayout
            title="Holistic Wellness"
            subtitle="Empowering the mind and body for peak academic performance."
        >
            <div className="space-y-16 text-foreground/80 leading-relaxed">
                <section className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-foreground mb-6 tracking-tight">The Pulse of Your Potential</h2>
                    <p className="text-lg">
                        We believe that academic excellence is impossible without mental and physical well-being.
                        NexEra Learn integrates advanced wellness tools directly into your daily workflow,
                        helping you maintain balance in a high-pressure environment.
                    </p>
                </section>

                <section className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Brain,
                            title: "AI Mental Health Companion",
                            desc: "Our Gemini-powered companion provides 24/7 emotional support and mindfulness guidance."
                        },
                        {
                            icon: Heart,
                            title: "Biometric Sentiment Analysis",
                            desc: "Optional stress monitoring helps you identify when you need a break before burnout hits."
                        },
                        {
                            icon: Zap,
                            title: "Cognitive Performance",
                            desc: "Track your focus cycles and optimize your study schedule based on your natural energy levels."
                        },
                        {
                            icon: Moon,
                            title: "Sleep & Recovery",
                            desc: "Insights into how your rest patterns affect your learning retention and cognitive clarity."
                        },
                        {
                            icon: Sun,
                            title: "Mindfulness Tools",
                            desc: "Integrated breathing exercises and focus music designed to reduce anxiety and improve concentration."
                        },
                        {
                            icon: Users,
                            title: "Community Support",
                            desc: "Connect with peer support networks and professional counseling services when you need them."
                        }
                    ].map((item, i) => (
                        <div key={i} className="glass-card p-8 rounded-3xl border-border hover:border-primary/30 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <item.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                            <p className="text-sm leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </section>

                <section className="premium-card p-12 bg-secondary/5 border-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] -ml-32 -mt-32 rounded-full" />
                    <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-black text-foreground mb-6 tracking-tight">A Sanctuary for the Mind</h2>
                            <p className="mb-8 text-lg">
                                Our "Mindful Sanctuary" feature provides a dedicated space within the portal
                                where you can disconnect from the noise and reconnect with yourself.
                                It's not just about tracking; it's about transformation.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "100% Anonymous Wellness Sessions",
                                    "Personalized Stress-Relief Plans",
                                    "Real-time Mood Tracking",
                                    "Crisis Support Integration"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card p-8 rounded-[2.5rem] border-border bg-background/50 backdrop-blur-3xl">
                            <div className="text-center space-y-6">
                                <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                                    <Heart className="w-10 h-10 text-primary animate-pulse" />
                                </div>
                                <h4 className="text-xl font-black">Ready to start?</h4>
                                <p className="text-sm text-foreground/60">
                                    Join thousands of students who have prioritized their mental health with NexEra Learn.
                                </p>
                                <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:shadow-glow transition-all">
                                    Explore Sanctuary
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </StaticLayout>
    );
}
