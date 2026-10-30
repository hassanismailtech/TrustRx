# Reviewer Console UX Boundary

## Core job

Help an authorised reviewer understand what requires attention, distinguish
transport/integrity state from clinical truth, record a rationale-backed decision
and see the consequence of that decision.

## Required screens

- Review queue: bounded, tenant-scoped, prioritised operational metadata.
- Signal detail: protected minimum-necessary data, provenance, delivery status
  and decision history.
- Decision composer: valid state choices, required rationale, confirmation and
  audit receipt.
- Handoff tracker: queued/submitted/acknowledged/failed state, never implied
  external acceptance.
- Delivery reconciliation: provider delivery/retry/abandonment operations.

## UX safety rules

- Always label synthetic/demo data and non-verified states.
- Never use red/green alone for severity, validity or actionability.
- Make actor, timestamp, rationale and state transition visible before a
  reviewer confirms an irreversible step.
- Do not expose protected console routes through the public marketing origin.
