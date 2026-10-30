import type { SignalState } from '../contracts/signal.js';

const ALLOWED: Record<SignalState, readonly SignalState[]> = {
  received: ['under_review', 'rejected'], under_review: ['verified', 'rejected'], verified: ['referred', 'submitted_to_official_channel'],
  referred: ['closed'], submitted_to_official_channel: ['acknowledged', 'closed'], acknowledged: ['closed'], rejected: [], closed: [],
};

export function assertReviewTransition(from: SignalState, to: SignalState): void {
  if (!ALLOWED[from].includes(to)) { const error = new Error(`Signal cannot transition from ${from} to ${to}`); error.name = 'InvalidReviewTransitionError'; throw error; }
}
