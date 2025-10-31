// hedera-service.js - Hedera Consensus Service Integration
const { 
  Client, 
  TopicCreateTransaction, 
  TopicMessageSubmitTransaction,
  PrivateKey 
} = require("@hashgraph/sdk");

class HederaService {
  constructor() {
    this.client = null;
    this.topicId = null;
  }

  // Initialize Hedera client with your testnet credentials
  async initialize(accountId, privateKey) {
    try {
      // Create client for testnet
      this.client = Client.forTestnet();
      
      // Set operator (your account)
      this.client.setOperator(accountId, privateKey);
      
      console.log("✅ Hedera client initialized");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Hedera:", error.message);
      return false;
    }
  }

  // Create a new topic for health data
  async createTopic() {
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo("TrustRx Health Data Stream");
      
      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      this.topicId = receipt.topicId.toString();
      console.log(`✅ Topic created: ${this.topicId}`);
      
      return this.topicId;
    } catch (error) {
      console.error("❌ Failed to create topic:", error.message);
      return null;
    }
  }

  // Submit health case data to Hedera
  async submitHealthData(caseData) {
    try {
      // If no topic exists, create one
      if (!this.topicId) {
        const topicId = await this.createTopic();
        if (!topicId) {
          throw new Error("Failed to create topic");
        }
      }

      // Prepare data payload
      const payload = {
        timestamp: new Date().toISOString(),
        location: caseData.location,
        disease: caseData.disease,
        cases: parseInt(caseData.cases),
        severity: caseData.severity || "moderate",
        reportedBy: "TrustRx Agent"
      };

      // Submit to Hedera Consensus Service
      const submitTx = new TopicMessageSubmitTransaction({
        topicId: this.topicId,
        message: JSON.stringify(payload)
      });

      const txResponse = await submitTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      const transactionId = txResponse.transactionId.toString();
      
      console.log(`✅ Health data recorded on Hedera: ${transactionId}`);
      
      return {
        success: true,
        transactionId: transactionId,
        topicId: this.topicId,
        timestamp: payload.timestamp,
        data: payload
      };
    } catch (error) {
      console.error("❌ Failed to submit data:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mock AI analysis (for demo purposes)
  analyzeRiskLevel(cases, disease) {
    const riskFactors = {
      "Malaria": 0.7,
      "Cholera": 0.9,
      "Typhoid": 0.6,
      "COVID-19": 0.8,
      "Lassa Fever": 0.85
    };

    const baseFactor = riskFactors[disease] || 0.5;
    const casesFactor = Math.min(cases / 100, 1);
    const riskScore = Math.round((baseFactor * 0.6 + casesFactor * 0.4) * 100);

    return {
      riskScore: riskScore,
      confidence: 78,
      recommendation: riskScore > 70 ? "Immediate attention required" : "Monitor closely"
    };
  }
}

module.exports = HederaService;