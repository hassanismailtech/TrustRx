# Migration Operations

## Status

No TrustRx database has been provisioned or migrated. These are pre-pilot
operational safeguards for an approved environment.

## Required sequence

1. Review migration SQL, data classification and rollback/recovery effect.
2. Take and verify a restore-capable backup where applicable.
3. Run migrations with a dedicated migration role—not the runtime role.
4. Verify migration version/checksum, tenant row-level security and role grants.
5. Run synthetic smoke tests for ingestion, review, outbox and restore path.
6. Record evidence in controlled operational documentation.

## Prohibited shortcuts

- No manual production schema edit.
- No runtime role with migration privilege.
- No migration against a pilot database without backup/restore evidence.
- No inserting realistic health data as a migration smoke test.

## Rollback principle

Prefer forward corrective migrations. Data-bearing rollback requires a reviewed
recovery plan; it is never an automatic `down` operation.
