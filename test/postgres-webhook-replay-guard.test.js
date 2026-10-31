const test = require('node:test');
const assert = require('node:assert/strict');
const { PostgresWebhookReplayGuard } = require('../build/adapters/postgres-webhook-replay-guard.js');

function poolWith(results = [{ rows: [], rowCount: 0 }, { rows: [], rowCount: 0 }, { rows: [{ provider_id: 'sms-provider' }], rowCount: 1 }]) {
  const calls = [];
  return {
    calls,
    pool: { connect: async () => ({ query: async (sql, parameters) => { calls.push({ sql, parameters }); return results.shift() ?? { rows: [], rowCount: 0 }; }, release() { calls.push({ release: true }); } }) },
  };
}

test('PostgreSQL replay guard atomically reserves only opaque provider-scoped replay keys', async () => {
  const { pool, calls } = poolWith();
  const guard = new PostgresWebhookReplayGuard(pool);
  assert.equal(await guard.reserve({ providerId: 'sms-provider', replayKey: 'replay-1', expiresAtEpochSeconds: Math.floor(Date.now() / 1000) + 300 }), true);
  assert.match(calls[1].sql, /DELETE FROM provider_webhook_replay_keys/);
  assert.match(calls[2].sql, /INSERT INTO provider_webhook_replay_keys/);
  assert.deepEqual(calls[2].parameters.slice(0, 2), ['sms-provider', 'replay-1']);
  assert.equal(calls.some((call) => typeof call.sql === 'string' && call.sql.includes('TRX1')), false);
  assert.equal(calls.at(-1).release, true);
});

test('PostgreSQL replay guard returns false for an existing unexpired key and rolls back failures', async () => {
  const duplicate = poolWith([{ rows: [], rowCount: 0 }, { rows: [], rowCount: 0 }, { rows: [], rowCount: 0 }]);
  assert.equal(await new PostgresWebhookReplayGuard(duplicate.pool).reserve({ providerId: 'sms-provider', replayKey: 'replay-1', expiresAtEpochSeconds: Math.floor(Date.now() / 1000) + 300 }), false);
  const failing = poolWith();
  failing.pool.connect = async () => ({ query: async (sql) => { failing.calls.push({ sql }); if (/INSERT/.test(sql)) throw new Error('db failed'); return { rows: [], rowCount: 0 }; }, release() { failing.calls.push({ release: true }); } });
  await assert.rejects(() => new PostgresWebhookReplayGuard(failing.pool).reserve({ providerId: 'sms-provider', replayKey: 'replay-1', expiresAtEpochSeconds: Math.floor(Date.now() / 1000) + 300 }));
  assert.equal(failing.calls.some((call) => call.sql === 'ROLLBACK'), true);
});
