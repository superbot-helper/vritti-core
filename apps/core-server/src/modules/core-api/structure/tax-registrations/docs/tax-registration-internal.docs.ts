import { TaxRegistrationsPageResponseDto } from '@commerce/tax-registrations/dto/response/tax-registrations-page-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { InternalTablePageDto } from '@/common/dto/request/internal-table-page.dto';

const SIGNATURE_HEADERS = [
  ApiHeader({ name: 'x-timestamp', description: 'Unix seconds when the request was signed', required: true }),
  ApiHeader({
    name: 'x-signature',
    description: 'Ed25519 signature of the canonical request (base64)',
    required: true,
  }),
  ApiHeader({ name: 'x-org-id', description: 'Organization ID scoping the request', required: true }),
];

export function ApiTableByLegalEntityTaxRegistrationsInternal() {
  return applyDecorators(
    ApiOperation({
      summary: 'Legal entity tax registrations table',
      description:
        "Resolves one page of a legal entity's tax registrations from the page request (filters, search, sort, pagination) cloud sends for the view state it holds. The legal entity comes from the path, never from the filters. Requires Ed25519 signature headers (x-timestamp, x-signature).",
    }),
    ...SIGNATURE_HEADERS,
    ApiParam({ name: 'legalEntityId', description: 'Legal entity ID' }),
    ApiBody({ type: InternalTablePageDto }),
    ApiResponse({
      status: 200,
      description: 'Tax registrations page retrieved successfully.',
      type: TaxRegistrationsPageResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid legal entity ID or table query.' }),
    ApiResponse({ status: 401, description: 'Invalid or missing request signature.' }),
  );
}
