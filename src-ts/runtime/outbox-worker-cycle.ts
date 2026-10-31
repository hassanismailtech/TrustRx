import type { RuntimeConfig } from '../config/runtime-config.js';
import type { OutboxDispatcher } from '../services/outbox-dispatcher.js';

export interface OutboxWorkerCycleResult {
  state: 'disabled' | 'completed';
  organisations: number;
  claimed: number;
  completed: number;
  failed: number;
}

function workerError(message: string): never {
  const error = new Error(message);
  error.name = 'InvalidOutboxWorkerConfigurationError';
  throw error;
}

/**
 * Executes exactly one tenant-explicit outbox pass. Scheduling, process
 * supervision and provider handlers remain deployment-owned responsibilities.
 */
export class OutboxWorkerCycle {
  constructor(private readonly config: RuntimeConfig, private readonly dispatcher: Pick<OutboxDispatcher, 'dispatch'>, private readonly workerRef: string) {}

  async runOnce(organisationIds: readonly string[], perOrganisationLimit = 10): Promise<OutboxWorkerCycleResult> {
    if (!this.config.outboxWorkerEnabled) return { state: 'disabled', organisations: 0, claimed: 0, completed: 0, failed: 0 };
    if (!this.config.databaseUrl) workerError('Enabled outbox worker requires database configuration');
    if (!/^[A-Za-z0-9_-]{3,64}$/.test(this.workerRef)) workerError('Outbox worker reference is invalid');
    if (!Number.isInteger(perOrganisationLimit) || perOrganisationLimit < 1 || perOrganisationLimit > 100) workerError('Outbox worker limit must be an integer from 1 to 100');
    const organisationSet = new Set(organisationIds);
    if (organisationSet.size === 0 || organisationSet.size > 50 || [...organisationSet].some((id) => !/^[A-Za-z0-9_-]{3,128}$/.test(id))) workerError('Outbox worker organisation scope is invalid');
    let claimed = 0; let completed = 0; let failed = 0;
    for (const organisationId of organisationSet) {
      const result = await this.dispatcher.dispatch(organisationId, this.workerRef, perOrganisationLimit);
      claimed += result.claimed; completed += result.completed; failed += result.failed;
    }
    return { state: 'completed', organisations: organisationSet.size, claimed, completed, failed };
  }
}
