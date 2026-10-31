import type { RuntimeConfig } from '../config/runtime-config.js';
import { PostgresSignalRepository } from '../adapters/postgres-signal-repository.js';
import { ReviewDecisionController, ReviewerQueueController } from '../http/reviewer-controllers.js';
import { SignalIngressController } from '../http/signal-ingress-controller.js';
import type { AuthenticatedActorResolver } from '../ports/authentication.js';
import type { DatabasePool } from '../ports/database.js';
import type { SignalIngressRequestFactory } from '../ports/signal-ingress-request-factory.js';
import { ReviewDecisionService } from '../services/review-decision-service.js';
import { ReviewerQueueService } from '../services/reviewer-queue-service.js';
import { SignalIngressService } from '../services/signal-ingress-service.js';

export interface ProtectedRuntimeDependencies {
  pool: DatabasePool;
  auth: AuthenticatedActorResolver;
  ingressFactory: SignalIngressRequestFactory;
}

export interface DisabledProtectedRuntime {
  state: 'disabled';
  reason: 'SIGNAL_INGRESS_DISABLED';
}

export interface ReadyProtectedRuntime {
  state: 'ready';
  controllers: {
    signalIngress: SignalIngressController;
    reviewerQueue: ReviewerQueueController;
    reviewDecision: ReviewDecisionController;
  };
}

export type ProtectedRuntime = DisabledProtectedRuntime | ReadyProtectedRuntime;

function compositionError(message: string): never {
  const error = new Error(message);
  error.name = 'InvalidRuntimeCompositionError';
  throw error;
}

/**
 * Assembles protected workflow controllers but intentionally does not bind a
 * network port, register framework routes or start workers. Deployment code
 * must explicitly opt in after configuration, migration and provider review.
 */
export function composeProtectedRuntime(config: RuntimeConfig, dependencies?: ProtectedRuntimeDependencies): ProtectedRuntime {
  if (!config.signalIngressEnabled) return { state: 'disabled', reason: 'SIGNAL_INGRESS_DISABLED' };
  if (config.authenticationMode !== 'approved_adapter') compositionError('Enabled protected runtime requires approved authentication mode');
  if (!dependencies) compositionError('Enabled protected runtime requires explicitly supplied dependencies');
  const repository = new PostgresSignalRepository(dependencies.pool);
  return {
    state: 'ready',
    controllers: {
      signalIngress: new SignalIngressController(dependencies.auth, dependencies.ingressFactory, new SignalIngressService(repository), true),
      reviewerQueue: new ReviewerQueueController(dependencies.auth, new ReviewerQueueService(repository)),
      reviewDecision: new ReviewDecisionController(dependencies.auth, new ReviewDecisionService(repository)),
    },
  };
}
