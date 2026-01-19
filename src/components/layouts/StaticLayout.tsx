import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Footer } from "@/components/ui/Footer";

interface StaticLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export const StaticLayout = ({ children, title, subtitle }: StaticLayoutProps) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
                <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
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
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 pt-28 md:pt-40 pb-20 px-4 md:px-6">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <h1 className="text-4xl md:text-6xl font-display font-black mb-4 tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-xl text-foreground/70 leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="prose  max-w-none"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
