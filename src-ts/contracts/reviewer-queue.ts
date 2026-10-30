import type { SignalState } from './signal.js';

export interface ReviewerQueueItem {
  signalId: string;
  facilityRef: string;
  syndromeCode: string;
  caseCount: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  state: SignalState;
  receivedAt: string;
  integrityStatus: 'pending' | 'anchored' | 'failed';
}

export interface ReviewerQueuePage {
  items: readonly ReviewerQueueItem[];
  nextCursor: string | null;
}
