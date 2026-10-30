import { assertDeliveryTransition, nextRetryState, type DeliveryState } from '../domain/delivery-reconciliation.js';
import type { DeliveryAttempt, MessageDeliveryRepository, OutboundDeliveryRequest, QueuedDelivery } from '../ports/message-delivery-repository.js';

export class OutboundReceiptService {
  constructor(private readonly repository: MessageDeliveryRepository, private readonly maximumAttempts = 3) {}

  queue(input: OutboundDeliveryRequest) {
    return this.repository.queueOutbound(input);
  }

  async recordProviderOutcome(input: Omit<DeliveryAttempt, 'nextState' | 'nextAttemptAt'> & { outcome: 'submitted' | 'delivered' | 'failed'; retryAt?: string }): Promise<QueuedDelivery> {
    const nextState: DeliveryState = input.outcome === 'submitted' ? 'submitted' : input.outcome === 'delivered' ? 'delivered' : nextRetryState(input.attemptNumber, this.maximumAttempts);
    assertDeliveryTransition(input.expectedState, input.outcome === 'failed' ? 'failed' : nextState);
    if (input.outcome === 'failed') assertDeliveryTransition('failed', nextState);
    if (nextState === 'retry_scheduled' && !input.retryAt) {
      const error = new Error('A retry time is required when scheduling another delivery attempt');
      error.name = 'MissingRetryScheduleError';
      throw error;
    }
    return this.repository.recordAttempt({ ...input, nextState, nextAttemptAt: nextState === 'retry_scheduled' ? input.retryAt || null : null });
  }
}
