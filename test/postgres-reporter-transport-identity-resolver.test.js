const test = require('node:test');
const assert = require('node:assert/strict');
const { PostgresReporterTransportIdentityResolver } = require('../build/adapters/postgres-reporter-transport-identity-resolver.js');

test('private reporter transport resolver calls only the minimum identity function with parameters', async () => {
  const calls = [];
  const pool = { connect: async () => ({ query: async (sql, parameters) => { calls.push({ sql, parameters }); return { rows: [{ subject_id: 'reporter-1', organisation_id: 'org-1', facility_id: 'facility-1', reporter_credential_id: 'credential-1', facility_ref: 'FAC001', reporter_credential_ref: 'CRED001', active: true }], rowCount: 1 }; }, release() { calls.push({ release: true }); } }) };
  const resolver = new PostgresReporterTransportIdentityResolver(pool);
  assert.deepEqual(await resolver.resolve({ providerId: 'sms-provider', senderReference: 'sender-1' }), { subjectId: 'reporter-1', organisationId: 'org-1', facilityId: 'facility-1', reporterCredentialId: 'credential-1', facilityRef: 'FAC001', reporterCredentialRef: 'CRED001', active: true });
  assert.match(calls[0].sql, /resolve_active_reporter_transport_binding\(\$1, \$2\)/);
  assert.deepEqual(calls[0].parameters, ['sms-provider', 'sender-1']);
  assert.equal(calls.at(-1).release, true);
});

test('private reporter transport resolver rejects malformed lookup references before database access', async () => {
  let connected = false;
  const resolver = new PostgresReporterTransportIdentityResolver({ connect: async () => { connected = true; throw new Error('not called'); } });
  await assert.rejects(() => resolver.resolve({ providerId: '..', senderReference: 'sender-1' }), { name: 'InvalidReporterTransportIdentityLookupError' });
  assert.equal(connected, false);
});
