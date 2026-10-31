import { parseStructuredSms, parseUssdSelection, type ParsedReportingSubmission } from '../domain/reporting-protocol.js';
import type { AuthorisedReporterTransport } from './authorised-reporter-transport-resolver.js';

export interface ValidatedAuthorisedSubmission extends ParsedReportingSubmission {
  organisationId: string;
  facilityId: string;
  reporterCredentialId: string;
  reporterSubjectId: string;
}

function validateBinding(submission: ParsedReportingSubmission, transport: AuthorisedReporterTransport): ValidatedAuthorisedSubmission | null {
  if (submission.facilityRef !== transport.facilityRef || submission.reporterCredentialRef !== transport.reporterCredentialRef) return null;
  return {
    ...submission,
    organisationId: transport.actor.organisationId,
    facilityId: transport.facilityId,
    reporterCredentialId: transport.reporterCredentialId,
    reporterSubjectId: transport.actor.subjectId,
  };
}

/**
 * Parses only the minimum structured protocol and binds it to the already
 * verified active reporter transport. No raw request body escapes this layer.
 */
export class AuthorisedReportingProtocol {
  parseSms(rawBody: string, transport: AuthorisedReporterTransport): ValidatedAuthorisedSubmission | null {
    try { return validateBinding(parseStructuredSms(rawBody), transport); } catch { return null; }
  }

  parseUssd(selection: Parameters<typeof parseUssdSelection>[0], transport: AuthorisedReporterTransport): ValidatedAuthorisedSubmission | null {
    try { return validateBinding(parseUssdSelection(selection), transport); } catch { return null; }
  }
}
