import { useWorkspaceTimeZone } from '@vritti/quantum-ui/hooks';
import { pluralize } from '@vritti/quantum-ui/pluralize';
import { isoTodayDate } from '@vritti/quantum-ui/timezone';
import type React from 'react';
import { useMemo, useState } from 'react';
import { SiteFilter } from '@/selectors/site';
import { defaultPriceRange, inCurrency } from '@/utils/supplierPrice';
import type { SupplierItemPricesBinding } from '../bindings';
import { PriceCurrencyFilter } from '../PriceCurrencyFilter';
import { PriceRangePicker } from '../PriceRangePicker';
import { PriceTimelineCard } from '../PriceTimelineCard';
import { type SitePrices, SitePricesChart } from '../SitePricesChart';
import type { UsePricedSiteIds } from '../types';
import { usePriceCurrency } from '../usePriceCurrency';

interface PriceHistoryProps {
  prices: SupplierItemPricesBinding;
  supplierId: string;
  itemId: string;
  // The supplier's default currency, the chart's until prices load
  currencyCode: string;
  // The workspace's own site; absent where the history spans the sites the item is priced at
  siteId?: string;
}

// A supplier item's price history in one currency: one site as a card led by the price in force, several sites as a
// line each on one chart. The chart stays in place — with its own empty state — when there is nothing to draw.
export const PriceHistory: React.FC<PriceHistoryProps> = ({ prices, supplierId, itemId, currencyCode, siteId }) => {
  const today = isoTodayDate(useWorkspaceTimeZone(siteId));
  const [range, setRange] = useState(() => defaultPriceRange(today));
  // The sites picked in the Sites filter (legal entity only); none charts every priced site
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const { data: priceHistory, isLoading } = prices.usePriceHistory(supplierId, itemId, siteIds, range);
  const spansSites = !!prices.sites;

  const sites = useMemo<SitePrices[]>(
    () =>
      (priceHistory?.sites ?? [])
        .map((site) => ({ ...site, siteName: site.siteName ?? site.siteCode ?? site.siteId }))
        .sort((a, b) => a.siteName.localeCompare(b.siteName)),
    [priceHistory],
  );
  const { currencies, currency, setCurrency } = usePriceCurrency(sites);
  // Each site's line in the chosen currency; a site never priced in it drops out
  const shown = useMemo(
    () =>
      sites
        .map((site) => (currency ? inCurrency(site, currency, today) : site))
        .filter((site) => site.windows.length > 0),
    [sites, currency, today],
  );

  const isFirstLoad = isLoading && !priceHistory;

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      {currencies.length > 0 && <PriceCurrencyFilter currencies={currencies} value={currency} onChange={setCurrency} />}
      {prices.sites && (
        <PriceHistorySiteFilter
          usePricedSiteIds={prices.sites.usePricedSiteIds}
          supplierId={supplierId}
          itemId={itemId}
          value={siteIds}
          onChange={setSiteIds}
        />
      )}
      <PriceRangePicker value={range} onChange={setRange} />
    </div>
  );

  if (!spansSites || (!isFirstLoad && shown.length === 1)) {
    return (
      <PriceTimelineCard
        title={spansSites ? shown[0].siteName : 'Price History'}
        site={shown[0]}
        currencyCode={currency ?? currencyCode}
        range={range}
        today={today}
        isLoading={isFirstLoad}
        action={controls}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          {shown.length > 0 && pluralize('site', shown.length, true)}
        </span>
        {controls}
      </div>
      <SitePricesChart
        sites={shown}
        currencyCode={currency ?? currencyCode}
        range={range}
        today={today}
        isLoading={isFirstLoad}
      />
    </div>
  );
};

interface PriceHistorySiteFilterProps {
  usePricedSiteIds: UsePricedSiteIds;
  supplierId: string;
  itemId: string;
  value: string[];
  onChange: (siteIds: string[]) => void;
}

// The sites charted, offering only the ones the item has prices at; hidden until there is more than one to choose from
const PriceHistorySiteFilter: React.FC<PriceHistorySiteFilterProps> = ({
  usePricedSiteIds,
  supplierId,
  itemId,
  value,
  onChange,
}) => {
  const { data: siteIds } = usePricedSiteIds(supplierId, itemId);
  if (!siteIds || siteIds.length < 2) return null;

  return (
    <SiteFilter
      name="sites"
      label="Sites"
      placeholder="All sites"
      mode="context"
      multiple
      siteIds={siteIds}
      value={value}
      onChange={(result) => onChange(Array.isArray(result?.value) ? result.value.map(String) : [])}
    />
  );
};
