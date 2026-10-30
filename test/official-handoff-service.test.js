const test = require('node:test');
const assert = require('node:assert/strict');
const { OfficialHandoffService } = require('../build/services/official-handoff-service.js');
const { assertOfficialHandoffTransition } = require('../build/domain/official-handoff.js');
const operator = { subjectId: 'operator-1', organisationId: 'org-1', roles: ['official_channel_operator'], permittedFacilityIds: [], active: true };

test('official handoff is queued only after human verification and authorised operator check', async () => {
  const calls = [];
  const service = new OfficialHandoffService({ queue: async (input) => { calls.push(input); return { kind: 'queued', id: input.id, state: 'queued' }; } });
  const result = await service.queue({ actor: operator, id: 'handoff-1', outboxEventId: 'outbox-1', organisationId: 'org-1', signalId: 'signal-1', signalState: 'verified', targetKind: 'sormas', targetProfileRef: 'SORMAS_STATE_1', correlationRef: 'handoff_0123456789' });
  assert.equal(result.state, 'queued');
  assert.equal(calls[0].requestedByRef, 'operator-1');
});

test('handoff lifecycle rejects invalid state changes', () => {
  assert.doesNotThrow(() => assertOfficialHandoffTransition('queued', 'submitted'));
  assert.throws(() => assertOfficialHandoffTransition('acknowledged', 'submitted'), { name: 'InvalidOfficialHandoffTransitionError' });
});
