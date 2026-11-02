import { cn } from '@vritti/quantum-ui/cn';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';

interface ContextFilterSkeletonProps {
  // Widths of the label and value the real filter shows, so the bar keeps its length when it loads
  labelWidth?: string;
  valueWidth?: string;
  // Offsets the pulse, so a row of filters ripples instead of blinking together
  delay?: number;
}

// Placeholder shaped like a `mode="context"` filter anchor — outlined h-9 trigger with an icon, label and value
export const ContextFilterSkeleton = ({
  labelWidth = 'w-10',
  valueWidth = 'w-20',
  delay = 0,
}: ContextFilterSkeletonProps) => {
  const style = { animationDelay: `${delay}ms` };
  return (
    <div
      aria-hidden
      className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-xs"
    >
      <Skeleton className="size-3.5 rounded-full" style={style} />
      <Skeleton className={cn('h-3', labelWidth)} style={style} />
      <Skeleton className={cn('h-3.5', valueWidth)} style={style} />
    </div>
  );
};
