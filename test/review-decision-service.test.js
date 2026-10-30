const test = require('node:test');
const assert = require('node:assert/strict');
const { ReviewDecisionService } = require('../build/services/review-decision-service.js');
const reviewer = { subjectId: 'reviewer-1', organisationId: 'org-1', roles: ['reviewer'], permittedFacilityIds: [], active: true };

test('review decision requires reviewer authority, valid workflow state and rationale', async () => {
  const calls = [];
  const service = new ReviewDecisionService({ recordDecision: async (input) => calls.push(input) });
  await service.decide({ actor: reviewer, id: 'decision-1', organisationId: 'org-1', signalId: 'signal-1', expectedState: 'under_review', nextState: 'verified', rationale: 'Meets the defined review criteria.', decidedAt: '2026-10-30T00:00:00.000Z' });
  assert.equal(calls[0].reviewerRef, 'reviewer-1');
  await assert.rejects(service.decide({ actor: reviewer, id: 'decision-2', organisationId: 'org-1', signalId: 'signal-1', expectedState: 'received', nextState: 'acknowledged', rationale: 'Meets the defined review criteria.', decidedAt: '2026-10-30T00:00:00.000Z' }), { name: 'InvalidReviewTransitionError' });
});
