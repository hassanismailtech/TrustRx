import type { ActorContext, ActorRole } from '../domain/access-control.js';
import type { AuthenticatedActorResolver, HttpRequestContext } from '../ports/authentication.js';

/**
 * Claims only reach this adapter after the provider-specific verifier has
 * checked signature, key provenance and token integrity. This adapter enforces
 * TrustRx's tenancy and authorisation claims; it is not a JWT implementation.
 */
export interface VerifiedIdentityClaims {
  issuer: string;
  audience: string | readonly string[];
  subject: string;
  organisationId: string;
  roles: readonly string[];
  permittedFacilityIds: readonly string[];
  active: boolean;
  expiresAtEpochSeconds: number;
  issuedAtEpochSeconds: number;
}

export interface VerifiedBearerTokenReader {
  verify(token: string): Promise<VerifiedIdentityClaims | null>;
}

export interface VerifiedTokenActorResolverOptions {
  trustedIssuer: string;
  requiredAudience: string;
  maxClockSkewSeconds?: number;
  nowEpochSeconds?: () => number;
}

const ACTOR_ROLES = new Set<ActorRole>([
  'reporter',
  'reviewer',
  'official_channel_operator',
  'tenant_admin',
  'platform_admin',
]);

function bearerToken(headers: Readonly<Record<string, string | undefined>>): string | null {
  const value = headers.authorization ?? headers.Authorization;
  if (!value) return null;
  const match = /^Bearer ([A-Za-z0-9._~-]+)$/.exec(value);
  return match?.[1] ?? null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function mapsToActor(
  claims: VerifiedIdentityClaims,
  options: Required<Pick<VerifiedTokenActorResolverOptions, 'trustedIssuer' | 'requiredAudience' | 'maxClockSkewSeconds'>>,
  nowEpochSeconds: number,
): ActorContext | null {
  const audience = Array.isArray(claims.audience) ? claims.audience : [claims.audience];
  if (claims.issuer !== options.trustedIssuer || !audience.includes(options.requiredAudience)) return null;
  if (!Number.isSafeInteger(claims.expiresAtEpochSeconds) || claims.expiresAtEpochSeconds <= nowEpochSeconds - options.maxClockSkewSeconds) return null;
  if (!Number.isSafeInteger(claims.issuedAtEpochSeconds) || claims.issuedAtEpochSeconds > nowEpochSeconds + options.maxClockSkewSeconds) return null;
  if (!isNonEmptyString(claims.subject) || !isNonEmptyString(claims.organisationId) || !isStringArray(claims.roles) || !isStringArray(claims.permittedFacilityIds)) return null;
  if (typeof claims.active !== 'boolean' || !claims.active || claims.roles.length === 0 || claims.roles.some((role) => !ACTOR_ROLES.has(role as ActorRole))) return null;
  return {
    subjectId: claims.subject,
    organisationId: claims.organisationId,
    roles: claims.roles as readonly ActorRole[],
    permittedFacilityIds: claims.permittedFacilityIds,
    active: true,
  };
}

/** Fail-closed mapper for already cryptographically verified bearer tokens. */
export class VerifiedTokenActorResolver implements AuthenticatedActorResolver {
  private readonly now: () => number;
  private readonly options: Required<Pick<VerifiedTokenActorResolverOptions, 'trustedIssuer' | 'requiredAudience' | 'maxClockSkewSeconds'>>;

  constructor(private readonly reader: VerifiedBearerTokenReader, options: VerifiedTokenActorResolverOptions) {
    this.options = {
      trustedIssuer: options.trustedIssuer,
      requiredAudience: options.requiredAudience,
      maxClockSkewSeconds: options.maxClockSkewSeconds ?? 60,
    };
    this.now = options.nowEpochSeconds ?? (() => Math.floor(Date.now() / 1000));
  }

  async resolve(request: HttpRequestContext): Promise<ActorContext | null> {
    if (!isNonEmptyString(this.options.trustedIssuer) || !isNonEmptyString(this.options.requiredAudience) || this.options.maxClockSkewSeconds < 0) return null;
    const token = bearerToken(request.headers);
    if (!token) return null;
    try {
      const claims = await this.reader.verify(token);
      return claims ? mapsToActor(claims, this.options, this.now()) : null;
    } catch {
      return null;
    }
  }
}
