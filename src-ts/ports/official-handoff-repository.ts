import type { OfficialHandoffState, OfficialHandoffTarget } from '../domain/official-handoff.js';

export interface QueueOfficialHandoff {
  id: string;
  organisationId: string;
  signalId: string;
  requestedByRef: string;
  targetKind: OfficialHandoffTarget;
  targetProfileRef: string;
  correlationRef: string;
}

export interface OfficialHandoffRepository {
  queue(input: QueueOfficialHandoff): Promise<{ kind: 'queued' | 'duplicate'; id: string; state: OfficialHandoffState }>;
}
