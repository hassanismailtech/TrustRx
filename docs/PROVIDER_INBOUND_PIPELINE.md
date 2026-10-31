# Provider Inbound Signal Pipeline

## Status

**Pre-pilot provider-neutral composition; no provider route is active.**

`ProviderInboundSignalIntake` composes four existing fail-closed controls for
SMS-style inbound messages:

1. provider signature, timestamp and durable replay verification;
2. private authorised-reporter credential/facility resolution;
3. strict fixed-format `TRX1` protocol parsing;
4. protocol reference matching against the active reporter binding.

The result is either a minimum structured, identity-bound submission or a
generic rejection. It does not return provider sender references, raw body,
signature, replay key, lookup detail or failure reason.

## Deliberate boundary

The pipeline does not mint IDs, calculate integrity commitments, write the
private signal record, issue a receipt, bind an HTTP route, choose an SMS/USSD
provider, or verify a production provider signature scheme. An approved
provider-specific command factory must turn an accepted submission into the
already-tested `SignalIngressRequest` only after those dependencies and
workflow controls are approved.
