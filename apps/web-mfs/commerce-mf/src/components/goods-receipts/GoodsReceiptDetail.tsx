import { Button } from '@vritti/quantum-ui/Button';
import { DangerZone } from '@vritti/quantum-ui/DangerZone';
import { useConfirm, useSlugParams } from '@vritti/quantum-ui/hooks';
import { PageHeader } from '@vritti/quantum-ui/PageHeader';
import { Tabs } from '@vritti/quantum-ui/Tabs';
import { CheckCircle } from 'lucide-react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoodsReceiptStatus } from '@/schemas/goods-receipts';
import type { GoodsReceiptsBinding } from './bindings';
import { GoodsReceiptStatusBadge } from './GoodsReceiptStatusBadge';
import { BreakdownTab } from './tabs/BreakdownTab';
import { ItemsCostTab } from './tabs/ItemsCostTab';
import { OverviewTab } from './tabs/OverviewTab';

interface GoodsReceiptDetailProps {
  binding: GoodsReceiptsBinding;
}

// `…/goods-receipts/<number~id>` — a receipt of a purchase order's goods: what was counted per line, where it was put
// away and its provisional cost; a draft is counted, published or deleted
export const GoodsReceiptDetail: React.FC<GoodsReceiptDetailProps> = ({ binding }) => {
  const { permissions } = binding;
  const { id } = useSlugParams('grSlug');
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { data: receipt } = binding.useGoodsReceipt(id);
  const publishMutation = binding.usePublish(receipt.id);
  const deleteMutation = binding.useDelete();
  const isDraft = receipt.status === GoodsReceiptStatus.DRAFT;

  // Confirms and publishes the receipt into stock
  const handlePublish = async () => {
    const confirmed = await confirm({
      title: `Publish ${receipt.grNumber}?`,
      description: `The goods land in stock at their locations and ${receipt.po.poNumber}'s received quantities move. The receipt can no longer be edited.`,
      confirmLabel: 'Publish',
    });
    if (confirmed) publishMutation.mutate();
  };

  // Confirms and deletes the draft, returning to the list
  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `Delete ${receipt.grNumber}?`,
      description: `${receipt.grNumber} and all its items, lots, lines and serials will be permanently removed.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) deleteMutation.mutate(receipt.id, { onSuccess: () => navigate('..') });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={receipt.grNumber}
        titleSlot={<GoodsReceiptStatusBadge status={receipt.status} />}
        description={receipt.siteName ? `${receipt.supplierName} · ${receipt.siteName}` : receipt.supplierName}
        actions={
          isDraft && (
            <Button
              size="sm"
              permission={permissions.publish}
              startAdornment={<CheckCircle className="size-4" />}
              onClick={handlePublish}
              isLoading={publishMutation.isPending}
              disabled={!receipt.isPublishable}
              disabledTip="Count at least one item and distribute every item's accepted quantity to lines before publishing."
            >
              Publish
            </Button>
          )
        }
      />

      <Tabs
        tabs={[
          {
            value: 'overview',
            label: 'Overview',
            permission: permissions.view,
            content: <OverviewTab binding={binding} receipt={receipt} />,
          },
          {
            value: 'breakdown',
            label: `Breakdown (${receipt.itemCount})`,
            permission: permissions.view,
            content: <BreakdownTab binding={binding} receipt={receipt} isDraft={isDraft} />,
          },
          {
            value: 'items-cost',
            label: 'Items Cost',
            permission: permissions.view,
            content: <ItemsCostTab binding={binding} goodsReceiptId={receipt.id} isDraft={isDraft} />,
          },
        ]}
        defaultValue="overview"
      />

      {isDraft && (
        <DangerZone
          title="Delete this draft"
          description="This action cannot be undone. The draft receipt and all its items, lots, lines, and serials will be permanently removed."
          buttonText="Delete Draft"
          permission={permissions.delete}
          onClick={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};
