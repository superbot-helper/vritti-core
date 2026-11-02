import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { useId } from 'react';

// Ghost price histories in a 100×40 viewBox — step lines like PriceSeriesChart draws, alternate ones dashed as there
const GHOST_LINES = [
  { d: 'M0 26 H16 V22 H38 V23 H61 V17 H79 V19 H100', dashed: false },
  { d: 'M0 32 H24 V30 H49 V31 H72 V26 H100', dashed: true },
  { d: 'M0 13 H20 V15 H44 V10 H67 V12 H100', dashed: false },
];
const GRID_Y = [4, 14, 24, 34];
const X_TICKS = 5;
const LEGEND_NAME_WIDTHS = ['w-28', 'w-36', 'w-24'];
// Where the "Today" marker usually falls in the default window, which ends a little after today
const TODAY_X = 78;

interface PriceChartSkeletonProps {
  // How many lines (and legend entries) to sketch, 1–3
  lines?: number;
}

// Placeholder for a price chart card: faint step lines over the grid with a light that runs along them, the axes, and
// the legend beneath — the real chart lands in the same places
export const PriceChartSkeleton = ({ lines = 3 }: PriceChartSkeletonProps) => {
  const id = useId();
  const maskId = `${id}-lines`;
  const glowId = `${id}-glow`;
  const ghosts = GHOST_LINES.slice(0, Math.min(Math.max(lines, 1), GHOST_LINES.length));

  return (
    <div aria-hidden className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <div className="flex min-h-80 gap-3">
        <div className="flex flex-col justify-between py-1">
          {GRID_Y.map((y, index) => (
            <Skeleton key={y} className="h-3 w-12" style={{ animationDelay: `${index * 80}ms` }} />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="w-full flex-1 text-muted-foreground"
            role="presentation"
          >
            <defs>
              <linearGradient id={glowId} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="currentColor" stopOpacity="0" />
                <stop offset="0.5" stopColor="currentColor" stopOpacity="0.9" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
              <mask id={maskId}>
                {ghosts.map((line) => (
                  <path
                    key={line.d}
                    d={line.d}
                    fill="none"
                    stroke="white"
                    strokeWidth={4}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </mask>
            </defs>

            {GRID_Y.map((y) => (
              <line
                key={y}
                x1={0}
                x2={100}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.12}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <line
              x1={TODAY_X}
              x2={TODAY_X}
              y1={0}
              y2={40}
              stroke="currentColor"
              strokeOpacity={0.25}
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />

            {ghosts.map((line, index) => (
              <path
                key={line.d}
                d={line.d}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.3}
                strokeWidth={2}
                strokeDasharray={line.dashed ? '6 4' : undefined}
                vectorEffect="non-scaling-stroke"
                className="motion-safe:animate-pulse"
                style={{ animationDelay: `${index * 200}ms` }}
              />
            ))}

            {/* The light only shows where the mask has a line, so it travels along the prices rather than the card */}
            <g mask={`url(#${maskId})`} className="motion-reduce:hidden">
              <rect x={-30} y={0} width={30} height={40} fill={`url(#${glowId})`} opacity={0.55}>
                <animate attributeName="x" from="-30" to="100" dur="1.8s" repeatCount="indefinite" />
              </rect>
            </g>
          </svg>
          <div className="flex justify-between">
            {Array.from({ length: X_TICKS }, (_, index) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton ticks
                key={index}
                className="h-3 w-14"
                style={{ animationDelay: `${index * 80}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-x-8 gap-y-3 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-3">
        {LEGEND_NAME_WIDTHS.slice(0, ghosts.length).map((width, index) => {
          const style = { animationDelay: `${index * 150}ms` };
          return (
            <li key={width} className="flex items-start gap-3">
              <Skeleton className="mt-1.5 size-2.5 shrink-0 rounded-full" style={style} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className={`h-4 ${width}`} style={style} />
                  <Skeleton className="h-4 w-16" style={style} />
                </div>
                <Skeleton className="h-4 w-20 rounded-full" style={style} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
