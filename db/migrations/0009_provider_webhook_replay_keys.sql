-- Stores only provider-scoped opaque replay keys and expiry; never raw webhook bodies, signatures, sender data or health reports.
BEGIN;

CREATE TABLE provider_webhook_replay_keys (
  provider_id text NOT NULL CHECK (provider_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{2,63}$'),
  replay_key text NOT NULL CHECK (replay_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$'),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider_id, replay_key)
);

CREATE INDEX provider_webhook_replay_keys_expiry_idx ON provider_webhook_replay_keys (expires_at);

COMMIT;
