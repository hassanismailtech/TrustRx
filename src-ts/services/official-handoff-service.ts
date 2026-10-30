import { assertCanHandoffSignal, type ActorContext } from '../domain/access-control.js';
import { assertApprovedTargetProfile, type OfficialHandoffTarget } from '../domain/official-handoff.js';
import type { OfficialHandoffRepository } from '../ports/official-handoff-repository.js';

export class OfficialHandoffService {
  constructor(private readonly repository: OfficialHandoffRepository) {}
  async queue(input: { actor: ActorContext; id: string; organisationId: string; signalId: string; signalState: 'verified'; targetKind: OfficialHandoffTarget; targetProfileRef: string; correlationRef: string }): Promise<{ kind: 'queued' | 'duplicate'; id: string; state: 'queued' | 'submitted' | 'acknowledged' | 'failed' | 'cancelled' }> {
    assertCanHandoffSignal(input.actor, input.organisationId, input.signalState);
    assertApprovedTargetProfile(input.targetProfileRef);
    return this.repository.queue({ id: input.id, organisationId: input.organisationId, signalId: input.signalId, requestedByRef: input.actor.subjectId, targetKind: input.targetKind, targetProfileRef: input.targetProfileRef, correlationRef: input.correlationRef });
  }
}
