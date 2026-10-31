import type { RuntimeConfig } from '../config/runtime-config.js';
import { evaluateMigrationReadiness, type MigrationReadinessEvidence } from './migration-readiness.js';

export interface DeploymentReadinessEvidence {
  migration: MigrationReadinessEvidence;
  privateInfrastructureReviewRef: string;
  transportSecurityReviewRef: string;
  identityProviderReviewRef: string;
  observabilityReviewRef: string;
  incidentResponseReviewRef: string;
  partnerWorkflowApprovalRef: string;
}

export type DeploymentReadinessBlocker =
  | 'ENVIRONMENT_NOT_DEPLOYABLE'
  | 'SIGNAL_INGRESS_NOT_ENABLED'
  | 'OUTBOX_WORKER_NOT_ENABLED'
  | 'DATABASE_NOT_CONFIGURED'
  | 'AUTHENTICATION_NOT_APPROVED'
  | 'INTEGRITY_ANCHOR_NOT_CONFIGURED'
  | 'MIGRATION_READINESS_INCOMPLETE'
  | 'PRIVATE_INFRASTRUCTURE_REVIEW_MISSING'
  | 'TRANSPORT_SECURITY_REVIEW_MISSING'
  | 'IDENTITY_PROVIDER_REVIEW_MISSING'
  | 'OBSERVABILITY_REVIEW_MISSING'
  | 'INCIDENT_RESPONSE_REVIEW_MISSING'
  | 'PARTNER_WORKFLOW_APPROVAL_MISSING';

export interface DeploymentReadinessResult {
  eligibleForOwnerReview: boolean;
  blockers: readonly DeploymentReadinessBlocker[];
}

function opaqueReference(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(value);
}

/**
 * This is an evidence checklist, not an activation switch. A positive result
 * means only that the supplied references satisfy the code-level prerequisite
 * set for an accountable owner to review.
 */
export function evaluateDeploymentReadiness(config: RuntimeConfig, evidence: DeploymentReadinessEvidence): DeploymentReadinessResult {
  const blockers: DeploymentReadinessBlocker[] = [];
  if (!['staging', 'production'].includes(config.environment)) blockers.push('ENVIRONMENT_NOT_DEPLOYABLE');
  if (!config.signalIngressEnabled) blockers.push('SIGNAL_INGRESS_NOT_ENABLED');
  if (!config.outboxWorkerEnabled) blockers.push('OUTBOX_WORKER_NOT_ENABLED');
  if (!config.databaseUrl) blockers.push('DATABASE_NOT_CONFIGURED');
  if (config.authenticationMode !== 'approved_adapter') blockers.push('AUTHENTICATION_NOT_APPROVED');
  if (!config.integrityAnchorConfigured) blockers.push('INTEGRITY_ANCHOR_NOT_CONFIGURED');
  if (!evaluateMigrationReadiness(evidence.migration).ready) blockers.push('MIGRATION_READINESS_INCOMPLETE');
  if (!opaqueReference(evidence.privateInfrastructureReviewRef)) blockers.push('PRIVATE_INFRASTRUCTURE_REVIEW_MISSING');
  if (!opaqueReference(evidence.transportSecurityReviewRef)) blockers.push('TRANSPORT_SECURITY_REVIEW_MISSING');
  if (!opaqueReference(evidence.identityProviderReviewRef)) blockers.push('IDENTITY_PROVIDER_REVIEW_MISSING');
  if (!opaqueReference(evidence.observabilityReviewRef)) blockers.push('OBSERVABILITY_REVIEW_MISSING');
  if (!opaqueReference(evidence.incidentResponseReviewRef)) blockers.push('INCIDENT_RESPONSE_REVIEW_MISSING');
  if (!opaqueReference(evidence.partnerWorkflowApprovalRef)) blockers.push('PARTNER_WORKFLOW_APPROVAL_MISSING');
  return { eligibleForOwnerReview: blockers.length === 0, blockers };
}
