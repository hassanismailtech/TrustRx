import { assertCanReportSignal, type ActorContext } from '../domain/access-control.js';
import { assertIdempotencyKey, assertRequestFingerprint, type IdempotencyRequest } from '../domain/idempotency.js';
import type { IntegrityCommitment, SignalReport } from '../contracts/signal.js';
import type { AuditEvent, IdempotentCreateResult, SignalRepository } from '../ports/signal-repository.js';

export interface SignalIngressRequest {
  actor: ActorContext;
  organisationId: string;
  facilityId: string;
  reporterCredentialId: string | null;
  signal: SignalReport;
  integrity: IntegrityCommitment;
  audit: AuditEvent;
  idempotency: IdempotencyRequest;
}

export class SignalIngressService {
  constructor(private readonly repository: SignalRepository) {}

  async accept(request: SignalIngressRequest): Promise<IdempotentCreateResult> {
    assertCanReportSignal(request.actor, request.organisationId, request.facilityId);
    assertIdempotencyKey(request.idempotency.key);
    assertRequestFingerprint(request.idempotency.requestFingerprint);
    if (request.idempotency.organisationId !== request.organisationId) {
      const error = new Error('Idempotency key must belong to the signal organisation');
      error.name = 'IdempotencyTenantMismatchError';
      throw error;
    }
    return this.repository.createIdempotent({
      organisationId: request.organisationId,
      facilityId: request.facilityId,
      reporterCredentialId: request.reporterCredentialId,
      signal: request.signal,
      integrity: request.integrity,
      audit: request.audit,
      idempotency: request.idempotency,
    });
  }
}
