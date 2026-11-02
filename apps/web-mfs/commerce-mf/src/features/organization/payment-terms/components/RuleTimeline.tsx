import { cn } from '@vritti/quantum-ui/cn';
import { useCategoricalColors } from '@vritti/quantum-ui/hooks';
import {
  PAYMENT_TERM_BASELINE_LABELS,
  type PaymentTermBaseline,
  type PaymentTermRuleData,
} from '@/schemas/payment-terms';

interface RuleTimelineProps {
  rules: PaymentTermRuleData[];
  baseline: PaymentTermBaseline;
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
}

function axisScale(lastDueDay: number): { max: number; step: number } {
  if (lastDueDay <= 0) return { max: 30, step: 5 };
  const roundTo = lastDueDay <= 30 ? 10 : lastDueDay <= 90 ? 15 : 30;
  const max = Math.ceil((lastDueDay * 1.08) / roundTo) * roundTo;
  return { max, step: max <= 30 ? 5 : max <= 120 ? 15 : 30 };
}

export const RuleTimeline = ({ rules, baseline, highlightedId, onHighlight }: RuleTimelineProps) => {
  const colors = useCategoricalColors(rules.length);
  const { max, step } = axisScale(Math.max(0, ...rules.map((rule) => rule.dueDays)));
  const position = (days: number) => `${(days / max) * 100}%`;
  const dueDays = new Set(rules.map((rule) => rule.dueDays));
  const ticks = Array.from({ length: Math.floor(max / step) }, (_, i) => (i + 1) * step).filter(
    (day) => !dueDays.has(day),
  );
  const discounts = rules
    .filter((rule) => rule.discountDays != null && rule.discountDays > 0)
    .sort((a, b) => (b.discountDays ?? 0) - (a.discountDays ?? 0));

  return (
    <div className="relative mx-2 mt-6 mb-2 h-32">
      <div className="absolute inset-x-0 top-16 h-0.5 rounded-full bg-border" />
      <div className="absolute top-14 left-0 size-4.5 -translate-x-1/2 rounded-full border-2 border-foreground bg-card" />
      <span className="absolute top-24 left-0 -translate-x-3 whitespace-nowrap font-semibold text-xs">
        {PAYMENT_TERM_BASELINE_LABELS[baseline]}
      </span>

      {ticks.map((day) => (
        <span
          key={day}
          style={{ left: position(day) }}
          className="absolute top-18 -translate-x-1/2 font-mono text-xs text-muted-foreground before:absolute before:-top-2 before:left-1/2 before:h-1.5 before:w-px before:bg-border"
        >
          {day}d
        </span>
      ))}

      {discounts.map((rule) => (
        <div
          key={rule.id}
          style={{ width: position(rule.discountDays ?? 0) }}
          className="absolute top-10 left-0 flex h-4 items-center justify-end overflow-hidden whitespace-nowrap rounded-t-md border border-success/45 border-b-0 bg-success/15 px-1.5 font-semibold text-xs text-success"
        >
          {rule.discountPercent}% off · ≤ {rule.discountDays}d
        </div>
      ))}

      {rules.map((rule, index) => (
        <div
          key={rule.id}
          role="img"
          aria-label={`${rule.percent}% due on day ${rule.dueDays}`}
          style={{ left: position(rule.dueDays) }}
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          onMouseEnter={() => onHighlight(rule.id)}
          onMouseLeave={() => onHighlight(null)}
        >
          <span
            style={{ backgroundColor: colors[index].background, color: colors[index].foreground }}
            className={cn(
              'flex h-6 items-center whitespace-nowrap rounded-full px-2.5 font-semibold text-xs shadow-sm transition-transform',
              highlightedId === rule.id && 'scale-110',
            )}
          >
            {rule.percent}%
          </span>
          <span className="h-8 w-0.5" style={{ backgroundColor: colors[index].background }} />
          <span
            className="size-3.5 rounded-full border-3 border-card ring-1 ring-border"
            style={{ backgroundColor: colors[index].background }}
          />
          <span className="mt-6 whitespace-nowrap font-semibold text-xs">Day {rule.dueDays}</span>
        </div>
      ))}
    </div>
  );
};
