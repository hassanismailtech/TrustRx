# TrustRx API Contract

**Status:** pre-pilot internal contract; no public production API.  
**Data classification:** restricted operational/health-workflow data.

## Versioning

All application endpoints use `/api/v1`. Contract changes require compatibility
assessment, migration note, tests and an ADR when they affect safety, privacy,
workflow or external integration.

## Signal acceptance semantics

`POST /api/v1/signals` is disabled by default. It may be enabled only in an
approved synthetic or pilot environment after authentication, tenant resolution,
reporter entitlement, durable storage, DPIA review and operational approval.

Successful acceptance means `202 Accepted`: the event was structurally accepted
and privately recorded. It does not mean it is verified, clinically true,
escalated or delivered to an official system.

## Required controls before enabling ingress

- Authenticated actor and tenant context.
- Facility/reporter entitlement check.
- Valid protocol version and strict structured parsing.
- Idempotency key plus one-way request fingerprint.
- Size limits, rate limits, replay controls and redacted logs.
- Private-store transaction, audit event and observable failure path.

## Error semantics

| Condition | Contract response |
|---|---|
| Invalid shape/protocol | `400` with stable error code; do not echo raw report body. |
| Actor or tenant not entitled | `403`; disclose no signal existence. |
| Idempotency conflict | `409`; same key with different request fingerprint. |
| Accepted replay | return original safe receipt; do not create a second signal. |
| Ingress not approved/configured | `503`; do not fall back to insecure demo behaviour. |

## Not an integration claim

This document does not define an approved SORMAS, DHIS2 or FHIR interface. Those
contracts follow partner discovery, mapping approval and sandbox verification.
