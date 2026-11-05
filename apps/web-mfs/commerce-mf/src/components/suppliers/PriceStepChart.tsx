import { useFormatters } from '@vritti/quantum-ui/hooks';
import { LineChart, type LineChartEmptyState } from '@vritti/quantum-ui/LineChart';
import type React from 'react';
import { dayEpoch, NO_PRICES_IN_RANGE, type PricePoint, type PriceRange, priceDomain } from '@/utils/supplierPrice';

interface PriceStepChartProps {
  points: PricePoint[];
  currencyCode: string;
  // The window the chart shows; with no price in it, its dates still frame the empty chart
  range: PriceRange;
  today: string;
  className?: string;
  isLoading?: boolean;
  // What the chart says inside its frame when there is no price to draw
  emptyState?: LineChartEmptyState;
}

const CHART_CONFIG = { unitPrice: { label: 'Unit price', color: 'var(--chart-1)' } };

// One price series as a step line over a time axis — a price holds until the next one takes effect
export const PriceStepChart: React.FC<PriceStepChartProps> = ({
  points,
  currencyCode,
  range,
  today,
  className,
  isLoading = false,
  emptyState = NO_PRICES_IN_RANGE,
}) => {
  const fmt = useFormatters();
  const todayInRange = range.from <= today && today <= range.to;
  return (
    <LineChart
      data={points as unknown as Record<string, unknown>[]}
      config={CHART_CONFIG}
      xAxisKey="at"
      xAxisType="time"
      lines={[{ dataKey: 'unitPrice', type: 'stepAfter', dot: true }]}
      showLegend={false}
      yDomain={priceDomain(points.map((point) => point.unitPrice))}
      markers={todayInRange ? [{ x: dayEpoch(today), label: 'Today' }] : []}
      xDomain={[dayEpoch(range.from), dayEpoch(range.to)]}
      isLoading={isLoading}
      emptyState={emptyState}
      className={className}
      valueFormatter={(value) => String(fmt.currency({ currency: currencyCode, value: String(value) }).primary)}
      xAxisFormatter={(value) => String(fmt.date(new Date(Number(value)).toISOString().slice(0, 10)).primary)}
    />
  );
};
