const test = require('node:test');
const assert = require('node:assert/strict');
const { assertCanHandoffSignal, assertCanReportSignal, assertCanReviewSignal } = require('../build/domain/access-control.js');
const { assertIdempotencyKey, classifyReplay } = require('../build/domain/idempotency.js');

const reporter = { subjectId: 'r-1', organisationId: 'org-1', roles: ['reporter'], permittedFacilityIds: ['facility-1'], active: true };
const reviewer = { subjectId: 'v-1', organisationId: 'org-1', roles: ['reviewer'], permittedFacilityIds: [], active: true };
const operator = { subjectId: 'o-1', organisationId: 'org-1', roles: ['official_channel_operator'], permittedFacilityIds: [], active: true };

test('reporting and reviewing stay inside actor tenant and facility entitlement', () => {
  assert.doesNotThrow(() => assertCanReportSignal(reporter, 'org-1', 'facility-1'));
  assert.throws(() => assertCanReportSignal(reporter, 'org-1', 'facility-2'), { name: 'AccessDeniedError' });
  assert.doesNotThrow(() => assertCanReviewSignal(reviewer, 'org-1'));
  assert.throws(() => assertCanReviewSignal(reviewer, 'org-2'), { name: 'AccessDeniedError' });
});

test('official handoff needs the distinct role and a verified signal', () => {
  assert.doesNotThrow(() => assertCanHandoffSignal(operator, 'org-1', 'verified'));
  assert.throws(() => assertCanHandoffSignal(operator, 'org-1', 'received'), { name: 'AccessDeniedError' });
  assert.throws(() => assertCanHandoffSignal(reviewer, 'org-1', 'verified'), { name: 'AccessDeniedError' });
});

test('idempotency keys accept replay but reject a reused key with a different request fingerprint', () => {
  const key = 'ingress_0123456789abcdef';
  const fingerprint = 'a'.repeat(64);
  assert.doesNotThrow(() => assertIdempotencyKey(key));
  assert.throws(() => assertIdempotencyKey('short'), { name: 'InvalidIdempotencyKeyError' });
  assert.equal(classifyReplay({ organisationId: 'org-1', scope: 'signal_ingress', key, requestFingerprint: fingerprint, status: 'completed', signalId: 's-1', expiresAt: '2026-11-01T00:00:00.000Z' }, fingerprint), 'replay');
  assert.equal(classifyReplay({ organisationId: 'org-1', scope: 'signal_ingress', key, requestFingerprint: fingerprint, status: 'completed', signalId: 's-1', expiresAt: '2026-11-01T00:00:00.000Z' }, 'b'.repeat(64)), 'conflict');
});
