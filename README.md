# TrustRx

TrustRx is building offline-first epidemic-intelligence infrastructure for
authorised public-health workflows. It helps registered reporters submit
minimum-necessary syndromic signals, preserves a private audit trail, and gives
authorised reviewers evidence for an approved official-system handoff.

TrustRx strengthens the final-mile route to IDSR, SORMAS and DHIS2. It does not
replace those systems, diagnose patients, confirm outbreaks, trigger public
action autonomously, or operate as a patient record.

## Current status

This repository is an active pre-pilot rebuild. It contains a static public
launch surface and synthetic-data-only implementation foundations. It is not a
live health-data service. Do not submit health information through any deployed
TrustRx site or endpoint.

## System direction

```text
Authorised reporter → structured SMS/USSD → private TrustRx core
  → integrity commitment → authorised reviewer → approved handoff
```

The public integrity layer receives only a non-sensitive commitment and protocol
metadata. Raw signals, patient data, facility identity and reporter identity do
not belong on a public ledger.

## Repository guide

- `public/` — public, static launch experience; no reporting form or health-data intake.
- `src-ts/` — typed replacement-core contracts, domain rules and adapters.
- `db/migrations/` — PostgreSQL private-store baseline; not yet applied to any database.
- `docs/` — public-safe product, architecture and engineering documentation.
- `test/` — synthetic behavioral and migration-contract tests.

Read [AGENTS.md](AGENTS.md) before making changes. The public-document boundary
is defined in [docs/PUBLICATION_POLICY.md](docs/PUBLICATION_POLICY.md).

## Local verification

```bash
npm install
npm test
```

The local environment must provide the pinned TypeScript compiler. CI runs the
same build and test path from the lockfile.

## Safety boundary

No real-data pilot, provider integration, database deployment, SORMAS/DHIS2
handoff or mainnet integrity anchoring is approved by this repository. Those
require partner workflow validation, privacy review, operational controls and
explicit owner approval.

## License

MIT. See [LICENSE](LICENSE).
