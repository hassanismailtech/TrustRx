# Deployment Readiness Evaluator

## Status

**Pre-pilot checklist code; not an activation, release, or compliance approval.**

`evaluateDeploymentReadiness` combines the repository's fail-closed runtime
configuration with opaque references to controlled evidence. It requires a
staging or production configuration with signal ingress, the outbox worker,
database, approved authentication, and integrity anchoring configured. It also
requires a complete migration-readiness result plus controlled review references
for private infrastructure, transport security, identity provider,
observability, incident response, and partner workflow approval.

## Meaning of the result

`eligibleForOwnerReview: true` means the provided values meet this narrow
code-level prerequisite list. It does not check whether the references are true,
apply a migration, contact a provider, start a server, authorise processing, or
release anything. A named accountable owner must still verify the underlying
evidence and approve the next controlled action.

## Data boundary

Only short opaque record references may be supplied. Evidence records, facility
details, participant information, security findings, credentials, connection
strings, legal advice, and partner agreements stay in governed storage outside
this public repository.
