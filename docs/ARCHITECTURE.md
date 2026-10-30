# TrustRx Architecture Baseline

## Design principles

- Offline-first reporting, not web-first reporting with an SMS add-on.
- Minimum necessary data and data minimisation before analysis.
- Private operational record; public integrity commitment.
- Human public-health review before external escalation.
- Integration by approved contract, not by assumptions about SORMAS/DHIS2 APIs.
- Rules first; models in shadow mode until local, permissioned evaluation supports use.

## Target components

```text
SMS/USSD provider
        |
Ingress and message parser -- authentication / rate limit / replay checks
        |
Domain API and workflow service -- private encrypted PostgreSQL store
        |                                  |
        |                                  +-- evidence/object store
        |
Commitment service -- KMS-managed keyed commitment --> Hedera Consensus Service
        |
Reviewer API / web console -- reviewer, facility and tenant RBAC
        |
Rules engine / aggregation service --> approved FHIR or official-system handoff adapter
```

## Data boundary

The encrypted private store contains the full event, workflow state, evidence, permitted contact details, actor and audit records. The ledger contains only a canonical commitment and non-sensitive protocol/version metadata. Keys, salts and lookup information remain off-chain.

## Domain entities

- `Organisation`, `Facility`, `ReporterCredential`, `User`, `RoleAssignment`
- `SignalReport`, `SignalRevision`, `ReviewDecision`, `Escalation`, `OfficialHandoff`
- `IntegrityCommitment`, `HcsReceipt`, `AuditEvent`, `ThresholdRule`, `RulesetVersion`

## Required engineering decisions

1. Adopt TypeScript for all new server code and replace the current in-memory API.
2. Use a persistent relational store with migrations; no report exists only in process memory.
3. Treat the current direct `/api/configure` credential pattern as demo-only and remove it before any non-demo deployment.
4. Use testnet and synthetic events until pilot approval. Mainnet requires an approved cost, key-management and DPIA decision.
5. Define FHIR profiles only after partner interface discovery; an exported JSON shape is not conformance.

## Migration order

1. Preserve the hackathon demo under a `legacy/` tag or branch; do not extend it.
2. Scaffold the TypeScript service, schema, migrations, test harness and synthetic fixtures.
3. Implement private event creation, audit events, commitment generation and HCS testnet verifier.
4. Implement reporter workflow, reviewer queue and rules-based prioritisation.
5. Implement the partner-approved handoff adapter and controlled dashboard.
