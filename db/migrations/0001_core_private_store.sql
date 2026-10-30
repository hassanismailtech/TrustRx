-- TrustRx core private store. Apply only through the approved migration runner.
-- This schema stores no public-ledger payload and no real data in this repository.
BEGIN;

CREATE TABLE organisations (
  id uuid PRIMARY KEY,
  external_ref text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE facilities (
  id uuid PRIMARY KEY,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  facility_ref text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'suspended', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, facility_ref)
);

CREATE TABLE reporter_credentials (
  id uuid PRIMARY KEY,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  facility_id uuid NOT NULL REFERENCES facilities(id),
  credential_ref text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'suspended', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (organisation_id, credential_ref)
);

CREATE TABLE signal_reports (
  id uuid PRIMARY KEY,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  facility_id uuid NOT NULL REFERENCES facilities(id),
  reporter_credential_id uuid REFERENCES reporter_credentials(id),
  schema_version text NOT NULL,
  state text NOT NULL CHECK (state IN ('received', 'under_review', 'verified', 'referred', 'submitted_to_official_channel', 'acknowledged', 'closed', 'rejected')),
  syndrome_code text NOT NULL,
  case_count integer NOT NULL CHECK (case_count > 0),
  severity text NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  reported_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL,
  encrypted_detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX signal_reports_review_queue_idx ON signal_reports (organisation_id, state, received_at DESC);

CREATE TABLE integrity_commitments (
  id uuid PRIMARY KEY,
  signal_id uuid NOT NULL UNIQUE REFERENCES signal_reports(id),
  commitment text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('pending', 'anchored', 'failed')),
  hcs_transaction_id text,
  hcs_topic_id text,
  anchored_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  signal_id uuid REFERENCES signal_reports(id),
  actor_ref text,
  action text NOT NULL,
  from_state text,
  to_state text,
  rationale text,
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_events_signal_idx ON audit_events (organisation_id, signal_id, occurred_at);

COMMIT;
