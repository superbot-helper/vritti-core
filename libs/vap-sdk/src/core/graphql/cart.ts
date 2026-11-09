// The cart documents, as codegen generates them from cart.graphql. Each is its own export of the generated
// module, so a bundle keeps only the documents it sends.
export {
  AddToCartDocument as ADD_TO_CART,
  CartDocument as CART_QUERY,
  CartFieldsFragmentDoc as CartFieldsFragment,
  CartItemFieldsFragmentDoc as CartItemFieldsFragment,
  CartQuantitiesDocument as CART_QUANTITIES_QUERY,
  ClearCartDocument as CLEAR_CART,
  MoneyFieldsFragmentDoc as MoneyFieldsFragment,
  RemoveFromCartDocument as REMOVE_FROM_CART,
  UpdateCartItemDocument as UPDATE_CART_ITEM,
} from '../gql/graphql.js';
