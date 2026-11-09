// The people documents, as codegen generates them from people.graphql. Each is its own export of the generated
// module, so a bundle keeps only the documents it sends.
export {
  AddPartyAddressDocument as ADD_PARTY_ADDRESS,
  AddPersonCommunicationDocument as ADD_PERSON_COMMUNICATION,
  AddToWishlistDocument as ADD_TO_WISHLIST,
  CreatePersonDocument as CREATE_PERSON,
  PartyAddressesDocument as PARTY_ADDRESSES_QUERY,
  PartyAddressFieldsFragmentDoc as PartyAddressFieldsFragment,
  PartyProfileDocument as PARTY_PROFILE_QUERY,
  PartyProfileFieldsFragmentDoc as PartyProfileFieldsFragment,
  PeopleByCommunicationDocument as PEOPLE_BY_COMMUNICATION_QUERY,
  PersonCommunicationFieldsFragmentDoc as PersonCommunicationFieldsFragment,
  PersonFieldsFragmentDoc as PersonFieldsFragment,
  RemoveFromWishlistDocument as REMOVE_FROM_WISHLIST,
  RemovePartyAddressDocument as REMOVE_PARTY_ADDRESS,
  UpdatePartyAddressDocument as UPDATE_PARTY_ADDRESS,
  UpdatePartyProfileDocument as UPDATE_PARTY_PROFILE,
  WishlistCodesDocument as WISHLIST_CODES_QUERY,
  WishlistDocument as WISHLIST_QUERY,
  WishlistItemFieldsFragmentDoc as WishlistItemFieldsFragment,
} from '../gql/graphql.js';
