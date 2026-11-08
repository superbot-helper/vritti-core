import { buildSlug } from '@vritti/quantum-ui/slug';

export type TaxGroupTab = 'overview' | 'rates' | 'classes';

// The tax group detail page's path relative to the tax groups list, opened on one tab
export function taxGroupPath(taxGroup: { id: string; name: string }, tab: TaxGroupTab): string {
  return `${buildSlug(taxGroup.name, taxGroup.id)}/${tab}`;
}
