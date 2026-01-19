import { StaticLayout } from "@/components/layouts/StaticLayout";
import { ShieldCheck, Lock, Eye, Server, Key, FileCheck } from "lucide-react";

export default function Security() {
    return (
        <StaticLayout
            title="Sovereign Security"
            subtitle="Enterprise-grade protection for the modern academic ecosystem."
        >
            <div className="space-y-16 text-foreground/80 leading-relaxed">
                <section className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-foreground mb-6 tracking-tight">Our Security Philosophy</h2>
                    <p className="text-lg">
                        At NexEra Learn, security isn't a feature—it's the foundation. We employ a multi-layered
                        defense strategy that combines zero-trust architecture with advanced encryption to
                        ensure your institutional data remains private and protected.
                    </p>
                </section>

                <section className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: ShieldCheck,
                            title: "Zero-Knowledge Architecture",
                            desc: "Your data is encrypted before it leaves your device. Even we can't see your private information."
                        },
                        {
                            icon: Lock,
                            title: "End-to-End Encryption",
                            desc: "All communications, from chats to file transfers, are protected by military-grade E2EE."
                        },
                        {
                            icon: Eye,
                            title: "Privacy by Design",
                            desc: "We follow strict data minimization principles, collecting only what's necessary for your experience."
                        },
                        {
                            icon: Server,
                            title: "Secure Infrastructure",
                            desc: "Hosted on globally distributed, SOC2-compliant data centers with 99.99% uptime and redundancy."
                        },
                        {
                            icon: Key,
                            title: "Multi-Factor Authentication",
                            desc: "Biometric and hardware-key support ensures that only authorized users can access sensitive portals."
                        },
                        {
                            icon: FileCheck,
                            title: "Compliance Ready",
                            desc: "Built to exceed GDPR, FERPA, and HIPAA standards for educational and personal data protection."
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
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-foreground mb-6 tracking-tight">Continuous Monitoring</h2>
                        <p className="mb-8 text-lg max-w-3xl">
                            Our security operations center (SOC) monitors the platform 24/7 for anomalies.
                            We conduct regular third-party audits and penetration tests to ensure our
                            defenses evolve as fast as the threats do.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {["ISO 27001", "SOC 2 Type II", "GDPR Compliant", "FERPA Certified"].map((cert, i) => (
                                <div key={i} className="px-4 py-2 rounded-full bg-background border border-border text-xs font-black uppercase tracking-widest">
                                    {cert}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </StaticLayout>
    );
}
