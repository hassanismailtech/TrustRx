import type { ActorContext } from '../domain/access-control.js';
import type { SignalIngressRequest } from '../services/signal-ingress-service.js';
import type { HttpRequestContext } from './authentication.js';

/** Converts only a validated provider-specific request into the core command. */
export interface SignalIngressRequestFactory {
  create(request: HttpRequestContext, actor: ActorContext): Promise<SignalIngressRequest>;
}
