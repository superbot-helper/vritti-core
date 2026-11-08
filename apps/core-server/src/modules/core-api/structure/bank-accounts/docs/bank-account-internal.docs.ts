import { BankAccountDto } from '@domain/bank-account/dto/entity/bank-account.dto';
import { CreateBankAccountDto } from '@domain/bank-account/dto/request/create-bank-account.dto';
import { UpdateBankAccountDto } from '@domain/bank-account/dto/request/update-bank-account.dto';
import { BankAccountsPageResponseDto } from '@domain/bank-account/dto/response/bank-accounts-page-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateResponseDto, SuccessResponseDto } from '@vritti/api-sdk/responses';
import { InternalTablePageDto } from '@/common/dto/request/internal-table-page.dto';

const ID = { name: 'id', description: 'Bank account ID' };

const SIGNATURE_HEADERS = [
  ApiHeader({ name: 'x-timestamp', description: 'Unix seconds when the request was signed', required: true }),
  ApiHeader({
    name: 'x-signature',
    description: 'Ed25519 signature of the canonical request (base64)',
    required: true,
  }),
  ApiHeader({ name: 'x-org-id', description: 'Organization ID scoping the request', required: true }),
];

export function ApiFindForTableByLegalEntityBankAccountsInternal() {
  return applyDecorators(
    ApiOperation({
      summary: 'Legal entity bank accounts table',
      description:
        "Resolves one page of a legal entity's bank accounts from the page request (filters, search, sort, pagination) cloud sends for the view state it holds. The legal entity comes from the path, never from the filters. Requires Ed25519 signature headers (x-timestamp, x-signature).",
    }),
    ...SIGNATURE_HEADERS,
    ApiParam({ name: 'legalEntityId', description: 'Legal entity ID' }),
    ApiBody({ type: InternalTablePageDto }),
    ApiResponse({
      status: 200,
      description: 'Bank accounts page retrieved successfully.',
      type: BankAccountsPageResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid legal entity ID or table query.' }),
    ApiResponse({ status: 401, description: 'Invalid or missing request signature.' }),
  );
}

export function ApiListBankAccountsInternal() {
  return applyDecorators(
    ApiOperation({
      summary: 'List bank accounts of a legal entity',
      description: 'Returns every bank account held by the legal entity, newest first.',
    }),
    ...SIGNATURE_HEADERS,
    ApiParam({ name: 'legalEntityId', description: 'Legal entity ID' }),
    ApiResponse({ status: 200, description: 'Bank accounts retrieved successfully.', type: [BankAccountDto] }),
    ApiResponse({ status: 401, description: 'Invalid or missing request signature.' }),
  );
}

export function ApiCreateBankAccountInternal() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create bank account',
      description:
        'Adds a bank account to a legal entity of the organization. The account number is unique per legal entity and IFSC.',
    }),
    ...SIGNATURE_HEADERS,
    ApiBody({ type: CreateBankAccountDto }),
    ApiResponse({ status: 201, description: 'Bank account created successfully.', type: CreateResponseDto }),
    ApiResponse({ status: 400, description: 'Invalid input data or legal entity outside the organization.' }),
    ApiResponse({ status: 401, description: 'Invalid or missing request signature.' }),
    ApiResponse({ status: 409, description: 'The legal entity already holds this account.' }),
  );
}

export function ApiGetBankAccountInternal() {
  return applyDecorators(
    ApiOperation({ summary: 'Get bank account', description: 'Returns a single bank account by ID.' }),
    ...SIGNATURE_HEADERS,
    ApiParam(ID),
    ApiResponse({ status: 200, description: 'Bank account retrieved successfully.', type: BankAccountDto }),
    ApiResponse({ status: 401, description: 'Invalid or missing request signature.' }),
    ApiResponse({ status: 404, description: 'Bank account not found.' }),
  );
}

export function ApiUpdateBankAccountInternal() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update bank account',
      description: 'Updates the holder, number, IFSC, bank or branch of a bank account.',
    }),
    ...SIGNATURE_HEADERS,
    ApiParam(ID),
    ApiBody({ type: UpdateBankAccountDto }),
    ApiResponse({ status: 200, description: 'Bank account updated successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Invalid or missing request signature.' }),
    ApiResponse({ status: 404, description: 'Bank account not found.' }),
    ApiResponse({ status: 409, description: 'The legal entity already holds this account.' }),
  );
}

export function ApiDeleteBankAccountInternal() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete bank account', description: 'Deletes a bank account.' }),
    ...SIGNATURE_HEADERS,
    ApiParam(ID),
    ApiResponse({ status: 200, description: 'Bank account deleted successfully.', type: SuccessResponseDto }),
    ApiResponse({ status: 401, description: 'Invalid or missing request signature.' }),
    ApiResponse({ status: 404, description: 'Bank account not found.' }),
    ApiResponse({ status: 409, description: 'A payment gateway config or linked account still uses the account.' }),
  );
}
