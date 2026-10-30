import type { OperationalLogEvent } from '../domain/observability.js';

export interface ObservabilitySink {
  emit(event: OperationalLogEvent): Promise<void>;
}
