# ADR 0002: Separate the public web surface from the regulated TrustRx core

**Status:** Accepted — 2026-10-30  
**Owner:** TrustRx engineering owner

## Context

The existing Vercel project is a public static-site deployment in `iad1`. The
TrustRx core will handle sensitive health-workflow data and must be selected only
after privacy, data-transfer, availability, procurement and operator decisions.

## Decision

- Keep Vercel limited to public marketing content and non-sensitive preview UI
  until an approved deployment assessment says otherwise.
- Build the core as a typed HTTP/service workload with a private,
  migration-managed PostgreSQL database and a serverless-compatible connection
  pool in a region selected through the pilot's DPIA and data-transfer review.
- Use a durable queue or workflow engine for telecom delivery reconciliation,
  HCS anchoring retries and official-system handoff; do not perform those tasks
  inline with reporter requests.
- Separate credentials, logs, monitoring and deployment permissions for public
  web and regulated core environments.

## Consequences

The public website can iterate quickly without becoming a collection point for
health data. Core-hosting provider, region and processor agreements remain an
explicit pilot-readiness decision; this ADR does not approve a cross-border
transfer or a production deployment.
