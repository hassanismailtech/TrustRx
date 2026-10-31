const test = require('node:test');
const assert = require('node:assert/strict');
const { ProviderInboundSignalIntake } = require('../build/services/provider-inbound-signal-intake.js');

const inbound = { providerId: 'sms-provider', signature: 'signature-1', timestampEpochSeconds: 1000, rawBody: 'TRX1|FAC001|CRED001|CHOLERA|2|HIGH|ingress_0123456789abcdef' };
const reporter = { actor: { subjectId: 'reporter-1', organisationId: 'org-1', roles: ['reporter'], permittedFacilityIds: ['facility-1'], active: true }, facilityId: 'facility-1', reporterCredentialId: 'credential-1', facilityRef: 'FAC001', reporterCredentialRef: 'CRED001' };

test('provider inbound intake returns only a validated identity-bound submission', async () => {
  const pipeline = new ProviderInboundSignalIntake(
    { authenticate: async () => ({ kind: 'verified', providerId: 'sms-provider', senderReference: 'sender-1' }) },
    { resolve: async () => reporter },
  );
  const result = await pipeline.acceptSms(inbound);
  assert.equal(result.kind, 'accepted');
  if (result.kind !== 'accepted') throw new Error('unreachable');
  assert.equal(result.submission.organisationId, 'org-1');
  assert.equal(JSON.stringify(result).includes('sender-1'), false);
  assert.equal(JSON.stringify(result).includes('TRX1|'), false);
});

test('provider inbound intake fails closed at authentication, binding and protocol boundaries', async () => {
  const rejectedAuth = new ProviderInboundSignalIntake({ authenticate: async () => ({ kind: 'rejected' }) }, { resolve: async () => { throw new Error('not called'); } });
  assert.deepEqual(await rejectedAuth.acceptSms(inbound), { kind: 'rejected' });
  const rejectedBinding = new ProviderInboundSignalIntake({ authenticate: async () => ({ kind: 'verified', providerId: 'sms-provider', senderReference: 'sender-1' }) }, { resolve: async () => null });
  assert.deepEqual(await rejectedBinding.acceptSms(inbound), { kind: 'rejected' });
  const rejectedProtocol = new ProviderInboundSignalIntake({ authenticate: async () => ({ kind: 'verified', providerId: 'sms-provider', senderReference: 'sender-1' }) }, { resolve: async () => reporter });
  assert.deepEqual(await rejectedProtocol.acceptSms({ ...inbound, rawBody: 'TRX1|OTHER|CRED001|CHOLERA|2|HIGH|ingress_0123456789abcdef' }), { kind: 'rejected' });
});
