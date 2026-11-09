// The checkout documents, as codegen generates them from checkout.graphql. Each is its own export of the generated
// module, so a bundle keeps only the documents it sends.
export {
  ActiveCheckoutDocument as ACTIVE_CHECKOUT,
  CancelCheckoutDocument as CANCEL_CHECKOUT,
  ChangeCheckoutAddressDocument as CHANGE_CHECKOUT_ADDRESS,
  ChangeCheckoutContactDocument as CHANGE_CHECKOUT_CONTACT,
  CheckoutDocument as CHECKOUT_QUERY,
  CheckoutFieldsFragmentDoc as CheckoutFieldsFragment,
  StartCheckoutDocument as START_CHECKOUT,
} from '../gql/graphql.js';
