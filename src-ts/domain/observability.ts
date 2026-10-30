const ALLOWED_FIELDS = new Set(['organisationId', 'signalId', 'deliveryId', 'handoffId', 'outboxEventId', 'eventType', 'state', 'outcome', 'errorCode', 'correlationRef', 'actorRole', 'durationMs']);
const SAFE_SCALAR = (value: unknown): value is string | number | boolean | null => value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

export interface OperationalLogEvent { name: string; fields: Readonly<Record<string, string | number | boolean | null>>; occurredAt: string; }

export function sanitizeOperationalFields(input: Record<string, unknown>): Readonly<Record<string, string | number | boolean | null>> {
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(input)) {
    if (ALLOWED_FIELDS.has(key) && SAFE_SCALAR(value)) output[key] = value;
  }
  return output;
}

export function assertSafeOperationalEvent(event: OperationalLogEvent): void {
  if (!/^[a-z][a-z0-9_.-]{2,80}$/.test(event.name)) { const error = new Error('Operational event name is invalid'); error.name = 'InvalidOperationalEventNameError'; throw error; }
  if (Number.isNaN(new Date(event.occurredAt).valueOf())) { const error = new Error('Operational event timestamp is invalid'); error.name = 'InvalidOperationalEventTimestampError'; throw error; }
}
