# Authentication and Transport Boundary

## Rule

The core service never infers identity from an unverified phone number, request
body or frontend field. A provider-specific adapter must resolve an authenticated
actor or return no actor. The HTTP controller fails closed with `401`.

## Layering

1. Provider/webhook adapter verifies its own signature and replay constraints.
2. A provider-owned token verifier checks signature, approved key provenance and
   token integrity. The TrustRx verified-token adapter then validates its
   trusted issuer, audience, expiry, issued-at time, active status and strictly
   allow-listed tenant/role claims.
3. Strict reporting-protocol adapter converts validated transport fields to a
   `SignalIngressRequest`.
4. Core service verifies actor/facility entitlement and idempotency, then writes
   the private record atomically.

No layer logs or returns the raw message body. The controller returns stable,
safe codes and a request ID only.

## Token adapter contract

`VerifiedTokenActorResolver` accepts only a conventional bearer token and an
injected, provider-specific verifier. It cannot verify JWTs itself and must not
be used as evidence that a token was cryptographically verified. A deployment
must configure an approved verifier with key rotation, issuer/audience policy
and replay/session controls appropriate to the identity provider.

It fails closed for missing/malformed credentials; verifier errors; untrusted
issuer/audience; expired or future-issued tokens; inactive identities; missing
tenant claims; and any role outside the TrustRx allow-list. It does not log the
token or claims.

## Current status

The controller contract and a post-verification claim-mapping adapter are
implemented, but ingress remains disabled by default. No identity provider,
SMS/USSD provider, webhook signature, rate limit or public route is connected
yet.
