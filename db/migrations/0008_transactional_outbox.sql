-- Outbox payloads contain internal references and protocol metadata only; never raw health-report content.
BEGIN;

CREATE TABLE outbox_events (
  id uuid PRIMARY KEY,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  aggregate_ref text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('integrity_anchor', 'outbound_receipt', 'official_handoff')),
  dedupe_ref text NOT NULL,
  payload jsonb NOT NULL,
  state text NOT NULL CHECK (state IN ('pending', 'processing', 'completed', 'failed', 'abandoned')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  available_at timestamptz NOT NULL DEFAULT now(),
  claimed_by text,
  claimed_until timestamptz,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, event_type, dedupe_ref)
);

ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY outbox_events_tenant_isolation ON outbox_events
  USING (organisation_id = current_organisation_id())
  WITH CHECK (organisation_id = current_organisation_id());

CREATE INDEX outbox_events_claim_idx ON outbox_events (state, available_at) WHERE state IN ('pending', 'failed');

COMMIT;
