// server.js - Simple Express API for TrustRx
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const HederaService = require('./hedera_service');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Hedera service
const hederaService = new HederaService();

// Auto-configure Hedera on startup
(async () => {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  
  if (accountId && privateKey) {
    const success = await hederaService.initialize(accountId, privateKey);
    if (success) {
      console.log('✅ Hedera auto-configured from .env file');
    } else {
      console.log('⚠️  Hedera auto-configuration failed');
    }
  } else {
    console.log('⚠️  No Hedera credentials in .env file');
  }
})();

// In-memory storage for demo (tracks submissions)
const submissions = [];

// Configuration endpoint
app.post('/api/configure', async (req, res) => {
  const { accountId, privateKey } = req.body;
  
  if (!accountId || !privateKey) {
    return res.status(400).json({ 
      error: 'Missing accountId or privateKey' 
    });
  }

  const success = await hederaService.initialize(accountId, privateKey);
  
  if (success) {
    res.json({ 
      message: 'Hedera configured successfully',
      status: 'ready' 
    });
  } else {
    res.status(500).json({ 
      error: 'Failed to configure Hedera' 
    });
  }
});

// Submit health case endpoint
app.post('/api/submit-case', async (req, res) => {
  try {
    const { location, disease, cases, severity } = req.body;

    // Validate input
    if (!location || !disease || !cases) {
      return res.status(400).json({ 
        error: 'Missing required fields: location, disease, cases' 
      });
    }

    // Submit to Hedera
    const result = await hederaService.submitHealthData({
      location,
      disease,
      cases,
      severity
    });

    if (result.success) {
      // Get AI analysis
      const analysis = hederaService.analyzeRiskLevel(cases, disease);
      
      // Store submission
      const submission = {
        id: submissions.length + 1,
        ...result.data,
        transactionId: result.transactionId,
        topicId: result.topicId,
        analysis: analysis
      };
      
      submissions.push(submission);

      res.json({
        success: true,
        message: 'Health data recorded on Hedera blockchain',
        submission: submission
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all submissions endpoint
app.get('/api/submissions', (req, res) => {
  res.json({
    total: submissions.length,
    submissions: submissions.reverse()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online',
    service: 'TrustRx API',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TrustRx server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   POST /api/configure - Configure Hedera credentials`);
  console.log(`   POST /api/submit-case - Submit health case data`);
  console.log(`   GET  /api/submissions - View all submissions`);
});

module.exports = app;