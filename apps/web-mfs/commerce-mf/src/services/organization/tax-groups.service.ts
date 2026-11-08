import axios from '@vritti/quantum-ui/axios';
import type { SelectOptionsResponse } from '@vritti/quantum-ui/Select';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type {
  CreateTaxClassGroupPayload,
  CreateTaxGroupPayload,
  TaxClassGroupData,
  TaxClassGroupsTableResponse,
  TaxClassMappingTableResponse,
  TaxGroupData,
  TaxGroupRateData,
  TaxGroupRatePayload,
  TaxGroupRatesContext,
  TaxGroupRatesTableResponse,
  TaxGroupsTableResponse,
  UpdateTaxClassGroupPayload,
  UpdateTaxGroupPayload,
} from '@/schemas/tax-groups';

const BASE = 'commerce-api/tax-groups';

// Finds the first country, alphabetically, the organization has tax groups in; null when it has none
export function getFirstTaxGroupCountry(): Promise<string | null> {
  return axios
    .get<SelectOptionsResponse>('commerce-api/select-api/tax-groups', {
      params: { valueKey: 'countryCode', orderByKey: 'countryCode', limit: 1 },
    })
    .then((r) => (r.data.options[0] ? String(r.data.options[0].value) : null));
}

// Fetches the current page of tax groups; the country comes from the saved table state
export function getTaxGroupsTable(): Promise<TaxGroupsTableResponse> {
  return axios.get<TaxGroupsTableResponse>(`${BASE}/table`).then((r) => r.data);
}

// Fetches one tax group by ID
export function getTaxGroup(id: string): Promise<TaxGroupData> {
  return axios.get<TaxGroupData>(`${BASE}/${id}`).then((r) => r.data);
}

// Creates a tax group in a country
export function createTaxGroup(data: CreateTaxGroupPayload): Promise<CreateResponse<TaxGroupData>> {
  return axios.post<CreateResponse<TaxGroupData>>(BASE, data).then((r) => r.data);
}

// Updates a tax group by ID; its country stays fixed
export function updateTaxGroup({ id, data }: { id: string; data: UpdateTaxGroupPayload }): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`${BASE}/${id}`, data).then((r) => r.data);
}

// Deletes a tax group no tax class is mapped to
export function deleteTaxGroup(id: string): Promise<SuccessResponse> {
  return axios.delete<SuccessResponse>(`${BASE}/${id}`).then((r) => r.data);
}

// Fetches the current page of a tax group's dated rates, optionally only those charged in a state on a day
export function getTaxGroupRatesTable(
  taxGroupId: string,
  context: TaxGroupRatesContext,
): Promise<TaxGroupRatesTableResponse> {
  return axios
    .get<TaxGroupRatesTableResponse>(`${BASE}/${taxGroupId}/rates/table`, { params: context })
    .then((r) => r.data);
}

// Adds a dated rate to a tax group
export function createTaxGroupRate({
  taxGroupId,
  data,
}: {
  taxGroupId: string;
  data: TaxGroupRatePayload;
}): Promise<CreateResponse<TaxGroupRateData>> {
  return axios.post<CreateResponse<TaxGroupRateData>>(`${BASE}/${taxGroupId}/rates`, data).then((r) => r.data);
}

// Updates one of a tax group's rates
export function updateTaxGroupRate({
  taxGroupId,
  rateId,
  data,
}: {
  taxGroupId: string;
  rateId: string;
  data: TaxGroupRatePayload;
}): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`${BASE}/${taxGroupId}/rates/${rateId}`, data).then((r) => r.data);
}

// Deletes one of a tax group's rates
export function deleteTaxGroupRate({
  taxGroupId,
  rateId,
}: {
  taxGroupId: string;
  rateId: string;
}): Promise<SuccessResponse> {
  return axios.delete<SuccessResponse>(`${BASE}/${taxGroupId}/rates/${rateId}`).then((r) => r.data);
}

// Fetches the current page of the tax classes mapped to a tax group
export function getTaxGroupClassesTable(taxGroupId: string): Promise<TaxClassGroupsTableResponse> {
  return axios.get<TaxClassGroupsTableResponse>(`${BASE}/${taxGroupId}/classes/table`).then((r) => r.data);
}

// Maps a tax class to a tax group in the group's country for a period
export function createTaxClassGroup({
  taxGroupId,
  data,
}: {
  taxGroupId: string;
  data: CreateTaxClassGroupPayload;
}): Promise<CreateResponse<TaxClassGroupData>> {
  return axios.post<CreateResponse<TaxClassGroupData>>(`${BASE}/${taxGroupId}/classes`, data).then((r) => r.data);
}

// Updates a tax class mapping of a tax group
export function updateTaxClassGroup({
  taxGroupId,
  mappingId,
  data,
}: {
  taxGroupId: string;
  mappingId: string;
  data: UpdateTaxClassGroupPayload;
}): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`${BASE}/${taxGroupId}/classes/${mappingId}`, data).then((r) => r.data);
}

// Deletes a tax class mapping of a tax group
export function deleteTaxClassGroup({
  taxGroupId,
  mappingId,
}: {
  taxGroupId: string;
  mappingId: string;
}): Promise<SuccessResponse> {
  return axios.delete<SuccessResponse>(`${BASE}/${taxGroupId}/classes/${mappingId}`).then((r) => r.data);
}

// Fetches every active tax class of the organization with the tax group it maps to today, if any, in the country of
// the saved table state
export function getTaxClassMappingTable(): Promise<TaxClassMappingTableResponse> {
  return axios.get<TaxClassMappingTableResponse>(`${BASE}/class-mapping/table`).then((r) => r.data);
}
