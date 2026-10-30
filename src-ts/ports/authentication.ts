import type { ActorContext } from '../domain/access-control.js';

export interface HttpRequestContext {
  method: string;
  path: string;
  headers: Readonly<Record<string, string | undefined>>;
  query?: Readonly<Record<string, string | undefined>>;
  body: unknown;
  requestId: string;
}

/** Identity providers/adapters must return null for any missing or unverifiable identity. */
export interface AuthenticatedActorResolver {
  resolve(request: HttpRequestContext): Promise<ActorContext | null>;
}
