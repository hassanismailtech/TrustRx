# Private Infrastructure Adapter Boundary

## Status

**Pre-pilot interface only.** No cloud account, database, secret manager or
network provider is selected or configured by this repository.

## Contract

`createPrivateDatabasePool` receives an opaque secret reference, resolves it
just in time through a deployment-owned `SecretResolver`, and passes the value
directly to an injected PostgreSQL pool factory. The factory is required to use
`verify-full` TLS and an explicit application name. The helper never logs,
returns, persists or exposes the resolved connection string.

The pool factory must use a runtime database role that cannot apply migrations
or bypass row-level security. Migration tooling uses a separately approved
least-privilege role.

## Non-actions and deployment gate

This is not a database driver, secret-manager implementation, deployment
manifest, or release approval. The current generic runtime configuration still
exists for local/test composition; a production deployment must map its approved
secret-manager reference into this boundary and must not put connection strings
in browser code, public build output, logs or repository files.

Before invoking it outside a synthetic test, the accountable owner must approve
provider region/residency, encryption, key handling, network isolation, backup
and recovery, least-privilege roles, RLS verification, monitoring, and incident
response.
