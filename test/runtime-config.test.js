const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRuntimeConfig, safeReadiness } = require('../build/config/runtime-config.js');

test('runtime defaults to fail-closed development configuration', () => {
  const config = loadRuntimeConfig({});
  assert.deepEqual(safeReadiness(config), { environment: 'development', signalIngress: 'disabled', outboxWorker: 'disabled', database: 'not_configured', authentication: 'disabled', integrityAnchor: 'not_configured' });
});

test('outbox worker remains disabled by default and needs a private database when enabled', () => {
  assert.throws(() => loadRuntimeConfig({ TRUSTRX_ENABLE_OUTBOX_WORKER: 'true' }), { name: 'InvalidRuntimeConfigurationError' });
  assert.equal(loadRuntimeConfig({ TRUSTRX_ENABLE_OUTBOX_WORKER: 'true', DATABASE_URL: 'postgres://private' }).outboxWorkerEnabled, true);
});

test('enabled ingress requires database, secret, authentication and explicit origin', () => {
  assert.throws(() => loadRuntimeConfig({ TRUSTRX_ENABLE_SIGNAL_INGRESS: 'true' }), { name: 'InvalidRuntimeConfigurationError' });
  const config = loadRuntimeConfig({ TRUSTRX_ENABLE_SIGNAL_INGRESS: 'true', DATABASE_URL: 'postgres://private', TRUSTRX_COMMITMENT_SECRET: 'secret', TRUSTRX_AUTH_MODE: 'approved_adapter', TRUSTRX_ALLOWED_ORIGIN: 'https://app.example.org' });
  assert.equal(config.signalIngressEnabled, true);
  assert.throws(() => loadRuntimeConfig({ TRUSTRX_ENVIRONMENT: 'production', TRUSTRX_ENABLE_SIGNAL_INGRESS: 'true', DATABASE_URL: 'postgres://private', TRUSTRX_COMMITMENT_SECRET: 'secret', TRUSTRX_AUTH_MODE: 'approved_adapter', TRUSTRX_ALLOWED_ORIGIN: 'https://app.example.org' }), { name: 'InvalidRuntimeConfigurationError' });
});
