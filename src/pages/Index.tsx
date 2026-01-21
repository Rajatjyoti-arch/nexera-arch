import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { Footer } from "@/components/ui/Footer";
import {
  ArrowRight,
  MessageCircle,
  Users,
  Heart,
  Shield,
  Zap,
  Globe,
  Github,
  Linkedin,
  Sparkles,
  Layers,
  MousePointer2,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Index() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="md:hidden">
            <Logo size="sm" showText={false} />
          </div>
          <div className="hidden md:block">
            <Logo />
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/portals")} className="shadow-glow gradient-primary border-0 text-sm md:text-base px-4 md:px-6">
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Login</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-40 pb-20 md:pb-32 px-4 md:px-6">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6 md:mb-8 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] md:text-xs font-medium tracking-wider uppercase text-foreground/70">
                Next-Gen Education Ecosystem
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-9xl font-display font-black mb-6 md:mb-8 tracking-tighter leading-[0.9] md:leading-[0.85]">
              Your Campus,<br />
              <span className="gradient-text">Redefined.</span>
            </h1>

            <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Experience the future of academic life with NEXERA LEARN. A seamless,
              secure, and intelligent platform for students and faculty.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Button size="lg" onClick={() => navigate("/portals")} className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 text-base md:text-lg shadow-glow gradient-primary border-0 group rounded-2xl">
                Explore Portals
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToHowItWorks} className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-10 text-base md:text-lg glass-card border-border hover:bg-secondary rounded-2xl">
                How it Works
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/10 blur-[150px] rounded-full -z-10 animate-pulse" />
      </section>

      {/* What is Nexera Learn Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 relative bg-secondary/5">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">
                The Future of <span className="gradient-text">Academic Excellence</span>
              </h2>
              <p className="text-xl text-foreground/80 leading-relaxed">
                NexEra Learn isn't just a portal; it's a cognitive campus infrastructure.
                We've built a unified environment where administration, pedagogy, and
                student life converge through intelligent automation and secure,
                high-performance networking.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Unified Platform",
                desc: "One login for everything—attendance, grades, communication, and resources.",
                icon: Layers,
                color: "from-blue-500/20 to-cyan-500/20"
              },
              {
                title: "AI Companion",
                desc: "Nexera AI assists students with learning and monitors mental well-being.",
                icon: Sparkles,
                color: "from-purple-500/20 to-pink-500/20"
              },
              {
                title: "Zero-Trust Security",
                desc: "Your data is encrypted and accessible only to authorized personnel.",
                icon: Shield,
                color: "from-emerald-500/20 to-teal-500/20"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  if (item.title === "Zero-Trust Security") navigate("/security");
                  if (item.title === "AI Companion") navigate("/wellness");
                }}
                className={cn(
                  "glass-card p-8 rounded-3xl border-border hover:border-primary/30 transition-all group",
                  (item.title === "Zero-Trust Security" || item.title === "AI Companion") && "cursor-pointer"
                )}
              >
                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6", item.color)}>
                  <item.icon className="w-7 h-7 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{item.desc}</p>
                {(item.title === "Zero-Trust Security" || item.title === "AI Companion") && (
                  <div className="mt-6 flex items-center text-primary text-sm font-bold group-hover:gap-2 transition-all">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 px-4 md:px-6 relative">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              How it <span className="gradient-text">Works</span>
            </h2>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
              Getting started with Nexera Learn is simple and intuitive.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 -z-10" />

            {[
              {
                step: "01",
                title: "Choose Portal",
                desc: "Select your role: Student, Faculty, or Admin.",
                icon: MousePointer2
              },
              {
                step: "02",
                title: "Secure Login",
                desc: "Authenticate using your institutional credentials.",
                icon: Shield
              },
              {
                step: "03",
                title: "Personalize",
                desc: "Set up your profile and academic preferences.",
                icon: Sparkles
              },
              {
                step: "04",
                title: "Connect",
                desc: "Access your dashboard and start learning.",
                icon: Rocket
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-3xl border-border text-center relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-black text-black shadow-glow">
                  {item.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Nexera Learn (Features) */}
      <section className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden bg-secondary/5">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight leading-tight">
                Why Choose <span className="gradient-text">Nexera Learn?</span>
              </h2>
              <div className="space-y-8">
                {[
                  {
                    title: "Unified Ecosystem",
                    desc: "Everything you need—from attendance to assignments—in one beautiful, high-performance interface.",
                    icon: Globe
                  },
                  {
                    title: "AI-Powered Insights",
                    desc: "Leverage Nexera AI for personalized learning paths and wellness monitoring.",
                    icon: Zap
                  },
                  {
                    title: "Institutional Security",
                    desc: "Enterprise-grade encryption ensures that student and faculty data remains private and secure.",
                    icon: Shield
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-6 transition-all",
                      item.title === "Institutional Security" && "cursor-pointer hover:translate-x-2"
                    )}
                    onClick={() => {
                      if (item.title === "Institutional Security") navigate("/security");
                    }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        {item.title}
                        {item.title === "Institutional Security" && <ArrowRight className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </h3>
                      <p className="text-foreground/70 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] gradient-primary opacity-20 blur-3xl absolute inset-0 -z-10" />
              <div className="glass-card p-8 rounded-[3rem] border-border shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                      Smart Dashboard
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/2 bg-secondary rounded-lg animate-pulse" />
                        <div className="h-3 w-1/3 bg-secondary/50 rounded-lg animate-pulse" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                        <div className="h-2 w-1/2 bg-primary/20 rounded mb-3" />
                        <div className="h-6 w-3/4 bg-primary/40 rounded-lg" />
                      </div>
                      <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                        <div className="h-2 w-1/2 bg-blue-500/20 rounded mb-3" />
                        <div className="h-6 w-3/4 bg-blue-500/40 rounded-lg" />
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-secondary/20 border border-border/50 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="h-3 w-1/4 bg-secondary rounded" />
                        <div className="h-3 w-1/6 bg-secondary rounded" />
                      </div>
                      <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "75%" }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-primary shadow-glow"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-12 bg-secondary/40 rounded-xl" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gemini Powered Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden">
        <div className="container mx-auto">
          <div className="glass-card rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 border-border relative overflow-hidden group">
            {/* Background Animation */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />

            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Intelligence by Google</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight leading-tight">
                  Powered by <br />
                  <span className="gradient-text">Gemini AI</span>
                </h2>
                <p className="text-xl text-foreground/80 leading-relaxed mb-10">
                  Nexera Learn is built on the foundation of Google's most capable AI models.
                  Experience a campus that thinks, learns, and grows with you. From personalized
                  learning paths to proactive wellness monitoring, Gemini AI is the heartbeat of
                  our ecosystem.
                </p>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-glow" />
                    <span className="font-bold text-sm">Real-time Assistance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-glow" />
                    <span className="font-bold text-sm">Predictive Analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 shadow-glow" />
                    <span className="font-bold text-sm">Natural Language Processing</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative flex justify-center"
              >
                {/* Gemini Animation */}
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  {/* Outer Rings */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border border-blue-400/20 rounded-full"
                  />

                  {/* Core Orb */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 90, 180, 270, 360]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-12 rounded-full bg-gradient-to-br from-primary via-blue-500 to-purple-600 shadow-[0_0_80px_rgba(139,92,246,0.5)] flex items-center justify-center overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
                    <Sparkles className="w-20 h-20 text-black animate-pulse" />

                    {/* Dynamic Glows */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse" />
                  </motion.div>

                  {/* Floating Particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -20, 0],
                        x: [0, i % 2 === 0 ? 10 : -10, 0],
                        opacity: [0.2, 0.8, 0.2]
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5
                      }}
                      className={cn(
                        "absolute w-2 h-2 rounded-full shadow-glow",
                        i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-blue-400" : "bg-purple-400"
                      )}
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 px-6 relative bg-secondary/5">
        <div className="container mx-auto">
          {/* Team Logo & Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-0"
            >
              {/* Team Logo */}
              <div className="inline-block mt-8">
                <img
                  src="/nexera-innovators-logo.png"
                  alt="NexEra Innovators"
                  className="w-64 h-64 md:w-80 md:h-80 object-contain mx-auto"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                Meet <span className="gradient-text">NexEra Innovators</span>
              </h2>
              <p className="text-foreground/80 text-lg max-w-2xl mx-auto mb-4">
                The visionaries behind the next generation of educational technology.
              </p>
              <p className="text-sm text-primary/80 font-semibold uppercase tracking-widest">
                Building the future of campus connectivity
              </p>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Abhinav", role: "Team Lead" },
              { name: "Harsh", role: "Finance Lead" },
              { name: "Rajat", role: "Tech Lead" },
              { name: "Sakshi", role: "Creative Lead" },
              { name: "Mehak", role: "QA Lead" }
            ].map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-[2.5rem] border-border hover:border-primary/30 transition-all group text-center"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 mx-auto mb-6 flex items-center justify-center text-3xl font-black text-primary-foreground shadow-glow group-hover:scale-110 transition-transform">
                  {member.name[0]}
                </div>
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-sm text-primary font-bold uppercase tracking-widest mb-6">{member.role}</p>
                <div className="flex justify-center gap-4">
                  <button className="p-2 rounded-lg bg-secondary hover:bg-primary/20 text-foreground/70 hover:text-primary transition-all">
                    <Github className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-secondary hover:bg-primary/20 text-foreground/70 hover:text-primary transition-all">
                    <Linkedin className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
