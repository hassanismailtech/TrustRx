import type { ActorContext } from '../domain/access-control.js';
import type { ReporterTransportIdentityRecord, ReporterTransportIdentityResolver } from '../ports/reporter-transport-identity.js';
import type { ProviderWebhookAuthentication } from './provider-webhook-authenticator.js';

export interface AuthorisedReporterTransport {
  actor: ActorContext;
  facilityId: string;
  reporterCredentialId: string;
}

function validReference(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/.test(value);
}

function toAuthorisedTransport(record: ReporterTransportIdentityRecord): AuthorisedReporterTransport | null {
  if (!record.active || !validReference(record.subjectId) || !validReference(record.organisationId) || !validReference(record.facilityId) || !validReference(record.reporterCredentialId)) return null;
  return {
    actor: { subjectId: record.subjectId, organisationId: record.organisationId, roles: ['reporter'], permittedFacilityIds: [record.facilityId], active: true },
    facilityId: record.facilityId,
    reporterCredentialId: record.reporterCredentialId,
  };
}

/**
 * Resolves a reporter only after provider authentication succeeded. It emits
 * no lookup reason, sender reference or record details on a failure.
 */
export class AuthorisedReporterTransportResolver {
  constructor(private readonly identities: ReporterTransportIdentityResolver) {}

  async resolve(authentication: ProviderWebhookAuthentication): Promise<AuthorisedReporterTransport | null> {
    if (authentication.kind !== 'verified') return null;
    try {
      const record = await this.identities.resolve({ providerId: authentication.providerId, senderReference: authentication.senderReference });
      return record ? toAuthorisedTransport(record) : null;
    } catch {
      return null;
    }
  }
}
