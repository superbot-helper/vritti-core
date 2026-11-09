import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { UNAVAILABLE_CODE, VapError } from '../errors.js';

// Runs an Apollo operation and rethrows its failures as `VapError`.
export async function run<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw toCoreError(error);
  }
}

function toCoreError(error: unknown): unknown {
  if (CombinedGraphQLErrors.is(error)) {
    const first = error.errors[0];
    const extensions = (first?.extensions ?? {}) as { label?: string; code?: string; status?: number };
    return new VapError(
      first?.message ?? 'Something went wrong.',
      extensions.label ?? extensions.code,
      extensions.status,
    );
  }

  // Core is up but failing, or something between us and it is.
  if (ServerError.is(error) && error.statusCode >= 500) {
    return new VapError('The store is unavailable right now.', undefined, error.statusCode);
  }

  // A transport failure (DNS, TLS, connection refused, the request deadline): core never answered. Said as such, with
  // the original kept as the cause, so a storefront can tell an outage from a refusal
  if (isTransportFailure(error)) {
    const unavailable = new VapError('The store is unavailable right now.', UNAVAILABLE_CODE, undefined);
    unavailable.cause = error;
    return unavailable;
  }
  return error;
}

// Unwraps a response payload that the types allow to be absent.
export function requireData<T>(data: T | null | undefined): T {
  if (data == null) throw new VapError('Something went wrong.', undefined, undefined);
  return data;
}

// A fetch that never got a response: the network failed, or the deadline aborted it
function isTransportFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === 'AbortError' || error.name === 'TimeoutError') return true;
  // undici's "fetch failed" (connection refused, DNS, TLS) and browsers' network TypeError
  return error.name === 'TypeError' && /fetch|network|load failed/i.test(error.message);
}
