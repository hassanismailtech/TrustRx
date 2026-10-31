import type { AuthorisedReporterTransportResolver } from './authorised-reporter-transport-resolver.js';
import { AuthorisedReportingProtocol, type ValidatedAuthorisedSubmission } from './authorised-reporting-protocol.js';
import type { ProviderWebhookAuthenticator } from './provider-webhook-authenticator.js';

export type ProviderInboundIntakeResult =
  | { kind: 'accepted'; submission: ValidatedAuthorisedSubmission }
  | { kind: 'rejected' };

/**
 * Provider-neutral inbound SMS pipeline. It deliberately ends at a validated,
 * identity-bound submission; signal IDs, commitments and persistence are added
 * later by an approved provider-specific command factory.
 */
export class ProviderInboundSignalIntake {
  constructor(
    private readonly webhookAuthentication: Pick<ProviderWebhookAuthenticator, 'authenticate'>,
    private readonly reporters: Pick<AuthorisedReporterTransportResolver, 'resolve'>,
    private readonly protocol: AuthorisedReportingProtocol = new AuthorisedReportingProtocol(),
  ) {}

  async acceptSms(input: { providerId: string; signature: string; timestampEpochSeconds: number; rawBody: string }): Promise<ProviderInboundIntakeResult> {
    const authentication = await this.webhookAuthentication.authenticate(input);
    if (authentication.kind !== 'verified') return { kind: 'rejected' };
    const reporter = await this.reporters.resolve(authentication);
    if (!reporter) return { kind: 'rejected' };
    const submission = this.protocol.parseSms(input.rawBody, reporter);
    return submission ? { kind: 'accepted', submission } : { kind: 'rejected' };
  }
}
