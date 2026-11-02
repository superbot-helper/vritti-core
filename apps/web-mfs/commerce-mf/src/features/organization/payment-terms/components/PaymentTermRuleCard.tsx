import { ORG_PAYMENT_TERMS } from '@vritti/commerce-permissions/payment-terms';
import { Button } from '@vritti/quantum-ui/Button';
import { cn } from '@vritti/quantum-ui/cn';
import type { CategoricalColor } from '@vritti/quantum-ui/colors';
import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
import { useConfirm } from '@vritti/quantum-ui/hooks';
import { CircleMinus, MoreVertical, Pencil, Tag, Trash2 } from 'lucide-react';
import { useCallback } from 'react';
import { useDeletePaymentTermRule } from '@/hooks/organization/payment-terms';
import type { PaymentTermRuleData } from '@/schemas/payment-terms';
import { PaymentTermRuleDialog } from '../forms/PaymentTermRuleDialog';

interface PaymentTermRuleCardProps {
  paymentTermId: string;
  rule: PaymentTermRuleData;
  color: CategoricalColor;
  editable: boolean;
  remainingPercent: number;
  highlighted: boolean;
  onHighlight: (id: string | null) => void;
}

export const PaymentTermRuleCard = ({
  paymentTermId,
  rule,
  color,
  editable,
  remainingPercent,
  highlighted,
  onHighlight,
}: PaymentTermRuleCardProps) => {
  const confirm = useConfirm();
  const deleteMutation = useDeletePaymentTermRule();

  const handleDelete = useCallback(async () => {
    const ok = await confirm({
      title: 'Delete this rule?',
      description: `Removes the ${rule.percent}% due after ${rule.dueDays} days.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (ok) deleteMutation.mutate({ paymentTermId, ruleId: rule.id });
  }, [confirm, deleteMutation, paymentTermId, rule]);

  return (
    <article
      aria-label={`${rule.percent}% due on day ${rule.dueDays}`}
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card py-3.5 pr-3.5 pl-4.5 transition-shadow',
        highlighted && 'shadow-md',
      )}
      onMouseEnter={() => onHighlight(rule.id)}
      onMouseLeave={() => onHighlight(null)}
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color.background }} />
      <div className="flex min-h-6 items-start justify-between">
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Day {rule.dueDays}</span>
        {editable && (
          <DropdownMenu
            trigger={{
              children: (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="-mt-1.5 -mr-1.5 text-muted-foreground"
                  aria-label="Rule actions"
                >
                  <MoreVertical className="size-4" />
                </Button>
              ),
            }}
            items={[
              {
                type: 'dialog',
                id: 'edit',
                icon: Pencil,
                label: 'Edit',
                permission: ORG_PAYMENT_TERMS.rules.edit,
                dialog: {
                  title: 'Edit Rule',
                  description: 'Change how much of the invoice falls due and when.',
                  content: (close) => (
                    <PaymentTermRuleDialog
                      paymentTermId={paymentTermId}
                      rule={rule}
                      remainingPercent={remainingPercent}
                      onSuccess={close}
                      onCancel={close}
                    />
                  ),
                },
              },
              {
                type: 'item',
                id: 'delete',
                icon: Trash2,
                label: 'Delete',
                variant: 'destructive',
                permission: ORG_PAYMENT_TERMS.rules.delete,
                disabled: deleteMutation.isPending,
                onClick: handleDelete,
              },
            ]}
          />
        )}
      </div>
      <p className="mt-0.5 mb-1.5 font-semibold text-2xl">
        {rule.percent}%<span className="ml-1 font-normal text-muted-foreground text-sm">of invoice</span>
      </p>
      {rule.discountPercent != null ? (
        <p className="flex items-center gap-1.5 font-medium text-sm text-success">
          <Tag className="size-4" />
          {rule.discountPercent}% off if paid within {rule.discountDays} days
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <CircleMinus className="size-4" />
          No early-payment discount
        </p>
      )}
    </article>
  );
};
