-- Operational delivery metadata only. Do not store SMS/USSD bodies in these tables.
BEGIN;

CREATE TABLE message_deliveries (
  id uuid PRIMARY KEY,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  signal_id uuid REFERENCES signal_reports(id),
  direction text NOT NULL CHECK (direction IN ('outbound_receipt', 'inbound_report')),
  channel text NOT NULL CHECK (channel IN ('sms', 'ussd')),
  correlation_ref text NOT NULL,
  provider_message_ref text,
  state text NOT NULL CHECK (state IN ('queued', 'submitted', 'delivered', 'failed', 'retry_scheduled', 'abandoned')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at timestamptz,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, direction, correlation_ref)
);

CREATE TABLE message_delivery_attempts (
  id uuid PRIMARY KEY,
  delivery_id uuid NOT NULL REFERENCES message_deliveries(id),
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  provider_message_ref text,
  outcome text NOT NULL CHECK (outcome IN ('submitted', 'delivered', 'failed')),
  error_code text,
  occurred_at timestamptz NOT NULL,
  UNIQUE (delivery_id, attempt_number)
);

ALTER TABLE message_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_delivery_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY message_deliveries_tenant_isolation ON message_deliveries
  USING (organisation_id = current_organisation_id())
  WITH CHECK (organisation_id = current_organisation_id());

CREATE POLICY message_delivery_attempts_tenant_isolation ON message_delivery_attempts
  USING (EXISTS (SELECT 1 FROM message_deliveries WHERE message_deliveries.id = message_delivery_attempts.delivery_id AND message_deliveries.organisation_id = current_organisation_id()));

CREATE INDEX message_deliveries_retry_idx ON message_deliveries (organisation_id, state, next_attempt_at) WHERE state = 'retry_scheduled';

COMMIT;
