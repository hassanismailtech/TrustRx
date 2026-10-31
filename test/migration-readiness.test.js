const test = require('node:test');
const assert = require('node:assert/strict');
const { EXPECTED_MIGRATION_IDS, evaluateMigrationReadiness } = require('../build/runtime/migration-readiness.js');

const completeEvidence = () => ({
  environment: 'staging', reviewedMigrationIds: [...EXPECTED_MIGRATION_IDS], migrationRoleRef: 'migration-role-1', runtimeRoleRef: 'runtime-role-1',
  backupRestoreEvidenceRef: 'backup-restore-20261031', rlsVerificationEvidenceRef: 'rls-check-20261031',
  syntheticSmokeEvidenceRef: 'synthetic-smoke-20261031', ownerApprovalRef: 'owner-approval-20261031',
});

test('migration readiness needs ordered review and all controlled evidence references', () => {
  assert.deepEqual(evaluateMigrationReadiness(completeEvidence()), { ready: true, blockers: [] });
  const incomplete = evaluateMigrationReadiness({ ...completeEvidence(), reviewedMigrationIds: ['0001', '0003'], migrationRoleRef: 'same-role', runtimeRoleRef: 'same-role', backupRestoreEvidenceRef: '', ownerApprovalRef: 'x' });
  assert.equal(incomplete.ready, false);
  assert.deepEqual(incomplete.blockers, ['MIGRATION_REVIEW_INCOMPLETE', 'MIGRATION_ROLE_INVALID', 'BACKUP_RESTORE_EVIDENCE_MISSING', 'OWNER_APPROVAL_MISSING']);
});
