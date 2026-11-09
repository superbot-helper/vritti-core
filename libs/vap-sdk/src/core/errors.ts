export class VapError extends Error {
  constructor(
    message: string,
    readonly code: string | undefined,
    readonly status: number | undefined,
  ) {
    super(message);
    this.name = 'VapError';
  }

  // Core could not be reached or failed on its side (a network failure, a timeout, a 5xx) — as opposed to core refusing
  // this request. A storefront degrades the part that needed core rather than failing the page
  get unavailable(): boolean {
    return this.code === UNAVAILABLE_CODE || (this.status !== undefined && this.status >= 500);
  }
}

// The code a VapError carries when core could not be reached at all
export const UNAVAILABLE_CODE = 'Unavailable';

export class PartyRollbackError extends Error {
  constructor(
    readonly localId: string | number,
    readonly cause: unknown,
    readonly rollbackError: unknown,
  ) {
    super(
      `Registration failed and the local record ${localId} could not be rolled back — ` +
        'it now exists without a commerce party.',
    );
    this.name = 'PartyRollbackError';
  }
}
