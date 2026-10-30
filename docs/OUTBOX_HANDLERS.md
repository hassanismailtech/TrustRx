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
