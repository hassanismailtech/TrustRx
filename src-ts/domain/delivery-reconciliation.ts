export type DeliveryState = 'queued' | 'submitted' | 'delivered' | 'failed' | 'retry_scheduled' | 'abandoned';

const TRANSITIONS: Record<DeliveryState, readonly DeliveryState[]> = {
  queued: ['submitted', 'failed'],
  submitted: ['delivered', 'failed'],
  delivered: [],
  failed: ['retry_scheduled', 'abandoned'],
  retry_scheduled: ['submitted', 'abandoned'],
  abandoned: [],
};

export function assertDeliveryTransition(from: DeliveryState, to: DeliveryState): void {
  if (!TRANSITIONS[from].includes(to)) {
    const error = new Error(`Delivery cannot transition from ${from} to ${to}`);
    error.name = 'InvalidDeliveryTransitionError';
    throw error;
  }
}

export function nextRetryState(attemptCount: number, maximumAttempts: number): 'retry_scheduled' | 'abandoned' {
  if (!Number.isInteger(attemptCount) || !Number.isInteger(maximumAttempts) || attemptCount < 0 || maximumAttempts < 1) {
    const error = new Error('Delivery attempt configuration is invalid');
    error.name = 'InvalidDeliveryAttemptConfigurationError';
    throw error;
  }
  return attemptCount < maximumAttempts ? 'retry_scheduled' : 'abandoned';
}
