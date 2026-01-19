import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, Loader2, User, Mail, Lock, GraduationCap, ChevronLeft } from "lucide-react";

export default function StudentLogin() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        username: "",
        college: "",
        course: "",
        year: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password, "student");
                toast.success("Welcome back, Student!");
                navigate("/student");
            } else {
                await signup({ ...formData, role: "student" });
                toast.success("Account created! Welcome to NexEra Learn!");
                navigate("/student");
            }
        } catch (error: any) {
            const message = error?.message || "Authentication failed";
            if (message.includes("Invalid login credentials")) {
                toast.error("Invalid email or password. Please try again.");
            } else if (message.includes("User already registered")) {
                toast.error("This email is already registered. Please sign in instead.");
            } else if (message.includes("Password should be")) {
                toast.error("Password must be at least 6 characters.");
            } else {
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10" />

            <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 text-foreground/70 hover:text-foreground gap-2"
            >
                <ChevronLeft className="w-4 h-4" /> Back to Home
            </Button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[450px] z-10"
            >
                <div className="text-center mb-8">
                    <Logo size="xl" className="justify-center mb-4" />
                    <h2 className="text-2xl font-bold tracking-tight">
                        {isLogin ? "Student Login" : "Join Campus Connect"}
                    </h2>
                    <p className="text-foreground/70 mt-2">
                        {isLogin
                            ? "Sign in to access your courses and network"
                            : "Create your student account today"}
                    </p>
                </div>

                <Card className="glass-card p-8 border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                className="pl-10 bg-secondary/20 border-border"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                                            <Input
                                                id="username"
                                                placeholder="john_doe"
                                                className="pl-10 bg-secondary/20 border-border"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@college.edu"
                                    className="pl-10 bg-secondary/20 border-border"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 bg-secondary/20 border-border"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 gradient-primary border-0 shadow-glow mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? "Sign In" : "Create Account"}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-foreground/70 hover:text-primary transition-colors"
                        >
                            {isLogin
                                ? "Don't have an account? Sign up"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
