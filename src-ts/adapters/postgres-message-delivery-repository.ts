import type { DatabaseClient, DatabasePool } from '../ports/database.js';
import type { DeliveryAttempt, MessageDeliveryRepository, OutboundDeliveryRequest, QueuedDelivery } from '../ports/message-delivery-repository.js';

export class PostgresMessageDeliveryRepository implements MessageDeliveryRepository {
  constructor(private readonly pool: DatabasePool) {}

  async queueOutbound(input: OutboundDeliveryRequest): Promise<{ kind: 'queued' | 'duplicate'; delivery: QueuedDelivery }> {
    return this.withTenant(input.organisationId, async (client) => {
      const inserted = await client.query<QueuedDelivery>(
        `INSERT INTO message_deliveries (id, organisation_id, signal_id, direction, channel, correlation_ref, state)
         VALUES ($1, $2, $3, 'outbound_receipt', $4, $5, 'queued')
         ON CONFLICT (organisation_id, direction, correlation_ref) DO NOTHING
         RETURNING id, state, attempt_count AS "attemptCount"`,
        [input.id, input.organisationId, input.signalId, input.channel, input.correlationRef],
      );
      if (inserted.rows[0]) return { kind: 'queued', delivery: inserted.rows[0] };
      const existing = await client.query<QueuedDelivery>(
        `SELECT id, state, attempt_count AS "attemptCount" FROM message_deliveries
          WHERE direction = 'outbound_receipt' AND correlation_ref = $1`,
        [input.correlationRef],
      );
      if (!existing.rows[0]) throw new Error('Idempotent delivery record could not be recovered');
      return { kind: 'duplicate', delivery: existing.rows[0] };
    });
  }

  async recordAttempt(input: DeliveryAttempt): Promise<QueuedDelivery> {
    return this.withTenant(input.organisationId, async (client) => {
      const updated = await client.query<QueuedDelivery>(
        `UPDATE message_deliveries
            SET state = $1, attempt_count = $2, provider_message_ref = COALESCE($3, provider_message_ref), last_error_code = $4, next_attempt_at = $5, updated_at = now()
          WHERE id = $6 AND state = $7
          RETURNING id, state, attempt_count AS "attemptCount"`,
        [input.nextState, input.attemptNumber, input.providerMessageRef, input.errorCode, input.nextAttemptAt, input.deliveryId, input.expectedState],
      );
      if (updated.rowCount !== 1 || !updated.rows[0]) {
        const error = new Error('Delivery state changed before this provider outcome could be recorded');
        error.name = 'DeliveryStateConflictError';
        throw error;
      }
      await client.query(
        `INSERT INTO message_delivery_attempts (id, delivery_id, attempt_number, provider_message_ref, outcome, error_code, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [input.id, input.deliveryId, input.attemptNumber, input.providerMessageRef, input.nextState === 'submitted' || input.nextState === 'delivered' ? input.nextState : 'failed', input.errorCode, input.occurredAt],
      );
      return updated.rows[0];
    });
  }

  private async withTenant<T>(organisationId: string, work: (client: DatabaseClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.organisation_id', $1, true)", [organisationId]);
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
