import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { Footer } from "@/components/ui/Footer";
import {
  ArrowRight,
  TrendingUp,
  Droplets,
  Settings,
  Building2,
  Users,
  GraduationCap,
  Shield,
  Sparkles,
  Layers,
  Zap,
  Globe,
  Github,
  Linkedin,
  ChevronRight,
  Play,
  BookOpen,
  Lightbulb,
  Award,
  PenTool,
  Brain,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } }
};

// Partner logos placeholder
const partnerLogos = [
  { name: "Microsoft", initial: "M" },
  { name: "KuCoin", initial: "K" },
  { name: "NexGen", initial: "N" },
  { name: "AWS", initial: "A" },
  { name: "BitNova", initial: "B" },
  { name: "Huawei", initial: "H" },
];

export default function Index() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sticky Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden lg:flex items-center gap-8">
              <button 
                onClick={() => navigate("/portals")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Portals
              </button>
              <button 
                onClick={() => navigate("/about")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => navigate("/team")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Team
              </button>
              <button 
                onClick={() => navigate("/security")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Security
              </button>
              <button 
                onClick={() => navigate("/contact")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={scrollToHowItWorks}
              className="hidden sm:flex text-sm"
            >
              Learn More
            </Button>
            <Button 
              onClick={() => navigate("/portals")} 
              className="bloom-btn-launch text-sm px-6 py-2 h-auto"
            >
              Launch
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - BloomFi Style */}
      <section className="relative pt-32 md:pt-44 pb-16 md:pb-24 px-4 md:px-6">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Decorative Plus */}
            <motion.div variants={itemVariants} className="flex justify-center mb-6">
              <div className="w-8 h-8 text-primary">
                <svg viewBox="0 0 32 32" fill="currentColor">
                  <rect x="14" y="4" width="4" height="24" rx="2" />
                  <rect x="4" y="14" width="24" height="4" rx="2" />
                </svg>
              </div>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 tracking-tight leading-[1.1]"
            >
              Where Learning
              <br />
              <span className="gradient-text">Grows</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              A programmable, utility-driven education platform
              designed for native value accrual and seamless
              integration into modern campus life.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/portals")} 
                className="w-full sm:w-auto h-14 px-8 text-base bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-soft-lg"
              >
                Try it now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero 3D Image Container - Dark Navy with Floating Icons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 md:mt-24 relative"
          >
            <div className="relative mx-auto max-w-5xl aspect-[16/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-bloom bg-gradient-to-br from-[#1A1B23] via-[#252836] to-[#1A1B23] border border-purple-500/20">
              {/* Ambient glow effects */}
              <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-64 md:h-64 bg-purple-500/20 rounded-full blur-[80px] animate-pulse" />
              <div className="absolute bottom-1/3 right-1/3 w-40 h-40 md:w-56 md:h-56 bg-purple-600/15 rounded-full blur-[60px]" />
              
              {/* Floating 3D Elements Container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  
                  {/* Graduation Cap Icon - Purple with glow */}
                  <motion.div 
                    animate={{ 
                      y: [0, -20, 0], 
                      x: [0, 8, 0],
                      rotate: [0, 3, -2, 0],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      times: [0, 0.5, 1]
                    }}
                    className="absolute top-[18%] left-[22%] md:left-[28%]"
                  >
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-purple-500/50 rounded-2xl md:rounded-3xl blur-xl scale-110" />
                      <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 shadow-2xl flex items-center justify-center border border-purple-400/30">
                        <GraduationCap className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white drop-shadow-lg" strokeWidth={1.5} />
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Trending Up Icon - Teal/Emerald circle */}
                  <motion.div 
                    animate={{ 
                      y: [0, -15, 0], 
                      x: [0, -10, 0],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      ease: "easeInOut", 
                      delay: 0.8 
                    }}
                    className="absolute top-[22%] right-[18%] md:right-[22%]"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-400/40 rounded-full blur-lg scale-110" />
                      <div className="relative w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 shadow-2xl flex items-center justify-center border border-emerald-300/40">
                        <TrendingUp className="w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white drop-shadow-md" strokeWidth={2} />
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Sparkles Icon - Orange/Amber */}
                  <motion.div 
                    animate={{ 
                      y: [0, -12, 0], 
                      x: [0, 6, 0],
                      rotate: [0, 8, -4, 0],
                      scale: [1, 1.05, 0.98, 1]
                    }}
                    transition={{ 
                      duration: 4.5, 
                      repeat: Infinity, 
                      ease: "easeInOut", 
                      delay: 0.4 
                    }}
                    className="absolute top-[48%] left-[32%] md:left-[36%]"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-500/40 rounded-xl md:rounded-2xl blur-lg scale-110" />
                      <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-2xl flex items-center justify-center border border-amber-300/40">
                        <Sparkles className="w-6 h-6 md:w-8 md:h-8 lg:w-9 lg:h-9 text-white drop-shadow-md" strokeWidth={2} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Book Icon - Blue/Indigo */}
                  <motion.div 
                    animate={{ 
                      y: [0, -18, 0], 
                      x: [0, -5, 0],
                      rotate: [0, -6, 3, 0]
                    }}
                    transition={{ 
                      duration: 5.5, 
                      repeat: Infinity, 
                      ease: "easeInOut", 
                      delay: 1.2 
                    }}
                    className="absolute top-[58%] right-[18%] md:right-[20%]"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/40 rounded-xl md:rounded-2xl blur-lg scale-110" />
                      <div className="relative w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600 shadow-2xl flex items-center justify-center border border-blue-300/40">
                        <BookOpen className="w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 text-white drop-shadow-md" strokeWidth={1.5} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Lightbulb Icon - Yellow/Gold */}
                  <motion.div 
                    animate={{ 
                      y: [0, -14, 0], 
                      x: [0, 8, 0],
                      scale: [1, 1.08, 1],
                      rotate: [0, 5, -3, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut", 
                      delay: 0.6 
                    }}
                    className="absolute top-[12%] left-[48%] md:left-[52%]"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400/50 rounded-full blur-lg scale-125" />
                      <div className="relative w-11 h-11 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 shadow-2xl flex items-center justify-center border border-yellow-200/50">
                        <Lightbulb className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white drop-shadow-md" strokeWidth={2} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Award/Certificate Icon - Rose/Pink */}
                  <motion.div 
                    animate={{ 
                      y: [0, -16, 0], 
                      x: [0, -6, 0],
                      rotate: [0, 4, -6, 0]
                    }}
                    transition={{ 
                      duration: 5.2, 
                      repeat: Infinity, 
                      ease: "easeInOut", 
                      delay: 1.8 
                    }}
                    className="absolute top-[68%] left-[18%] md:left-[22%]"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-rose-500/40 rounded-xl blur-lg scale-110" />
                      <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-xl bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 shadow-2xl flex items-center justify-center border border-rose-300/40">
                        <Award className="w-6 h-6 md:w-8 md:h-8 lg:w-9 lg:h-9 text-white drop-shadow-md" strokeWidth={1.5} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Brain Icon - Cyan/Sky */}
                  <motion.div 
                    animate={{ 
                      y: [0, -12, 0], 
                      x: [0, 10, 0],
                      rotate: [0, -4, 6, 0],
                      scale: [1, 1.04, 0.98, 1]
                    }}
                    transition={{ 
                      duration: 6.5, 
                      repeat: Infinity, 
                      ease: "easeInOut", 
                      delay: 2.2 
                    }}
                    className="absolute top-[38%] right-[8%] md:right-[12%]"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-400/40 rounded-2xl blur-lg scale-110" />
                      <div className="relative w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-cyan-600 shadow-2xl flex items-center justify-center border border-cyan-300/40">
                        <Brain className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white drop-shadow-md" strokeWidth={1.5} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Target Icon - Violet */}
                  <motion.div 
                    animate={{ 
                      y: [0, -10, 0], 
                      x: [0, -8, 0],
                      rotate: [0, 8, -4, 0]
                    }}
                    transition={{ 
                      duration: 4.8, 
                      repeat: Infinity, 
                      ease: "easeInOut", 
                      delay: 1.5 
                    }}
                    className="absolute top-[75%] left-[45%] md:left-[48%]"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-violet-500/40 rounded-full blur-lg scale-110" />
                      <div className="relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-violet-400 via-purple-500 to-violet-600 shadow-2xl flex items-center justify-center border border-violet-300/40">
                        <Target className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white drop-shadow-md" strokeWidth={2} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Central Orb - Translucent Purple */}
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.08, 1],
                      opacity: [0.6, 0.8, 0.6]
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute top-[45%] right-[28%] md:right-[32%]"
                  >
                    <div className="w-28 h-28 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-purple-600/30 via-purple-500/20 to-purple-800/40 backdrop-blur-sm border border-purple-400/20 shadow-[inset_0_0_30px_rgba(147,51,234,0.3)]" />
                  </motion.div>
                  
                  {/* Additional floating particles */}
                  <motion.div
                    animate={{ 
                      y: [0, -30, 0],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[60%] left-[12%] w-3 h-3 rounded-full bg-purple-400/60"
                  />
                  <motion.div
                    animate={{ 
                      y: [0, -20, 0],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[28%] right-[8%] w-2 h-2 rounded-full bg-emerald-400/60"
                  />
                  <motion.div
                    animate={{ 
                      y: [0, -25, 0],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[82%] right-[35%] w-2.5 h-2.5 rounded-full bg-amber-400/50"
                  />
                  <motion.div
                    animate={{ 
                      y: [0, -18, 0],
                      opacity: [0.35, 0.65, 0.35]
                    }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                    className="absolute top-[15%] left-[12%] w-2 h-2 rounded-full bg-blue-400/50"
                  />
                  <motion.div
                    animate={{ 
                      y: [0, -22, 0],
                      opacity: [0.25, 0.55, 0.25]
                    }}
                    transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="absolute top-[52%] right-[5%] w-2.5 h-2.5 rounded-full bg-rose-400/50"
                  />
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
                    className="absolute top-[85%] left-[8%] w-2 h-2 rounded-full bg-cyan-400/50"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What is Nexera Learn Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 relative">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-6">
                What is NexEra Learn?
              </h2>
              <Button 
                variant="outline" 
                onClick={() => navigate("/about")}
                className="rounded-full px-6 border-foreground/20 hover:bg-secondary"
              >
                Explore now
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-lg text-muted-foreground leading-relaxed">
                NexEra Learn is a yield-bearing education platform that helps your academic journey
                grow while staying pegged to institutional excellence. Experience seamless campus connectivity,
                AI-powered insights, and enterprise-grade security.
              </p>
            </motion.div>
          </div>

          {/* Bento Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Card 1 - Capital that grows (Light) */}
            <motion.div 
              variants={itemVariants}
              onClick={() => navigate("/portals")}
              className="bento-card-featured cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Knowledge that grows</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Earn passive knowledge as your learning journey
                is deployed into high-performing academic
                protocols.
              </p>
              <div className="mt-6 flex items-center text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                Learn More <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>

            {/* Card 2 - Always liquid (Dark) */}
            <motion.div 
              variants={itemVariants}
              className="bento-card-navy"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Always accessible,<br />always stable</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Stay fully connected with
                instant access to your classes—
                no lockups or delays.
              </p>
            </motion.div>

            {/* Card 3 - 100% hands-free (Dark) */}
            <motion.div 
              variants={itemVariants}
              className="bento-card-navy"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">100%<br />hands-free</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                No need to manage schedules
                manually. NexEra works
                in the background for you.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Partner Logos Section */}
      <section className="py-12 px-4 md:px-6 border-y border-border bg-secondary/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Backed by the best companies<br className="md:hidden" /> and visionary angels.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {partnerLogos.map((partner, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
                    {partner.initial}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{partner.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="how-it-works" className="py-20 md:py-32 px-4 md:px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-4">NexEra Learn in Action</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
              Use cases
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl">
              NexEra Learn offers a variety of use cases for
              students, faculty and institutions seeking
              secure and productive education integrations.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Education Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bloom-card p-8 md:p-10"
            >
              <h3 className="text-2xl font-bold mb-4">Education</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Boost student engagement by offering NexEra Learn, a secure
                AI-backed platform with high yields, allowing your
                students to learn effortlessly on your platform.
              </p>
              <Button 
                variant="link" 
                onClick={() => navigate("/portals")}
                className="p-0 h-auto text-primary font-semibold"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Learn more
              </Button>

              {/* 3D Icon */}
              <div className="mt-8 flex justify-center">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-48 h-48 md:w-64 md:h-64"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-lavender-soft via-purple-100 to-pink-100 dark:from-purple-900/30 dark:via-primary/20 dark:to-pink-900/30 rounded-3xl" />
                  <div className="absolute inset-4 flex items-center justify-center">
                    <Building2 className="w-24 h-24 md:w-32 md:h-32 text-primary/80" strokeWidth={1} />
                  </div>
                  {/* Decorative columns */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-4 h-16 bg-gradient-to-t from-primary/40 to-primary/10 rounded-t-full" />
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* For Institutions Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bloom-card p-8 md:p-10"
            >
              <h3 className="text-2xl font-bold mb-4">For Institutions</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Modernize your campus infrastructure with our comprehensive
                suite of tools designed for academic excellence and
                administrative efficiency.
              </p>
              <Button 
                variant="link" 
                onClick={() => navigate("/security")}
                className="p-0 h-auto text-primary font-semibold"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Explore security
              </Button>

              {/* 3D Icon */}
              <div className="mt-8 flex justify-center">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="relative w-48 h-48 md:w-64 md:h-64"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-cyan-900/30 rounded-3xl" />
                  <div className="absolute inset-4 flex items-center justify-center">
                    <Shield className="w-24 h-24 md:w-32 md:h-32 text-emerald-600/80 dark:text-emerald-400/80" strokeWidth={1} />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 relative bg-secondary/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-8 leading-tight">
                Why Choose <span className="gradient-text">NexEra Learn?</span>
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
                    icon: Zap,
                    link: "/wellness"
                  },
                  {
                    title: "Institutional Security",
                    desc: "Enterprise-grade encryption ensures that student and faculty data remains private and secure.",
                    icon: Shield,
                    link: "/security"
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "flex gap-5 transition-all group",
                      item.link && "cursor-pointer hover:translate-x-2"
                    )}
                    onClick={() => item.link && navigate(item.link)}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        {item.title}
                        {item.link && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Smart Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bloom-card p-6 md:p-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-widest">
                    Smart Dashboard
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/2 bg-muted rounded-lg" />
                      <div className="h-3 w-1/3 bg-muted/50 rounded-lg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                      <div className="h-2 w-1/2 bg-primary/20 rounded mb-3" />
                      <div className="h-6 w-3/4 bg-primary/30 rounded-lg" />
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="h-2 w-1/2 bg-emerald-500/20 rounded mb-3" />
                      <div className="h-6 w-3/4 bg-emerald-500/30 rounded-lg" />
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-muted/50 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-1/4 bg-muted rounded" />
                      <div className="h-3 w-1/6 bg-muted rounded" />
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "70%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 rounded-[3rem] -z-10 blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Powered Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden">
        <div className="container mx-auto">
          <div className="bloom-card p-8 md:p-16 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 blur-[80px] rounded-full" />

            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">AI-Powered</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-6 leading-tight">
                  Powered by <span className="gradient-text">Gemini AI</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Experience a campus that thinks, learns, and grows with you. From personalized
                  learning paths to proactive wellness monitoring, AI is the heartbeat of
                  our ecosystem.
                </p>
                <div className="flex flex-wrap gap-4">
                  {["Real-time Assistance", "Predictive Analytics", "Natural Language"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        i === 0 ? "bg-primary" : i === 1 ? "bg-emerald-400" : "bg-purple-400"
                      )} />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                {/* Gemini Orb Animation */}
                <div className="relative w-56 h-56 md:w-72 md:h-72">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-6 border border-purple-400/30 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-12 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 shadow-glow-lg flex items-center justify-center"
                  >
                    <Sparkles className="w-16 h-16 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 relative bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <img
                src="/nexera-innovators-logo.png"
                alt="NexEra Innovators"
                className="w-48 h-48 md:w-64 md:h-64 object-contain mx-auto mb-4"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
                Meet <span className="gradient-text">NexEra Innovators</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The visionaries behind the next generation of educational technology.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
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
                className="bloom-card p-6 text-center group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 mx-auto mb-4 flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-glow group-hover:scale-110 transition-transform">
                  {member.name[0]}
                </div>
                <h3 className="font-bold mb-1 text-sm md:text-base">{member.name}</h3>
                <p className="text-xs text-primary font-semibold uppercase tracking-widest">{member.role}</p>
                <div className="flex justify-center gap-2 mt-4">
                  <button className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors">
                    <Github className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </button>
                  <button className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors">
                    <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary" />
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