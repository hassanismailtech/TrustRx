-- Handoff records prove operational disposition, not partner-system acceptance.
BEGIN;

CREATE TABLE official_handoffs (
  id uuid PRIMARY KEY,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  signal_id uuid NOT NULL REFERENCES signal_reports(id),
  requested_by_ref text NOT NULL,
  target_kind text NOT NULL CHECK (target_kind IN ('sormas', 'dhis2', 'fhir', 'other_approved')),
  target_profile_ref text NOT NULL,
  correlation_ref text NOT NULL,
  state text NOT NULL CHECK (state IN ('queued', 'submitted', 'acknowledged', 'failed', 'cancelled')),
  external_reference text,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  acknowledged_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, target_profile_ref, correlation_ref)
);

ALTER TABLE official_handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY official_handoffs_tenant_isolation ON official_handoffs
  USING (organisation_id = current_organisation_id())
  WITH CHECK (organisation_id = current_organisation_id());

CREATE INDEX official_handoffs_pending_idx ON official_handoffs (organisation_id, state, created_at) WHERE state IN ('queued', 'failed');

COMMIT;
