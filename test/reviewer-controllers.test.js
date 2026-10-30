const test = require('node:test');
const assert = require('node:assert/strict');
const { ReviewDecisionController, ReviewerQueueController } = require('../build/http/reviewer-controllers.js');
const actor = { subjectId: 'reviewer-1', organisationId: 'org-1', roles: ['reviewer'], permittedFacilityIds: [], active: true };
const request = { method: 'GET', path: '/api/v1/reviewer/queue', headers: {}, query: {}, body: null, requestId: 'req-1' };

test('reviewer queue controller requires identity and returns a bounded page', async () => {
  const controller = new ReviewerQueueController({ resolve: async () => actor }, { list: async () => ({ items: [], nextCursor: null }) });
  assert.deepEqual(await controller.get(request), { status: 200, body: { items: [], nextCursor: null, requestId: 'req-1' } });
  const noAuth = new ReviewerQueueController({ resolve: async () => null }, { list: async () => { throw new Error('not called'); } });
  assert.equal((await noAuth.get(request)).status, 401);
});

test('review decision controller validates payload and records a human decision', async () => {
  const calls = [];
  const controller = new ReviewDecisionController({ resolve: async () => actor }, { decide: async (input) => calls.push(input) });
  const response = await controller.post({ ...request, method: 'POST', body: { id: 'decision-1', signalId: 'signal-1', expectedState: 'under_review', nextState: 'verified', rationale: 'Evidence satisfies the review criteria.', decidedAt: '2026-10-30T00:00:00.000Z' } });
  assert.equal(response.status, 202);
  assert.equal(calls[0].organisationId, 'org-1');
  assert.equal((await controller.post({ ...request, method: 'POST', body: { unsafe: 'data' } })).status, 400);
});
