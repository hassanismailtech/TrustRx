const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRuntimeConfig } = require('../build/config/runtime-config.js');
const { OutboxWorkerCycle } = require('../build/runtime/outbox-worker-cycle.js');

const enabled = () => loadRuntimeConfig({ TRUSTRX_ENABLE_OUTBOX_WORKER: 'true', DATABASE_URL: 'postgres://private' });

test('outbox worker cycle is inert by default', async () => {
  const cycle = new OutboxWorkerCycle(loadRuntimeConfig({}), { dispatch: async () => { throw new Error('not called'); } }, 'worker-1');
  assert.deepEqual(await cycle.runOnce(['org-1']), { state: 'disabled', organisations: 0, claimed: 0, completed: 0, failed: 0 });
});

test('outbox worker cycle performs one bounded tenant-explicit pass', async () => {
  const calls = [];
  const cycle = new OutboxWorkerCycle(enabled(), { dispatch: async (organisationId, workerRef, limit) => { calls.push({ organisationId, workerRef, limit }); return { claimed: 2, completed: 1, failed: 1 }; } }, 'worker-1');
  assert.deepEqual(await cycle.runOnce(['org-1', 'org-1', 'org-2'], 4), { state: 'completed', organisations: 2, claimed: 4, completed: 2, failed: 2 });
  assert.deepEqual(calls, [{ organisationId: 'org-1', workerRef: 'worker-1', limit: 4 }, { organisationId: 'org-2', workerRef: 'worker-1', limit: 4 }]);
  await assert.rejects(() => cycle.runOnce([]), { name: 'InvalidOutboxWorkerConfigurationError' });
});
