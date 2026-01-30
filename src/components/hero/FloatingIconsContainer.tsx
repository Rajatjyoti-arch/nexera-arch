import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  GraduationCap,
  TrendingUp,
  Sparkles,
  BookOpen,
  Lightbulb,
  Award,
  Brain,
  Target,
  LucideIcon
} from "lucide-react";

interface FloatingIcon {
  id: string;
  Icon: LucideIcon;
  baseTop: number;
  baseLeft: number;
  size: "sm" | "md" | "lg";
  shape: "square" | "circle";
  gradient: string;
  glowColor: string;
  borderColor: string;
  parallaxIntensity: number;
  animationDuration: number;
  animationDelay: number;
}

const iconConfigs: Omit<FloatingIcon, "baseTop" | "baseLeft">[] = [
  {
    id: "graduation",
    Icon: GraduationCap,
    size: "lg",
    shape: "square",
    gradient: "from-purple-500 via-purple-600 to-purple-700",
    glowColor: "bg-purple-500/50",
    borderColor: "border-purple-400/30",
    parallaxIntensity: 0.8,
    animationDuration: 6,
    animationDelay: 0
  },
  {
    id: "trending",
    Icon: TrendingUp,
    size: "md",
    shape: "circle",
    gradient: "from-emerald-400 via-teal-500 to-emerald-600",
    glowColor: "bg-emerald-400/40",
    borderColor: "border-emerald-300/40",
    parallaxIntensity: 1.2,
    animationDuration: 5,
    animationDelay: 0.8
  },
  {
    id: "sparkles",
    Icon: Sparkles,
    size: "sm",
    shape: "square",
    gradient: "from-amber-400 via-orange-500 to-amber-600",
    glowColor: "bg-amber-500/40",
    borderColor: "border-amber-300/40",
    parallaxIntensity: 1.5,
    animationDuration: 4.5,
    animationDelay: 0.4
  },
  {
    id: "book",
    Icon: BookOpen,
    size: "md",
    shape: "square",
    gradient: "from-blue-400 via-indigo-500 to-blue-600",
    glowColor: "bg-blue-500/40",
    borderColor: "border-blue-300/40",
    parallaxIntensity: 1.0,
    animationDuration: 5.5,
    animationDelay: 1.2
  },
  {
    id: "lightbulb",
    Icon: Lightbulb,
    size: "sm",
    shape: "circle",
    gradient: "from-yellow-300 via-yellow-400 to-amber-500",
    glowColor: "bg-yellow-400/50",
    borderColor: "border-yellow-200/50",
    parallaxIntensity: 1.3,
    animationDuration: 4,
    animationDelay: 0.6
  },
  {
    id: "award",
    Icon: Award,
    size: "sm",
    shape: "square",
    gradient: "from-rose-400 via-pink-500 to-rose-600",
    glowColor: "bg-rose-500/40",
    borderColor: "border-rose-300/40",
    parallaxIntensity: 0.9,
    animationDuration: 5.2,
    animationDelay: 1.8
  },
  {
    id: "brain",
    Icon: Brain,
    size: "sm",
    shape: "square",
    gradient: "from-cyan-400 via-sky-500 to-cyan-600",
    glowColor: "bg-cyan-400/40",
    borderColor: "border-cyan-300/40",
    parallaxIntensity: 1.1,
    animationDuration: 6.5,
    animationDelay: 2.2
  },
  {
    id: "target",
    Icon: Target,
    size: "sm",
    shape: "circle",
    gradient: "from-violet-400 via-purple-500 to-violet-600",
    glowColor: "bg-violet-500/40",
    borderColor: "border-violet-300/40",
    parallaxIntensity: 1.4,
    animationDuration: 4.8,
    animationDelay: 1.5
  }
];

// Position zones to ensure good distribution
const positionZones = [
  { top: [12, 22], left: [20, 35] },   // top-left
  { top: [10, 20], left: [45, 58] },   // top-center
  { top: [18, 28], left: [65, 82] },   // top-right
  { top: [35, 50], left: [28, 42] },   // mid-left
  { top: [55, 68], left: [15, 28] },   // bottom-left
  { top: [55, 68], left: [68, 82] },   // bottom-right
  { top: [32, 45], left: [75, 88] },   // mid-right
  { top: [70, 82], left: [42, 55] },   // bottom-center
];

function generateRandomPositions(): { top: number; left: number }[] {
  return positionZones.map(zone => ({
    top: zone.top[0] + Math.random() * (zone.top[1] - zone.top[0]),
    left: zone.left[0] + Math.random() * (zone.left[1] - zone.left[0])
  }));
}

const sizeClasses = {
  sm: {
    container: "w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16",
    icon: "w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8",
    rounded: { square: "rounded-xl md:rounded-2xl", circle: "rounded-full" }
  },
  md: {
    container: "w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24",
    icon: "w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12",
    rounded: { square: "rounded-xl md:rounded-2xl", circle: "rounded-full" }
  },
  lg: {
    container: "w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32",
    icon: "w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16",
    rounded: { square: "rounded-2xl md:rounded-3xl", circle: "rounded-full" }
  }
};

interface FloatingIconProps {
  config: FloatingIcon;
  mouseX: any;
  mouseY: any;
}

