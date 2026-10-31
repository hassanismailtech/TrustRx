const test = require('node:test');
const assert = require('node:assert/strict');
const { ProviderWebhookAuthenticator } = require('../build/services/provider-webhook-authenticator.js');

const input = { providerId: 'sms-provider', signature: 'signature-1', timestampEpochSeconds: 1000, rawBody: 'TRX1|...' };
const verified = { providerId: 'sms-provider', senderReference: 'sender-1', replayKey: 'replay-1' };
const authenticator = (verify, reserve) => new ProviderWebhookAuthenticator({ verify }, { reserve }, () => 1000);

test('provider webhook authenticator requires verified signature and one-time replay reservation', async () => {
  const calls = [];
  const result = await authenticator(async () => verified, async (value) => { calls.push(value); return true; }).authenticate(input);
  assert.deepEqual(result, { kind: 'verified', providerId: 'sms-provider', senderReference: 'sender-1' });
  assert.deepEqual(calls, [{ providerId: 'sms-provider', replayKey: 'replay-1', expiresAtEpochSeconds: 1300 }]);
  assert.equal(JSON.stringify(result).includes('TRX1'), false);
});

test('provider webhook authenticator fails closed for stale, replayed, malformed and verifier-failure requests', async () => {
  assert.deepEqual(await authenticator(async () => verified, async () => true).authenticate({ ...input, timestampEpochSeconds: 699 }), { kind: 'rejected' });
  assert.deepEqual(await authenticator(async () => verified, async () => false).authenticate(input), { kind: 'rejected' });
  assert.deepEqual(await authenticator(async () => ({ ...verified, providerId: 'other-provider' }), async () => true).authenticate(input), { kind: 'rejected' });
  assert.deepEqual(await authenticator(async () => { throw new Error('provider secret must not escape'); }, async () => true).authenticate(input), { kind: 'rejected' });
});
