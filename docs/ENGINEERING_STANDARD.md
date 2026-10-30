# TrustRx Engineering Standard

## Delivery rule

Every change must be traceable from a real user workflow to a tested implementation and an observable production outcome. A visually complete feature is not complete when its data classification, safety case, ownership, failure mode, tests, runbook or rollout plan is missing.

## Required before implementation

1. Identify the user role, institutional owner and exact operational workflow.
2. Record the intended outcome, non-goals, data classification, abuse cases and failure modes.
3. Link the applicable workflow, policy, regulatory source or interview evidence in the issue/ADR.
4. Define measurable acceptance criteria, including the expected operational and safety behaviour.
5. Obtain clinical/surveillance and privacy review when the change affects reports, thresholds, alerts, integrations or data access.

## Definition of done

- Code is modular, documented where behaviour is non-obvious and reviewed against the product contract.
- Input validation, authentication/authorisation, audit trail and error behaviour are explicit.
- Tests cover the expected path, validation failures and the highest-risk failure mode.
- No secrets, credentials, raw health data or production copies exist in code, browser state, logs, test fixtures or public ledgers.
- Database changes have migrations, rollback/recovery consideration and backup/restore impact assessed.
- API changes have a versioned contract, idempotency strategy and compatibility plan.
- Infrastructure changes have least privilege, environment separation and deployment/rollback evidence.
- Telemetry is privacy-reviewed and supports an on-call/operator decision.
- The owner accepts the release against the written acceptance criteria.

## Repository controls

- Protected `main`, pull-request review, required tests and dependency/security scanning before production promotion.
- Conventional commits and small, reversible changes; architecture decisions captured in `docs/adr/`.
- No direct production edits or unreviewed manual schema changes.
- Branch previews for UI/flow review; a production promotion only after approval and smoke tests.
- `README.md` describes the current system only. Aspirational capabilities belong in a dated roadmap, never in capability claims.

## Quality gates for TrustRx

| Change type | Additional gate |
|---|---|
| SMS/USSD workflow | usability test with authorised workflow owner; delivery/retry/failure-path evidence |
| health data or location data | DPIA change review, minimisation review and access-control test |
| HCS / integrity design | public-data review, commitment/verifier test and key-management review |
| detection or scoring | local-data evaluation plan, false-alert review, human oversight and monitoring design |
| SORMAS/DHIS2/FHIR integration | partner-approved mapping, sandbox/conformance test and reconciliation procedure |
| production deployment | review, tests, security scan, migration/rollback plan, smoke test and observability check |

## Evidence discipline

Use official sources and named partner documentation for regulations and national workflows. Use structured interviews and observed workflow artefacts to validate assumptions. Every external rule in a design document needs an owner, source URL, retrieval date and next review date.
