import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useMemo } from "react";
import {
  GraduationCap,
  TrendingUp,
  Sparkles,
  BookOpen,
  Lightbulb,
  Award,
  Brain,
  Target,
  Rocket,
  Trophy,
  Compass,
  PenTool,
  Microscope,
  Calculator,
  Globe,
  Music,
  Palette,
  Code,
  LucideIcon
} from "lucide-react";

interface FloatingIcon {
  id: string;
  Icon: LucideIcon;
  baseTop: number;
  baseLeft: number;
  size: "xs" | "sm" | "md" | "lg";
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
    size: "xs",
    shape: "circle",
    gradient: "from-violet-400 via-purple-500 to-violet-600",
    glowColor: "bg-violet-500/40",
    borderColor: "border-violet-300/40",
    parallaxIntensity: 1.4,
    animationDuration: 4.8,
    animationDelay: 1.5
  },
  {
    id: "rocket",
    Icon: Rocket,
    size: "md",
    shape: "circle",
    gradient: "from-orange-400 via-red-500 to-orange-600",
    glowColor: "bg-orange-500/40",
    borderColor: "border-orange-300/40",
    parallaxIntensity: 1.3,
    animationDuration: 5.8,
    animationDelay: 0.3
  },
  {
    id: "trophy",
    Icon: Trophy,
    size: "sm",
    shape: "square",
    gradient: "from-yellow-400 via-amber-500 to-yellow-600",
    glowColor: "bg-yellow-500/40",
    borderColor: "border-yellow-300/40",
    parallaxIntensity: 1.0,
    animationDuration: 5.3,
    animationDelay: 2.0
  },
  {
    id: "compass",
    Icon: Compass,
    size: "xs",
    shape: "circle",
    gradient: "from-teal-400 via-cyan-500 to-teal-600",
    glowColor: "bg-teal-400/40",
    borderColor: "border-teal-300/40",
    parallaxIntensity: 1.2,
    animationDuration: 6.2,
    animationDelay: 1.0
  },
  {
    id: "pen",
    Icon: PenTool,
    size: "xs",
    shape: "square",
    gradient: "from-pink-400 via-fuchsia-500 to-pink-600",
    glowColor: "bg-pink-500/40",
    borderColor: "border-pink-300/40",
    parallaxIntensity: 1.5,
    animationDuration: 4.2,
    animationDelay: 0.9
  },
  {
    id: "microscope",
    Icon: Microscope,
    size: "sm",
    shape: "square",
    gradient: "from-lime-400 via-green-500 to-lime-600",
    glowColor: "bg-lime-500/40",
    borderColor: "border-lime-300/40",
    parallaxIntensity: 0.95,
    animationDuration: 5.7,
    animationDelay: 1.4
  },
  {
    id: "calculator",
    Icon: Calculator,
    size: "xs",
    shape: "square",
    gradient: "from-slate-400 via-gray-500 to-slate-600",
    glowColor: "bg-slate-400/40",
    borderColor: "border-slate-300/40",
    parallaxIntensity: 1.1,
    animationDuration: 6.0,
    animationDelay: 2.5
  },
  {
    id: "globe",
    Icon: Globe,
    size: "md",
    shape: "circle",
    gradient: "from-sky-400 via-blue-500 to-sky-600",
    glowColor: "bg-sky-500/40",
    borderColor: "border-sky-300/40",
    parallaxIntensity: 0.85,
    animationDuration: 7,
    animationDelay: 0.5
  },
  {
    id: "music",
    Icon: Music,
    size: "xs",
    shape: "circle",
    gradient: "from-fuchsia-400 via-purple-500 to-fuchsia-600",
    glowColor: "bg-fuchsia-500/40",
    borderColor: "border-fuchsia-300/40",
    parallaxIntensity: 1.35,
    animationDuration: 4.6,
    animationDelay: 1.7
  },
  {
    id: "palette",
    Icon: Palette,
    size: "sm",
    shape: "square",
    gradient: "from-red-400 via-rose-500 to-red-600",
    glowColor: "bg-red-500/40",
    borderColor: "border-red-300/40",
    parallaxIntensity: 1.15,
    animationDuration: 5.4,
    animationDelay: 2.3
  },
  {
    id: "code",
    Icon: Code,
    size: "sm",
    shape: "square",
    gradient: "from-emerald-400 via-green-500 to-emerald-600",
    glowColor: "bg-emerald-500/40",
    borderColor: "border-emerald-300/40",
    parallaxIntensity: 1.25,
    animationDuration: 5.1,
    animationDelay: 0.7
  }
];

