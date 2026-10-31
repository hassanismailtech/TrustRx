# Framework Request Normalization

## Status

**Pre-pilot transport boundary; no framework is selected or connected.**

`normalizeFrameworkRequest` turns an already framework-parsed request into the
small `HttpRequestContext` accepted by the protected router. It permits only
the exact protected paths and `GET`/`POST`; a small header allow-list; bounded,
single-value header/query values; and locally generated request IDs. It ignores
unrecognised headers and rejects unrecognised or malformed query parameters.

The helper never logs or serialises the body, accepts a client-provided request
ID, verifies a provider signature, parses a body, or sets CORS/security headers.

## Outer-adapter obligations

The eventual framework adapter must reject oversize bodies before parsing;
enforce TLS and trusted-proxy policy; configure security headers and explicit
CORS; generate cryptographically appropriate request IDs; parse only expected
content types; verify provider signatures/timestamps/replay protections; apply
rate limits; and emit only redacted telemetry. It must not pass a raw Node or
framework request object into business logic.

This is a contract for an approved future deployment adapter, not permission to
expose reporting or reviewer endpoints publicly.
