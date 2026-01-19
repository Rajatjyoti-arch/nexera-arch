import { StaticLayout } from "@/components/layouts/StaticLayout";

export default function CookiePolicy() {
    return (
        <StaticLayout
            title="Cookie Policy"
            subtitle="How we use cookies to enhance your experience."
        >
            <div className="space-y-8 text-foreground/80 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">What are Cookies?</h2>
                    <p>
                        Cookies are small text files stored on your device when you visit a website.
                        They help us remember your preferences and provide a better user experience.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Cookies</h2>
                    <div className="space-y-4">
                        <div className="glass-card p-6 rounded-2xl border-border">
                            <h3 className="text-lg font-bold text-foreground mb-2">Essential Cookies</h3>
                            <p className="text-sm">Necessary for the platform to function, such as keeping you logged in.</p>
                        </div>
                        <div className="glass-card p-6 rounded-2xl border-border">
                            <h3 className="text-lg font-bold text-foreground mb-2">Preference Cookies</h3>
                            <p className="text-sm">Remember your settings like language preferences.</p>
                        </div>
                        <div className="glass-card p-6 rounded-2xl border-border">
                            <h3 className="text-lg font-bold text-foreground mb-2">Analytics Cookies</h3>
                            <p className="text-sm">Help us understand how users interact with the platform so we can improve it.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Managing Cookies</h2>
                    <p>
                        Most browsers allow you to control cookies through their settings. However,
                        disabling essential cookies may prevent you from using certain features of
                        Nexera Learn.
                    </p>
                </section>
            </div>
        </StaticLayout>
    );
}
