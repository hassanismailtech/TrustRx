# TrustRx Documentation Strategy

## Two documentation planes

### Public technical documentation

Public-safe architecture, API contracts, data boundaries, protocol specifications,
ADRs, contributor guidance and release notes belong in this repository. Once the
public product site reaches its route/build gate, these will be published through
a distinct `/docs` experience rather than mixed into marketing pages.

### Controlled operational documentation

Pilot evidence, named workflow maps, DPIAs, DPAs, security assessments,
incident records, access matrices, partner interface details, budgets, funder
pipeline and legal advice stay in controlled storage outside this public repo.
The public repo may link to a sanitised summary, never the source artefact.

## Documentation standard

Each technical document identifies its status, owner, scope, data boundary,
assumptions, interfaces, error/failure modes, verification method and review
trigger. Architecture decisions use `docs/adr/`; code changes update the
relevant document in the same reviewable commit.

## Documentation information architecture

1. **Start here:** product contract, system overview and glossary.
2. **Build:** data model, API contract, reporting protocol, workflow semantics,
   local development and test commands.
3. **Operate:** safe deployment boundary, migration process, observability and
   incident-response summaries (public-safe only).
4. **Govern:** privacy/data boundary, agent governance, publication policy and
   decision records.
5. **Learn:** research/publications and dated changelog/release notes.

## Publishing gate

Documentation publishes only after claim review, accessibility/reading review,
link check and source-date verification. It must never be treated as evidence
of a deployment, integration, pilot result or regulatory approval.
