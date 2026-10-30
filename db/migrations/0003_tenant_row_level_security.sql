-- Tenant boundary. The approved application role must set app.organisation_id
-- per transaction; database superusers and migration roles are not runtime roles.
BEGIN;

CREATE FUNCTION current_organisation_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.organisation_id', true), '')::uuid;
$$;

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporter_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrity_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY facilities_tenant_isolation ON facilities
  USING (organisation_id = current_organisation_id())
  WITH CHECK (organisation_id = current_organisation_id());

CREATE POLICY reporter_credentials_tenant_isolation ON reporter_credentials
  USING (organisation_id = current_organisation_id())
  WITH CHECK (organisation_id = current_organisation_id());

CREATE POLICY signal_reports_tenant_isolation ON signal_reports
  USING (organisation_id = current_organisation_id())
  WITH CHECK (organisation_id = current_organisation_id());

CREATE POLICY audit_events_tenant_isolation ON audit_events
  USING (organisation_id = current_organisation_id())
  WITH CHECK (organisation_id = current_organisation_id());

-- Integrity rows inherit their tenant boundary from the linked signal report.
CREATE POLICY integrity_commitments_tenant_isolation ON integrity_commitments
  USING (
    EXISTS (
      SELECT 1 FROM signal_reports
      WHERE signal_reports.id = integrity_commitments.signal_id
        AND signal_reports.organisation_id = current_organisation_id()
    )
  );

COMMIT;
