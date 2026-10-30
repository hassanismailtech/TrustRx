# TrustRx Product Contract

## Purpose

TrustRx is an offline-first epidemic-intelligence and trust layer for low-resource health systems. It gives designated frontline workers a structured SMS or USSD channel for syndromic signals, provides an independently verifiable chain of event provenance, and helps authorised surveillance teams review and hand off signals into their existing workflow.

TrustRx strengthens the final-mile route to IDSR, SORMAS and DHIS2. It does not replace them.

## Users and customers

- **Reporter:** an authorised CHW, nurse or facility surveillance focal person.
- **Reviewer:** a DSNO, epidemiologist or designated state/programme surveillance official.
- **Buyer:** a state public-health programme or implementing NGO operating a defined facility network.
- **System owner:** the authority that controls case definitions, official-system access and response workflow.

## V1 workflow

1. A registered reporter submits a minimum-necessary syndromic signal through SMS or USSD.
2. TrustRx validates format, reporter/facility entitlement, completeness and duplicate risk.
3. It records the event privately and issues the reporter a receipt/reference.
4. It creates a cryptographic commitment and anchors only that commitment and non-sensitive metadata using Hedera Consensus Service.
5. A reviewer sees the event, supporting provenance evidence and a rules-based priority explanation.
6. The reviewer decides follow-up and the approved official-system handoff. TrustRx records the outcome.

## In scope

- SMS/USSD reporting in low-connectivity contexts.
- Facility/reporter registration, role-based review and audit trail.
- Private event store; HCS integrity anchoring and verifier.
- Rules-first anomaly detection against partner-approved thresholds/baselines.
- Partner-approved FHIR/IDSR/SORMAS/DHIS2 mapping and auditable handoff.
- Aggregated, disclosure-controlled operational dashboards.

## Out of scope

- Diagnosis, clinical treatment advice, prescription, dispensing or e-pharmacy.
- Autonomous outbreak confirmation, public notification or government escalation.
- Patient longitudinal health record, consumer self-reporting or consumer forecasts.
- Patient identifiers, raw report content, exact addresses, facility identities or reporter identities on public ledgers.
- Token issuance, a DAO or sale of individual/re-identifiable health data.

## Truth states

No screen or API may conflate receipt, verification and external action. A report has one of the following states: `received`, `validation_failed`, `under_review`, `verified`, `referred`, `submitted_to_official_channel`, `acknowledged`, `closed`, or `rejected`.

Hedera anchoring proves the integrity and consensus ordering of a commitment. It does not prove the underlying signal is clinically true or officially validated.
