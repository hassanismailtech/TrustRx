# Private Store Migrations

`migrations/0001_core_private_store.sql` establishes the minimum private-store
shape for the TrustRx core. It is an implementation baseline, not approval to
process real health data or to provision a database.

`0002_immutable_audit_events.sql` makes database audit rows append-only.
`0003_tenant_row_level_security.sql` enables PostgreSQL row-level security for
tenant-owned operational records. The runtime repository must set
`app.organisation_id` inside every transaction and use a role that cannot bypass
row-level security; this is verified against a real database before any pilot.
`0004_idempotency_keys.sql` records a bounded idempotency key and one-way
request fingerprint so telecom retries cannot create duplicate signals. It never
stores raw message content.

Before it is applied, the engineering owner must select the PostgreSQL provider,
region, encryption/key-management model, backup/recovery controls, migration
runner and tenant-isolation strategy through the pilot readiness process. The
application migration must run under a least-privilege database role and include
a tested rollback/recovery plan.
