export type OutboxEventType = 'integrity_anchor' | 'outbound_receipt' | 'official_handoff';
export type OutboxState = 'pending' | 'processing' | 'completed' | 'failed' | 'abandoned';

const TRANSITIONS: Record<OutboxState, readonly OutboxState[]> = {
  pending: ['processing', 'abandoned'], processing: ['completed', 'failed', 'abandoned'], completed: [], failed: ['processing', 'abandoned'], abandoned: [],
};

export function assertOutboxTransition(from: OutboxState, to: OutboxState): void {
  if (!TRANSITIONS[from].includes(to)) { const error = new Error(`Outbox event cannot transition from ${from} to ${to}`); error.name = 'InvalidOutboxTransitionError'; throw error; }
}

export function nextOutboxFailureState(attemptCount: number, maximumAttempts: number): 'failed' | 'abandoned' {
  if (!Number.isInteger(attemptCount) || !Number.isInteger(maximumAttempts) || attemptCount < 1 || maximumAttempts < 1) { const error = new Error('Outbox attempt configuration is invalid'); error.name = 'InvalidOutboxAttemptConfigurationError'; throw error; }
  return attemptCount < maximumAttempts ? 'failed' : 'abandoned';
}
