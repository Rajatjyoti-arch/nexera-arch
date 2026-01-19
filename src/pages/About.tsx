import { StaticLayout } from "@/components/layouts/StaticLayout";

export default function About() {
    return (
        <StaticLayout
            title="Beyond Learning"
            subtitle="Architecting the next generation of cognitive campus ecosystems."
        >
            <div className="space-y-12 text-foreground/80 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-black text-foreground mb-4 tracking-tight">Our Vision</h2>
                    <p className="text-lg">
                        At NexEra Learn, we believe that education should be as dynamic as the world it prepares us for.
                        Traditional campus management systems are often fragmented, slow, and disconnected.
                        We've engineered a unified cognitive infrastructure that brings students, faculty, and administrators
                        together in a high-fidelity, high-performance environment.
                    </p>
                </section>

                <section className="grid md:grid-cols-2 gap-8">
                    <div className="glass-card p-8 rounded-3xl border-border">
                        <h3 className="text-xl font-bold text-foreground mb-3">Cognitive Design</h3>
                        <p className="text-sm">
                            Every interaction in NexEra Learn is optimized for cognitive load and clarity.
                            Our interface isn't just responsive; it's anticipatory, providing the right insights at the right moment.
                        </p>
                    </div>
                    <div className="glass-card p-8 rounded-3xl border-border">
                        <h3 className="text-xl font-bold text-foreground mb-3">Sovereign Security</h3>
                        <p className="text-sm">
                            We employ zero-knowledge architecture and enterprise-grade encryption protocols to ensure
                            that institutional and personal data remains sovereign, private, and immutable.
                        </p>
                    </div>
                </section>

                <section className="premium-card p-8 bg-secondary/5 border-border">
                    <h2 className="text-2xl font-black text-foreground mb-4 tracking-tight">The NexEra Advantage</h2>
                    <p className="mb-8 text-lg">
                        Unlike legacy platforms, NexEra Learn integrates advanced AI to monitor campus sentiment,
                        provide deep academic analytics, and facilitate real-time, secure collaboration.
                        We're not just a tool; we're the pulse of your institution.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {[
                            "Real-time Biometric Wellness Monitoring",
                            "Gemini-Powered Academic Assistance",
                            "Unified Role-Based Portals",
                            "Zero-Trust Encrypted Communication",
                            "Predictive Campus Analytics",
                            "Automated Administrative Workflows"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary shadow-glow" />
                                <span className="text-sm font-bold text-foreground">{item}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </StaticLayout>
    );
}
