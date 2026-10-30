const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

test('database migrations are ordered and individually transactional', () => {
  const directory = path.join(__dirname, '..', 'db', 'migrations');
  const files = fs.readdirSync(directory).filter((file) => file.endsWith('.sql')).sort();
  assert.deepEqual(files.map((file) => file.slice(0, 4)), ['0001', '0002', '0003', '0004', '0005', '0006', '0007', '0008']);
  for (const file of files) {
    const sql = fs.readFileSync(path.join(directory, file), 'utf8');
    assert.match(sql, /^--|^BEGIN;/);
    assert.match(sql, /BEGIN;/);
    assert.match(sql, /COMMIT;/);
  }
});
