/**
 * The executor owns approved, partner-specific mappings outside the outbox
 * payload. It receives an opaque handoff reference, never raw report content.
 */
export interface OfficialHandoffExecutor {
  submit(input: { organisationId: string; handoffId: string }): Promise<{ externalReference: string }>;
}
