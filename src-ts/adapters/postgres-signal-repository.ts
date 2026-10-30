import type { IntegrityCommitment, SignalReport, SignalState } from '../contracts/signal.js';
import type { ReviewerQueueItem, ReviewerQueuePage } from '../contracts/reviewer-queue.js';
import type { DatabaseClient, DatabasePool } from '../ports/database.js';
import { classifyReplay } from '../domain/idempotency.js';
import type { AuditEvent, CreateSignalRecord, IdempotentCreateResult, IdempotentSignalCreate, SignalRepository } from '../ports/signal-repository.js';

type SignalRow = {
  id: string;
  schema_version: string;
  state: SignalState;
  received_at: Date | string;
  syndrome_code: string;
  case_count: number;
  severity: SignalReport['severity'];
  facility_ref: string;
  reporter_credential_ref: string | null;
  reported_at: Date | string;
};

type ReviewerQueueRow = {
  signal_id: string;
  facility_ref: string;
  syndrome_code: string;
  case_count: number;
  severity: ReviewerQueueItem['severity'];
  state: SignalState;
  received_at: Date | string;
  integrity_status: ReviewerQueueItem['integrityStatus'];
};

export class PostgresSignalRepository implements SignalRepository {
  constructor(private readonly pool: DatabasePool) {}

  async create(input: CreateSignalRecord): Promise<void> {
    await this.withTenant(input.organisationId, async (client) => {
      await this.persistSignal(client, input);
    });
  }

  async createIdempotent(input: IdempotentSignalCreate): Promise<IdempotentCreateResult> {
    return this.withTenant(input.organisationId, async (client) => {
      const existing = await client.query<{ request_fingerprint: string; status: 'reserved' | 'completed' | 'expired'; signal_id: string | null }>(
        `SELECT request_fingerprint, status, signal_id FROM idempotency_keys
          WHERE scope = $1 AND idempotency_key = $2 FOR UPDATE`,
        [input.idempotency.scope, input.idempotency.key],
      );
      if (existing.rows[0]) {
        const decision = classifyReplay({ ...input.idempotency, requestFingerprint: existing.rows[0].request_fingerprint, status: existing.rows[0].status, signalId: existing.rows[0].signal_id }, input.idempotency.requestFingerprint);
        return decision === 'conflict' ? { kind: 'conflict' } : { kind: 'replay', signalId: existing.rows[0].signal_id };
      }
      await client.query(
        `INSERT INTO idempotency_keys (id, organisation_id, scope, idempotency_key, request_fingerprint, status, signal_id, expires_at)
         VALUES ($1, $2, $3, $4, $5, 'reserved', NULL, $6)`,
        [input.idempotency.id, input.organisationId, input.idempotency.scope, input.idempotency.key, input.idempotency.requestFingerprint, input.idempotency.expiresAt],
      );
      await this.persistSignal(client, input);
      await client.query(
        `UPDATE idempotency_keys SET status = 'completed', signal_id = $1, updated_at = now() WHERE id = $2`,
        [input.signal.id, input.idempotency.id],
      );
      return { kind: 'accepted', signalId: input.signal.id };
    });
  }

  async findById(organisationId: string, signalId: string): Promise<SignalReport | null> {
    return this.withTenant(organisationId, async (client) => {
      const result = await client.query<SignalRow>(
        `SELECT s.id, s.schema_version, s.state, s.received_at, s.syndrome_code, s.case_count, s.severity, f.facility_ref, rc.credential_ref AS reporter_credential_ref, s.reported_at
           FROM signal_reports s
           JOIN facilities f ON f.id = s.facility_id
           LEFT JOIN reporter_credentials rc ON rc.id = s.reporter_credential_id
          WHERE s.id = $1`,
        [signalId],
      );
      return result.rows[0] ? toSignalReport(result.rows[0]) : null;
    });
  }

  async transitionState(input: { organisationId: string; signalId: string; expectedState: SignalState; nextState: SignalState; audit: AuditEvent }): Promise<SignalReport> {
    return this.withTenant(input.organisationId, async (client) => {
      const result = await client.query<SignalRow>(
        `WITH updated AS (
            UPDATE signal_reports
               SET state = $1, updated_at = now()
             WHERE id = $2 AND state = $3
             RETURNING *
         )
         SELECT u.id, u.schema_version, u.state, u.received_at, u.syndrome_code, u.case_count, u.severity, f.facility_ref, rc.credential_ref AS reporter_credential_ref, u.reported_at
           FROM updated u
           JOIN facilities f ON f.id = u.facility_id
           LEFT JOIN reporter_credentials rc ON rc.id = u.reporter_credential_id`,
        [input.nextState, input.signalId, input.expectedState],
      );
      if (result.rowCount !== 1 || !result.rows[0]) {
        const error = new Error('Signal was not found or its state changed before review could be recorded');
        error.name = 'SignalStateConflictError';
        throw error;
      }
      await this.insertAudit(client, input.organisationId, input.audit);
      return toSignalReport(result.rows[0]);
    });
  }

