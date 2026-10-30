# Private Store Migrations

`migrations/0001_core_private_store.sql` establishes the minimum private-store
shape for the TrustRx core. It is an implementation baseline, not approval to
process real health data or to provision a database.

Before it is applied, the engineering owner must select the PostgreSQL provider,
region, encryption/key-management model, backup/recovery controls, migration
runner and tenant-isolation strategy through the pilot readiness process. The
application migration must run under a least-privilege database role and include
a tested rollback/recovery plan.
