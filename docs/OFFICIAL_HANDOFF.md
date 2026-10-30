# Official-System Handoff Boundary

## Meaning

An official handoff is a human-authorised operational request to an approved
target profile. It is not an integration claim, an automatic escalation, or
evidence that an external system accepted the record.

## Preconditions

- Signal is `verified` by an authorised reviewer.
- Actor has the official-channel operator, tenant-admin or platform-admin role.
- Target profile is approved by the system owner and recorded outside public
  documentation where it contains partner-specific detail.
- Mapping, sandbox/conformance and reconciliation approach are accepted for the
  target workflow.

## State semantics

`queued` means ready for an approved adapter. `submitted` means the adapter has
made an external request. `acknowledged` requires target-system evidence.
`failed` and `cancelled` are operational outcomes requiring review. A signal
does not become `submitted_to_official_channel` merely because a handoff was
queued.

## Reliability boundary

Creating a new handoff also creates a deduplicated `official_handoff` outbox
event in the same private database transaction. A duplicate handoff request
returns the existing record and does not create a second external action.
