const test = require('node:test');
const assert = require('node:assert/strict');
const { AuthorisedReporterTransportResolver } = require('../build/services/authorised-reporter-transport-resolver.js');

const verified = { kind: 'verified', providerId: 'sms-provider', senderReference: 'sender-1' };
const record = { subjectId: 'reporter-1', organisationId: 'org-1', facilityId: 'facility-1', reporterCredentialId: 'credential-1', active: true };

test('transport identity resolver maps only a verified active provider sender to a minimum reporter context', async () => {
  const resolver = new AuthorisedReporterTransportResolver({ resolve: async (input) => { assert.deepEqual(input, { providerId: 'sms-provider', senderReference: 'sender-1' }); return record; } });
  assert.deepEqual(await resolver.resolve(verified), {
    actor: { subjectId: 'reporter-1', organisationId: 'org-1', roles: ['reporter'], permittedFacilityIds: ['facility-1'], active: true },
    facilityId: 'facility-1', reporterCredentialId: 'credential-1',
  });
});

test('transport identity resolver fails closed before and after private lookup', async () => {
  let called = false;
  const resolver = new AuthorisedReporterTransportResolver({ resolve: async () => { called = true; return record; } });
  assert.equal(await resolver.resolve({ kind: 'rejected' }), null);
  assert.equal(called, false);
  assert.equal(await new AuthorisedReporterTransportResolver({ resolve: async () => ({ ...record, active: false }) }).resolve(verified), null);
  assert.equal(await new AuthorisedReporterTransportResolver({ resolve: async () => { throw new Error('registry detail'); } }).resolve(verified), null);
});
