const test = require('node:test');
const assert = require('node:assert/strict');
const { IntegrityAnchorOutboxHandler, OfficialHandoffOutboxHandler } = require('../build/services/outbox-handlers.js');

test('integrity handler sends only the approved commitment payload', async () => {
  const calls = [];
  const handler = new IntegrityAnchorOutboxHandler({ getApprovedPayload: async (input) => { calls.push(['lookup', input]); return { commitment: 'a'.repeat(64), schemaVersion: '1', eventType: 'syndromic-signal' }; } }, { anchor: async (payload) => calls.push(['anchor', payload]) });
  await handler.handle({ id: 'e1', organisationId: 'org-1', aggregateRef: 'signal-1', eventType: 'integrity_anchor', dedupeRef: 'd1', payload: { signalId: 'signal-1', integrityCommitmentId: 'commitment-1' }, state: 'processing', attemptCount: 1 });
  assert.deepEqual(calls[1][1], { commitment: 'a'.repeat(64), schemaVersion: '1', eventType: 'syndromic-signal' });
});

test('official handoff handler passes only opaque references to an executor', async () => {
  const calls = [];
  const handler = new OfficialHandoffOutboxHandler({ submit: async (input) => { calls.push(input); return { externalReference: 'safe-ref' }; } });
  await handler.handle({ id: 'e2', organisationId: 'org-1', aggregateRef: 'signal-1', eventType: 'official_handoff', dedupeRef: 'd2', payload: { handoffId: 'handoff-1' }, state: 'processing', attemptCount: 1 });
  assert.deepEqual(calls[0], { organisationId: 'org-1', handoffId: 'handoff-1' });
});
