import { assertOutboxTransition, nextOutboxFailureState } from '../domain/outbox.js';
import type { OutboxEvent, OutboxRepository } from '../ports/outbox-repository.js';

export class OutboxService {
  constructor(private readonly repository: OutboxRepository, private readonly maximumAttempts = 5) {}
  enqueue(event: Omit<OutboxEvent, 'state' | 'attemptCount'>) { return this.repository.enqueue(event); }
  claim(organisationId: string, workerRef: string, leaseSeconds = 60, limit = 10) {
    if (!/^[A-Za-z0-9_-]{3,64}$/.test(workerRef) || !Number.isInteger(leaseSeconds) || leaseSeconds < 10 || leaseSeconds > 900 || !Number.isInteger(limit) || limit < 1 || limit > 100) { const error = new Error('Outbox claim parameters are invalid'); error.name = 'InvalidOutboxClaimError'; throw error; }
    return this.repository.claimDue({ organisationId, workerRef, leaseSeconds, limit });
  }
  async markCompleted(event: OutboxEvent, workerRef: string): Promise<void> { assertOutboxTransition(event.state, 'completed'); await this.repository.complete({ id: event.id, organisationId: event.organisationId, workerRef, expectedState: 'processing' }); }
  async markFailed(event: OutboxEvent, workerRef: string, errorCode: string, retryAt: string | null): Promise<'failed' | 'abandoned'> {
    const nextState = nextOutboxFailureState(event.attemptCount, this.maximumAttempts); assertOutboxTransition(event.state, nextState); if (nextState === 'failed' && !retryAt) { const error = new Error('Retry time is required for a retryable outbox failure'); error.name = 'MissingOutboxRetryScheduleError'; throw error; }
    await this.repository.fail({ id: event.id, organisationId: event.organisationId, workerRef, expectedState: 'processing', nextState, errorCode, availableAt: retryAt }); return nextState;
  }
}
