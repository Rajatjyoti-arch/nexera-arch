import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Globe, Users, Sparkles } from "lucide-react";

interface NetworkHeaderProps {
  totalConnections?: number;
}

export function NetworkHeader({ totalConnections = 0 }: NetworkHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-end justify-between gap-6"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/30">
            <Globe className="w-3.5 h-3.5 text-teal-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-500">Community</p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/20">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-bold text-foreground/70">Live</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
          Campus Network
        </h1>
        <p className="text-foreground/60 font-medium max-w-md">
          Connect, collaborate, and grow with peers across the ecosystem.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/10 border border-border">
          <Users className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-bold">{totalConnections}</span>
          <span className="text-xs text-foreground/60">in network</span>
        </div>
        <Button 
          variant="outline" 
          className="rounded-xl h-11 px-6 border-border hover:bg-teal-500/10 hover:border-teal-500/30 hover:text-teal-500 text-[10px] font-bold uppercase tracking-widest transition-all duration-300"
        >
          <Users className="w-3.5 h-3.5 mr-2" />
          My Connections
        </Button>
      </div>
    </motion.div>
  );
}
