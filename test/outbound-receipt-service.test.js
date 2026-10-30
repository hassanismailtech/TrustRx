const test = require('node:test');
const assert = require('node:assert/strict');
const { OutboundReceiptService } = require('../build/services/outbound-receipt-service.js');

const delivery = { id: 'attempt-1', organisationId: 'org-1', deliveryId: 'delivery-1', expectedState: 'submitted', attemptNumber: 1, providerMessageRef: 'MSG001', errorCode: 'NETWORK_TIMEOUT', occurredAt: '2026-10-30T00:00:00.000Z' };

test('failed outbound receipt schedules a bounded retry without retaining a message body', async () => {
  const calls = [];
  const service = new OutboundReceiptService({ queueOutbound: async () => ({ kind: 'queued', delivery: { id: 'delivery-1', state: 'queued', attemptCount: 0 } }), recordAttempt: async (attempt) => { calls.push(attempt); return { id: attempt.deliveryId, state: attempt.nextState, attemptCount: attempt.attemptNumber }; } });
  const result = await service.recordProviderOutcome({ ...delivery, outcome: 'failed', retryAt: '2026-10-30T00:05:00.000Z' });
  assert.deepEqual(result, { id: 'delivery-1', state: 'retry_scheduled', attemptCount: 1 });
  assert.equal(calls[0].nextAttemptAt, '2026-10-30T00:05:00.000Z');
  assert.equal(Object.hasOwn(calls[0], 'body'), false);
});

test('failed receipt becomes abandoned after the retry budget is exhausted', async () => {
  const service = new OutboundReceiptService({ queueOutbound: async () => { throw new Error('not used'); }, recordAttempt: async (attempt) => ({ id: attempt.deliveryId, state: attempt.nextState, attemptCount: attempt.attemptNumber }) }, 3);
  const result = await service.recordProviderOutcome({ ...delivery, attemptNumber: 3, outcome: 'failed' });
  assert.equal(result.state, 'abandoned');
});
