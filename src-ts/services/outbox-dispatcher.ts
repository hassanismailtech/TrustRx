import type { OutboxEvent } from '../ports/outbox-repository.js';
import { OutboxService } from './outbox-service.js';

export interface OutboxHandler { eventType: OutboxEvent['eventType']; handle(event: OutboxEvent): Promise<void>; }
export class OutboxDispatcher {
  constructor(private readonly outbox: OutboxService, private readonly handlers: readonly OutboxHandler[], private readonly retryAfter = () => new Date(Date.now() + 60_000).toISOString()) {}
  async dispatch(organisationId: string, workerRef: string, limit = 10): Promise<{ claimed: number; completed: number; failed: number }> {
    const events = await this.outbox.claim(organisationId, workerRef, 60, limit); let completed = 0; let failed = 0;
    for (const event of events) {
      const handler = this.handlers.find((candidate) => candidate.eventType === event.eventType);
      try {
        if (!handler) throw new Error('OUTBOX_HANDLER_NOT_CONFIGURED');
        await handler.handle(event); await this.outbox.markCompleted(event, workerRef); completed += 1;
      } catch (error) {
        const code = error instanceof Error && /^[A-Z0-9_]{3,64}$/.test(error.message) ? error.message : 'OUTBOX_HANDLER_FAILED';
        await this.outbox.markFailed(event, workerRef, code, event.attemptCount < 5 ? this.retryAfter() : null); failed += 1;
      }
    }
    return { claimed: events.length, completed, failed };
  }
}
