import type { NormalizedPayment } from './gateway-transport';

// The payment that decides an order, out of every attempt the gateway lists for it: a captured one if any, else one
// authorized and awaiting capture, else the latest attempt. Null when the gateway lists none
export function pickOrderPayment(attempts: { payment: NormalizedPayment; at: number }[]): NormalizedPayment | null {
  const captured = attempts.find((attempt) => attempt.payment.status === 'captured');
  if (captured) return captured.payment;
  const authorized = attempts.find((attempt) => attempt.payment.status === 'authorized');
  if (authorized) return authorized.payment;
  const latest = [...attempts].sort((a, b) => b.at - a.at)[0];
  return latest?.payment ?? null;
}
