import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useMemo } from "react";
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  Award,
  Brain,
  Rocket,
  Trophy,
  Globe,
  Code,
  Target,
  Sparkles,
  PenTool,
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
    gradient: "from-purple-400 via-purple-500 to-indigo-500",
    glowColor: "bg-purple-400/30",
    borderColor: "border-purple-300/50",
    parallaxIntensity: 0.8,
    animationDuration: 6,
    animationDelay: 0
  },
  {
    id: "book",
    Icon: BookOpen,
    size: "md",
    shape: "square",
    gradient: "from-blue-400 via-indigo-400 to-blue-500",
    glowColor: "bg-blue-400/25",
    borderColor: "border-blue-200/50",
    parallaxIntensity: 1.0,
    animationDuration: 5.5,
    animationDelay: 0.5
  },
  {
    id: "lightbulb",
    Icon: Lightbulb,
    size: "sm",
    shape: "circle",
    gradient: "from-amber-300 via-yellow-400 to-orange-400",
    glowColor: "bg-amber-300/35",
    borderColor: "border-amber-200/60",
    parallaxIntensity: 1.3,
    animationDuration: 4,
    animationDelay: 1.0
  },
  {
    id: "award",
    Icon: Award,
    size: "sm",
    shape: "square",
    gradient: "from-rose-400 via-pink-400 to-rose-500",
    glowColor: "bg-rose-400/25",
    borderColor: "border-rose-200/50",
    parallaxIntensity: 0.9,
    animationDuration: 5.2,
    animationDelay: 1.5
  },
  {
    id: "brain",
    Icon: Brain,
    size: "md",
    shape: "circle",
    gradient: "from-cyan-400 via-teal-400 to-cyan-500",
    glowColor: "bg-cyan-400/25",
    borderColor: "border-cyan-200/50",
    parallaxIntensity: 1.1,
    animationDuration: 6.5,
    animationDelay: 2.0
  },
  {
    id: "rocket",
    Icon: Rocket,
    size: "md",
    shape: "circle",
    gradient: "from-orange-400 via-red-400 to-orange-500",
    glowColor: "bg-orange-400/25",
    borderColor: "border-orange-200/50",
    parallaxIntensity: 1.2,
    animationDuration: 5.8,
    animationDelay: 0.3
  },
  {
    id: "trophy",
    Icon: Trophy,
    size: "sm",
    shape: "square",
    gradient: "from-yellow-400 via-amber-400 to-yellow-500",
    glowColor: "bg-yellow-400/30",
    borderColor: "border-yellow-200/60",
    parallaxIntensity: 1.0,
    animationDuration: 5.3,
    animationDelay: 2.5
  },
  {
    id: "globe",
    Icon: Globe,
    size: "sm",
    shape: "circle",
    gradient: "from-sky-400 via-blue-400 to-sky-500",
    glowColor: "bg-sky-400/25",
    borderColor: "border-sky-200/50",
    parallaxIntensity: 0.85,
    animationDuration: 7,
    animationDelay: 1.8
  },
  {
    id: "code",
    Icon: Code,
    size: "sm",
    shape: "square",
    gradient: "from-emerald-400 via-green-400 to-emerald-500",
    glowColor: "bg-emerald-400/25",
    borderColor: "border-emerald-200/50",
    parallaxIntensity: 1.15,
    animationDuration: 5.1,
    animationDelay: 0.7
  },
  {
    id: "target",
    Icon: Target,
    size: "xs",
    shape: "circle",
    gradient: "from-violet-400 via-purple-400 to-violet-500",
    glowColor: "bg-violet-400/25",
    borderColor: "border-violet-200/50",
    parallaxIntensity: 1.4,
    animationDuration: 4.8,
    animationDelay: 1.2
  },
  {
    id: "sparkles",
    Icon: Sparkles,
    size: "xs",
    shape: "square",
    gradient: "from-amber-400 via-orange-400 to-amber-500",
    glowColor: "bg-amber-400/25",
    borderColor: "border-amber-200/50",
    parallaxIntensity: 1.5,
    animationDuration: 4.5,
    animationDelay: 0.4
  },
  {
    id: "pen",
    Icon: PenTool,
    size: "xs",
    shape: "square",
    gradient: "from-pink-400 via-fuchsia-400 to-pink-500",
    glowColor: "bg-pink-400/25",
    borderColor: "border-pink-200/50",
    parallaxIntensity: 1.3,
    animationDuration: 4.2,
    animationDelay: 2.2
  }
];

// Position zones covering entire background - 12 zones for 12 icons
const positionZones = [
  { top: [5, 15], left: [5, 18] },       // top-left
  { top: [5, 15], left: [42, 58] },      // top-center
  { top: [5, 15], left: [82, 95] },      // top-right
  { top: [35, 48], left: [5, 18] },      // mid-left
  { top: [35, 48], left: [42, 58] },     // mid-center
  { top: [35, 48], left: [82, 95] },     // mid-right
  { top: [65, 78], left: [5, 18] },      // lower-left
  { top: [65, 78], left: [42, 58] },     // lower-center
  { top: [65, 78], left: [82, 95] },     // lower-right
  { top: [20, 32], left: [22, 38] },     // between top-left and center
  { top: [20, 32], left: [62, 78] },     // between top-right and center
  { top: [52, 62], left: [22, 38] },     // between mid and lower left
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
      <div className="relative" style={{ filter: 'blur(1.5px)' }}>
        {/* Enhanced glow effect with stronger blur */}
        <div className={`absolute inset-0 ${glowColor} ${roundedClass} blur-2xl scale-150 opacity-60`} />
        <div className={`absolute inset-0 ${glowColor} ${roundedClass} blur-3xl scale-[2] opacity-30`} />
        <div className={`relative ${sizeConfig.container} ${roundedClass} bg-gradient-to-br ${gradient} shadow-2xl flex items-center justify-center border ${borderColor} opacity-70`}>
          <Icon className={`${sizeConfig.icon} text-white/90 drop-shadow-lg`} strokeWidth={size === "lg" ? 1.5 : 2} />
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
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Gradient overlay for blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-30" />
      
      {/* Enhanced ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-[28rem] md:h-[28rem] bg-purple-500/8 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-600/6 rounded-full blur-[130px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 bg-lavender-soft/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/3 right-1/3 w-48 h-48 md:w-64 md:h-64 bg-pink-500/5 rounded-full blur-[120px]" />
      
      {/* Floating Icons with dreamy effect */}
      <div className="absolute inset-0" style={{ filter: 'blur(0.5px)' }}>
        {icons.map((icon) => (
          <FloatingIconItem
            key={icon.id}
            config={icon}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        ))}
      </div>
      
      {/* Top gradient fade for seamless blend with header */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent" />
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}