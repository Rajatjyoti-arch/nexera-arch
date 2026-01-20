import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, Eye, EyeOff, HeartHandshake, Loader2 } from "lucide-react";

export default function CounselorLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    specialization: "",
    qualifications: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // For counselor signup, we need to use a special flow
        // Counselors should be created by admin, but we allow registration pending admin approval
        const { supabase } = await import("@/integrations/supabase/client");
        
        const redirectUrl = `${window.location.origin}/`;
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              name: formData.name,
              role: 'counselor',
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create user");

        // Create role entry
        await supabase.from('user_roles').insert({ 
          user_id: authData.user.id, 
          role: 'counselor' 
        });

        // Create counselor profile
        await supabase.from('counselor_profiles').insert({
          user_id: authData.user.id,
          email: formData.email,
          name: formData.name,
          specialization: formData.specialization,
          qualifications: formData.qualifications,
          status: 'pending', // Pending admin approval
        });

        toast({
          title: "Registration Submitted",
          description: "Your counselor account is pending admin approval.",
        });
        
        setIsSignUp(false);
      } else {
        await login(formData.email, formData.password);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in as Counselor.",
        });
        navigate("/counselor");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/10 blur-[80px] rounded-full -z-10" />

      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-between z-10">
        <Logo />
        <Button
          variant="ghost"
          onClick={() => navigate("/portals")}
          className="text-foreground/70 hover:text-foreground gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Portals</span>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 rounded-3xl border-border space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <HeartHandshake className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">
                {isSignUp ? "Counselor Registration" : "Counselor Portal"}
              </h1>
              <p className="text-foreground/70 text-sm">
                {isSignUp 
                  ? "Register to support students" 
                  : "Sign in to access your counseling dashboard"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Dr. Jane Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      placeholder="e.g., Academic Counseling, Mental Health"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Input
                      id="qualifications"
                      placeholder="e.g., M.A. Psychology, Certified Counselor"
                      value={formData.qualifications}
                      onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="counselor@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="h-12 rounded-xl pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSignUp ? (
                  "Submit Registration"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Toggle */}
            <div className="text-center text-sm">
              <span className="text-foreground/70">
                {isSignUp ? "Already registered?" : "New counselor?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-rose-400 hover:text-rose-300 font-medium"
              >
                {isSignUp ? "Sign in" : "Register here"}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}