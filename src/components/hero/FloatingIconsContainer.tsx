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
    gradient: "from-purple-500 via-purple-600 to-purple-700",
    glowColor: "bg-purple-500/50",
    borderColor: "border-purple-400/30",
    parallaxIntensity: 0.8,
    animationDuration: 6,
    animationDelay: 0
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
    animationDelay: 0.5
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
    animationDelay: 1.0
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
    animationDelay: 1.5
  },
  {
    id: "brain",
    Icon: Brain,
    size: "md",
    shape: "circle",
    gradient: "from-cyan-400 via-sky-500 to-cyan-600",
    glowColor: "bg-cyan-400/40",
    borderColor: "border-cyan-300/40",
    parallaxIntensity: 1.1,
    animationDuration: 6.5,
    animationDelay: 2.0
  },
  {
    id: "rocket",
    Icon: Rocket,
    size: "md",
    shape: "circle",
    gradient: "from-orange-400 via-red-500 to-orange-600",
    glowColor: "bg-orange-500/40",
    borderColor: "border-orange-300/40",
    parallaxIntensity: 1.2,
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
    animationDelay: 2.5
  },
  {
    id: "globe",
    Icon: Globe,
    size: "sm",
    shape: "circle",
    gradient: "from-sky-400 via-blue-500 to-sky-600",
    glowColor: "bg-sky-500/40",
    borderColor: "border-sky-300/40",
    parallaxIntensity: 0.85,
    animationDuration: 7,
    animationDelay: 1.8
  },
  {
    id: "code",
    Icon: Code,
    size: "sm",
    shape: "square",
    gradient: "from-emerald-400 via-green-500 to-emerald-600",
    glowColor: "bg-emerald-500/40",
    borderColor: "border-emerald-300/40",
    parallaxIntensity: 1.15,
    animationDuration: 5.1,
    animationDelay: 0.7
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
    animationDelay: 1.2
  },
  {
    id: "sparkles",
    Icon: Sparkles,
    size: "xs",
    shape: "square",
    gradient: "from-amber-400 via-orange-500 to-amber-600",
    glowColor: "bg-amber-500/40",
    borderColor: "border-amber-300/40",
    parallaxIntensity: 1.5,
    animationDuration: 4.5,
    animationDelay: 0.4
  },
  {
    id: "pen",
    Icon: PenTool,
    size: "xs",
    shape: "square",
    gradient: "from-pink-400 via-fuchsia-500 to-pink-600",
    glowColor: "bg-pink-500/40",
    borderColor: "border-pink-300/40",
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
      className="absolute backdrop-blur-sm"
    >
      <div className="relative">
        {/* Glow effect with blur */}
        <div className={`absolute inset-0 ${glowColor} ${roundedClass} blur-xl scale-125`} />
        <div className={`relative ${sizeConfig.container} ${roundedClass} bg-gradient-to-br ${gradient} shadow-2xl flex items-center justify-center border ${borderColor} backdrop-blur-md bg-opacity-80`}>
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
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Subtle blur overlay for depth */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 md:w-80 md:h-80 bg-blue-600/8 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-72 md:h-72 bg-purple-500/5 rounded-full blur-[80px]" />
      
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
      </div>
    </div>
  );
}