# Authorised Reporter Transport Identity

## Status

**Pre-pilot private-identity contract.** No reporter registry, phone number,
provider mapping, facility, or credential record is included in this repository.

`AuthorisedReporterTransportResolver` receives a result only after the provider
signature/timestamp/replay boundary has verified the inbound transport. It asks
an injected private resolver for a controlled reporter-credential binding and
returns the minimum core context: reporter actor, organisation, permitted
facility and credential IDs plus their expected structured protocol references.
The subsequent authorised-protocol layer rejects any report whose facility or
credential field does not match that binding. A rejected webhook, missing binding, inactive
record, malformed record, or lookup failure returns only `null`.

## Data and workflow boundary

`senderReference` is a provider-normalised opaque private reference, not a raw
phone number. The eventual registration workflow must establish the mapping with
the authorised programme owner, record facility/credential lifecycle changes,
and validate revocation/suspension behaviour. It must not rely on a caller's
phone number, free-text body, browser field, or unverified provider metadata.

## Deferred persistence decision

The private registry baseline now defines `provider_reporter_bindings`, which
stores a provider-normalised opaque sender reference—not a raw phone number—and
enables tenant RLS for normal administration. Inbound resolution happens before
the organisation is known, so it uses a narrowly scoped `SECURITY DEFINER`
function that returns only an active minimum identity record. Public access is
revoked; deployment must grant the runtime role `EXECUTE` on that function only,
never cross-tenant table `SELECT`.

The registration workflow, key-management approach for any reversible contact
data, retention rules, actual provider normalisation, role grants, and
partner-approved credential lifecycle remain controlled deployment decisions.
