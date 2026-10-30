const TRANSITIONS = Object.freeze({
  received: new Set(['under_review', 'rejected']),
  under_review: new Set(['verified', 'rejected']),
  verified: new Set(['referred', 'submitted_to_official_channel']),
  referred: new Set(['closed']),
  submitted_to_official_channel: new Set(['acknowledged', 'closed']),
  acknowledged: new Set(['closed']),
  rejected: new Set(),
  closed: new Set(),
});

function assertValidTransition(from, to) {
  if (!TRANSITIONS[from]) {
    const error = new Error(`Unknown signal state: ${from}`);
    error.code = 'INVALID_SIGNAL_STATE';
    throw error;
  }
  if (!TRANSITIONS[from].has(to)) {
    const error = new Error(`Signal cannot transition from ${from} to ${to}`);
    error.code = 'INVALID_SIGNAL_TRANSITION';
    throw error;
  }
}

module.exports = { TRANSITIONS, assertValidTransition };
