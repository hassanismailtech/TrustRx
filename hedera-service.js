// hedera-service.js - Hedera Consensus Service Integration
class HederaService {
  constructor({ accountId, privateKey, topicId } = {}) {
    this.client = null;
    this.topicId = topicId || null;
    this.accountId = accountId || null;
    this.privateKey = privateKey || null;
  }

  isReady() { return Boolean(this.accountId && this.privateKey && this.topicId); }

  createClient() {
    let sdk;
    try {
      sdk = require('@hashgraph/sdk');
    } catch (cause) {
      const error = new Error('Hedera SDK is unavailable; integrity anchoring is disabled');
      error.code = 'HEDERA_SDK_UNAVAILABLE';
      error.cause = cause;
      throw error;
    }
    return sdk.Client.forTestnet().setOperator(this.accountId, this.privateKey);
  }

  async anchorCommitment({ commitment, schemaVersion, eventType }) {
    if (!this.isReady()) throw new Error('Hedera anchor service is not configured');
    const client = this.createClient();
    const { TopicMessageSubmitTransaction } = require('@hashgraph/sdk');
    const message = JSON.stringify({ commitment, schemaVersion, eventType });
    const response = await new TopicMessageSubmitTransaction({ topicId: this.topicId, message }).execute(client);
    const receipt = await response.getReceipt(client);
    return { transactionId: response.transactionId.toString(), topicId: this.topicId, status: receipt.status.toString() };
  }
}

module.exports = HederaService;
