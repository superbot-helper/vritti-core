import { ORG_PAYMENT_TERMS } from '@vritti/commerce-permissions/payment-terms';
import { Alert } from '@vritti/quantum-ui/Alert';
import { Button } from '@vritti/quantum-ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vritti/quantum-ui/Card';
import { CurrencyFieldFilter } from '@vritti/quantum-ui/CurrencyField';
import type { CurrencyValue } from '@vritti/quantum-ui/currency';
import { DateFilter } from '@vritti/quantum-ui/DateFilter';
import { Dialog } from '@vritti/quantum-ui/Dialog';
import {
  useCategoricalColors,
  useDialog,
  useFormatters,
  useWorkspaceCurrency,
  useWorkspaceTimeZone,
} from '@vritti/quantum-ui/hooks';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';
import { isoTodayDate } from '@vritti/quantum-ui/timezone';
import { CalendarClock, ListOrdered, Lock, Plus } from 'lucide-react';
import { useState } from 'react';
import { usePaymentSchedule, usePaymentTermRules } from '@/hooks/organization/payment-terms';
import { PAYMENT_TERM_BASELINE_LABELS, PaymentTermBaselineValues, type PaymentTermData } from '@/schemas/payment-terms';
import { getErrorMessage } from '@/utils/error';
import { PaymentTermRuleCard } from '../components/PaymentTermRuleCard';
import { remainingPercent } from '../components/payment-schedule';
import { RuleSharePie } from '../components/RuleSharePie';
import { RuleTimeline } from '../components/RuleTimeline';
import { PaymentTermRuleDialog } from '../forms/PaymentTermRuleDialog';

interface RulesTabProps {
  paymentTerm: PaymentTermData;
}

export const RulesTab = ({ paymentTerm }: RulesTabProps) => (
  <div className="flex flex-col gap-4">
    <PaymentScheduleCard paymentTerm={paymentTerm} />
    <InvoicePreviewCard paymentTerm={paymentTerm} />
  </div>
);

