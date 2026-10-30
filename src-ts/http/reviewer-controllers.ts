import type { SignalState } from '../contracts/signal.js';
import type { AuthenticatedActorResolver, HttpRequestContext } from '../ports/authentication.js';
import { ReviewerQueueService } from '../services/reviewer-queue-service.js';
import { ReviewDecisionService } from '../services/review-decision-service.js';

export interface ReviewerHttpResponse { status: number; body: unknown; }
const STATES = new Set<SignalState>(['received', 'under_review', 'verified', 'referred', 'submitted_to_official_channel', 'acknowledged', 'closed', 'rejected']);

function safeError(error: unknown, requestId: string): ReviewerHttpResponse {
  if (error instanceof Error && error.name === 'AccessDeniedError') return { status: 403, body: { error: 'FORBIDDEN', requestId } };
  if (error instanceof Error && /^(Invalid|IdempotencyTenantMismatch)/.test(error.name)) return { status: 400, body: { error: 'INVALID_REQUEST', requestId } };
  return { status: 500, body: { error: 'REVIEW_WORKFLOW_FAILED', requestId } };
}

export class ReviewerQueueController {
  constructor(private readonly auth: AuthenticatedActorResolver, private readonly queue: ReviewerQueueService) {}
  async get(request: HttpRequestContext): Promise<ReviewerHttpResponse> {
    const actor = await this.auth.resolve(request);
    if (!actor) return { status: 401, body: { error: 'UNAUTHENTICATED', requestId: request.requestId } };
    try {
      const limitValue = request.query?.limit;
      const limit = limitValue === undefined ? undefined : Number(limitValue);
      const page = await this.queue.list({ actor, organisationId: actor.organisationId, limit, before: request.query?.before || null });
      return { status: 200, body: { items: page.items, nextCursor: page.nextCursor, requestId: request.requestId } };
    } catch (error) { return safeError(error, request.requestId); }
  }
}

export class ReviewDecisionController {
  constructor(private readonly auth: AuthenticatedActorResolver, private readonly decisions: ReviewDecisionService) {}
  async post(request: HttpRequestContext): Promise<ReviewerHttpResponse> {
    const actor = await this.auth.resolve(request);
    if (!actor) return { status: 401, body: { error: 'UNAUTHENTICATED', requestId: request.requestId } };
    const body = request.body;
    if (!body || typeof body !== 'object') return { status: 400, body: { error: 'INVALID_REQUEST', requestId: request.requestId } };
    const value = body as Record<string, unknown>;
    if (typeof value.id !== 'string' || typeof value.signalId !== 'string' || typeof value.rationale !== 'string' || typeof value.decidedAt !== 'string' || typeof value.expectedState !== 'string' || typeof value.nextState !== 'string' || !STATES.has(value.expectedState as SignalState) || !STATES.has(value.nextState as SignalState)) return { status: 400, body: { error: 'INVALID_REQUEST', requestId: request.requestId } };
    try {
      await this.decisions.decide({ actor, id: value.id, organisationId: actor.organisationId, signalId: value.signalId, expectedState: value.expectedState as SignalState, nextState: value.nextState as SignalState, rationale: value.rationale, decidedAt: value.decidedAt });
      return { status: 202, body: { outcome: 'review_decision_recorded', requestId: request.requestId } };
    } catch (error) { return safeError(error, request.requestId); }
  }
}
