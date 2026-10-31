import type { DatabaseClient, DatabasePool } from '../ports/database.js';
import type { WebhookReplayGuard } from '../ports/provider-webhook.js';

function validReference(value: string, max = 128): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(value) && value.length <= max;
}

/**
 * Global-by-provider replay protection is intentional: tenant identity is not
 * trusted or necessarily known until after provider authentication. No raw
 * payload, signature, sender or health content is retained.
 */
export class PostgresWebhookReplayGuard implements WebhookReplayGuard {
  constructor(private readonly pool: DatabasePool) {}

  async reserve(input: { providerId: string; replayKey: string; expiresAtEpochSeconds: number }): Promise<boolean> {
    if (!validReference(input.providerId, 64) || !validReference(input.replayKey) || !Number.isSafeInteger(input.expiresAtEpochSeconds) || input.expiresAtEpochSeconds <= Math.floor(Date.now() / 1000)) {
      const error = new Error('Webhook replay reservation input is invalid');
      error.name = 'InvalidWebhookReplayReservationError';
      throw error;
    }
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `DELETE FROM provider_webhook_replay_keys
          WHERE provider_id = $1 AND replay_key = $2 AND expires_at < now()`,
        [input.providerId, input.replayKey],
      );
      const result = await client.query<{ provider_id: string }>(
        `INSERT INTO provider_webhook_replay_keys (provider_id, replay_key, expires_at)
         VALUES ($1, $2, to_timestamp($3))
         ON CONFLICT (provider_id, replay_key) DO NOTHING
         RETURNING provider_id`,
        [input.providerId, input.replayKey, input.expiresAtEpochSeconds],
      );
      await client.query('COMMIT');
      return result.rowCount === 1;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
