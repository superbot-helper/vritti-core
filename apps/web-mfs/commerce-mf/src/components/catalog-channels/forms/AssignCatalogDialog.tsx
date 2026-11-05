import type { UseMutationResult } from '@tanstack/react-query';
import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form } from '@vritti/quantum-ui/Form';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type { AxiosError } from 'axios';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { type AssignCatalogFormData, assignCatalogSchema } from '@/schemas/catalog-channels';
import { CatalogSelector } from '@/selectors/catalog';

interface AssignCatalogDialogProps<TData, TVariables> {
  excludeCatalogIds?: (string | null | undefined)[];
  mutation: UseMutationResult<TData, AxiosError, TVariables>;
  transformSubmit: (data: AssignCatalogFormData) => TVariables;
  submitLabel: string;
  onCancel: () => void;
}

export const AssignCatalogDialog = <TData, TVariables>({
  excludeCatalogIds,
  mutation,
  transformSubmit,
  submitLabel,
  onCancel,
}: AssignCatalogDialogProps<TData, TVariables>): React.ReactElement => {
  const form = useForm<AssignCatalogFormData>({
    resolver: zodResolver(assignCatalogSchema),
  });

  // The endpoint takes one comma-separated list, not repeated params
  const excludeIds = (excludeCatalogIds ?? []).filter(Boolean).join(',');

  return (
    <Form form={form} mutation={mutation} transformSubmit={transformSubmit} resetOnSuccess onCancel={onCancel}>
      <CatalogSelector name="catalogId" params={excludeIds ? { excludeIds } : undefined} />
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Saving...">
          {submitLabel}
        </Button>
      </DialogActions>
    </Form>
  );
};
