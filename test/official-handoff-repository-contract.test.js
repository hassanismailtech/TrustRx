const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'src-ts', 'adapters', 'postgres-official-handoff-repository.ts'), 'utf8');

test('new official handoff queues a deduplicated outbox event in the same transaction', () => {
  assert.match(source, /INSERT INTO official_handoffs/);
  assert.match(source, /INSERT INTO outbox_events/);
  assert.match(source, /event_type, dedupe_ref, payload, state/);
  assert.match(source, /'official_handoff'/);
});
