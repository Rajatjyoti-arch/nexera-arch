import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wind, Play, Pause, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaveBreathingSession } from "@/hooks/useWellness";
import { useAuth } from "@/contexts/AuthContext";

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

interface BreathingPattern {
  name: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

const PATTERNS: Record<string, BreathingPattern> = {
  box: { name: 'Box Breathing', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  relaxing: { name: 'Relaxing Breath', inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  energizing: { name: 'Energizing Breath', inhale: 4, holdIn: 0, exhale: 4, holdOut: 0 },
};

interface BreathingExerciseProps {
  onClose: () => void;
}

export default function BreathingExercise({ onClose }: BreathingExerciseProps) {
  const { user } = useAuth();
  const saveSession = useSaveBreathingSession();
  
  const [pattern, setPattern] = useState<string>('box');
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const startTimeRef = useRef<number>(0);
  const phaseStartRef = useRef<number>(0);
  const animationRef = useRef<number>();
  
  const currentPattern = PATTERNS[pattern];
  
  const getPhaseConfig = useCallback(() => {
    switch (phase) {
      case 'inhale': return { duration: currentPattern.inhale, label: 'Breathe In', next: 'hold-in' as BreathPhase };
      case 'hold-in': return { duration: currentPattern.holdIn, label: 'Hold', next: 'exhale' as BreathPhase };
      case 'exhale': return { duration: currentPattern.exhale, label: 'Breathe Out', next: 'hold-out' as BreathPhase };
      case 'hold-out': return { duration: currentPattern.holdOut, label: 'Hold', next: 'inhale' as BreathPhase };
    }
  }, [phase, currentPattern]);
  
  const animate = useCallback(() => {
    if (!isRunning) return;
    
    const now = Date.now();
    const elapsed = (now - phaseStartRef.current) / 1000;
    const totalElapsed = (now - startTimeRef.current) / 1000;
    
    const config = getPhaseConfig();
    
    setPhaseTime(elapsed);
    setTotalSeconds(Math.floor(totalElapsed));
    
    if (elapsed >= config.duration) {
      // Skip phases with 0 duration
      let nextPhase = config.next;
      while (PATTERNS[pattern][nextPhase === 'hold-in' ? 'holdIn' : nextPhase === 'hold-out' ? 'holdOut' : nextPhase] === 0) {
        const nextConfig = {
          'inhale': 'hold-in',
          'hold-in': 'exhale', 
          'exhale': 'hold-out',
          'hold-out': 'inhale',
        }[nextPhase] as BreathPhase;
        nextPhase = nextConfig;
        if (nextPhase === 'inhale') break;
      }
      
      if (nextPhase === 'inhale') {
        setCycles(c => c + 1);
      }
      
      setPhase(nextPhase);
      phaseStartRef.current = now;
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isRunning, getPhaseConfig, pattern]);
  
  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, animate]);
  
  const handleStart = () => {
    setIsRunning(true);
    const now = Date.now();
    startTimeRef.current = now;
    phaseStartRef.current = now;
  };
  
  const handlePause = () => {
    setIsRunning(false);
  };
  
  const handleReset = () => {
    setIsRunning(false);
    setPhase('inhale');
    setPhaseTime(0);
    setTotalSeconds(0);
    setCycles(0);
    setIsComplete(false);
  };
  
  const handleComplete = async () => {
    setIsRunning(false);
    
    if (user && totalSeconds > 0) {
      await saveSession.mutateAsync({
        duration_seconds: totalSeconds,
        pattern: pattern,
      });
    }
    
    setIsComplete(true);
  };
  
  const config = getPhaseConfig();
  const progress = config.duration > 0 ? Math.min(phaseTime / config.duration, 1) : 0;
  
  // Calculate circle animation scale
  const getCircleScale = () => {
    if (!isRunning) return 1;
    switch (phase) {
      case 'inhale': return 1 + progress * 0.4;
      case 'hold-in': return 1.4;
      case 'exhale': return 1.4 - progress * 0.4;
      case 'hold-out': return 1;
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center"
      >
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-emerald-500" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Great job!</h2>
            <p className="text-foreground/70">
              {cycles} cycles • {formatTime(totalSeconds)}
            </p>
          </div>
          <Button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-600 text-black">
            Done
          </Button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Wind className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Breathing Exercise</h2>
            <p className="text-xs text-foreground/70">{currentPattern.name}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={onClose} className="text-xs font-bold uppercase tracking-widest">
          Exit
        </Button>
      </div>
      
      {/* Pattern Selection */}
      {!isRunning && totalSeconds === 0 && (
        <div className="p-6 border-b border-border">
          <div className="flex justify-center gap-2">
            {Object.entries(PATTERNS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setPattern(key)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                  pattern === key
                    ? "bg-indigo-500 text-black"
                    : "bg-secondary/10 text-foreground/70 hover:text-foreground"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Breathing Circle */}
        <div className="relative mb-12">
          <motion.div
            animate={{ scale: getCircleScale() }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "w-64 h-64 rounded-full border-4 flex items-center justify-center transition-colors duration-500",
              phase === 'inhale' && "border-indigo-500/50 bg-indigo-500/10",
              phase === 'hold-in' && "border-violet-500/50 bg-violet-500/10",
              phase === 'exhale' && "border-teal-500/50 bg-teal-500/10",
              phase === 'hold-out' && "border-amber-500/50 bg-amber-500/10"
            )}
          >
            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-2xl font-bold text-foreground/90"
                >
                  {config.label}
                </motion.p>
              </AnimatePresence>
              <p className="text-4xl font-bold mt-2 tabular-nums">
                {Math.ceil(config.duration - phaseTime)}
              </p>
            </div>
          </motion.div>
          
          {/* Outer ring progress */}
          <svg className="absolute inset-0 w-64 h-64 -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="124"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${progress * 779} 779`}
              className={cn(
                "transition-colors duration-500",
                phase === 'inhale' && "text-indigo-500",
                phase === 'hold-in' && "text-violet-500",
                phase === 'exhale' && "text-teal-500",
                phase === 'hold-out' && "text-amber-500"
              )}
            />
          </svg>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-8 text-center mb-8">
          <div>
            <p className="text-3xl font-bold tabular-nums">{formatTime(totalSeconds)}</p>
            <p className="text-xs text-foreground/60 uppercase tracking-widest mt-1">Time</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-3xl font-bold tabular-nums">{cycles}</p>
            <p className="text-xs text-foreground/60 uppercase tracking-widest mt-1">Cycles</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              size="lg"
              className="h-16 w-16 rounded-full bg-indigo-500 hover:bg-indigo-600 text-black"
            >
              <Play className="w-6 h-6 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              size="lg"
              className="h-16 w-16 rounded-full bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Pause className="w-6 h-6" />
            </Button>
          )}
          
          {totalSeconds > 0 && !isRunning && (
            <>
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="h-16 w-16 rounded-full"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleComplete}
                size="lg"
                className="h-16 px-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black"
                disabled={saveSession.isPending}
              >
                <Check className="w-5 h-5 mr-2" />
                Complete
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
