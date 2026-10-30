import { assertCanReviewSignal, type ActorContext } from '../domain/access-control.js';
import { assertReviewTransition } from '../domain/review-workflow.js';
import type { SignalState } from '../contracts/signal.js';

export interface ReviewDecisionRepository {
  recordDecision(input: { id: string; organisationId: string; signalId: string; reviewerRef: string; expectedState: SignalState; nextState: SignalState; rationale: string; decidedAt: string }): Promise<void>;
}

export class ReviewDecisionService {
  constructor(private readonly repository: ReviewDecisionRepository) {}
  async decide(input: { actor: ActorContext; id: string; organisationId: string; signalId: string; expectedState: SignalState; nextState: SignalState; rationale: string; decidedAt: string }): Promise<void> {
    assertCanReviewSignal(input.actor, input.organisationId);
    assertReviewTransition(input.expectedState, input.nextState);
    if (input.rationale.trim().length < 8 || input.rationale.length > 1000) { const error = new Error('Review rationale must be 8–1000 characters'); error.name = 'InvalidReviewRationaleError'; throw error; }
    await this.repository.recordDecision({ ...input, reviewerRef: input.actor.subjectId });
  }
}
