-- Retains only a one-way request fingerprint, never raw SMS/USSD message text.
BEGIN;

CREATE TABLE idempotency_keys (
  id uuid PRIMARY KEY,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  scope text NOT NULL CHECK (scope IN ('signal_ingress')),
  idempotency_key text NOT NULL,
  request_fingerprint text NOT NULL CHECK (request_fingerprint ~ '^[A-Fa-f0-9]{64}$'),
  status text NOT NULL CHECK (status IN ('reserved', 'completed', 'expired')),
  signal_id uuid REFERENCES signal_reports(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, scope, idempotency_key)
);

ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY idempotency_keys_tenant_isolation ON idempotency_keys
  USING (organisation_id = current_organisation_id())
  WITH CHECK (organisation_id = current_organisation_id());

COMMIT;
