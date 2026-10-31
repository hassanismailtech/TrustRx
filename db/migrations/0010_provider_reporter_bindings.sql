-- Binds a provider-normalised opaque sender reference to an active private reporter credential. Never store raw phone numbers or message bodies here.
BEGIN;

CREATE TABLE provider_reporter_bindings (
  id uuid PRIMARY KEY,
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  reporter_credential_id uuid NOT NULL REFERENCES reporter_credentials(id),
  provider_id text NOT NULL CHECK (provider_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{2,63}$'),
  sender_reference text NOT NULL CHECK (sender_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$'),
  status text NOT NULL CHECK (status IN ('active', 'suspended', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (provider_id, sender_reference)
);

ALTER TABLE provider_reporter_bindings ENABLE ROW LEVEL SECURITY;

CREATE POLICY provider_reporter_bindings_tenant_isolation ON provider_reporter_bindings
  USING (organisation_id = current_organisation_id())
  WITH CHECK (organisation_id = current_organisation_id());

-- The inbound lookup occurs before tenant identity is known. This controlled
-- function exposes only an active minimum identity record, not the binding table.
CREATE FUNCTION resolve_active_reporter_transport_binding(input_provider_id text, input_sender_reference text)
RETURNS TABLE (
  subject_id text,
  organisation_id text,
  facility_id text,
  reporter_credential_id text,
  facility_ref text,
  reporter_credential_ref text,
  active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT rc.id::text, binding.organisation_id::text, facility.id::text, rc.id::text,
         facility.facility_ref, rc.credential_ref, true
    FROM public.provider_reporter_bindings binding
    JOIN public.reporter_credentials rc ON rc.id = binding.reporter_credential_id
    JOIN public.facilities facility ON facility.id = rc.facility_id
   WHERE binding.provider_id = input_provider_id
     AND binding.sender_reference = input_sender_reference
     AND binding.status = 'active'
     AND rc.status = 'active'
     AND facility.status = 'active'
   LIMIT 1;
$$;

REVOKE ALL ON TABLE provider_reporter_bindings FROM PUBLIC;
REVOKE ALL ON FUNCTION resolve_active_reporter_transport_binding(text, text) FROM PUBLIC;

COMMIT;
