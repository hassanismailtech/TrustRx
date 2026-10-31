import type { ProviderWebhookSignatureVerifier, VerifiedProviderWebhook, WebhookReplayGuard } from '../ports/provider-webhook.js';

export type ProviderWebhookAuthentication =
  | { kind: 'verified'; providerId: string; senderReference: string }
  | { kind: 'rejected' };

function isReference(value: string, maximum = 128): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(value) && value.length <= maximum;
}

/**
 * Validates transport bounds, timestamp and one-time replay reservation around
 * a provider-owned cryptographic verifier. It never logs or returns raw bodies,
 * signatures, replay keys or verifier failure detail.
 */
export class ProviderWebhookAuthenticator {
  constructor(
    private readonly verifier: ProviderWebhookSignatureVerifier,
    private readonly replayGuard: WebhookReplayGuard,
    private readonly nowEpochSeconds: () => number = () => Math.floor(Date.now() / 1000),
    private readonly maximumAgeSeconds = 300,
    private readonly maximumFutureSkewSeconds = 60,
  ) {}

  async authenticate(input: { providerId: string; signature: string; timestampEpochSeconds: number; rawBody: string }): Promise<ProviderWebhookAuthentication> {
    const now = this.nowEpochSeconds();
    if (!isReference(input.providerId, 64) || input.signature.length < 8 || input.signature.length > 4096 || /[\r\n]/.test(input.signature) || !Number.isSafeInteger(input.timestampEpochSeconds) || input.rawBody.length === 0 || input.rawBody.length > 16_384) return { kind: 'rejected' };
    if (input.timestampEpochSeconds < now - this.maximumAgeSeconds || input.timestampEpochSeconds > now + this.maximumFutureSkewSeconds) return { kind: 'rejected' };
    let verified: VerifiedProviderWebhook | null;
    try {
      verified = await this.verifier.verify(input);
    } catch {
      return { kind: 'rejected' };
    }
    if (!verified || verified.providerId !== input.providerId || !isReference(verified.senderReference) || !isReference(verified.replayKey)) return { kind: 'rejected' };
    try {
      const reserved = await this.replayGuard.reserve({ providerId: verified.providerId, replayKey: verified.replayKey, expiresAtEpochSeconds: now + this.maximumAgeSeconds });
      return reserved ? { kind: 'verified', providerId: verified.providerId, senderReference: verified.senderReference } : { kind: 'rejected' };
    } catch {
      return { kind: 'rejected' };
    }
  }
}
