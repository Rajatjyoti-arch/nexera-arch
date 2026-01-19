import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import {
    Github,
    Twitter,
    Linkedin,
    Mail
} from "lucide-react";

export const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="pt-20 md:pt-32 pb-12 px-4 md:px-6 border-t border-border bg-background relative z-10">
            <div className="container mx-auto">
                <div className="grid md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-2">
                        <Logo className="mb-8" />
                        <p className="text-foreground/70 max-w-sm leading-relaxed mb-8">
                            Nexera Learn is a comprehensive education ecosystem designed to empower students,
                            faculty, and administrators with intelligent tools and seamless connectivity.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                                <button key={i} className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-primary hover:border-primary transition-all group">
                                    <Icon className="w-5 h-5 text-foreground/70 group-hover:text-primary-foreground transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-8 uppercase tracking-widest text-xs">Platform</h4>
                        <ul className="space-y-4">
                            {[
                                { label: "Portals", path: "/portals" },
                                { label: "Features", path: "/#features" },
                                { label: "Security", path: "/security" },
                                { label: "Wellness", path: "/wellness" }
                            ].map((link) => (
                                <li key={link.label}>
                                    <button
                                        onClick={() => link.path.startsWith('/#') ? window.location.href = link.path : navigate(link.path)}
                                        className="text-foreground/70 hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-8 uppercase tracking-widest text-xs">Company</h4>
                        <ul className="space-y-4">
                            {[
                                { label: "About Us", path: "/about" },
                                { label: "Our Team", path: "/team" },
                                { label: "Contact", path: "/contact" },
                                { label: "Privacy", path: "/privacy" }
                            ].map((link) => (
                                <li key={link.label}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-foreground/70 hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-border text-sm text-foreground/70">
                    <p>© 2026 NEXERA INNOVATORS. All rights reserved.</p>
                    <div className="flex gap-8">
                        <button onClick={() => navigate("/terms")} className="hover:text-primary transition-colors">Terms of Service</button>
                        <button onClick={() => navigate("/privacy")} className="hover:text-primary transition-colors">Privacy Policy</button>
                        <button onClick={() => navigate("/cookies")} className="hover:text-primary transition-colors">Cookie Policy</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};
