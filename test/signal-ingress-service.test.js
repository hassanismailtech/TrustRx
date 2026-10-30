const test = require('node:test');
const assert = require('node:assert/strict');
const { SignalIngressService } = require('../build/services/signal-ingress-service.js');

const actor = { subjectId: 'reporter-1', organisationId: 'org-1', roles: ['reporter'], permittedFacilityIds: ['facility-1'], active: true };
const input = {
  actor, organisationId: 'org-1', facilityId: 'facility-1', reporterCredentialId: 'credential-1',
  signal: { id: 'signal-1', schemaVersion: '1', state: 'received', receivedAt: '2026-10-30T00:00:00.000Z', facilityRef: 'F-1', syndromeCode: 'CHOLERA', caseCount: 2, severity: 'high', reporterCredentialRef: 'credential-1', reportedAt: '2026-10-30T00:00:00.000Z', coarseLocation: null, notes: null },
  integrity: { id: 'integrity-1', commitment: 'a'.repeat(64), status: 'pending', hcsReceipt: null },
  audit: { id: 'audit-1', signalId: 'signal-1', actorRef: 'credential-1', action: 'signal.received', fromState: null, toState: 'received', rationale: null, occurredAt: '2026-10-30T00:00:00.000Z' },
  idempotency: { id: 'idem-1', organisationId: 'org-1', scope: 'signal_ingress', key: 'ingress_0123456789abcdef', requestFingerprint: 'b'.repeat(64), expiresAt: '2026-11-01T00:00:00.000Z' },
  integrityOutboxEventId: 'outbox-anchor-1',
};

test('ingress service authorises a reporter before atomically accepting an idempotent signal', async () => {
  const calls = [];
  const service = new SignalIngressService({ createIdempotent: async (request) => { calls.push(request); return { kind: 'accepted', signalId: request.signal.id }; } });
  assert.deepEqual(await service.accept(input), { kind: 'accepted', signalId: 'signal-1' });
  assert.equal(calls.length, 1);
});

test('ingress service rejects a cross-tenant idempotency key before persistence', async () => {
  const service = new SignalIngressService({ createIdempotent: async () => { throw new Error('should not persist'); } });
  await assert.rejects(service.accept({ ...input, idempotency: { ...input.idempotency, organisationId: 'org-2' } }), { name: 'IdempotencyTenantMismatchError' });
});
