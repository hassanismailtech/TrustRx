# TrustRx Product Documentation

These documents define the product contract for the re-engineering of TrustRx. They are deliberately small: research papers, applications and pitch materials remain evidence and context, but do not override these implementation decisions without an explicit architecture decision record.

## Authority order

1. Signed pilot agreement, approved public-health workflow and applicable law/regulator instruction.
2. `PRODUCT_CONTRACT.md` — what TrustRx is, does and does not do.
3. `ARCHITECTURE.md` — system boundaries and data flows.
4. `THREAT_MODEL.md` — unacceptable risks and required controls.
5. `PILOT_PROTOCOL.md` — the bounded first deployment and success measures.
6. Dated architecture decision records in `adr/` when created.

## Status

Version 0.1 is the implementation baseline. It must be reviewed with the founding, clinical-surveillance and privacy owners before any real data is processed. All development until then uses synthetic data only.
