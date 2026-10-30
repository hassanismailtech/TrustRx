import type { AuthenticatedActorResolver, HttpRequestContext } from '../ports/authentication.js';
import type { SignalIngressRequestFactory } from '../ports/signal-ingress-request-factory.js';
import { SignalIngressService } from '../services/signal-ingress-service.js';

export interface HttpResponse { status: number; body: Readonly<Record<string, string>>; }

export class SignalIngressController {
  constructor(private readonly auth: AuthenticatedActorResolver, private readonly factory: SignalIngressRequestFactory, private readonly ingress: SignalIngressService, private readonly enabled = false) {}
  async post(request: HttpRequestContext): Promise<HttpResponse> {
    if (!this.enabled) return { status: 503, body: { error: 'SIGNAL_INGRESS_DISABLED', requestId: request.requestId } };
    const actor = await this.auth.resolve(request);
    if (!actor) return { status: 401, body: { error: 'UNAUTHENTICATED', requestId: request.requestId } };
    try {
      const command = await this.factory.create(request, actor);
      const result = await this.ingress.accept(command);
      if (result.kind === 'conflict') return { status: 409, body: { error: 'IDEMPOTENCY_CONFLICT', requestId: request.requestId } };
      return { status: result.kind === 'accepted' ? 202 : 200, body: { outcome: result.kind, signalRef: result.signalId || '', requestId: request.requestId } };
    } catch (error) {
      if (error instanceof Error && error.name === 'AccessDeniedError') return { status: 403, body: { error: 'FORBIDDEN', requestId: request.requestId } };
      if (error instanceof Error && /^(Invalid|Unsupported|IdempotencyTenantMismatch)/.test(error.name)) return { status: 400, body: { error: 'INVALID_REQUEST', requestId: request.requestId } };
      return { status: 500, body: { error: 'SIGNAL_INGRESS_FAILED', requestId: request.requestId } };
    }
  }
}
