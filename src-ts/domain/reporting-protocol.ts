import type { SignalIngressCommand } from '../contracts/signal.js';

export type ReportingChannel = 'sms' | 'ussd';
export type DeliveryState = 'submitted' | 'delivered' | 'failed' | 'unknown';

export interface ParsedReportingSubmission extends SignalIngressCommand {
  channel: ReportingChannel;
  facilityRef: string;
  reporterCredentialRef: string;
  idempotencyKey: string;
}

export interface DeliveryReceipt {
  providerMessageRef: string;
  state: DeliveryState;
  occurredAt: string;
}

const SEVERITIES = new Set<SignalIngressCommand['severity']>(['low', 'moderate', 'high', 'critical']);
const REFERENCE = /^[A-Z0-9_-]{2,48}$/;
const SYNDROME = /^[A-Z][A-Z0-9_]{1,31}$/;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{16,128}$/;

function protocolError(code: string, message: string): never {
  const error = new Error(message);
  error.name = code;
  throw error;
}

function parseCount(value: string): number {
  if (!/^\d{1,4}$/.test(value)) protocolError('InvalidCaseCountError', 'Case count must be an integer from 1 to 9999');
  const count = Number(value);
  if (count < 1 || count > 9999) protocolError('InvalidCaseCountError', 'Case count must be an integer from 1 to 9999');
  return count;
}

function validateField(value: string, pattern: RegExp, code: string): string {
  const normalized = value.trim().toUpperCase();
  if (!pattern.test(normalized)) protocolError(code, 'Structured reporting value is invalid');
  return normalized;
}

function buildSubmission(values: readonly string[], channel: ReportingChannel): ParsedReportingSubmission {
  const [facilityRef, reporterCredentialRef, syndromeCode, caseCount, severity, idempotencyKey] = values;
  if (values.length !== 6 || values.some((value) => value === undefined)) {
    protocolError('InvalidReportFormatError', 'Report contains the wrong number of structured fields');
  }
  const normalizedSeverity = severity.trim().toLowerCase() as SignalIngressCommand['severity'];
  if (!SEVERITIES.has(normalizedSeverity)) protocolError('InvalidSeverityError', 'Severity is invalid');
  if (!IDEMPOTENCY_KEY.test(idempotencyKey.trim())) protocolError('InvalidIdempotencyKeyError', 'Idempotency key is invalid');
  return {
    channel,
    facilityRef: validateField(facilityRef, REFERENCE, 'InvalidFacilityReferenceError'),
    reporterCredentialRef: validateField(reporterCredentialRef, REFERENCE, 'InvalidCredentialReferenceError'),
    syndromeCode: validateField(syndromeCode, SYNDROME, 'InvalidSyndromeCodeError'),
    caseCount: parseCount(caseCount.trim()),
    severity: normalizedSeverity,
    idempotencyKey: idempotencyKey.trim(),
  };
}

/**
 * TRX1 is intentionally fixed-width and contains no patient name, phone number,
 * address, free-text narrative, diagnosis or treatment detail.
 */
export function parseStructuredSms(body: string): ParsedReportingSubmission {
  if (typeof body !== 'string' || body.length > 180) protocolError('InvalidReportFormatError', 'SMS report is invalid');
  const fields = body.trim().split('|');
  if (fields.shift() !== 'TRX1') protocolError('UnsupportedProtocolVersionError', 'Unsupported report protocol');
  return buildSubmission(fields, 'sms');
}

export function parseUssdSelection(selection: { facilityRef: string; reporterCredentialRef: string; syndromeCode: string; caseCount: string; severity: string; sessionRef: string }): ParsedReportingSubmission {
  return buildSubmission([selection.facilityRef, selection.reporterCredentialRef, selection.syndromeCode, selection.caseCount, selection.severity, selection.sessionRef], 'ussd');
}

export function normalizeDeliveryReceipt(receipt: { providerMessageRef: string; status: string; occurredAt: string }): DeliveryReceipt {
  if (!REFERENCE.test(receipt.providerMessageRef.toUpperCase())) protocolError('InvalidProviderMessageReferenceError', 'Provider message reference is invalid');
  const statusMap: Record<string, DeliveryState> = { submitted: 'submitted', sent: 'submitted', delivered: 'delivered', failed: 'failed', undelivered: 'failed' };
  const occurredAt = new Date(receipt.occurredAt);
  if (Number.isNaN(occurredAt.valueOf())) protocolError('InvalidDeliveryReceiptTimestampError', 'Delivery receipt timestamp is invalid');
  return { providerMessageRef: receipt.providerMessageRef, state: statusMap[receipt.status.toLowerCase()] || 'unknown', occurredAt: occurredAt.toISOString() };
}
