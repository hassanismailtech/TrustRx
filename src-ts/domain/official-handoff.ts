export type OfficialHandoffState = 'queued' | 'submitted' | 'acknowledged' | 'failed' | 'cancelled';
export type OfficialHandoffTarget = 'sormas' | 'dhis2' | 'fhir' | 'other_approved';

const TRANSITIONS: Record<OfficialHandoffState, readonly OfficialHandoffState[]> = {
  queued: ['submitted', 'failed', 'cancelled'], submitted: ['acknowledged', 'failed'], acknowledged: [], failed: ['queued', 'cancelled'], cancelled: [],
};

export function assertOfficialHandoffTransition(from: OfficialHandoffState, to: OfficialHandoffState): void {
  if (!TRANSITIONS[from].includes(to)) { const error = new Error(`Official handoff cannot transition from ${from} to ${to}`); error.name = 'InvalidOfficialHandoffTransitionError'; throw error; }
}

export function assertApprovedTargetProfile(targetProfileRef: string): void {
  if (!/^[A-Z0-9_-]{4,64}$/i.test(targetProfileRef)) { const error = new Error('Target profile reference is invalid'); error.name = 'InvalidTargetProfileReferenceError'; throw error; }
}
