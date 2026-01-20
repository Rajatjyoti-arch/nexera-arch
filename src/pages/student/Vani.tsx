import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import StudentLayout from "@/components/layouts/StudentLayout";
import {
  ExternalLink,
  Shield,
  Eye,
  Lock,
  Bot,
  FileText,
  AlertTriangle,
  Users,
  Scale,
  Clock,
  CheckCircle,
  ArrowRight,
  Fingerprint,
  Database,
  Cpu
} from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Zero-Knowledge Authentication",
    description: "Client-side SHA-256 hashing with 12-word mnemonic phrases ensures your credentials never reach the server."
  },
  {
    icon: Lock,
    title: "AES-256 Encryption",
    description: "All evidence and sensitive submissions are encrypted with military-grade AES-256 encryption."
  },
  {
    icon: Eye,
    title: "Complete Anonymity",
    description: "Your identity is fully protected through advanced cryptographic techniques—report without fear."
  },
  {
    icon: Bot,
    title: "AI-Powered Resolution",
    description: "Three specialized AI agents (Sentinel, Governor, Arbiter) negotiate fair resolutions using Google Gemini."
  },
  {
    icon: Users,
    title: "Irene AI Assistant",
    description: "Get real-time procedural guidance and compliance assistance throughout your grievance journey."
  },
  {
    icon: FileText,
    title: "Immutable Public Ledger",
    description: "Transparent case tracking ensures accountability with tamper-proof record keeping."
  },
  {
    icon: Database,
    title: "PostgreSQL RLS Security",
    description: "Row-Level Security policies ensure data protection at the database level."
  },
  {
    icon: Clock,
    title: "Dead Man's Switch",
    description: "Safety-critical unresolved cases are automatically published after a defined period."
  }
];

const portals = [
  {
    title: "Student Portal",
    icon: Users,
    features: [
      "Anonymous credentialing",
      "Secure evidence submission",
      "Case status tracking",
      "AI-guided procedures"
    ],
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Administrative Portal",
    icon: Scale,
    features: [
      "Welfare analytics dashboard",
      "Sentiment heatmaps",
      "Governance Resolution Matrix",
      "Case management system"
    ],
    color: "from-purple-500 to-pink-500"
  }
];

export default function Vani() {
  return (
    <StudentLayout>
      <div className="min-h-screen p-4 md:p-6 pb-24 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2"
            >
              <Badge variant="outline" className="px-4 py-1.5 text-sm border-primary/50 bg-primary/10">
                <Shield className="w-4 h-4 mr-2" />
                Zero-Knowledge Governance
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-display font-black tracking-tight"
            >
              <span className="gradient-text">VANI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-lg text-muted-foreground font-medium"
            >
              Verifiable Anonymous Network Intelligence
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-foreground/80 max-w-3xl mx-auto text-lg leading-relaxed"
            >
              A zero-knowledge governance platform developed for the Central University of Jammu (CUJ) 
              that enables students to anonymously report grievances while maintaining complete identity protection.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                className="gradient-primary shadow-glow text-lg h-14 px-8 rounded-2xl"
                onClick={() => window.open("https://vani-arch.vercel.app/", "_blank")}
              >
                Launch VANI Platform
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>

          {/* Dual Portal Architecture */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Dual-Portal Architecture</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {portals.map((portal, i) => (
                <Card key={i} className="glass-card border-border/50 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${portal.color}`} />
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${portal.color} flex items-center justify-center`}>
                        <portal.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">{portal.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {portal.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2 text-foreground/80">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Key Features Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Key Features</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Card className="glass-card h-full border-border/50 hover:border-primary/30 transition-colors">
                    <CardContent className="p-5 space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* AI Agents Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass-card border-border/50 overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Cpu className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold">Governance Resolution Matrix</h2>
                </div>
                <p className="text-foreground/80 mb-6 leading-relaxed">
                  VANI employs three specialized AI agents powered by Google Gemini 2.5 Flash/Pro 
                  that work together to negotiate fair and balanced resolutions:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <h3 className="font-bold text-red-400 mb-2">🛡️ Sentinel</h3>
                    <p className="text-sm text-foreground/70">
                      Monitors and flags potential policy violations and safety concerns.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h3 className="font-bold text-blue-400 mb-2">⚖️ Governor</h3>
                    <p className="text-sm text-foreground/70">
                      Evaluates cases against institutional policies and precedents.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <h3 className="font-bold text-purple-400 mb-2">🔮 Arbiter</h3>
                    <p className="text-sm text-foreground/70">
                      Mediates between parties to reach fair, balanced resolutions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Tech Stack */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center space-y-4"
          >
            <p className="text-sm text-muted-foreground">Built with</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["React.js", "TypeScript", "Tailwind CSS", "Lovable Cloud", "Google Gemini", "PostgreSQL RLS"].map((tech, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1">
                  {tech}
                </Badge>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center pt-4"
          >
            <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 space-y-4">
                <AlertTriangle className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Have a Grievance to Report?</h3>
                <p className="text-foreground/70 max-w-lg mx-auto">
                  VANI transforms institutional grievance handling from opaque processes into 
                  accountable, AI-mediated governance—completely anonymously.
                </p>
                <Button
                  size="lg"
                  className="gradient-primary shadow-glow"
                  onClick={() => window.open("https://vani-arch.vercel.app/", "_blank")}
                >
                  Access VANI Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </StudentLayout>
  );
}