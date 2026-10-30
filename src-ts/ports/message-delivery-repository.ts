import type { DeliveryState } from '../domain/delivery-reconciliation.js';

export interface OutboundDeliveryRequest {
  id: string;
  organisationId: string;
  signalId: string | null;
  channel: 'sms' | 'ussd';
  correlationRef: string;
}

export interface DeliveryAttempt {
  id: string;
  organisationId: string;
  deliveryId: string;
  expectedState: DeliveryState;
  nextState: DeliveryState;
  attemptNumber: number;
  providerMessageRef: string | null;
  errorCode: string | null;
  occurredAt: string;
  nextAttemptAt: string | null;
}

export interface QueuedDelivery {
  id: string;
  state: DeliveryState;
  attemptCount: number;
}

export interface MessageDeliveryRepository {
  queueOutbound(input: OutboundDeliveryRequest): Promise<{ kind: 'queued' | 'duplicate'; delivery: QueuedDelivery }>;
  recordAttempt(input: DeliveryAttempt): Promise<QueuedDelivery>;
}
