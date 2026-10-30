import type { DatabaseClient, DatabasePool } from '../ports/database.js';
import type { OfficialHandoffRepository, QueueOfficialHandoff } from '../ports/official-handoff-repository.js';
import type { OfficialHandoffState } from '../domain/official-handoff.js';

export class PostgresOfficialHandoffRepository implements OfficialHandoffRepository {
  constructor(private readonly pool: DatabasePool) {}
  async queue(input: QueueOfficialHandoff): Promise<{ kind: 'queued' | 'duplicate'; id: string; state: OfficialHandoffState }> {
    return this.withTenant(input.organisationId, async (client) => {
      const inserted = await client.query<{ id: string; state: OfficialHandoffState }>(
        `INSERT INTO official_handoffs (id, organisation_id, signal_id, requested_by_ref, target_kind, target_profile_ref, correlation_ref, state)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'queued')
         ON CONFLICT (organisation_id, target_profile_ref, correlation_ref) DO NOTHING RETURNING id, state`,
        [input.id, input.organisationId, input.signalId, input.requestedByRef, input.targetKind, input.targetProfileRef, input.correlationRef],
      );
      if (inserted.rows[0]) return { kind: 'queued', ...inserted.rows[0] };
      const existing = await client.query<{ id: string; state: OfficialHandoffState }>(
        `SELECT id, state FROM official_handoffs WHERE target_profile_ref = $1 AND correlation_ref = $2`, [input.targetProfileRef, input.correlationRef],
      );
      if (!existing.rows[0]) throw new Error('Idempotent official handoff record could not be recovered');
      return { kind: 'duplicate', ...existing.rows[0] };
    });
  }
  private async withTenant<T>(organisationId: string, work: (client: DatabaseClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try { await client.query('BEGIN'); await client.query("SELECT set_config('app.organisation_id', $1, true)", [organisationId]); const result = await work(client); await client.query('COMMIT'); return result; }
    catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  }
}
