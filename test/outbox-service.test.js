const test = require('node:test');
const assert = require('node:assert/strict');
const { OutboxService } = require('../build/services/outbox-service.js');

const event = { id: 'outbox-1', organisationId: 'org-1', aggregateRef: 'signal-1', eventType: 'integrity_anchor', dedupeRef: 'anchor-1', payload: { signalId: 'signal-1' }, state: 'processing', attemptCount: 1 };

test('outbox schedules retryable failure with bounded attempts', async () => {
  const calls = [];
  const service = new OutboxService({ enqueue: async () => ({ kind: 'enqueued', id: 'outbox-1' }), claimDue: async () => [], complete: async () => {}, fail: async (input) => calls.push(input) }, 3);
  assert.equal(await service.markFailed(event, 'UPSTREAM_TIMEOUT', '2026-10-30T00:05:00.000Z'), 'failed');
  assert.equal(calls[0].nextState, 'failed');
});

test('outbox abandons exhausted retries and validates worker claim bounds', async () => {
  const service = new OutboxService({ enqueue: async () => ({ kind: 'enqueued', id: 'outbox-1' }), claimDue: async () => [], complete: async () => {}, fail: async () => {} }, 3);
  assert.equal(await service.markFailed({ ...event, attemptCount: 3 }, 'UPSTREAM_TIMEOUT', null), 'abandoned');
  assert.throws(() => service.claim('x', 60, 10), { name: 'InvalidOutboxClaimError' });
});
