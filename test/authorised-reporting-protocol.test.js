const test = require('node:test');
const assert = require('node:assert/strict');
const { AuthorisedReportingProtocol } = require('../build/services/authorised-reporting-protocol.js');

const transport = {
  actor: { subjectId: 'reporter-1', organisationId: 'org-1', roles: ['reporter'], permittedFacilityIds: ['facility-1'], active: true },
  facilityId: 'facility-1', reporterCredentialId: 'credential-1', facilityRef: 'FAC001', reporterCredentialRef: 'CRED001',
};

test('authorised reporting protocol accepts only strict reports bound to the verified reporter credential and facility', () => {
  const protocol = new AuthorisedReportingProtocol();
  const result = protocol.parseSms('TRX1|FAC001|CRED001|CHOLERA|2|HIGH|ingress_0123456789abcdef', transport);
  assert.equal(result.organisationId, 'org-1');
  assert.equal(result.facilityId, 'facility-1');
  assert.equal(result.reporterCredentialId, 'credential-1');
  assert.equal(JSON.stringify(result).includes('TRX1|'), false);
});

test('authorised reporting protocol fails closed for protocol or binding mismatch', () => {
  const protocol = new AuthorisedReportingProtocol();
  assert.equal(protocol.parseSms('TRX1|OTHER|CRED001|CHOLERA|2|HIGH|ingress_0123456789abcdef', transport), null);
  assert.equal(protocol.parseSms('not structured', transport), null);
  assert.equal(protocol.parseUssd({ facilityRef: 'FAC001', reporterCredentialRef: 'OTHER', syndromeCode: 'cholera', caseCount: '2', severity: 'high', sessionRef: 'ussd_0123456789abcdef' }, transport), null);
});
