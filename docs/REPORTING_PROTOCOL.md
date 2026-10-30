# TrustRx Structured Reporting Protocol

## Status

Draft, synthetic-data only. It is not yet connected to an SMS, USSD or telecom
provider and must not be used for live surveillance reporting.

## SMS message shape

```text
TRX1|FACILITY_REF|CREDENTIAL_REF|SYNDROME_CODE|CASE_COUNT|SEVERITY|IDEMPOTENCY_KEY
```

Example using synthetic values:

```text
TRX1|FAC001|CRED001|CHOLERA|2|HIGH|ingress_0123456789abcdef
```

The parser accepts no free-text notes, patient name, phone number, address,
diagnosis or treatment detail. `TRX1` may evolve only through a documented,
versioned compatibility decision.

## USSD

USSD uses the same six structured values through a provider adapter; it does not
parse an unstructured message body. Provider session identifiers are accepted as
idempotency keys only after adapter validation.

## Delivery receipts

Delivery state is operational metadata. `delivered` means the telecom provider
reports delivery; it does not mean TrustRx accepted, verified, or escalated the
signal. Receipt bodies must not contain health details.

## Required future controls

Before a live pilot: provider contract, sender verification, anti-replay policy,
rate limits, delivery reconciliation, multilingual usability testing, manual
fallback SOP and workflow-owner approval.
