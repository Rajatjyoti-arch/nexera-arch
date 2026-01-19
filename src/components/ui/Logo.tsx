import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export const Logo = ({ size = "md", className, showText = true }: LogoProps) => {
  const iconSizes = {
    sm: "w-[48px] h-[48px]",
    md: "w-[64px] h-[64px]",
    lg: "w-[80px] h-[80px]",
    xl: "w-[140px] h-[140px]",
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl",
    xl: "text-6xl",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn("flex items-center gap-5 shrink-0", className)}
    >
      <div className={cn(
        iconSizes[size],
        "relative shrink-0 overflow-hidden rounded-2xl shadow-2xl border border-border bg-secondary/10"
      )}>
        <img
          src="/logo.png"
          alt="NexEra Learn Logo"
          className="w-full h-full object-cover scale-[1.6]" // Heavily zoomed to remove all image padding
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className={cn(
            "font-display font-bold tracking-tighter text-foreground flex items-baseline gap-2",
            textSizes[size]
          )}>
            <span>NexEra</span>
            <span className="text-primary">Learn</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-foreground/60 font-black mt-2">
            Next-Gen Education
          </span>
        </div>
      )}
    </motion.div>
  );
};
