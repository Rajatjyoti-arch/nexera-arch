import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Play, Pause, RotateCcw, Check, Coffee, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaveFocusSession } from "@/hooks/useWellness";
import { useAuth } from "@/contexts/AuthContext";

type TimerMode = 'focus' | 'break';

const FOCUS_DURATIONS = [
  { label: '25 min', seconds: 25 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
];

const BREAK_DURATIONS = [
  { label: '5 min', seconds: 5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
  { label: '15 min', seconds: 15 * 60 },
];

interface FocusTimerProps {
  onClose: () => void;
}

export default function FocusTimer({ onClose }: FocusTimerProps) {
  const { user } = useAuth();
  const saveSession = useSaveFocusSession();
  
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [taskLabel, setTaskLabel] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const focusTimeAccumulated = useRef(0);
  
  const handleStart = useCallback(() => {
    setIsRunning(true);
    setHasStarted(true);
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer finished
          if (mode === 'focus') {
            focusTimeAccumulated.current += focusDuration;
            setTotalFocusTime(focusTimeAccumulated.current);
            setSessionsCompleted(s => s + 1);
            setMode('break');
            return breakDuration;
          } else {
            setMode('focus');
            return focusDuration;
          }
        }
        
        // Track focus time
        if (mode === 'focus') {
          setTotalFocusTime(focusTimeAccumulated.current + (focusDuration - prev + 1));
        }
        
        return prev - 1;
      });
    }, 1000);
  }, [mode, focusDuration, breakDuration]);
  
  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Accumulate focus time when pausing
    if (mode === 'focus') {
      const elapsed = focusDuration - timeRemaining;
      focusTimeAccumulated.current += elapsed;
    }
  };
  
  const handleReset = () => {
    setIsRunning(false);
    setHasStarted(false);
    setMode('focus');
    setTimeRemaining(focusDuration);
    focusTimeAccumulated.current = 0;
    setTotalFocusTime(0);
    setSessionsCompleted(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const handleSkipBreak = () => {
    setMode('focus');
    setTimeRemaining(focusDuration);
  };
  
  const handleComplete = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Calculate final focus time
    let finalFocusTime = focusTimeAccumulated.current;
    if (mode === 'focus' && isRunning) {
      finalFocusTime += focusDuration - timeRemaining;
    }
    
    if (user && finalFocusTime > 0) {
      await saveSession.mutateAsync({
        focus_duration_seconds: finalFocusTime,
        break_duration_seconds: breakDuration * sessionsCompleted,
        session_count: sessionsCompleted + (mode === 'focus' && timeRemaining < focusDuration ? 1 : 0),
        task_label: taskLabel || undefined,
      });
    }
    
    setIsComplete(true);
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
  
  const currentDuration = mode === 'focus' ? focusDuration : breakDuration;
  const progress = 1 - (timeRemaining / currentDuration);
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
            className="w-24 h-24 mx-auto rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-teal-500" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Focus Session Complete!</h2>
            <p className="text-foreground/70 mb-1">
              {sessionsCompleted} pomodoro{sessionsCompleted !== 1 ? 's' : ''} completed
            </p>
            <p className="text-foreground/70">
              Total focus time: {formatTime(totalFocusTime)}
            </p>
          </div>
          <Button onClick={onClose} className="bg-teal-500 hover:bg-teal-600 text-black">
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
          <div className={cn(
            "w-10 h-10 rounded-xl border flex items-center justify-center transition-colors",
            mode === 'focus' 
              ? "bg-teal-500/20 border-teal-500/30" 
              : "bg-amber-500/20 border-amber-500/30"
          )}>
            {mode === 'focus' ? (
              <Target className="w-5 h-5 text-teal-500" />
            ) : (
              <Coffee className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {mode === 'focus' ? 'Focus Time' : 'Break Time'}
            </h2>
            <p className="text-xs text-foreground/70">
              {sessionsCompleted} pomodoro{sessionsCompleted !== 1 ? 's' : ''} completed
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={onClose} className="text-xs font-bold uppercase tracking-widest">
          Exit
        </Button>
      </div>
      
      {/* Task Label & Duration Selection */}
      {!hasStarted && (
        <div className="p-6 border-b border-border space-y-4">
          <Input
            placeholder="What are you working on? (optional)"
            value={taskLabel}
            onChange={(e) => setTaskLabel(e.target.value)}
            className="bg-secondary/10 border-border"
          />
          <div className="flex justify-center gap-2 flex-wrap">
            <span className="text-xs text-foreground/60 uppercase tracking-widest mr-2 self-center">Focus:</span>
            {FOCUS_DURATIONS.map((opt) => (
              <button
                key={opt.seconds}
                onClick={() => {
                  setFocusDuration(opt.seconds);
                  setTimeRemaining(opt.seconds);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                  focusDuration === opt.seconds
                    ? "bg-teal-500 text-black"
                    : "bg-secondary/10 text-foreground/70 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            <span className="text-xs text-foreground/60 uppercase tracking-widest mr-2 self-center">Break:</span>
            {BREAK_DURATIONS.map((opt) => (
              <button
                key={opt.seconds}
                onClick={() => setBreakDuration(opt.seconds)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                  breakDuration === opt.seconds
                    ? "bg-amber-500 text-black"
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
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-secondary/30"
            />
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
              className={cn(
                "transition-all duration-100",
                mode === 'focus' ? "text-teal-500" : "text-amber-500"
              )}
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl font-bold tabular-nums text-foreground/90">
                {formatTime(timeRemaining)}
              </p>
              <p className="text-xs text-foreground/60 uppercase tracking-widest mt-2">
                {mode === 'focus' 
                  ? (isRunning ? 'Stay focused' : hasStarted ? 'Paused' : 'Ready to focus')
                  : (isRunning ? 'Take a break' : 'Break paused')
                }
              </p>
            </div>
          </div>
          
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
              className={cn(
                "absolute inset-0 rounded-full blur-xl -z-10",
                mode === 'focus' ? "bg-teal-500/10" : "bg-amber-500/10"
              )}
            />
          )}
        </div>
        
        {/* Stats */}
        {hasStarted && (
          <div className="flex items-center gap-8 text-center mb-8">
            <div>
              <p className="text-2xl font-bold tabular-nums">{formatTime(totalFocusTime)}</p>
              <p className="text-xs text-foreground/60 uppercase tracking-widest mt-1">Focus Time</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-bold tabular-nums">{sessionsCompleted}</p>
              <p className="text-xs text-foreground/60 uppercase tracking-widest mt-1">Pomodoros</p>
            </div>
          </div>
        )}
        
        {/* Controls */}
        <div className="flex items-center gap-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              size="lg"
              className={cn(
                "h-16 w-16 rounded-full text-black",
                mode === 'focus' 
                  ? "bg-teal-500 hover:bg-teal-600" 
                  : "bg-amber-500 hover:bg-amber-600"
              )}
            >
              <Play className="w-6 h-6 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              size="lg"
              className="h-16 w-16 rounded-full bg-rose-500 hover:bg-rose-600 text-black"
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
              
              {mode === 'break' && (
                <Button
                  onClick={handleSkipBreak}
                  size="lg"
                  variant="outline"
                  className="h-16 px-6 rounded-full"
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Skip Break
                </Button>
              )}
              
              <Button
                onClick={handleComplete}
                size="lg"
                className="h-16 px-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black"
                disabled={saveSession.isPending}
              >
                <Check className="w-5 h-5 mr-2" />
                End Session
              </Button>
            </>
          )}
        </div>
        
        {/* Task label display */}
        {taskLabel && hasStarted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-sm text-foreground/60 text-center"
          >
            Working on: <span className="text-foreground/80 font-medium">{taskLabel}</span>
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
