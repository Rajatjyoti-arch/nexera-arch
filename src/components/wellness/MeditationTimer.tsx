import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Moon, Play, Pause, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaveMeditationSession } from "@/hooks/useWellness";
import { useAuth } from "@/contexts/AuthContext";

const DURATION_OPTIONS = [
  { label: '3 min', seconds: 3 * 60 },
  { label: '5 min', seconds: 5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '20 min', seconds: 20 * 60 },
];

interface MeditationTimerProps {
  onClose: () => void;
}

export default function MeditationTimer({ onClose }: MeditationTimerProps) {
  const { user } = useAuth();
  const saveSession = useSaveMeditationSession();
  
  const [selectedDuration, setSelectedDuration] = useState(5 * 60);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  
  const handleStart = useCallback(() => {
    setIsRunning(true);
    setHasStarted(true);
    
    if (pausedTimeRef.current > 0) {
      // Resume from paused state
      startTimeRef.current = Date.now() - (selectedDuration - pausedTimeRef.current) * 1000;
    } else {
      startTimeRef.current = Date.now();
    }
    
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, selectedDuration - elapsed);
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setIsComplete(true);
        
        // Auto-save session
        if (user) {
          saveSession.mutate({ duration_seconds: selectedDuration });
        }
      }
    }, 100);
  }, [selectedDuration, user, saveSession]);
  
  const handlePause = () => {
    setIsRunning(false);
    pausedTimeRef.current = timeRemaining;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const handleReset = () => {
    setIsRunning(false);
    setHasStarted(false);
    setTimeRemaining(selectedDuration);
    pausedTimeRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const handleComplete = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const actualDuration = selectedDuration - timeRemaining;
    
    if (user && actualDuration > 0) {
      await saveSession.mutateAsync({ duration_seconds: actualDuration });
    }
    
    setIsComplete(true);
  };
  
  const selectDuration = (seconds: number) => {
    if (!hasStarted) {
      setSelectedDuration(seconds);
      setTimeRemaining(seconds);
    }
  };
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = 1 - (timeRemaining / selectedDuration);
  const circumference = 2 * Math.PI * 140;
  
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
            className="w-24 h-24 mx-auto rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-violet-500" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Meditation Complete</h2>
            <p className="text-foreground/70">
              {formatTime(selectedDuration - timeRemaining)} of mindful practice
            </p>
          </div>
          <Button onClick={onClose} className="bg-violet-500 hover:bg-violet-600 text-black">
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
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Moon className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Meditation Timer</h2>
            <p className="text-xs text-foreground/70">Find your calm</p>
          </div>
        </div>
        <Button variant="ghost" onClick={onClose} className="text-xs font-bold uppercase tracking-widest">
          Exit
        </Button>
      </div>
      
      {/* Duration Selection */}
      {!hasStarted && (
        <div className="p-6 border-b border-border">
          <div className="flex justify-center gap-2 flex-wrap">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.seconds}
                onClick={() => selectDuration(opt.seconds)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                  selectedDuration === opt.seconds
                    ? "bg-violet-500 text-black"
                    : "bg-secondary/10 text-foreground/70 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Timer Circle */}
        <div className="relative mb-12">
          <svg className="w-80 h-80 -rotate-90">
            {/* Background circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-secondary/30"
            />
            {/* Progress circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="text-violet-500 transition-all duration-100"
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl font-bold tabular-nums text-foreground/90">
                {formatTime(timeRemaining)}
              </p>
              <p className="text-xs text-foreground/60 uppercase tracking-widest mt-2">
                {isRunning ? 'Breathe deeply' : hasStarted ? 'Paused' : 'Ready'}
              </p>
            </div>
          </div>
          
          {/* Ambient glow */}
          {isRunning && (
            <motion.div
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-violet-500/10 blur-xl -z-10"
            />
          )}
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              size="lg"
              className="h-16 w-16 rounded-full bg-violet-500 hover:bg-violet-600 text-black"
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
          
          {hasStarted && !isRunning && (
            <>
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="h-16 w-16 rounded-full"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              {timeRemaining < selectedDuration && (
                <Button
                  onClick={handleComplete}
                  size="lg"
                  className="h-16 px-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black"
                  disabled={saveSession.isPending}
                >
                  <Check className="w-5 h-5 mr-2" />
                  End Session
                </Button>
              )}
            </>
          )}
        </div>
        
        {/* Helpful tip */}
        {isRunning && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-sm text-foreground/60 text-center max-w-sm"
          >
            Focus on your breath. Let thoughts pass without judgment.
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
