# TrustRx Observability Boundary

## Objective

Operational telemetry must support a human decision—queue delay, failed receipt,
outbox retry, handoff failure or access anomaly—without becoming a shadow store
of health data or credentials.

## Allowed event fields

Only stable operational references and safe scalars are allowed: organisation,
signal, delivery, handoff and outbox IDs; state/outcome; event type; correlation
reference; actor role; error code; and duration. Report body, patient data,
facility detail, phone number, credential, token, private key, raw provider
payload, free text and stack trace are prohibited.

## Minimum signals

- Signal acceptance/rejection count and validation code.
- Reviewer-queue age and state transitions.
- Delivery state, retry/abandonment and provider error code.
- Outbox claim age, retry count, handler outcome and lease conflict.
- Handoff queue/submission/acknowledgement/failure by approved target profile.

## Release gate

Before a pilot, define retention, access, alert thresholds, on-call owner,
dashboard classification, sampling/redaction checks and an incident-response
procedure. No operational log should be used for clinical decision-making.
