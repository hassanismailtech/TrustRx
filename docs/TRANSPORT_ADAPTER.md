# Protected Transport Adapter Boundary

## Status

**Pre-pilot code boundary; no HTTP server is registered or deployed.**

`ProtectedRouter` maps only three exact protected routes to an already-ready
TrustRx runtime:

- `POST /api/v1/signals`
- `GET /api/v1/reviewer/queue`
- `POST /api/v1/reviewer/decisions`

It returns stable, minimal `404`, `405` or disabled-runtime `503` responses and
does not perform wildcard routing, static-file serving, identity extraction,
body parsing, logging or CORS.

## Required outer adapter controls

The eventual framework/server adapter is responsible for terminating TLS;
generating and validating request IDs; restricting body size and content type;
normalising a bounded header/query set; enforcing explicit CORS policy; applying
rate limits and DDoS protections; verifying provider signatures and replay
protection; resolving identity; and emitting only redacted telemetry. It passes
the resulting `HttpRequestContext` to the router.

The public Vercel site is not this outer adapter and must never proxy health
reporting or reviewer routes.

## Activation gate

The router can be constructed with a disabled runtime but exposes no protected
workflow while disabled. A ready runtime still does not authorise an external
listener: owner approval of the deployment, migration, provider, security and
partner-workflow gates remains required.
