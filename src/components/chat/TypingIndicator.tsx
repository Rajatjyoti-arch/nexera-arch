import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  message: string;
  className?: string;
}

export function TypingIndicator({ message, className }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn("flex items-center gap-2 px-4 py-2", className)}
    >
      <div className="flex items-center gap-1">
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          className="w-2 h-2 rounded-full bg-foreground/50"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          className="w-2 h-2 rounded-full bg-foreground/50"
        />
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          className="w-2 h-2 rounded-full bg-foreground/50"
        />
      </div>
      <span className="text-xs text-foreground/60 font-medium">{message}</span>
    </motion.div>
  );
}
