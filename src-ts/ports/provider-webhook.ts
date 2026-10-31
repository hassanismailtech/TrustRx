/**
 * Provider adapters verify their native signature scheme against the raw body.
 * They must return no result for invalid key provenance, signature or sender.
 */
export interface VerifiedProviderWebhook {
  providerId: string;
  senderReference: string;
  replayKey: string;
}

export interface ProviderWebhookSignatureVerifier {
  verify(input: { providerId: string; signature: string; timestampEpochSeconds: number; rawBody: string }): Promise<VerifiedProviderWebhook | null>;
}

/** Must atomically reserve a replay key within its provider scope. */
export interface WebhookReplayGuard {
  reserve(input: { providerId: string; replayKey: string; expiresAtEpochSeconds: number }): Promise<boolean>;
}
