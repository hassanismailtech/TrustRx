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

## Code readiness gate

`evaluateMigrationReadiness` checks only opaque references to controlled
evidence. It requires all ordered migrations to have been reviewed, a distinct
migration and runtime role, backup/restore verification, RLS verification,
synthetic smoke-test evidence, and accountable-owner approval. It does not
read a database, apply SQL, validate the evidence, or make a database safe.

The references must point to controlled records outside this public repository.
They must not contain participant data, credentials, connection strings or
security-assessment detail. A `ready` result is an engineering checklist result,
not authorisation to migrate or process health data.

## Prohibited shortcuts

- No manual production schema edit.
- No runtime role with migration privilege.
- No migration against a pilot database without backup/restore evidence.
- No inserting realistic health data as a migration smoke test.

## Rollback principle

Prefer forward corrective migrations. Data-bearing rollback requires a reviewed
recovery plan; it is never an automatic `down` operation.
