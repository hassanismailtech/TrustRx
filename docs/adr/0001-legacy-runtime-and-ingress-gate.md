# ADR 0001: Contain the legacy runtime and keep signal ingress closed by default

**Status:** Accepted — 2026-10-30  
**Owner:** TrustRx engineering owner

## Context

The inherited hackathon runtime is CommonJS JavaScript and had an unauthenticated
HTTP path intended for demonstration data. The architecture baseline requires a
typed server, persistent storage, authenticated reporter workflow and a private
pilot approval before real signals exist in the system.

## Decision

- Preserve the legacy runtime only as a containment layer while the typed service
  is scaffolded.
- Keep `POST /api/v1/signals` disabled unless
  `TRUSTRX_ENABLE_SIGNAL_INGRESS=true` is deliberately set in an approved
  synthetic or pilot environment.
- Never treat the current in-memory store as a production persistence mechanism.
- Do not enable real-data ingress until authentication, authorisation,
  idempotency, durable private storage, audit retrieval, DPIA review and pilot
  approval are complete.

## Consequences

The deployed static site cannot inadvertently become a live health-data intake.
The next implementation milestone is a typed service with a migration-managed
private database and an approved reporter authentication design. This decision
does not represent a production launch or a regulatory approval.
