const test = require('node:test');
const assert = require('node:assert/strict');
const { SignalIngressController } = require('../build/http/signal-ingress-controller.js');

const request = { method: 'POST', path: '/api/v1/signals', headers: {}, body: { raw: 'never echo this' }, requestId: 'req-1' };
const actor = { subjectId: 'reporter-1', organisationId: 'org-1', roles: ['reporter'], permittedFacilityIds: ['facility-1'], active: true };

test('controller stays disabled until an approved environment enables ingress', async () => {
  const controller = new SignalIngressController({ resolve: async () => actor }, { create: async () => { throw new Error('not called'); } }, { accept: async () => { throw new Error('not called'); } });
  assert.deepEqual(await controller.post(request), { status: 503, body: { error: 'SIGNAL_INGRESS_DISABLED', requestId: 'req-1' } });
});

test('controller fails closed without identity and returns safe accepted/replay responses', async () => {
  const unauthenticated = new SignalIngressController({ resolve: async () => null }, { create: async () => { throw new Error('not called'); } }, { accept: async () => { throw new Error('not called'); } }, true);
  assert.equal((await unauthenticated.post(request)).status, 401);
  const controller = new SignalIngressController({ resolve: async () => actor }, { create: async () => ({}) }, { accept: async () => ({ kind: 'accepted', signalId: 'signal-1' }) }, true);
  const response = await controller.post(request);
  assert.deepEqual(response, { status: 202, body: { outcome: 'accepted', signalRef: 'signal-1', requestId: 'req-1' } });
  assert.equal(JSON.stringify(response).includes('never echo this'), false);
});
