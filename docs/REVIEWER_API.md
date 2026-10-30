# Reviewer API Boundary

Reviewer API routes are protected operational interfaces, not public endpoints.
They require resolved actor identity, tenant-scoped queue access and human role
authorisation. The queue exposes only reviewer-necessary event metadata; it
does not expose raw SMS/USSD transport content.

Review-decision input requires a signal reference, expected state, next state,
rationale and decision time. A decision is accepted only when the actor is
authorised and the state transition is valid. Conflict, authorisation and input
errors return stable safe codes without leaking signal existence or content.
