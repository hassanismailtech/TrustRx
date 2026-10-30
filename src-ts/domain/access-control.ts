import type { SignalState } from '../contracts/signal.js';

export type ActorRole = 'reporter' | 'reviewer' | 'official_channel_operator' | 'tenant_admin' | 'platform_admin';

export interface ActorContext {
  subjectId: string;
  organisationId: string;
  roles: readonly ActorRole[];
  permittedFacilityIds: readonly string[];
  active: boolean;
}

function deny(message: string): never {
  const error = new Error(message);
  error.name = 'AccessDeniedError';
  throw error;
}

function assertActive(actor: ActorContext): void {
  if (!actor.active) deny('Inactive actors cannot access TrustRx workflows');
}

function assertTenant(actor: ActorContext, organisationId: string): void {
  if (actor.organisationId !== organisationId && !actor.roles.includes('platform_admin')) {
    deny('Actor is not entitled to this organisation');
  }
}

function hasAnyRole(actor: ActorContext, roles: readonly ActorRole[]): boolean {
  return roles.some((role) => actor.roles.includes(role));
}

export function assertCanReportSignal(actor: ActorContext, organisationId: string, facilityId: string): void {
  assertActive(actor);
  assertTenant(actor, organisationId);
  if (!hasAnyRole(actor, ['reporter', 'tenant_admin', 'platform_admin'])) deny('Actor cannot submit signals');
  if (!actor.roles.includes('platform_admin') && !actor.roles.includes('tenant_admin') && !actor.permittedFacilityIds.includes(facilityId)) {
    deny('Reporter is not entitled to this facility');
  }
}

export function assertCanReviewSignal(actor: ActorContext, organisationId: string): void {
  assertActive(actor);
  assertTenant(actor, organisationId);
  if (!hasAnyRole(actor, ['reviewer', 'tenant_admin', 'platform_admin'])) deny('Actor cannot review signals');
}

export function assertCanHandoffSignal(actor: ActorContext, organisationId: string, state: SignalState): void {
  assertActive(actor);
  assertTenant(actor, organisationId);
  if (!hasAnyRole(actor, ['official_channel_operator', 'tenant_admin', 'platform_admin'])) deny('Actor cannot perform official-system handoff');
  if (state !== 'verified') deny('Only a verified signal can be handed off');
}
