export type IdempotencyStatus = 'reserved' | 'completed' | 'expired';

export interface IdempotencyRecord {
  id: string;
  organisationId: string;
  scope: 'signal_ingress';
  key: string;
  requestFingerprint: string;
  status: IdempotencyStatus;
  signalId: string | null;
  expiresAt: string;
}

export interface IdempotencyRequest {
  id: string;
  organisationId: string;
  scope: 'signal_ingress';
  key: string;
  requestFingerprint: string;
  expiresAt: string;
}

export function assertIdempotencyKey(key: string): void {
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(key)) {
    const error = new Error('Idempotency key must be 16–128 URL-safe characters');
    error.name = 'InvalidIdempotencyKeyError';
    throw error;
  }
}

export function assertRequestFingerprint(fingerprint: string): void {
  if (!/^[a-f0-9]{64}$/i.test(fingerprint)) {
    const error = new Error('Request fingerprint must be a SHA-256 or HMAC-SHA-256 digest');
    error.name = 'InvalidRequestFingerprintError';
    throw error;
  }
}

export function classifyReplay(existing: IdempotencyRecord, fingerprint: string): 'replay' | 'conflict' | 'reserved' {
  assertRequestFingerprint(fingerprint);
  if (existing.status === 'expired') return 'reserved';
  return existing.requestFingerprint === fingerprint ? 'replay' : 'conflict';
}
