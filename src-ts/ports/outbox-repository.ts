import type { OutboxEventType, OutboxState } from '../domain/outbox.js';

export interface OutboxEvent {
  id: string;
  organisationId: string;
  aggregateRef: string;
  eventType: OutboxEventType;
  dedupeRef: string;
  payload: Record<string, string>;
  state: OutboxState;
  attemptCount: number;
}

export interface OutboxRepository {
  enqueue(event: Omit<OutboxEvent, 'state' | 'attemptCount'>): Promise<{ kind: 'enqueued' | 'duplicate'; id: string }>;
  claimDue(input: { organisationId: string; workerRef: string; leaseSeconds: number; limit: number }): Promise<readonly OutboxEvent[]>;
  complete(input: { id: string; organisationId: string; workerRef: string; expectedState: 'processing' }): Promise<void>;
  fail(input: { id: string; organisationId: string; workerRef: string; expectedState: 'processing'; nextState: 'failed' | 'abandoned'; errorCode: string; availableAt: string | null }): Promise<void>;
}
