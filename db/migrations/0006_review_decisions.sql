BEGIN;

CREATE TABLE review_decisions (
  id uuid PRIMARY KEY,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  signal_id uuid NOT NULL REFERENCES signal_reports(id),
  reviewer_ref text NOT NULL,
  from_state text NOT NULL,
  to_state text NOT NULL CHECK (to_state IN ('verified', 'rejected', 'referred', 'submitted_to_official_channel', 'acknowledged', 'closed')),
  rationale text NOT NULL,
  decided_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE review_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY review_decisions_tenant_isolation ON review_decisions
  USING (organisation_id = current_organisation_id())
  WITH CHECK (organisation_id = current_organisation_id());

CREATE INDEX review_decisions_signal_idx ON review_decisions (organisation_id, signal_id, decided_at DESC);

COMMIT;
