// The payments documents, as codegen generates them from payments.graphql. Each is its own export of the generated
// module, so a bundle keeps only the documents it sends.
export {
  CancelPaymentIntentDocument as CANCEL_PAYMENT_INTENT,
  ConfirmPaymentDocument as CONFIRM_PAYMENT,
  CreatePaymentIntentDocument as CREATE_PAYMENT_INTENT,
  PaymentIntentDocument as PAYMENT_INTENT_QUERY,
  PaymentIntentFieldsFragmentDoc as PaymentIntentFieldsFragment,
} from '../gql/graphql.js';
