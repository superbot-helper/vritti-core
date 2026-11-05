import axios from '@vritti/quantum-ui/axios';
import type { CreateResponse, SuccessResponse } from '@vritti/quantum-ui/types/api-response';
import type {
  CreateSupplierEnrollmentPayload,
  SetSupplierEnrollmentActiveVars,
  SupplierEnrollment,
  SupplierEnrollmentDetail,
  SupplierEnrollmentKey,
  SupplierEnrollmentsTableResponse,
  UpdateSupplierEnrollmentVars,
} from '@/schemas/supplier-enrollments';
import type { SupplierSiteItemDataTableResponse } from '@/schemas/suppliers';

function base(supplierId: string): string {
  return `commerce-api/le/suppliers/${supplierId}/enrollments`;
}

// Fetches every site of the legal entity with the supplier's enrollment there
export function getSupplierEnrollmentsTable(supplierId: string): Promise<SupplierEnrollmentsTableResponse> {
  return axios.get<SupplierEnrollmentsTableResponse>(`${base(supplierId)}/table`).then((r) => r.data);
}

// Fetches the supplier as one of the legal entity's sites sees it, enrolled there or not
export function getSupplierEnrollment({
  supplierId,
  siteId,
}: SupplierEnrollmentKey): Promise<SupplierEnrollmentDetail> {
  return axios.get<SupplierEnrollmentDetail>(`${base(supplierId)}/${siteId}`).then((r) => r.data);
}

// Enrolls the supplier at one of the legal entity's sites
export function createSupplierEnrollment({
  supplierId,
  ...data
}: CreateSupplierEnrollmentPayload): Promise<SupplierEnrollment> {
  return axios.post<CreateResponse<SupplierEnrollment>>(base(supplierId), data).then((r) => r.data.data);
}

// Updates the supplier's enrollment at a site
export function updateSupplierEnrollment({
  supplierId,
  siteId,
  data,
}: UpdateSupplierEnrollmentVars): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`${base(supplierId)}/${siteId}`, data).then((r) => r.data);
}

// Activates or deactivates the supplier's enrollment at a site
export function setSupplierEnrollmentActive({
  supplierId,
  siteId,
  isActive,
}: SetSupplierEnrollmentActiveVars): Promise<SuccessResponse> {
  return axios.patch<SuccessResponse>(`${base(supplierId)}/${siteId}/active`, { isActive }).then((r) => r.data);
}

// Removes the supplier's enrollment at a site
export function deleteSupplierEnrollment({ supplierId, siteId }: SupplierEnrollmentKey): Promise<SuccessResponse> {
  return axios.delete<SuccessResponse>(`${base(supplierId)}/${siteId}`).then((r) => r.data);
}

// Fetches the supplier's items carried by the enrollment's site
export function getSupplierEnrollmentSiteItemsTable({
  supplierId,
  siteId,
}: SupplierEnrollmentKey): Promise<SupplierSiteItemDataTableResponse> {
  return axios
    .get<SupplierSiteItemDataTableResponse>(`${base(supplierId)}/${siteId}/site-items/table`)
    .then((r) => r.data);
}