const PaymentScheduleCard = ({ paymentTerm }: RulesTabProps) => {
  const addDialog = useDialog();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const {
    data: { rules, totalPercent },
  } = usePaymentTermRules(paymentTerm.id);
  const isDraft = !paymentTerm.isPublished;
  const lockedTip = 'Unpublish the payment term to change its rules';
  const remaining = remainingPercent(totalPercent);
  const colors = useCategoricalColors(rules.length);

  return (
    <>
      {isDraft && totalPercent !== 100 && (
        <Alert
          variant="warning"
          title={rules.length === 0 ? 'Add rules to publish' : `Rules total ${totalPercent}%`}
          description="A payment term can be published once it has at least one rule and its rules total exactly 100%."
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Payment schedule</CardTitle>
            <CardDescription className="flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              Baseline: {PAYMENT_TERM_BASELINE_LABELS[paymentTerm.baseline]}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <RuleSharePie rules={rules} totalPercent={totalPercent} />
            <Button
              size="sm"
              permission={ORG_PAYMENT_TERMS.rules.add}
              startAdornment={<Plus className="size-4" />}
              onClick={addDialog.open}
              disabled={!isDraft || remaining === 0}
              disabledTip={isDraft ? 'The rules already cover 100% of the invoice' : lockedTip}
            >
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {rules.length > 0 && (
            <RuleTimeline
              rules={rules}
              baseline={paymentTerm.baseline}
              highlightedId={highlightedId}
              onHighlight={setHighlightedId}
            />
          )}
          <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
            {rules.map((rule, index) => (
              <PaymentTermRuleCard
                key={rule.id}
                paymentTermId={paymentTerm.id}
                rule={rule}
                color={colors[index]}
                editable={isDraft}
                remainingPercent={remaining}
                highlighted={highlightedId === rule.id}
                onHighlight={setHighlightedId}
              />
            ))}
            {isDraft && remaining > 0 && (
              <Button
                variant="outline"
                permission={ORG_PAYMENT_TERMS.rules.add}
                onClick={addDialog.open}
                className="h-auto min-h-28 flex-col gap-1 border-dashed text-muted-foreground shadow-none"
              >
                <span className="grid size-7 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <Plus className="size-4" />
                </span>
                <span className="font-medium">Add rule</span>
                <span className="font-normal text-xs">
                  {rules.length === 0 ? 'A single 100% rule is a plain net term' : `${remaining}% still unallocated`}
                </span>
              </Button>
            )}
          </div>
          {!isDraft && (
            <p className="mt-2 flex items-center gap-1.5 text-muted-foreground text-xs">
              <Lock className="size-3.5" />
              {lockedTip}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        handle={addDialog}
        icon={ListOrdered}
        title="Add Rule"
        description="Make part of the invoice due a number of days after the baseline date."
        content={(close) => (
          <PaymentTermRuleDialog
            paymentTermId={paymentTerm.id}
            remainingPercent={remaining}
            onSuccess={close}
            onCancel={close}
          />
        )}
      />
    </>
  );
};

const InvoicePreviewCard = ({ paymentTerm }: RulesTabProps) => {
  const formatters = useFormatters();
  const workspaceCurrency = useWorkspaceCurrency();
  const [amount, setAmount] = useState<CurrencyValue>({ currency: workspaceCurrency ?? 'USD', value: '100000.00' });
  const timeZone = useWorkspaceTimeZone();
  const [documentDate, setDocumentDate] = useState(() => isoTodayDate(timeZone));
  const {
    data: { rules, totalPercent },
  } = usePaymentTermRules(paymentTerm.id);
  const canPreview = rules.length > 0 && totalPercent <= 100;
  const { data: schedule, error } = usePaymentSchedule(
    paymentTerm.id,
    { amount: amount.value, currency: amount.currency, date: documentDate },
    { enabled: canPreview },
  );
  const colors = useCategoricalColors(rules.length);

  if (!canPreview) return null;

  const colorByRule = new Map(rules.map((rule, index) => [rule.id, colors[index].background]));
  const date = (iso: string) => formatters.date(iso).primary;
  const money = formatters.currency;
  const errorMessage = error ? getErrorMessage(error) : undefined;
  const dateLabel =
    paymentTerm.baseline === PaymentTermBaselineValues.GOODS_RECEIPT_DATE ? 'Goods receipt date' : 'Invoice date';

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 border-b">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Try it on an invoice</CardTitle>
          <CardDescription>
            Preview the due dates and amounts this term produces. Nothing is saved.
            {paymentTerm.baseline === PaymentTermBaselineValues.END_OF_MONTH &&
              schedule &&
              ` Baseline: ${date(schedule.baselineDate)}.`}
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CurrencyFieldFilter
            name="amount"
            label="Invoice amount"
            mode="context"
            clearable={false}
            value={{ field: 'amount', operator: 'equals', value: amount }}
            onChange={(condition) => setAmount(condition.value)}
          />
          <DateFilter
            name="date"
            label={dateLabel}
            mode="context"
            clearable={false}
            value={{ field: 'date', operator: 'equals', value: documentDate }}
            onChange={(condition) => setDocumentDate(condition.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
        {!schedule ? (
          !error && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          )
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Instalment</th>
                <th className="px-3 py-2 font-medium">Due date</th>
                <th className="px-3 py-2 text-right font-medium">Amount due</th>
                <th className="px-3 py-2 font-medium">Early-payment discount</th>
              </tr>
            </thead>
            <tbody>
              {schedule.instalments.map((instalment) => (
                <tr key={instalment.ruleId} className="border-b align-top">
                  <td className="px-3 py-2.5">
                    <span
                      className="mr-2 inline-block size-2 rounded-full align-middle"
                      style={{ backgroundColor: colorByRule.get(instalment.ruleId) }}
                    />
                    {instalment.percent}% · Day {instalment.dueDays}
                  </td>
                  <td className="px-3 py-2.5">{date(instalment.dueDate)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{money(instalment.amount).primary}</td>
                  <td className="px-3 py-2.5">
                    {instalment.discount ? (
                      <>
                        Pay {money(instalment.discount.payable).primary} by{' '}
                        <span className="font-medium">{date(instalment.discount.payBy)}</span>
                        <div className="text-success text-xs">Saves {money(instalment.discount.amount).primary}</div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {Number(schedule.unallocated.value) > 0 && (
                <tr className="border-b text-muted-foreground">
                  <td className="px-3 py-2.5">
                    <span className="mr-2 inline-block size-2 rounded-full bg-muted-foreground/40 align-middle" />
                    Unallocated
                  </td>
                  <td className="px-3 py-2.5">No due date</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{money(schedule.unallocated).primary}</td>
                  <td />
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="px-3 py-2.5">Total</td>
                <td />
                <td className="px-3 py-2.5 text-right tabular-nums">{money(schedule.allocated).primary}</td>
                <td className="px-3 py-2.5 text-success">
                  {Number(schedule.maxSavings.value) > 0 &&
                    `Up to ${money(schedule.maxSavings).primary} saved paying early`}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </CardContent>
    </Card>
  );
};
