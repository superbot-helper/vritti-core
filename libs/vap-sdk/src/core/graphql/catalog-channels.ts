// The catalog-channels documents, as codegen generates them from catalog-channels.graphql. Each is its own export of the generated
// module, so a bundle keeps only the documents it sends.
export {
  CatalogCurrenciesDocument as CATALOG_CURRENCIES_QUERY,
  CatalogListingByCodeDocument as CATALOG_LISTING_QUERY_BY_CODE,
  CatalogListingsByCodesDocument as CATALOG_LISTINGS_BY_CODES_QUERY,
  CatalogListingsDocument as CATALOG_LISTINGS_QUERY,
  LeCatalogCurrenciesDocument as LE_CATALOG_CURRENCIES_QUERY,
  LeCatalogListingByCodeDocument as LE_CATALOG_LISTING_QUERY_BY_CODE,
  LeCatalogListingsByCodesDocument as LE_CATALOG_LISTINGS_BY_CODES_QUERY,
  LeCatalogListingsDocument as LE_CATALOG_LISTINGS_QUERY,
  ListingFieldsFragmentDoc as LISTING_FIELDS_FRAGMENT,
  SiteCatalogCurrenciesDocument as SITE_CATALOG_CURRENCIES_QUERY,
  SiteCatalogListingByCodeDocument as SITE_CATALOG_LISTING_QUERY_BY_CODE,
  SiteCatalogListingsByCodesDocument as SITE_CATALOG_LISTINGS_BY_CODES_QUERY,
  SiteCatalogListingsDocument as SITE_CATALOG_LISTINGS_QUERY,
} from '../gql/graphql.js';
