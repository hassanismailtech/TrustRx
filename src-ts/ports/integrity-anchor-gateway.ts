export interface ApprovedIntegrityAnchorPayload {
  commitment: string;
  schemaVersion: string;
  eventType: 'syndromic-signal';
}

/** The only payload shape permitted to cross the private-store/anchor boundary. */
export interface IntegrityAnchorLookup {
  getApprovedPayload(input: { organisationId: string; signalId: string; integrityCommitmentId: string }): Promise<ApprovedIntegrityAnchorPayload>;
}

export interface IntegrityAnchorGateway {
  anchor(payload: ApprovedIntegrityAnchorPayload): Promise<{ externalReference: string }>;
}
