# Deployment Readiness

## Current state

TrustRx is not approved for a real-data deployment. The runtime configuration
loader is a fail-closed engineering control, not a deployment authorisation.

## Required configuration gates

Enabled ingress requires a private database URL, commitment secret, explicit
allowed origin and approved authentication adapter. Production ingress also
requires a complete integrity-anchor configuration. Wildcard CORS and partial
anchor configuration are rejected.

## Required non-configuration gates

- Approved database provider, region, processor terms and key-management model.
- Migration execution, restore test, tenant-isolation test and least-privilege
  runtime/database roles.
- Provider webhook signature/replay protection, rate limiting and reconciliation.
- DPIA, data-processing agreement, incident plan, operational owner and pilot
  workflow approval.
- Security review, synthetic load/recovery test and observability runbook.

## Safe readiness endpoint

Future health/readiness output may disclose component configuration state only.
It must never disclose a connection string, secret, topic ID, account ID,
facility, tenant, provider payload or internal error trace.
