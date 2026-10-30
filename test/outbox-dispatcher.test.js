const test = require('node:test');
const assert = require('node:assert/strict');
const { OutboxDispatcher } = require('../build/services/outbox-dispatcher.js');

test('dispatcher completes handled tenant-scoped events and retries handler failures', async () => {
  const calls = [];
  const events = [
    { id: 'e1', organisationId: 'org-1', aggregateRef: 'signal-1', eventType: 'integrity_anchor', dedupeRef: 'a', payload: {}, state: 'processing', attemptCount: 1 },
    { id: 'e2', organisationId: 'org-1', aggregateRef: 'signal-2', eventType: 'official_handoff', dedupeRef: 'b', payload: {}, state: 'processing', attemptCount: 1 },
  ];
  const outbox = { claim: async (...args) => { calls.push(['claim', args]); return events; }, markCompleted: async (event, worker) => calls.push(['complete', event.id, worker]), markFailed: async (event, worker, code) => calls.push(['failed', event.id, worker, code]) };
  const dispatcher = new OutboxDispatcher(outbox, [{ eventType: 'integrity_anchor', handle: async () => {} }, { eventType: 'official_handoff', handle: async () => { throw new Error('UPSTREAM_TIMEOUT'); } }]);
  assert.deepEqual(await dispatcher.dispatch('org-1', 'worker-1'), { claimed: 2, completed: 1, failed: 1 });
  assert.deepEqual(calls[1], ['complete', 'e1', 'worker-1']);
  assert.deepEqual(calls[2], ['failed', 'e2', 'worker-1', 'UPSTREAM_TIMEOUT']);
});
