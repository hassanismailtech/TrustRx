const test = require('node:test');
const assert = require('node:assert/strict');
const { loadRuntimeConfig } = require('../build/config/runtime-config.js');
const { EXPECTED_MIGRATION_IDS } = require('../build/runtime/migration-readiness.js');
const { evaluateDeploymentReadiness } = require('../build/runtime/deployment-readiness.js');

const config = () => loadRuntimeConfig({
  TRUSTRX_ENVIRONMENT: 'production', TRUSTRX_ENABLE_SIGNAL_INGRESS: 'true', TRUSTRX_ENABLE_OUTBOX_WORKER: 'true',
  DATABASE_URL: 'postgres://private', TRUSTRX_COMMITMENT_SECRET: 'secret', TRUSTRX_AUTH_MODE: 'approved_adapter', TRUSTRX_ALLOWED_ORIGIN: 'https://app.example.org',
  HEDERA_ACCOUNT_ID: '0.0.1', HEDERA_PRIVATE_KEY: 'private', HEDERA_TOPIC_ID: '0.0.2',
});
const evidence = () => ({
  migration: { environment: 'production', reviewedMigrationIds: [...EXPECTED_MIGRATION_IDS], migrationRoleRef: 'migration-role-1', runtimeRoleRef: 'runtime-role-1', backupRestoreEvidenceRef: 'backup-restore-1', rlsVerificationEvidenceRef: 'rls-review-1', syntheticSmokeEvidenceRef: 'synthetic-smoke-1', ownerApprovalRef: 'migration-owner-1' },
  privateInfrastructureReviewRef: 'infrastructure-review-1', transportSecurityReviewRef: 'transport-review-1', identityProviderReviewRef: 'identity-review-1', observabilityReviewRef: 'observability-review-1', incidentResponseReviewRef: 'incident-review-1', partnerWorkflowApprovalRef: 'partner-workflow-1',
});

test('deployment readiness is eligible only for owner review after every code-level evidence gate passes', () => {
  assert.deepEqual(evaluateDeploymentReadiness(config(), evidence()), { eligibleForOwnerReview: true, blockers: [] });
});

test('deployment readiness accumulates fail-closed blockers without reading controlled evidence', () => {
  const result = evaluateDeploymentReadiness(loadRuntimeConfig({}), { ...evidence(), privateInfrastructureReviewRef: '', migration: { ...evidence().migration, reviewedMigrationIds: ['0001'] } });
  assert.equal(result.eligibleForOwnerReview, false);
  assert.deepEqual(result.blockers, ['ENVIRONMENT_NOT_DEPLOYABLE', 'SIGNAL_INGRESS_NOT_ENABLED', 'OUTBOX_WORKER_NOT_ENABLED', 'DATABASE_NOT_CONFIGURED', 'AUTHENTICATION_NOT_APPROVED', 'INTEGRITY_ANCHOR_NOT_CONFIGURED', 'MIGRATION_READINESS_INCOMPLETE', 'PRIVATE_INFRASTRUCTURE_REVIEW_MISSING']);
});
