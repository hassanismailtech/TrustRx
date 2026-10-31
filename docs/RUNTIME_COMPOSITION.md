# Protected Runtime Composition

## Status

**Pre-pilot implementation boundary; not a deployed service.** This document
describes how typed core components are composed, not a deployment approval.

## Purpose and scope

`composeProtectedRuntime` creates the protected controller graph only after
the fail-closed runtime configuration has enabled signal ingress and the
application owner supplies three approved dependencies:

1. a PostgreSQL pool for the private store;
2. an authenticated-actor resolver backed by an approved identity provider;
3. a provider-specific ingress request factory.

The composition reuses one tenant-scoped signal repository for ingress,
reviewer queue and reviewer-decision paths. It makes no direct network,
provider, ledger or worker call while assembling the graph.

## Explicit non-actions

This module does **not** bind an HTTP port, register Express/Fastify routes,
apply database migrations, create a database pool, start an outbox worker,
enable Hedera, permit CORS, configure rate limits, or connect SMS/USSD. Those
are separate deployment decisions with owner approval, evidence and runbooks.

When `TRUSTRX_ENABLE_SIGNAL_INGRESS` is not exactly `true`, composition returns
only a disabled state. When it is enabled, missing dependencies or a disabled
authentication mode fail closed with `InvalidRuntimeCompositionError`.

## Deployment gate

Before any framework adapter consumes a ready controller graph, the accountable
owner must verify approved configuration, migrations, RLS, secret handling,
identity-provider verification, ingress signature/replay controls, rate limits,
structured redacted logging, worker leases, incident response and partner
workflow approval. A passing composition test is not a launch gate.
