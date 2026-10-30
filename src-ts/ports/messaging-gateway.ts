import type { DeliveryReceipt, ReportingChannel } from '../domain/reporting-protocol.js';

export interface OutboundReceipt {
  channel: ReportingChannel;
  recipientRef: string;
  body: string;
  correlationRef: string;
}

/** Provider adapter boundary. Implementations must redact body content in logs. */
export interface MessagingGateway {
  sendReceipt(receipt: OutboundReceipt): Promise<{ providerMessageRef: string }>;
  normalizeDeliveryReceipt(payload: unknown): DeliveryReceipt;
}
