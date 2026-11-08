import { TaxRegistrationResponseDto } from '@commerce/tax-registrations/dto/response/tax-registration-response.dto';
import { TaxRegistrationTableResponseDto } from '@commerce/tax-registrations/dto/response/tax-registration-table-response.dto';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

const ID = { name: 'id', description: 'Tax registration ID' };

export function ApiFindForTableTaxRegistrations() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tax registrations table',
      description:
        'Every tax registration held by legal entities in reach, with the country and, unless it is national, the jurisdiction each is issued in.',
    }),
    ApiResponse({ status: 200, type: TaxRegistrationTableResponseDto }),
  );
}

export function ApiListTaxRegistrations() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrations of one legal entity',
      description: 'The origin registrations tax resolution reads from when this entity is the supplier.',
    }),
    ApiResponse({ status: 200, type: [TaxRegistrationResponseDto] }),
  );
}

export function ApiGetTaxRegistration() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a tax registration' }),
    ApiParam(ID),
    ApiResponse({ status: 200, type: TaxRegistrationResponseDto }),
    ApiResponse({ status: 404, description: 'Tax registration not found.' }),
  );
}

export function ApiCreateTaxRegistration() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add a tax registration',
      description:
        'Registers the entity in a country and, optionally, one of its jurisdictions — a GSTIN must name a state; VAT, TIN and other numbers may be national. The jurisdiction must be in the same country. One registration per country and jurisdiction; the number is unique per organization. Marking it primary clears the flag on the others.',
    }),
    ApiResponse({ status: 201, description: 'Registration added.' }),
    ApiResponse({
      status: 400,
      description: 'A GSTIN without a state, or a jurisdiction outside the registration country.',
    }),
    ApiResponse({
      status: 409,
      description: 'The entity is already registered there, or the number is already registered.',
    }),
  );
}

export function ApiUpdateTaxRegistration() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a tax registration',
      description:
        'The resulting country, jurisdiction and type are checked together. `jurisdictionId: null` makes the registration national.',
    }),
    ApiParam(ID),
    ApiResponse({ status: 200, description: 'Registration updated.' }),
    ApiResponse({
      status: 400,
      description: 'A GSTIN without a state, or a jurisdiction outside the registration country.',
    }),
    ApiResponse({
      status: 409,
      description: 'The entity is already registered there, or the number is already registered.',
    }),
  );
}

export function ApiDeleteTaxRegistration() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove a tax registration' }),
    ApiParam(ID),
    ApiResponse({ status: 200, description: 'Registration removed.' }),
  );
}
