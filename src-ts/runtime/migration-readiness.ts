export const EXPECTED_MIGRATION_IDS = ['0001', '0002', '0003', '0004', '0005', '0006', '0007', '0008'] as const;

export interface MigrationReadinessEvidence {
  environment: 'staging' | 'production';
  reviewedMigrationIds: readonly string[];
  migrationRoleRef: string;
  runtimeRoleRef: string;
  backupRestoreEvidenceRef: string;
  rlsVerificationEvidenceRef: string;
  syntheticSmokeEvidenceRef: string;
  ownerApprovalRef: string;
}

export type MigrationReadinessBlocker =
  | 'MIGRATION_REVIEW_INCOMPLETE'
  | 'MIGRATION_ROLE_INVALID'
  | 'BACKUP_RESTORE_EVIDENCE_MISSING'
  | 'RLS_EVIDENCE_MISSING'
  | 'SYNTHETIC_SMOKE_EVIDENCE_MISSING'
  | 'OWNER_APPROVAL_MISSING';

export interface MigrationReadinessResult {
  ready: boolean;
  blockers: readonly MigrationReadinessBlocker[];
}

function opaqueReference(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(value);
}

function completeReviewedSet(ids: readonly string[]): boolean {
  return ids.length === EXPECTED_MIGRATION_IDS.length
    && new Set(ids).size === ids.length
    && ids.every((id, index) => id === EXPECTED_MIGRATION_IDS[index]);
}

/**
 * Evaluates references to controlled evidence only. It never reads a database,
 * applies SQL or stores the evidence itself; accountable owners retain those
 * records outside this public repository.
 */
export function evaluateMigrationReadiness(evidence: MigrationReadinessEvidence): MigrationReadinessResult {
  const blockers: MigrationReadinessBlocker[] = [];
  if (!completeReviewedSet(evidence.reviewedMigrationIds)) blockers.push('MIGRATION_REVIEW_INCOMPLETE');
  if (!opaqueReference(evidence.migrationRoleRef) || !opaqueReference(evidence.runtimeRoleRef) || evidence.migrationRoleRef === evidence.runtimeRoleRef) blockers.push('MIGRATION_ROLE_INVALID');
  if (!opaqueReference(evidence.backupRestoreEvidenceRef)) blockers.push('BACKUP_RESTORE_EVIDENCE_MISSING');
  if (!opaqueReference(evidence.rlsVerificationEvidenceRef)) blockers.push('RLS_EVIDENCE_MISSING');
  if (!opaqueReference(evidence.syntheticSmokeEvidenceRef)) blockers.push('SYNTHETIC_SMOKE_EVIDENCE_MISSING');
  if (!opaqueReference(evidence.ownerApprovalRef)) blockers.push('OWNER_APPROVAL_MISSING');
  return { ready: blockers.length === 0, blockers };
}
