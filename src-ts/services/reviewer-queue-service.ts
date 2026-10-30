import { assertCanReviewSignal, type ActorContext } from '../domain/access-control.js';
import type { ReviewerQueuePage } from '../contracts/reviewer-queue.js';

export interface ReviewerQueueRepository {
  listReviewerQueue(input: { organisationId: string; limit: number; before: string | null }): Promise<ReviewerQueuePage>;
}

export class ReviewerQueueService {
  constructor(private readonly repository: ReviewerQueueRepository) {}

  async list(input: { actor: ActorContext; organisationId: string; limit?: number; before?: string | null }): Promise<ReviewerQueuePage> {
    assertCanReviewSignal(input.actor, input.organisationId);
    const limit = input.limit ?? 25;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      const error = new Error('Reviewer queue limit must be an integer from 1 to 50');
      error.name = 'InvalidReviewerQueueLimitError';
      throw error;
    }
    return this.repository.listReviewerQueue({ organisationId: input.organisationId, limit, before: input.before ?? null });
  }
}
