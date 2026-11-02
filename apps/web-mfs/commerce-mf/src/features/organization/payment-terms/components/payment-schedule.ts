import Decimal from '@vritti/quantum-ui/decimal';

export function remainingPercent(totalPercent: number): number {
  return Decimal.max(0, new Decimal(100).minus(totalPercent)).toDecimalPlaces(2).toNumber();
}
