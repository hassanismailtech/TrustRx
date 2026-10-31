# Provider Webhook Authentication Boundary

## Status

**Provider-neutral pre-pilot contract.** No SMS/USSD provider, webhook URL,
credential, signature scheme, or replay store is selected or connected.

`ProviderWebhookAuthenticator` accepts an injected provider-owned signature
verifier and atomic replay guard. Before calling the verifier, it bounds the
raw body and signature, validates a short timestamp window, and rejects malformed
provider references. After successful cryptographic verification, it reserves an
opaque provider-scoped replay key. Any invalid input, verifier failure, stale or
future timestamp, malformed result, replay, or guard failure returns only a
generic rejection.

The authenticated result contains only the provider identifier and internal
sender reference. It never returns or logs the raw body, signature, replay key,
or detailed verification failure.

## Required provider adapter work

Before a provider is chosen, an accountable owner must verify its documented
signature canonicalisation, key rotation/provenance, timestamp semantics,
retries, IP/network controls, data-processing terms, sender identity mapping,
and test/sandbox behaviour. The outer HTTP framework must enforce TLS, request
size limits and raw-body preservation before this contract runs. A durable,
tenant-safe replay-guard adapter must be reviewed and tested before activation.
