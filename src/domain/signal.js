const crypto = require('node:crypto');

const SIGNAL_SCHEMA_VERSION = '2026-10-30.1';
const ALLOWED_SEVERITIES = new Set(['low', 'moderate', 'high', 'critical']);

function validateSignal(input) {
  const errors = [];
  const cases = Number(input.caseCount);
  if (!input.facilityRef || typeof input.facilityRef !== 'string') errors.push('facilityRef is required');
  if (!input.syndromeCode || typeof input.syndromeCode !== 'string') errors.push('syndromeCode is required');
  if (!Number.isInteger(cases) || cases < 1) errors.push('caseCount must be a positive integer');
  if (!ALLOWED_SEVERITIES.has(input.severity)) errors.push('severity must be low, moderate, high, or critical');
  return errors;
}

function createSignal(input, { id = crypto.randomUUID(), receivedAt = new Date() } = {}) {
  const errors = validateSignal(input);
  if (errors.length) {
    const error = new Error(errors.join('; '));
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  return {
    id,
    schemaVersion: SIGNAL_SCHEMA_VERSION,
    state: 'received',
    receivedAt: receivedAt.toISOString(),
    facilityRef: input.facilityRef.trim(),
    syndromeCode: input.syndromeCode.trim().toUpperCase(),
    caseCount: Number(input.caseCount),
    severity: input.severity,
    reporterCredentialRef: input.reporterCredentialRef || null,
    reportedAt: input.reportedAt || receivedAt.toISOString(),
    coarseLocation: input.coarseLocation || null,
    notes: input.notes || null,
  };
}

function canonicalCommitmentEnvelope(signal) {
  return JSON.stringify({ eventId: signal.id, eventType: 'syndromic-signal', schemaVersion: signal.schemaVersion, receivedDate: signal.receivedAt.slice(0, 10) });
}

function createCommitment(signal, secret) {
  if (!secret) throw new Error('TRUSTRX_COMMITMENT_SECRET is required to create integrity commitments');
  return crypto.createHmac('sha256', secret).update(canonicalCommitmentEnvelope(signal)).digest('hex');
}

module.exports = { SIGNAL_SCHEMA_VERSION, canonicalCommitmentEnvelope, createCommitment, createSignal };
