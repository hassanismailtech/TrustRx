const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeFrameworkRequest } = require('../build/http/framework-request-normalizer.js');

const ids = { create: () => 'server_req_0001' };
const base = { method: 'POST', path: '/api/v1/signals', headers: { Authorization: 'Bearer token', 'x-untrusted': 'drop' }, query: {}, body: { raw: 'never log this' } };

test('framework normalizer allow-lists bounded metadata and generates the request ID itself', () => {
  assert.deepEqual(normalizeFrameworkRequest(base, ids), {
    method: 'POST', path: '/api/v1/signals', headers: { authorization: 'Bearer token' }, query: {}, body: { raw: 'never log this' }, requestId: 'server_req_0001',
  });
});

test('framework normalizer rejects malformed routes, metadata and generated IDs', () => {
  assert.throws(() => normalizeFrameworkRequest({ ...base, method: 'post' }, ids), { name: 'InvalidFrameworkRequestError' });
  assert.throws(() => normalizeFrameworkRequest({ ...base, path: '/api/v1/signals?x=1' }, ids), { name: 'InvalidFrameworkRequestError' });
  assert.throws(() => normalizeFrameworkRequest({ ...base, query: { probe: '1' } }, ids), { name: 'InvalidFrameworkRequestError' });
  assert.throws(() => normalizeFrameworkRequest({ ...base, headers: { authorization: ['Bearer one', 'Bearer two'] } }, ids), { name: 'InvalidFrameworkRequestError' });
  assert.throws(() => normalizeFrameworkRequest(base, { create: () => 'bad' }), { name: 'InvalidFrameworkRequestError' });
});
