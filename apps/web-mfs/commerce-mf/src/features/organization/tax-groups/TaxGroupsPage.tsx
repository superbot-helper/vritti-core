import { ORG_TAX_GROUPS } from '@vritti/commerce-permissions/tax-groups';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { useFirstTaxGroupCountry } from '@/hooks/organization/tax-groups';
import { DEFAULT_TAX_COUNTRY } from '@/schemas/tax-groups';
import { ClassMappingTab } from './tabs/ClassMappingTab';
import { GroupsTab } from './tabs/GroupsTab';

export const TaxGroupsPage = () => {
  const { data: firstCountry, isLoading: isCountryLoading } = useFirstTaxGroupCountry();
  // Each tab opens on the first country with tax groups, India when there are none, until a country is picked
  const defaultCountry = isCountryLoading ? undefined : (firstCountry ?? DEFAULT_TAX_COUNTRY);
  const countryProps = { defaultCountry, isCountryLoading };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tax Groups"
        description="The rates each country charges, with their dated rates per state, and which tax group each tax class falls in."
      />

      <Tabs
        tabs={[
          {
            value: 'groups',
            label: 'Groups',
            permission: ORG_TAX_GROUPS.view,
            content: <GroupsTab {...countryProps} />,
          },
          {
            value: 'class-mapping',
            label: 'Class Mapping',
            permission: ORG_TAX_GROUPS.classes.view,
            content: <ClassMappingTab {...countryProps} />,
          },
        ]}
      />
    </div>
  );
};
