const test = require('node:test');
const assert = require('node:assert/strict');
const { canonicalCommitmentEnvelope, createCommitment, createSignal } = require('../src/domain/signal');
const { InMemoryEventStore } = require('../src/services/event-store');
const { ReviewService } = require('../src/services/review-service');

const input = { facilityRef: 'PHC-001', syndromeCode: 'cholera', caseCount: 3, severity: 'high' };

test('creates a private signal with the expected workflow state', () => {
  const signal = createSignal(input, { id: 'signal-1', receivedAt: new Date('2026-10-30T12:00:00.000Z') });
  assert.equal(signal.state, 'received');
  assert.equal(signal.syndromeCode, 'CHOLERA');
});

test('commitment envelope excludes health-report content', () => {
  const signal = createSignal(input, { id: 'signal-1', receivedAt: new Date('2026-10-30T12:00:00.000Z') });
  const envelope = canonicalCommitmentEnvelope(signal);
  assert.ok(!envelope.includes('PHC-001'));
  assert.ok(!envelope.includes('CHOLERA'));
  assert.equal(createCommitment(signal, 'test-secret').length, 64);
});

test('reviewer transition records an auditable human decision', async () => {
  const store = new InMemoryEventStore();
  await store.save(createSignal(input, { id: 'signal-2', receivedAt: new Date('2026-10-30T12:00:00.000Z') }));
  const reviewService = new ReviewService({ store, now: () => new Date('2026-10-30T12:01:00.000Z') });
  const updated = await reviewService.transition({ signalId: 'signal-2', toState: 'under_review', reviewerRef: 'reviewer-1', rationale: 'Initial completeness review' });
  assert.equal(updated.state, 'under_review');
  const audit = await store.findAuditBySignalId('signal-2');
  assert.equal(audit.length, 1);
  assert.equal(audit[0].fromState, 'received');
  assert.equal(audit[0].toState, 'under_review');
});

test('reviewer cannot bypass the TrustRx workflow state machine', async () => {
  const store = new InMemoryEventStore();
  await store.save(createSignal(input, { id: 'signal-3', receivedAt: new Date('2026-10-30T12:00:00.000Z') }));
  const reviewService = new ReviewService({ store });
  await assert.rejects(
    reviewService.transition({ signalId: 'signal-3', toState: 'acknowledged', reviewerRef: 'reviewer-1' }),
    { code: 'INVALID_SIGNAL_TRANSITION' },
  );
});
