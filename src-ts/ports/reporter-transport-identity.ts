/**
 * All values are private, provider-normalised opaque references. A provider
 * adapter must never pass a raw phone number or unverified sender value here.
 */
export interface ReporterTransportIdentityRecord {
  subjectId: string;
  organisationId: string;
  facilityId: string;
  reporterCredentialId: string;
  facilityRef: string;
  reporterCredentialRef: string;
  active: boolean;
}

export interface ReporterTransportIdentityResolver {
  resolve(input: { providerId: string; senderReference: string }): Promise<ReporterTransportIdentityRecord | null>;
}
