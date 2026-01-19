import { StaticLayout } from "@/components/layouts/StaticLayout";

export default function Privacy() {
    return (
        <StaticLayout
            title="Privacy Policy"
            subtitle="Your data privacy is our top priority."
        >
            <div className="space-y-8 text-foreground/80 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
                    <p>
                        Nexera Learn collects information necessary to provide a seamless educational experience.
                        This includes your name, institutional email, academic records, and biometric stress data
                        (if enabled for wellness monitoring).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Data</h2>
                    <p>
                        Your data is used to:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>Facilitate academic communication and management.</li>
                        <li>Provide personalized AI-driven learning insights.</li>
                        <li>Monitor student wellness and provide support.</li>
                        <li>Ensure the security and integrity of the platform.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Security</h2>
                    <p>
                        We employ zero-knowledge architecture for sensitive data. This means that even our
                        administrators cannot access your private communications or biometric data without
                        explicit authorization. All data is encrypted in transit and at rest.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">4. Your Rights</h2>
                    <p>
                        You have the right to access, correct, or delete your personal information at any time.
                        Institutional data (such as grades) is subject to your university's data retention policies.
                    </p>
                </section>

                <section className="p-8 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-sm italic">
                        Last updated: January 2026. For any privacy-related inquiries, please contact
                        privacy@nexeralearn.edu.
                    </p>
                </section>
            </div>
        </StaticLayout>
    );
}
