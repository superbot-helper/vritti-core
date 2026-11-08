import type { FilterCondition } from '@vritti/quantum-ui/types/table-filter';

// Returns the single value picked for a field in a table's context bar, undefined when nothing is picked
export function contextValue(context: FilterCondition[], field: string): string | undefined {
  const value = context.find((condition) => condition.field === field)?.value;
  return typeof value === 'string' ? value : undefined;
}
