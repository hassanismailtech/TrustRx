const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { EXPECTED_MIGRATION_IDS } = require('../build/runtime/migration-readiness.js');

test('database migrations are ordered and individually transactional', () => {
  const directory = path.join(__dirname, '..', 'db', 'migrations');
  const files = fs.readdirSync(directory).filter((file) => file.endsWith('.sql')).sort();
  assert.deepEqual(files.map((file) => file.slice(0, 4)), [...EXPECTED_MIGRATION_IDS]);
  for (const file of files) {
    const sql = fs.readFileSync(path.join(directory, file), 'utf8');
    assert.match(sql, /^--|^BEGIN;/);
    assert.match(sql, /BEGIN;/);
    assert.match(sql, /COMMIT;/);
  }
});
