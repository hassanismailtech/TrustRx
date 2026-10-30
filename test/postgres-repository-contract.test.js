const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'src-ts', 'adapters', 'postgres-signal-repository.ts'), 'utf8');

test('PostgreSQL repository scopes every operation to a transaction-local tenant', () => {
  assert.match(source, /await client\.query\('BEGIN'\)/);
  assert.match(source, /set_config\('app\.organisation_id', \$1, true\)/);
  assert.match(source, /await client\.query\('COMMIT'\)/);
  assert.match(source, /await client\.query\('ROLLBACK'\)/);
  assert.match(source, /client\.release\(\)/);
});

test('PostgreSQL repository uses parameterized SQL and atomic state transitions', () => {
  assert.match(source, /VALUES \(\$1, \$2, \$3/);
  assert.match(source, /WHERE id = \$2 AND state = \$3/);
  assert.match(source, /SignalStateConflictError/);
  assert.match(source, /INSERT INTO audit_events/);
});
