/** Typed contract for the replacement core service. */
export type SignalState =
  | 'received'
  | 'under_review'
  | 'verified'
  | 'referred'
  | 'submitted_to_official_channel'
  | 'acknowledged'
  | 'closed'
  | 'rejected';

export interface SignalIngressCommand {
  facilityRef: string;
  syndromeCode: string;
  caseCount: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  reporterCredentialRef?: string;
  reportedAt?: string;
  coarseLocation?: string;
  notes?: string;
}

export interface SignalReport {
  id: string;
  schemaVersion: string;
  state: SignalState;
  receivedAt: string;
  facilityRef: string;
  syndromeCode: string;
  caseCount: number;
  severity: SignalIngressCommand['severity'];
  reporterCredentialRef: string | null;
  reportedAt: string;
  coarseLocation: string | null;
  notes: string | null;
}

export interface IntegrityCommitment {
  id: string;
  commitment: string;
  status: 'pending' | 'anchored';
  hcsReceipt: { transactionId: string; topicId: string; status: string } | null;
}
