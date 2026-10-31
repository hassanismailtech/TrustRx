const test = require('node:test');
const assert = require('node:assert/strict');
const { VerifiedTokenActorResolver } = require('../build/adapters/verified-token-actor-resolver.js');

const request = (authorization) => ({ method: 'POST', path: '/api/v1/signals', headers: authorization ? { authorization } : {}, body: null, requestId: 'req-1' });
const validClaims = {
  issuer: 'https://identity.example.test', audience: ['trustrx-api'], subject: 'actor-1', organisationId: 'org-1',
  roles: ['reporter'], permittedFacilityIds: ['facility-1'], active: true, expiresAtEpochSeconds: 2000, issuedAtEpochSeconds: 1900,
};
const resolver = (verify, options = {}) => new VerifiedTokenActorResolver({ verify }, {
  trustedIssuer: 'https://identity.example.test', requiredAudience: 'trustrx-api', nowEpochSeconds: () => 1950, ...options,
});

test('maps an approved, cryptographically verified bearer token to a bounded actor context', async () => {
  const auth = resolver(async (token) => { assert.equal(token, 'token-1'); return validClaims; });
  assert.deepEqual(await auth.resolve(request('Bearer token-1')), {
    subjectId: 'actor-1', organisationId: 'org-1', roles: ['reporter'], permittedFacilityIds: ['facility-1'], active: true,
  });
});

test('fails closed before or after provider verification for invalid authentication material', async () => {
  let called = false;
  const auth = resolver(async () => { called = true; return validClaims; });
  assert.equal(await auth.resolve(request()), null);
  assert.equal(called, false);
  assert.equal(await auth.resolve(request('Basic token-1')), null);
  assert.equal(await resolver(async () => ({ ...validClaims, issuer: 'https://attacker.example.test' })).resolve(request('Bearer token-1')), null);
  assert.equal(await resolver(async () => ({ ...validClaims, expiresAtEpochSeconds: 1800 })).resolve(request('Bearer token-1')), null);
  assert.equal(await resolver(async () => ({ ...validClaims, roles: ['platform_owner'] })).resolve(request('Bearer token-1')), null);
  assert.equal(await resolver(async () => { throw new Error('provider failure'); }).resolve(request('Bearer token-1')), null);
});
