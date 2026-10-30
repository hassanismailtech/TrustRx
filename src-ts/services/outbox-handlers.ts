import type { OutboxEvent } from '../ports/outbox-repository.js';
import type { IntegrityAnchorGateway, IntegrityAnchorLookup } from '../ports/integrity-anchor-gateway.js';
import type { OfficialHandoffExecutor } from '../ports/official-handoff-executor.js';
import type { OutboxHandler } from './outbox-dispatcher.js';

function requiredPayloadField(event: OutboxEvent, key: string): string {
  const value = event.payload[key];
  if (!value || typeof value !== 'string') throw new Error('OUTBOX_PAYLOAD_INVALID');
  return value;
}

export class IntegrityAnchorOutboxHandler implements OutboxHandler {
  readonly eventType = 'integrity_anchor' as const;
  constructor(private readonly lookup: IntegrityAnchorLookup, private readonly gateway: IntegrityAnchorGateway) {}
  async handle(event: OutboxEvent): Promise<void> {
    const payload = await this.lookup.getApprovedPayload({ organisationId: event.organisationId, signalId: requiredPayloadField(event, 'signalId'), integrityCommitmentId: requiredPayloadField(event, 'integrityCommitmentId') });
    await this.gateway.anchor(payload);
  }
}

export class OfficialHandoffOutboxHandler implements OutboxHandler {
  readonly eventType = 'official_handoff' as const;
  constructor(private readonly executor: OfficialHandoffExecutor) {}
  async handle(event: OutboxEvent): Promise<void> {
    await this.executor.submit({ organisationId: event.organisationId, handoffId: requiredPayloadField(event, 'handoffId') });
  }
}
