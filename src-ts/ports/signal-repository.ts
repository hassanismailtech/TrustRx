import type { IntegrityCommitment, SignalReport, SignalState } from '../contracts/signal.js';
import type { IdempotencyRequest } from '../domain/idempotency.js';

export interface AuditEvent {
  id: string;
  signalId: string;
  actorRef: string | null;
  action: 'signal.received' | 'signal.state_transition';
  fromState: SignalState | null;
  toState: SignalState | null;
  rationale: string | null;
  occurredAt: string;
}

export interface CreateSignalRecord {
  organisationId: string;
  facilityId: string;
  reporterCredentialId: string | null;
  signal: SignalReport;
  integrity: IntegrityCommitment;
  audit: AuditEvent;
}

export interface IdempotentSignalCreate extends CreateSignalRecord {
  idempotency: IdempotencyRequest;
}

export type IdempotentCreateResult =
  | { kind: 'accepted'; signalId: string }
  | { kind: 'replay'; signalId: string | null }
  | { kind: 'conflict' };

/**
 * The typed persistence boundary for the regulated core. Implementations must
 * provide tenant isolation, transactions and immutable audit storage.
 */
export interface SignalRepository {
  create(input: CreateSignalRecord): Promise<void>;
  createIdempotent(input: IdempotentSignalCreate): Promise<IdempotentCreateResult>;
  findById(organisationId: string, signalId: string): Promise<SignalReport | null>;
  transitionState(input: {
    organisationId: string;
    signalId: string;
    expectedState: SignalState;
    nextState: SignalState;
    audit: AuditEvent;
  }): Promise<SignalReport>;
  listAuditEvents(organisationId: string, signalId: string): Promise<readonly AuditEvent[]>;
}
