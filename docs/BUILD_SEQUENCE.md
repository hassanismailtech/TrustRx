# TrustRx Build Sequence

## Rule

Public visual work may progress in parallel as a non-deployed draft. It must not
displace safety, privacy, operational or institutional-readiness work.

## Ordered delivery path

1. **Core private workflow:** private store, tenancy, audit, authorisation,
   idempotent ingress and structured reporting protocol. **In progress.**
2. **Operational messaging:** delivery reconciliation, retry-safe receipts,
   provider-neutral adapter and failure/reconciliation paths. **Current.**
3. **Reviewer workflow:** queue/query boundary, review decision recording and
   controlled handoff preparation. **Current.**
4. **Approved infrastructure:** private PostgreSQL environment, migrations,
   observability, backup/restore and access-control verification.
5. **Partner integration:** approved SMS/USSD provider, SORMAS/DHIS2/FHIR
   discovery, sandbox mapping and reconciliation.
6. **Pilot readiness:** DPIA, SOPs, contracts, training, usability validation,
   incident response and synthetic rehearsal.
7. **TrustRx Public:** route architecture, design system, copy review, browser
   QA, performance/accessibility validation and a founder-approved deployment.
8. **Launch and funding:** pilot pipeline, grant applications, evidence-backed
   go-to-market and controlled public launch.

The existing public page is a local draft from step 7. It remains un-deployed
until steps 1–3 have a demonstrable workflow slice and the public experience
passes its own review gate.
