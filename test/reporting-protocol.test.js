const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeDeliveryReceipt, parseStructuredSms, parseUssdSelection } = require('../build/domain/reporting-protocol.js');

test('parses only the strict, minimum-necessary TRX1 SMS format', () => {
  const report = parseStructuredSms('TRX1|FAC001|CRED001|CHOLERA|2|HIGH|ingress_0123456789abcdef');
  assert.equal(report.channel, 'sms');
  assert.equal(report.syndromeCode, 'CHOLERA');
  assert.equal(report.caseCount, 2);
  assert.throws(() => parseStructuredSms('TRX1|FAC001|CRED001|CHOLERA|2|HIGH|ingress_0123456789abcdef|patient-name'), { name: 'InvalidReportFormatError' });
});

test('maps structured USSD selections and delivery outcomes without trusting delivery as acceptance', () => {
  const report = parseUssdSelection({ facilityRef: 'FAC001', reporterCredentialRef: 'CRED001', syndromeCode: 'cholera', caseCount: '2', severity: 'high', sessionRef: 'ussd_0123456789abcdef' });
  assert.equal(report.channel, 'ussd');
  assert.deepEqual(normalizeDeliveryReceipt({ providerMessageRef: 'MSG_001', status: 'delivered', occurredAt: '2026-10-30T00:00:00.000Z' }).state, 'delivered');
  assert.equal(normalizeDeliveryReceipt({ providerMessageRef: 'MSG_001', status: 'mystery', occurredAt: '2026-10-30T00:00:00.000Z' }).state, 'unknown');
  assert.throws(() => normalizeDeliveryReceipt({ providerMessageRef: 'MSG_001', status: 'delivered', occurredAt: 'not-a-date' }), { name: 'InvalidDeliveryReceiptTimestampError' });
});
