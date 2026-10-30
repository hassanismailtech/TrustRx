import { assertSafeOperationalEvent, sanitizeOperationalFields, type OperationalLogEvent } from '../domain/observability.js';
import type { ObservabilitySink } from '../ports/observability-sink.js';

export class OperationalTelemetryService {
  constructor(private readonly sink: ObservabilitySink, private readonly now = () => new Date()) {}
  async emit(name: string, fields: Record<string, unknown>): Promise<void> {
    const event: OperationalLogEvent = { name, fields: sanitizeOperationalFields(fields), occurredAt: this.now().toISOString() };
    assertSafeOperationalEvent(event);
    await this.sink.emit(event);
  }
}
