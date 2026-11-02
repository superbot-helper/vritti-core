import { Button } from '@vritti/quantum-ui/Button';
import { DialogActions } from '@vritti/quantum-ui/Dialog';
import { Form, FormSection } from '@vritti/quantum-ui/Form';
import { Select } from '@vritti/quantum-ui/Select';
import { zodResolver } from '@vritti/quantum-ui/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import {
  type SupplierAtSiteData,
  type UpdateSiteEnrollmentFormData,
  updateSiteEnrollmentSchema,
} from '@/schemas/site-suppliers';
import { PartyCommunicationSelector } from '@/selectors/party-communication';
import { PaymentTermSelector } from '@/selectors/payment-term';
import type { SupplierSiteBinding } from '../bindings';
import type { SupplierSiteRef } from '../types';

interface EnrollAtSiteDialogProps {
  binding: SupplierSiteBinding;
  supplierRef: SupplierSiteRef;
  supplier: SupplierAtSiteData;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EnrollAtSiteDialog: React.FC<EnrollAtSiteDialogProps> = ({
  binding,
  supplierRef,
  supplier,
  onSuccess,
  onCancel,
}) => {
  const form = useForm<UpdateSiteEnrollmentFormData>({
    resolver: zodResolver(updateSiteEnrollmentSchema),
    defaultValues: {
      paymentTermId: supplier.defaultPaymentTermId,
    },
  });

  const enrollMutation = binding.useEnroll(supplierRef, { onSuccess });

  return (
    <Form
      form={form}
      mutation={enrollMutation}
      resetOnSuccess
      onCancel={onCancel}
      transformSubmit={(data) => ({
        paymentTermId: data.paymentTermId,
        partyTaxRegistrationId: data.partyTaxRegistrationId,
        partyBankAccountId: data.partyBankAccountId || null,
        orderRelationshipId: data.orderRelationshipId || null,
        orderEmailCommunicationId: data.orderEmailCommunicationId,
        orderPhoneCommunicationId: data.orderPhoneCommunicationId,
      })}
    >
      <FormSection title="Enrollment" contentClassName="block">
        <div className="flex flex-col gap-4">
          <PaymentTermSelector name="paymentTermId" />
          <Select
            name="partyTaxRegistrationId"
            label="Tax Registration"
            placeholder="Select the registration this site is billed under"
            searchable
            optionsEndpoint="commerce-api/select-api/party-tax-registrations"
            params={{ partyId: supplier.partyId }}
          />
          <Select
            name="partyBankAccountId"
            label="Bank Account"
            placeholder="Select a bank account"
            searchable
            optionsEndpoint="commerce-api/select-api/party-bank-accounts"
            params={{ partyId: supplier.partyId }}
          />
          <Select
            name="orderRelationshipId"
            label="Order Contact"
            placeholder="Select an order contact"
            searchable
            optionsEndpoint="commerce-api/select-api/party-contacts"
            params={{ partyId: supplier.partyId, function: 'ORDER' }}
          />
          <PartyCommunicationSelector name="orderEmailCommunicationId" partyId={supplier.partyId} channel="EMAIL" />
          <PartyCommunicationSelector name="orderPhoneCommunicationId" partyId={supplier.partyId} channel="PHONE" />
        </div>
      </FormSection>
      <DialogActions>
        <Button type="button" variant="outline" data-cancel>
          Cancel
        </Button>
        <Button type="submit" loadingText="Enrolling...">
          Enroll Supplier
        </Button>
      </DialogActions>
    </Form>
  );
};
