import type { HttpRequestContext } from '../ports/authentication.js';
import type { ProtectedRuntime } from '../runtime/protected-runtime.js';

export interface ProtectedRouterResponse {
  status: number;
  body: unknown;
  headers?: Readonly<Record<string, string>>;
}

const ALLOWED_ROUTES = new Map<string, string>([
  ['POST /api/v1/signals', 'signalIngress'],
  ['GET /api/v1/reviewer/queue', 'reviewerQueue'],
  ['POST /api/v1/reviewer/decisions', 'reviewDecision'],
]);

function routeKey(request: HttpRequestContext): string {
  return `${request.method.toUpperCase()} ${request.path}`;
}

function hasKnownPath(request: HttpRequestContext): boolean {
  const path = request.path;
  return [...ALLOWED_ROUTES.keys()].some((key) => key.endsWith(` ${path}`));
}

/**
 * Framework-neutral, exact-match protected route mapper. A deployment adapter
 * must still enforce TLS, body limits, trusted proxy policy, CORS, rate limits,
 * request IDs and provider signature/replay controls before calling this code.
 */
export class ProtectedRouter {
  constructor(private readonly runtime: ProtectedRuntime) {}

  async handle(request: HttpRequestContext): Promise<ProtectedRouterResponse> {
    if (this.runtime.state !== 'ready') {
      return { status: 503, body: { error: 'PROTECTED_RUNTIME_DISABLED', requestId: request.requestId } };
    }
    const route = ALLOWED_ROUTES.get(routeKey(request));
    if (!route) {
      if (hasKnownPath(request)) return { status: 405, body: { error: 'METHOD_NOT_ALLOWED', requestId: request.requestId } };
      return { status: 404, body: { error: 'ROUTE_NOT_FOUND', requestId: request.requestId } };
    }
    if (route === 'signalIngress') return this.runtime.controllers.signalIngress.post(request);
    if (route === 'reviewerQueue') return this.runtime.controllers.reviewerQueue.get(request);
    return this.runtime.controllers.reviewDecision.post(request);
  }
}
