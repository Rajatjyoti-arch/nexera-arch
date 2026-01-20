import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

export function OnlineIndicator({ 
  isOnline, 
  size = 'md', 
  className,
  showLabel = false 
}: OnlineIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "rounded-full shrink-0 transition-colors duration-300",
          sizeClasses[size],
          isOnline 
            ? "bg-green-500 shadow-sm shadow-green-500/50" 
            : "bg-foreground/30"
        )}
      />
      {showLabel && (
        <span className="text-[10px] font-medium text-foreground/60">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}
