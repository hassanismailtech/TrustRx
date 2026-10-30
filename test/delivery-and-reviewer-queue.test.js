const test = require('node:test');
const assert = require('node:assert/strict');
const { assertDeliveryTransition, nextRetryState } = require('../build/domain/delivery-reconciliation.js');
const { ReviewerQueueService } = require('../build/services/reviewer-queue-service.js');

const reviewer = { subjectId: 'reviewer-1', organisationId: 'org-1', roles: ['reviewer'], permittedFacilityIds: [], active: true };

test('delivery reconciliation permits only retry-safe lifecycle transitions', () => {
  assert.doesNotThrow(() => assertDeliveryTransition('submitted', 'failed'));
  assert.throws(() => assertDeliveryTransition('delivered', 'submitted'), { name: 'InvalidDeliveryTransitionError' });
  assert.equal(nextRetryState(1, 3), 'retry_scheduled');
  assert.equal(nextRetryState(3, 3), 'abandoned');
});

test('reviewer queue limits query scope and protects tenant access', async () => {
  const calls = [];
  const queue = new ReviewerQueueService({ listReviewerQueue: async (query) => { calls.push(query); return { items: [], nextCursor: null }; } });
  await queue.list({ actor: reviewer, organisationId: 'org-1', limit: 30, before: '2026-10-30T00:00:00.000Z' });
  assert.deepEqual(calls[0], { organisationId: 'org-1', limit: 30, before: '2026-10-30T00:00:00.000Z' });
  await assert.rejects(queue.list({ actor: reviewer, organisationId: 'org-2' }), { name: 'AccessDeniedError' });
  await assert.rejects(queue.list({ actor: reviewer, organisationId: 'org-1', limit: 51 }), { name: 'InvalidReviewerQueueLimitError' });
});
