import type { IntegrityCommitment, SignalReport, SignalState } from '../contracts/signal.js';

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

/**
 * The typed persistence boundary for the regulated core. Implementations must
 * provide tenant isolation, transactions and immutable audit storage.
 */
export interface SignalRepository {
  create(signal: SignalReport, integrity: IntegrityCommitment, audit: AuditEvent): Promise<void>;
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
