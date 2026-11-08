import { Empty } from '@vritti/quantum-ui/Empty';
import { PageContentPanel } from '@vritti/quantum-ui/PageContent';
import { SearchBar } from '@vritti/quantum-ui/SearchBar';
import { ISOCountryFilter } from '@vritti/quantum-ui/selects/iso-country';
import { TreeView } from '@vritti/quantum-ui/TreeView';
import { Map as MapIcon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useTaxJurisdictionTree } from '@/hooks/organization/tax-jurisdictions';
import { JurisdictionRow } from './JurisdictionRow';

interface JurisdictionTreePanelProps {
  country: string | undefined;
  onCountryChange: (country: string | undefined) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const JurisdictionTreePanel: React.FC<JurisdictionTreePanelProps> = ({
  country,
  onCountryChange,
  selectedId,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: treeData = [], isLoading } = useTaxJurisdictionTree({ search: searchQuery || undefined, country });

  return (
    <PageContentPanel
      header={
        <div className="flex flex-col gap-2">
          <ISOCountryFilter
            mode="context"
            placeholder="All countries"
            value={country}
            onChange={(result) => onCountryChange(result ? String(result.value) : undefined)}
          />
          <SearchBar placeholder="Search jurisdictions..." onDebouncedChange={setSearchQuery} debounceMs={250} />
        </div>
      }
      headerClassName="shrink-0"
      isLoading={isLoading}
      isEmpty={treeData.length === 0}
      emptyState={
        <Empty
          icon={<MapIcon />}
          title={searchQuery ? 'No results' : 'No jurisdictions'}
          description={searchQuery ? 'Try a different search term' : 'Add a state to get started'}
        />
      }
    >
      <TreeView
        data={treeData}
        isLoading={isLoading}
        selectedItemId={selectedId}
        onSelectChange={(item) => onSelect(item?.id ?? null)}
        renderItem={(params) => <JurisdictionRow {...params} />}
        defaultNodeIcon={MapIcon}
        defaultLeafIcon={MapIcon}
      />
    </PageContentPanel>
  );
};