  async listAuditEvents(organisationId: string, signalId: string): Promise<readonly AuditEvent[]> {
    return this.withTenant(organisationId, async (client) => {
      const result = await client.query<AuditEvent>(
        `SELECT id, signal_id AS "signalId", actor_ref AS "actorRef", action, from_state AS "fromState", to_state AS "toState", rationale, occurred_at AS "occurredAt"
           FROM audit_events WHERE signal_id = $1 ORDER BY occurred_at ASC`,
        [signalId],
      );
      return result.rows;
    });
  }

  async listReviewerQueue(input: { organisationId: string; limit: number; before: string | null }): Promise<ReviewerQueuePage> {
    return this.withTenant(input.organisationId, async (client) => {
      const result = await client.query<ReviewerQueueRow>(
        `SELECT s.id AS signal_id, f.facility_ref, s.syndrome_code, s.case_count, s.severity, s.state, s.received_at, ic.status AS integrity_status
           FROM signal_reports s
           JOIN facilities f ON f.id = s.facility_id
           JOIN integrity_commitments ic ON ic.signal_id = s.id
          WHERE s.state IN ('received', 'under_review')
            AND ($1::timestamptz IS NULL OR s.received_at < $1::timestamptz)
          ORDER BY s.received_at DESC, s.id DESC
          LIMIT $2`,
        [input.before, input.limit + 1],
      );
      const hasMore = result.rows.length > input.limit;
      const rows = result.rows.slice(0, input.limit);
      const finalRow = rows.at(-1);
      return {
        items: rows.map((row) => ({ signalId: row.signal_id, facilityRef: row.facility_ref, syndromeCode: row.syndrome_code, caseCount: row.case_count, severity: row.severity, state: row.state, receivedAt: new Date(row.received_at).toISOString(), integrityStatus: row.integrity_status })),
        nextCursor: hasMore && finalRow ? new Date(finalRow.received_at).toISOString() : null,
      };
    });
  }

  async recordDecision(input: { id: string; organisationId: string; signalId: string; reviewerRef: string; expectedState: SignalState; nextState: SignalState; rationale: string; decidedAt: string }): Promise<void> {
    await this.withTenant(input.organisationId, async (client) => {
      const updated = await client.query<{ id: string }>(
        `UPDATE signal_reports SET state = $1, updated_at = now()
          WHERE id = $2 AND state = $3 RETURNING id`,
        [input.nextState, input.signalId, input.expectedState],
      );
      if (updated.rowCount !== 1) {
        const error = new Error('Signal state changed before the review decision could be recorded');
        error.name = 'SignalStateConflictError';
        throw error;
      }
      await client.query(
        `INSERT INTO review_decisions (id, organisation_id, signal_id, reviewer_ref, from_state, to_state, rationale, decided_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [input.id, input.organisationId, input.signalId, input.reviewerRef, input.expectedState, input.nextState, input.rationale, input.decidedAt],
      );
      await this.insertAudit(client, input.organisationId, { id: input.id, signalId: input.signalId, actorRef: input.reviewerRef, action: 'signal.state_transition', fromState: input.expectedState, toState: input.nextState, rationale: input.rationale, occurredAt: input.decidedAt });
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

  private async insertAudit(client: DatabaseClient, organisationId: string, audit: AuditEvent): Promise<void> {
    await client.query(
      `INSERT INTO audit_events (id, organisation_id, signal_id, actor_ref, action, from_state, to_state, rationale, occurred_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [audit.id, organisationId, audit.signalId, audit.actorRef, audit.action, audit.fromState, audit.toState, audit.rationale, audit.occurredAt],
    );
  }

  private async persistSignal(client: DatabaseClient, input: CreateSignalRecord): Promise<void> {
    await client.query(
      `INSERT INTO signal_reports
        (id, organisation_id, facility_id, reporter_credential_id, schema_version, state, syndrome_code, case_count, severity, reported_at, received_at, encrypted_detail)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NULL)`,
      [input.signal.id, input.organisationId, input.facilityId, input.reporterCredentialId, input.signal.schemaVersion, input.signal.state, input.signal.syndromeCode, input.signal.caseCount, input.signal.severity, input.signal.reportedAt, input.signal.receivedAt],
    );
    await client.query(
      `INSERT INTO integrity_commitments (id, signal_id, commitment, status, hcs_transaction_id, hcs_topic_id, anchored_at)
       VALUES ($1, $2, $3, $4, NULL, NULL, NULL)`,
      [input.integrity.id, input.signal.id, input.integrity.commitment, input.integrity.status],
    );
    await this.insertAudit(client, input.organisationId, input.audit);
  }
}

function toSignalReport(row: SignalRow): SignalReport {
  return {
    id: row.id,
    schemaVersion: row.schema_version,
    state: row.state,
    receivedAt: new Date(row.received_at).toISOString(),
    facilityRef: row.facility_ref,
    syndromeCode: row.syndrome_code,
    caseCount: row.case_count,
    severity: row.severity,
    reporterCredentialRef: row.reporter_credential_ref,
    reportedAt: new Date(row.reported_at).toISOString(),
    coarseLocation: null,
    notes: null,
  };
}
