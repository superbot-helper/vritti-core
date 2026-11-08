import { PageContent, PageContentDetails, PageContentPanel, PanelSkeleton } from '@vritti/quantum-ui/PageContent';
import { PageHeaderSkeleton } from '@vritti/quantum-ui/PageHeader';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { JurisdictionDetailPanelSkeleton } from './components/JurisdictionDetailPanelSkeleton';

export const TaxJurisdictionsPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageHeaderSkeleton showActions />
    <PageContent>
      <PageContentPanel
        header={
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-40 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        }
        headerClassName="shrink-0"
      >
        <PanelSkeleton />
      </PageContentPanel>

      <PageContentDetails className="flex flex-col">
        <JurisdictionDetailPanelSkeleton />
      </PageContentDetails>
    </PageContent>
  </div>
);
