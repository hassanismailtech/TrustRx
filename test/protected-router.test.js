const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRuntimeConfig } = require('../build/config/runtime-config.js');
const { composeProtectedRuntime } = require('../build/runtime/protected-runtime.js');
const { ProtectedRouter } = require('../build/http/protected-router.js');

const request = (method, path) => ({ method, path, headers: {}, query: {}, body: { raw: 'never echo' }, requestId: 'req-1' });
const enabledConfig = () => loadRuntimeConfig({
  TRUSTRX_ENABLE_SIGNAL_INGRESS: 'true', DATABASE_URL: 'postgres://private', TRUSTRX_COMMITMENT_SECRET: 'secret',
  TRUSTRX_AUTH_MODE: 'approved_adapter', TRUSTRX_ALLOWED_ORIGIN: 'https://app.example.org',
});

test('protected router exposes no workflow while runtime is disabled', async () => {
  const router = new ProtectedRouter(composeProtectedRuntime(loadRuntimeConfig({})));
  assert.deepEqual(await router.handle(request('POST', '/api/v1/signals')), {
    status: 503, body: { error: 'PROTECTED_RUNTIME_DISABLED', requestId: 'req-1' },
  });
});

test('protected router uses exact routes and never reflects raw request content', async () => {
  const runtime = composeProtectedRuntime(enabledConfig(), {
    pool: { connect: async () => { throw new Error('not called without authenticated actor'); } },
    auth: { resolve: async () => null },
    ingressFactory: { create: async () => { throw new Error('not called'); } },
  });
  const router = new ProtectedRouter(runtime);
  assert.equal((await router.handle(request('POST', '/api/v1/signals'))).status, 401);
  assert.deepEqual(await router.handle(request('GET', '/api/v1/signals')), {
    status: 405, body: { error: 'METHOD_NOT_ALLOWED', requestId: 'req-1' },
  });
  const missing = await router.handle(request('POST', '/api/v1/not-a-route'));
  assert.deepEqual(missing, { status: 404, body: { error: 'ROUTE_NOT_FOUND', requestId: 'req-1' } });
  assert.equal(JSON.stringify(missing).includes('never echo'), false);
});
