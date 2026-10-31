# Outbox Handler Boundaries

## Integrity anchoring

The integrity handler receives only internal references from an outbox event. It
looks up an approved anchor payload in the private store and passes only
`commitment`, `schemaVersion`, and `eventType` to an anchor gateway. It must not
query, log, serialize or send raw report content, patient data, facility
identity or reporter identity.

## Official handoff

The handoff handler receives only an opaque handoff ID. A partner-approved
executor owns mapping and target authentication. The generic worker must not
contain target credentials, hard-coded mapping, or partner payloads.

## Failure model

Handlers throw stable uppercase error codes. The dispatcher records safe error
codes and uses the transactional outbox retry/abandonment model. A failed handler
is not an official-system rejection; reconciliation remains a human operation.

## Worker lifecycle boundary

`OutboxWorkerCycle` performs one bounded, tenant-explicit pass only when
`TRUSTRX_ENABLE_OUTBOX_WORKER` is exactly `true` and a database is configured.
It requires a validated worker reference, a non-empty allow-listed organisation
scope, and a per-organisation cap. It does not discover tenants, poll forever,
fork a process, schedule itself, or install handlers. The deployment owner must
provide supervision, a reviewed tenant schedule, retry-alert handling and the
approved integrity/handoff handlers.