function FloatingIcon({ config, mouseX, mouseY }: FloatingIconProps) {
  const { Icon, size, shape, gradient, glowColor, borderColor, parallaxIntensity, animationDuration, animationDelay, baseTop, baseLeft } = config;
  
  const sizeConfig = sizeClasses[size];
  const roundedClass = sizeConfig.rounded[shape];
  
  // Parallax transform based on mouse position
  const parallaxX = useTransform(mouseX, [-1, 1], [-20 * parallaxIntensity, 20 * parallaxIntensity]);
  const parallaxY = useTransform(mouseY, [-1, 1], [-15 * parallaxIntensity, 15 * parallaxIntensity]);
  
  const springConfig = { stiffness: 100, damping: 30 };
  const springX = useSpring(parallaxX, springConfig);
  const springY = useSpring(parallaxY, springConfig);

  return (
    <motion.div
      style={{
        x: springX,
        y: springY,
        top: `${baseTop}%`,
        left: `${baseLeft}%`,
      }}
      animate={{
        y: [0, -18 + Math.random() * 8, 0],
        x: [0, (Math.random() - 0.5) * 16, 0],
        rotate: [0, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, 0],
        scale: [1, 1 + Math.random() * 0.08, 1]
      }}
      transition={{
        duration: animationDuration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: animationDelay
      }}
      className="absolute"
    >
      <div className="relative">
        {/* Glow effect */}
        <div className={`absolute inset-0 ${glowColor} ${roundedClass} blur-xl scale-110`} />
        <div className={`relative ${sizeConfig.container} ${roundedClass} bg-gradient-to-br ${gradient} shadow-2xl flex items-center justify-center border ${borderColor}`}>
          <Icon className={`${sizeConfig.icon} text-white drop-shadow-lg`} strokeWidth={size === "lg" ? 1.5 : 2} />
        </div>
      </div>
    </motion.div>
  );
}

export function FloatingIconsContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Generate random positions once on mount
  const randomPositions = useMemo(() => generateRandomPositions(), []);
  
  const icons: FloatingIcon[] = useMemo(() => 
    iconConfigs.map((config, index) => ({
      ...config,
      baseTop: randomPositions[index].top,
      baseLeft: randomPositions[index].left
    })),
    [randomPositions]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Normalize to -1 to 1 range
      const normalizedX = (e.clientX - centerX) / (rect.width / 2);
      const normalizedY = (e.clientY - centerY) / (rect.height / 2);
      
      mouseX.set(Math.max(-1, Math.min(1, normalizedX)));
      mouseY.set(Math.max(-1, Math.min(1, normalizedY)));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div 
      ref={containerRef}
      className="relative mx-auto max-w-5xl aspect-[16/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-bloom bg-gradient-to-br from-[#1A1B23] via-[#252836] to-[#1A1B23] border border-purple-500/20"
    >
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-64 md:h-64 bg-purple-500/20 rounded-full blur-[80px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-40 h-40 md:w-56 md:h-56 bg-purple-600/15 rounded-full blur-[60px]" />
      
      {/* Floating Icons */}
      <div className="absolute inset-0">
        {icons.map((icon) => (
          <FloatingIcon
            key={icon.id}
            config={icon}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        ))}
        
        {/* Central Orb with Pulsing Rings */}
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Outer pulsing ring 3 */}
          <motion.div
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8
            }}
            className="absolute inset-0 w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full border border-purple-400/20 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
          />
          
          {/* Outer pulsing ring 2 */}
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.15, 0.4, 0.15]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
            className="absolute inset-0 w-28 h-28 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full border border-purple-500/25 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
          />
          
          {/* Outer pulsing ring 1 */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 w-24 h-24 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full border-2 border-purple-500/30 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
          />
          
          {/* Central orb */}
          <motion.div 
            animate={{ 
              scale: [1, 1.08, 1],
              opacity: [0.6, 0.85, 0.6]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative"
          >
            <div className="w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-purple-600/40 via-purple-500/30 to-purple-800/50 backdrop-blur-sm border border-purple-400/30 shadow-[inset_0_0_40px_rgba(147,51,234,0.4),0_0_60px_rgba(147,51,234,0.2)]" />
          </motion.div>
        </div>
        
        {/* Floating particles */}
        {[
          { top: 60, left: 12, size: 3, color: "purple", duration: 7, delay: 0 },
          { top: 28, left: 88, size: 2, color: "emerald", duration: 5, delay: 1 },
          { top: 82, left: 35, size: 2.5, color: "amber", duration: 6, delay: 2 },
          { top: 15, left: 12, size: 2, color: "blue", duration: 5.5, delay: 0.8 },
          { top: 52, left: 92, size: 2.5, color: "rose", duration: 6.5, delay: 1.5 },
          { top: 85, left: 8, size: 2, color: "cyan", duration: 4.5, delay: 2.5 },
          { top: 45, left: 5, size: 2, color: "yellow", duration: 5.8, delay: 1.2 },
          { top: 75, left: 88, size: 2.5, color: "violet", duration: 6.2, delay: 0.5 },
        ].map((particle, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -25 - Math.random() * 10, 0],
              opacity: [0.25, 0.7, 0.25]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay
            }}
            className={`absolute rounded-full bg-${particle.color}-400/50`}
            style={{
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              width: `${particle.size * 4}px`,
              height: `${particle.size * 4}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}