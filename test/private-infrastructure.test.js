const test = require('node:test');
const assert = require('node:assert/strict');
const { createPrivateDatabasePool } = require('../build/runtime/private-infrastructure.js');

const request = { environment: 'staging', databaseConnectionSecret: { name: 'trustrx/database-url' }, applicationName: 'trustrx-api' };

test('private infrastructure resolves a valid secret just in time and requires full TLS verification', async () => {
  let poolInput;
  const pool = { connect: async () => ({ query: async () => ({ rows: [], rowCount: 0 }), release() {} }) };
  const result = await createPrivateDatabasePool(request, { resolve: async (ref) => { assert.equal(ref.name, 'trustrx/database-url'); return 'postgres://private.example.test/db'; } }, { create: async (input) => { poolInput = input; return pool; } });
  assert.equal(result, pool);
  assert.deepEqual(poolInput, { connectionString: 'postgres://private.example.test/db', applicationName: 'trustrx-api', tls: 'verify-full' });
});

test('private infrastructure fails closed without exposing failed secret material', async () => {
  await assert.rejects(() => createPrivateDatabasePool(request, { resolve: async () => 'https://not-a-database.example.test' }, { create: async () => { throw new Error('not called'); } }), { name: 'PrivateInfrastructureResolutionError' });
  await assert.rejects(() => createPrivateDatabasePool({ ...request, databaseConnectionSecret: { name: '..' } }, { resolve: async () => { throw new Error('not called'); } }, { create: async () => { throw new Error('not called'); } }), { name: 'PrivateInfrastructureResolutionError' });
  await assert.rejects(() => createPrivateDatabasePool(request, { resolve: async () => { throw new Error('provider detail must not escape'); } }, { create: async () => { throw new Error('not called'); } }), { name: 'PrivateInfrastructureResolutionError' });
});
