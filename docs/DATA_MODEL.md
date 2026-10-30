# TrustRx Private Data Model

**Status:** implementation baseline; synthetic data only.  
**Owner:** TrustRx engineering owner.  
**Review trigger:** any new data field, integration, retention rule or pilot.

## Design rules

- `organisation_id` scopes every operational record.
- PostgreSQL row-level security is the final tenant boundary; application
  authorisation is not enough on its own.
- Health-report content lives only in the private store. No report body,
  patient identifier, exact address, facility identity or reporter identity is
  written to HCS.
- Mutable workflow state is accompanied by append-only audit and review-decision
  records.

## Core entities

| Entity | Purpose | Sensitive fields / handling |
|---|---|---|
| `organisations` | Tenant/root programme boundary | External reference only in public-safe schema. |
| `facilities` | Entitled reporting unit | Private operational reference. |
| `reporter_credentials` | Authorisation/revocation handle | Credential reference; never a secret or phone number. |
| `signal_reports` | Minimum-necessary syndromic event | Private event; optional encrypted detail is not public. |
| `integrity_commitments` | Private link to non-sensitive proof | Commitment only is eligible for integrity anchoring. |
| `audit_events` | Append-only operational trail | Never mutate; correction is a new event. |
| `review_decisions` | Human reviewer rationale/disposition | Requires reviewer role and valid state transition. |
| `idempotency_keys` | Telecom retry protection | One-way fingerprint, never message body. |
| `message_deliveries` | Operational delivery state | No SMS/USSD body stored. |
| `message_delivery_attempts` | Delivery/retry history | Provider reference/error code only. |

## State models

Signal state: `received → under_review → verified → referred | submitted_to_official_channel → acknowledged → closed`; rejection and closure are terminal under the current workflow.

Delivery state: `queued → submitted → delivered | failed`; failure becomes
`retry_scheduled` while within retry budget, otherwise `abandoned`. Delivery is
never evidence that a report was accepted, verified or acted on.

## Retention and encryption

Retention periods, backup location, encryption/KMS configuration and data
processor selection are deliberately deferred until pilot DPIA and contractual
review. The schema does not grant approval to retain real health data.
