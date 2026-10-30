# Authentication and Transport Boundary

## Rule

The core service never infers identity from an unverified phone number, request
body or frontend field. A provider-specific adapter must resolve an authenticated
actor or return no actor. The HTTP controller fails closed with `401`.

## Layering

1. Provider/webhook adapter verifies its own signature and replay constraints.
2. Authentication adapter resolves a registered TrustRx actor and tenant.
3. Strict reporting-protocol adapter converts validated transport fields to a
   `SignalIngressRequest`.
4. Core service verifies actor/facility entitlement and idempotency, then writes
   the private record atomically.

No layer logs or returns the raw message body. The controller returns stable,
safe codes and a request ID only.

## Current status

The controller contract is implemented but disabled by default. No identity
provider, SMS/USSD provider, webhook signature, rate limit or public route is
connected yet.
