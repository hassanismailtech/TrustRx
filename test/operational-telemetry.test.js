const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeOperationalFields } = require('../build/domain/observability.js');
const { OperationalTelemetryService } = require('../build/services/operational-telemetry-service.js');

test('operational telemetry whitelists safe fields and drops restricted content', () => {
  assert.deepEqual(sanitizeOperationalFields({ organisationId: 'org-1', signalId: 'signal-1', errorCode: 'UPSTREAM_TIMEOUT', rawSmsBody: 'patient name', privateKey: 'secret', nestedPayload: { body: 'restricted' } }), { organisationId: 'org-1', signalId: 'signal-1', errorCode: 'UPSTREAM_TIMEOUT' });
});

test('operational telemetry emits only a validated redacted event', async () => {
  const events = [];
  const service = new OperationalTelemetryService({ emit: async (event) => events.push(event) }, () => new Date('2026-10-30T00:00:00.000Z'));
  await service.emit('outbox.handler.failed', { outboxEventId: 'outbox-1', errorCode: 'UPSTREAM_TIMEOUT', body: 'do not log' });
  assert.deepEqual(events[0].fields, { outboxEventId: 'outbox-1', errorCode: 'UPSTREAM_TIMEOUT' });
});
