# Authorised Reporter Transport Identity

## Status

**Pre-pilot private-identity contract.** No reporter registry, phone number,
provider mapping, facility, or credential record is included in this repository.

`AuthorisedReporterTransportResolver` receives a result only after the provider
signature/timestamp/replay boundary has verified the inbound transport. It asks
an injected private resolver for a controlled reporter-credential binding and
returns the minimum core context: reporter actor, organisation, permitted
facility and credential ID. A rejected webhook, missing binding, inactive
record, malformed record, or lookup failure returns only `null`.

## Data and workflow boundary

`senderReference` is a provider-normalised opaque private reference, not a raw
phone number. The eventual registration workflow must establish the mapping with
the authorised programme owner, record facility/credential lifecycle changes,
and validate revocation/suspension behaviour. It must not rely on a caller's
phone number, free-text body, browser field, or unverified provider metadata.

## Deferred persistence decision

The actual private registry adapter needs a reviewed data model, least-privilege
query path, tenant isolation design, key-management approach for any reversible
contact data, retention rules, and a partner-approved registration workflow.
Those decisions are deliberately not guessed in a public codebase.
