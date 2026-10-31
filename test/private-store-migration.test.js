const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const migration = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '0001_core_private_store.sql'), 'utf8');
const auditMigration = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '0002_immutable_audit_events.sql'), 'utf8');
const tenantMigration = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '0003_tenant_row_level_security.sql'), 'utf8');
const replayMigration = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '0009_provider_webhook_replay_keys.sql'), 'utf8');
const bindingMigration = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '0010_provider_reporter_bindings.sql'), 'utf8');

test('private-store migration establishes tenant-scoped signal and audit records', () => {
  for (const table of ['organisations', 'facilities', 'reporter_credentials', 'signal_reports', 'integrity_commitments', 'audit_events']) {
    assert.match(migration, new RegExp(`CREATE TABLE ${table}`));
  }
  assert.match(migration, /organisation_id uuid NOT NULL/);
  assert.match(migration, /case_count integer NOT NULL CHECK \(case_count > 0\)/);
  assert.match(migration, /encrypted_detail jsonb/);
});

test('database audit records are immutable', () => {
  assert.match(auditMigration, /CREATE FUNCTION prevent_audit_event_mutation/);
  assert.match(auditMigration, /BEFORE UPDATE OR DELETE ON audit_events/);
  assert.match(auditMigration, /audit_events are immutable/);
});

test('tenant records are protected by database row-level security', () => {
  assert.match(tenantMigration, /CREATE FUNCTION current_organisation_id/);
  for (const table of ['facilities', 'reporter_credentials', 'signal_reports', 'integrity_commitments', 'audit_events']) {
    assert.match(tenantMigration, new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
  }
  assert.match(tenantMigration, /signal_reports\.organisation_id = current_organisation_id\(\)/);
});

test('provider replay migration retains only opaque replay values and expiry', () => {
  assert.match(replayMigration, /CREATE TABLE provider_webhook_replay_keys/);
  assert.match(replayMigration, /provider_id text NOT NULL/);
  assert.match(replayMigration, /replay_key text NOT NULL/);
  assert.match(replayMigration, /expires_at timestamptz NOT NULL/);
  assert.doesNotMatch(replayMigration, /\b(raw_body|signature|sender|health)_?\w*\s+(text|jsonb|bytea)/i);
});

test('provider reporter binding migration uses tenant RLS and a constrained pre-tenant lookup function', () => {
  assert.match(bindingMigration, /CREATE TABLE provider_reporter_bindings/);
  assert.match(bindingMigration, /sender_reference text NOT NULL/);
  assert.match(bindingMigration, /ALTER TABLE provider_reporter_bindings ENABLE ROW LEVEL SECURITY/);
  assert.match(bindingMigration, /SECURITY DEFINER/);
  assert.match(bindingMigration, /REVOKE ALL ON FUNCTION resolve_active_reporter_transport_binding/);
  assert.doesNotMatch(bindingMigration, /phone_number|raw_body|message_body/i);
});
