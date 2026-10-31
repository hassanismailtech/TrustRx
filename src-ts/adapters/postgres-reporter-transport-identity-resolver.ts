import type { DatabasePool } from '../ports/database.js';
import type { ReporterTransportIdentityRecord, ReporterTransportIdentityResolver } from '../ports/reporter-transport-identity.js';

type IdentityRow = {
  subject_id: string;
  organisation_id: string;
  facility_id: string;
  reporter_credential_id: string;
  facility_ref: string;
  reporter_credential_ref: string;
  active: boolean;
};

function validReference(value: string, max = 128): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(value) && value.length <= max;
}

/**
 * Calls a narrowly scoped security-definer function. The runtime role must be
 * granted only EXECUTE on that function, never table-wide cross-tenant SELECT.
 */
export class PostgresReporterTransportIdentityResolver implements ReporterTransportIdentityResolver {
  constructor(private readonly pool: DatabasePool) {}

  async resolve(input: { providerId: string; senderReference: string }): Promise<ReporterTransportIdentityRecord | null> {
    if (!validReference(input.providerId, 64) || !validReference(input.senderReference)) {
      const error = new Error('Reporter transport identity lookup is invalid');
      error.name = 'InvalidReporterTransportIdentityLookupError';
      throw error;
    }
    const client = await this.pool.connect();
    try {
      const result = await client.query<IdentityRow>(
        `SELECT subject_id, organisation_id, facility_id, reporter_credential_id, facility_ref, reporter_credential_ref, active
           FROM resolve_active_reporter_transport_binding($1, $2)`,
        [input.providerId, input.senderReference],
      );
      const row = result.rows[0];
      return row ? {
        subjectId: row.subject_id,
        organisationId: row.organisation_id,
        facilityId: row.facility_id,
        reporterCredentialId: row.reporter_credential_id,
        facilityRef: row.facility_ref,
        reporterCredentialRef: row.reporter_credential_ref,
        active: row.active,
      } : null;
    } finally {
      client.release();
    }
  }
}