// Position zones to ensure good distribution - expanded for more icons
const positionZones = [
  { top: [8, 18], left: [8, 20] },      // top-left corner
  { top: [12, 22], left: [25, 38] },    // top-left
  { top: [8, 16], left: [42, 55] },     // top-center
  { top: [10, 20], left: [58, 72] },    // top-right
  { top: [8, 18], left: [78, 92] },     // top-right corner
  { top: [28, 40], left: [8, 22] },     // mid-left
  { top: [35, 48], left: [30, 45] },    // center-left
  { top: [38, 50], left: [55, 70] },    // center-right
  { top: [28, 40], left: [78, 92] },    // mid-right
  { top: [52, 65], left: [8, 22] },     // lower-left
  { top: [55, 68], left: [28, 42] },    // lower-center-left
  { top: [55, 68], left: [58, 72] },    // lower-center-right
  { top: [52, 65], left: [78, 92] },    // lower-right
  { top: [72, 85], left: [12, 28] },    // bottom-left
  { top: [72, 85], left: [35, 50] },    // bottom-center-left
  { top: [72, 85], left: [52, 68] },    // bottom-center-right
  { top: [72, 85], left: [72, 88] },    // bottom-right
  { top: [45, 58], left: [45, 58] },    // true center
];

function generateRandomPositions(count: number): { top: number; left: number }[] {
  const positions: { top: number; left: number }[] = [];
  for (let i = 0; i < count; i++) {
    const zone = positionZones[i % positionZones.length];
    positions.push({
      top: zone.top[0] + Math.random() * (zone.top[1] - zone.top[0]),
      left: zone.left[0] + Math.random() * (zone.left[1] - zone.left[0])
    });
  }
  return positions;
}

const sizeClasses = {
  xs: {
    container: "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12",
    icon: "w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6",
    rounded: { square: "rounded-lg md:rounded-xl", circle: "rounded-full" }
  },
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
    container: "w-18 h-18 md:w-24 md:h-24 lg:w-28 lg:h-28",
    icon: "w-9 h-9 md:w-12 md:h-12 lg:w-14 lg:h-14",
    rounded: { square: "rounded-2xl md:rounded-3xl", circle: "rounded-full" }
  }
};

interface FloatingIconProps {
  config: FloatingIcon;
  mouseX: any;
  mouseY: any;
}

function FloatingIconItem({ config, mouseX, mouseY }: FloatingIconProps) {
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
  const randomPositions = useMemo(() => generateRandomPositions(iconConfigs.length), []);
  
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
      <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-64 md:h-64 bg-purple-500/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 md:w-56 md:h-56 bg-blue-600/10 rounded-full blur-[80px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 bg-purple-500/10 rounded-full blur-[60px]" />
      
      {/* Floating Icons */}
      <div className="absolute inset-0">
        {icons.map((icon) => (
          <FloatingIconItem
            key={icon.id}
            config={icon}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        ))}
        
        {/* Floating particles */}
        {[
          { top: 60, left: 5, size: 3, color: "bg-purple-400/50", duration: 7, delay: 0 },
          { top: 28, left: 95, size: 2, color: "bg-emerald-400/50", duration: 5, delay: 1 },
          { top: 88, left: 35, size: 2.5, color: "bg-amber-400/50", duration: 6, delay: 2 },
          { top: 12, left: 5, size: 2, color: "bg-blue-400/50", duration: 5.5, delay: 0.8 },
          { top: 48, left: 95, size: 2.5, color: "bg-rose-400/50", duration: 6.5, delay: 1.5 },
          { top: 90, left: 5, size: 2, color: "bg-cyan-400/50", duration: 4.5, delay: 2.5 },
          { top: 35, left: 3, size: 2, color: "bg-yellow-400/50", duration: 5.8, delay: 1.2 },
          { top: 78, left: 95, size: 2.5, color: "bg-violet-400/50", duration: 6.2, delay: 0.5 },
          { top: 5, left: 50, size: 2, color: "bg-pink-400/50", duration: 5.2, delay: 1.8 },
          { top: 95, left: 60, size: 2.5, color: "bg-teal-400/50", duration: 6.8, delay: 0.3 },
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
            className={`absolute rounded-full ${particle.color}`}
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