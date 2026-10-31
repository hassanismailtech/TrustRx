const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRuntimeConfig } = require('../build/config/runtime-config.js');
const { composeProtectedRuntime } = require('../build/runtime/protected-runtime.js');

const enabledConfig = () => loadRuntimeConfig({
  TRUSTRX_ENABLE_SIGNAL_INGRESS: 'true', DATABASE_URL: 'postgres://private', TRUSTRX_COMMITMENT_SECRET: 'secret',
  TRUSTRX_AUTH_MODE: 'approved_adapter', TRUSTRX_ALLOWED_ORIGIN: 'https://app.example.org',
});

test('protected runtime is inert unless ingress is explicitly enabled', () => {
  assert.deepEqual(composeProtectedRuntime(loadRuntimeConfig({})), { state: 'disabled', reason: 'SIGNAL_INGRESS_DISABLED' });
  assert.throws(() => composeProtectedRuntime(enabledConfig()), { name: 'InvalidRuntimeCompositionError' });
});

test('enabled protected runtime wires tenant-safe controllers without binding network transport', async () => {
  const dependencies = {
    pool: { connect: async () => { throw new Error('database must not be contacted during composition'); } },
    auth: { resolve: async () => null },
    ingressFactory: { create: async () => { throw new Error('not called'); } },
  };
  const runtime = composeProtectedRuntime(enabledConfig(), dependencies);
  assert.equal(runtime.state, 'ready');
  if (runtime.state !== 'ready') throw new Error('unreachable');
  const response = await runtime.controllers.signalIngress.post({ method: 'POST', path: '/api/v1/signals', headers: {}, body: null, requestId: 'req-1' });
  assert.equal(response.status, 401);
});
