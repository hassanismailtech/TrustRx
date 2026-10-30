import type { DatabaseClient, DatabasePool } from '../ports/database.js';
import type { OutboxEvent, OutboxRepository } from '../ports/outbox-repository.js';
import type { OutboxState } from '../domain/outbox.js';

type OutboxRow = { id: string; organisation_id: string; aggregate_ref: string; event_type: OutboxEvent['eventType']; dedupe_ref: string; payload: Record<string, string>; state: OutboxState; attempt_count: number };

export class PostgresOutboxRepository implements OutboxRepository {
  constructor(private readonly pool: DatabasePool) {}
  async enqueue(event: Omit<OutboxEvent, 'state' | 'attemptCount'>): Promise<{ kind: 'enqueued' | 'duplicate'; id: string }> {
    return this.withTenant(event.organisationId, async (client) => {
      const result = await client.query<{ id: string }>(
        `INSERT INTO outbox_events (id, organisation_id, aggregate_ref, event_type, dedupe_ref, payload, state)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, 'pending')
         ON CONFLICT (organisation_id, event_type, dedupe_ref) DO NOTHING RETURNING id`,
        [event.id, event.organisationId, event.aggregateRef, event.eventType, event.dedupeRef, JSON.stringify(event.payload)],
      );
      if (result.rows[0]) return { kind: 'enqueued', id: result.rows[0].id };
      const existing = await client.query<{ id: string }>(`SELECT id FROM outbox_events WHERE event_type = $1 AND dedupe_ref = $2`, [event.eventType, event.dedupeRef]);
      if (!existing.rows[0]) throw new Error('Idempotent outbox event could not be recovered');
      return { kind: 'duplicate', id: existing.rows[0].id };
    });
  }
  async claimDue(input: { organisationId: string; workerRef: string; leaseSeconds: number; limit: number }): Promise<readonly OutboxEvent[]> {
    return this.withTenant(input.organisationId, async (client) => {
      const result = await client.query<OutboxRow>(
        `WITH candidates AS (
           SELECT id FROM outbox_events
            WHERE state IN ('pending', 'failed') AND available_at <= now() AND (claimed_until IS NULL OR claimed_until < now())
            ORDER BY available_at, created_at LIMIT $1 FOR UPDATE SKIP LOCKED
         )
         UPDATE outbox_events o SET state = 'processing', attempt_count = o.attempt_count + 1, claimed_by = $2,
           claimed_until = now() + ($3::text || ' seconds')::interval, updated_at = now()
          FROM candidates WHERE o.id = candidates.id
          RETURNING o.id, o.organisation_id, o.aggregate_ref, o.event_type, o.dedupe_ref, o.payload, o.state, o.attempt_count`,
        [input.limit, input.workerRef, input.leaseSeconds],
      );
      return result.rows.map((row) => ({ id: row.id, organisationId: row.organisation_id, aggregateRef: row.aggregate_ref, eventType: row.event_type, dedupeRef: row.dedupe_ref, payload: row.payload, state: row.state, attemptCount: row.attempt_count }));
    });
  }
  async complete(input: { id: string; organisationId: string; workerRef: string; expectedState: 'processing' }): Promise<void> { await this.finish({ ...input, nextState: 'completed', errorCode: null, availableAt: null }); }
  async fail(input: { id: string; organisationId: string; workerRef: string; expectedState: 'processing'; nextState: 'failed' | 'abandoned'; errorCode: string; availableAt: string | null }): Promise<void> { await this.finish(input); }
  private async finish(input: { id: string; organisationId: string; workerRef: string; expectedState: 'processing'; nextState: 'completed' | 'failed' | 'abandoned'; errorCode: string | null; availableAt: string | null }): Promise<void> {
    await this.withTenant(input.organisationId, async (client) => {
      const result = await client.query<{ id: string }>(
        `UPDATE outbox_events SET state = $1, last_error_code = $2, available_at = COALESCE($3::timestamptz, available_at), claimed_by = NULL, claimed_until = NULL, updated_at = now()
          WHERE id = $4 AND state = $5 AND claimed_by = $6 RETURNING id`,
        [input.nextState, input.errorCode, input.availableAt, input.id, input.expectedState, input.workerRef],
      );
      if (result.rowCount !== 1) { const error = new Error('Outbox claim was lost before completion'); error.name = 'OutboxClaimConflictError'; throw error; }
    });
  }
  private async withTenant<T>(organisationId: string, work: (client: DatabaseClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try { await client.query('BEGIN'); await client.query("SELECT set_config('app.organisation_id', $1, true)", [organisationId]); const result = await work(client); await client.query('COMMIT'); return result; }
    catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  }
}
