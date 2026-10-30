# TrustRx Threat Model

## Assets to protect

- Patient and reporter confidentiality.
- Facility, location and outbreak-signal confidentiality before authorised action.
- Integrity, order and provenance of reports.
- Authorised reviewer decisions and official-channel handoff evidence.
- Hedera operator credentials, KMS keys, API credentials and telecom credentials.
- Availability of the reporter and reviewer workflow during a public-health event.

## Primary threats and required controls

| Threat | Required control |
|---|---|
| Public-ledger disclosure or linkage attack | Never write raw health data, identifiers, direct locations or reversible event references to HCS; perform DPIA and re-identification review for the commitment scheme. |
| Spoofed SMS/USSD report | registered sender/PIN, rate limits, replay/idempotency keys, validation and reviewer confirmation. |
| Political/institutional alteration or suppression | append-only private audit trail, HCS-backed commitments, role separation, documented reviewer disposition and verifier. |
| False-positive signal causes stigma or harmful response | threshold governance, clear unverified status, human review, limited geographic display and escalation SOP. |
| Lost/reused reporter phone | rapid revocation, credential reset, no patient data in message receipts and access review. |
| Credential leakage | no credentials accepted or retained through public API requests; managed secrets/KMS, rotation and environment separation. |
| Vendor outage or message failure | delivery monitoring, queue/retry, failure alerts, manual fallback SOP and event reconciliation. |
| Model bias or opaque alert | rules-first v1, explainable output, local validation, shadow-mode ML and false-alert monitoring. |

## Release gates

No real-data pilot until DPIA, data-processing agreements, incident response, access review, synthetic-data test suite, restore test, external security review and clinical-safety workflow are passed.
