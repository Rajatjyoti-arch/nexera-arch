import { StaticLayout } from "@/components/layouts/StaticLayout";

export default function Terms() {
    return (
        <StaticLayout
            title="Terms of Service"
            subtitle="The rules and guidelines for using Nexera Learn."
        >
            <div className="space-y-8 text-foreground/80 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using Nexera Learn, you agree to be bound by these Terms of Service
                        and all applicable laws and regulations. If you do not agree with any of these terms,
                        you are prohibited from using the platform.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">2. User Conduct</h2>
                    <p>
                        Users are expected to maintain academic integrity and professional conduct.
                        Prohibited activities include:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>Harassment or bullying of other users.</li>
                        <li>Attempting to breach the platform's security.</li>
                        <li>Sharing unauthorized academic materials.</li>
                        <li>Impersonating other students or faculty members.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">3. Intellectual Property</h2>
                    <p>
                        The Nexera Learn platform, including its design, code, and AI models, is the
                        intellectual property of Nexera Innovators. Course materials uploaded by faculty
                        remain the property of the respective creators or institutions.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">4. Limitation of Liability</h2>
                    <p>
                        Nexera Learn is provided "as is". While we strive for 99.9% uptime, Nexera Innovators
                        is not liable for any damages arising from the use or inability to use the platform.
                    </p>
                </section>
            </div>
        </StaticLayout>
    );
}
