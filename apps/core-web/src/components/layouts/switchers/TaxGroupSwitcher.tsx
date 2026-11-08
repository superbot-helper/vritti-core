import { Button } from '@vritti/quantum-ui/Button';
import { Separator } from '@vritti/quantum-ui/Separator';
import { buildSlug } from '@vritti/quantum-ui/slug';
import { ChevronsUpDown, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TaxGroupSelector } from '@/utils/RemoteSelectors';

interface TaxGroupSwitcherProps {
  // The raw `name~uuid` breadcrumb segment; the id addresses the API, the slug is the fallback label
  segment: string;
  // The tax groups root, e.g. `/org/<id>/tax-groups`
  basePath: string;
}

const idOf = (segment: string) => segment.slice(segment.indexOf('~') + 1);
const labelOf = (segment: string) => segment.slice(0, Math.max(segment.indexOf('~'), 0)) || segment;

export const TaxGroupSwitcher = ({ segment, basePath }: TaxGroupSwitcherProps) => {
  const navigate = useNavigate();
  const current = idOf(segment);

  return (
    <TaxGroupSelector
      value={current}
      // The breadcrumb has no country, so every country's groups are listed with the country beside each
      anyCountry
      // The anchor replaces the trigger but not the surrounding Field, so a label would still render above it
      label={undefined}
      searchPlaceholder="Find tax group..."
      contentClassName="w-72"
      anchor={({ selectedOption }) => (
        <Button
          startAdornment={<Percent className="size-4 text-muted-foreground" />}
          variant="ghost"
          className="h-auto min-w-25 gap-1.5 p-0 text-sm font-normal hover:bg-transparent"
        >
          <span className="flex-1 text-left font-normal text-foreground">
            {selectedOption?.label ?? labelOf(segment)}
          </span>
          <span className="flex size-6 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent">
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </span>
        </Button>
      )}
      footer={
        <>
          <Separator />
          <div className="p-1">
            <Button
              variant="ghost"
              className="h-auto w-full justify-start px-2 py-1.5 text-sm font-normal"
              onClick={() => navigate(basePath)}
            >
              All Tax Groups
            </Button>
          </div>
        </>
      }
      onOptionSelect={(option) => {
        // Skip the on-mount initial-resolve fire (same group) — only navigate on a real switch
        if (option && String(option.value) !== current) {
          // Lands on the group root, which redirects to Overview on its own
          navigate(`${basePath}/${buildSlug(String(option.label), String(option.value))}`);
        }
      }}
    />
  );
};
