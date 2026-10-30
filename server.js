// server.js - Simple Express API for TrustRx
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const HederaService = require('./hedera-service');

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Middleware
app.disable('x-powered-by');
app.use(cors(process.env.TRUSTRX_ALLOWED_ORIGIN ? { origin: process.env.TRUSTRX_ALLOWED_ORIGIN } : { origin: false }));
app.use(express.json({ limit: '32kb' }));
app.use(express.static('public'));

// Initialize Hedera service
const { InMemoryEventStore } = require('./src/services/event-store');
const { SignalService } = require('./src/services/signal-service');
const hederaService = new HederaService({ accountId: process.env.HEDERA_ACCOUNT_ID, privateKey: process.env.HEDERA_PRIVATE_KEY, topicId: process.env.HEDERA_TOPIC_ID });
const commitmentSecret = process.env.TRUSTRX_COMMITMENT_SECRET;
const signalIngressEnabled = process.env.TRUSTRX_ENABLE_SIGNAL_INGRESS === 'true';
if (!commitmentSecret) console.warn('TRUSTRX_COMMITMENT_SECRET is not configured; signal acceptance is disabled.');
const signalService = new SignalService({ store: new InMemoryEventStore(), commitmentSecret, hederaService });

app.post('/api/v1/signals', async (req, res) => {
  if (!signalIngressEnabled) {
    return res.status(503).json({ error: 'SIGNAL_INGRESS_DISABLED', message: 'Signal ingress is disabled until an approved, authenticated pilot configuration is deployed.' });
  }
  try {
    const signal = await signalService.receive(req.body);
    res.status(202).json({ signalRef: signal.id, state: signal.state, integrity: { status: signal.integrity.status, commitment: signal.integrity.commitment, receipt: signal.integrity.hcsReceipt } });
  } catch (error) {
    const status = error.code === 'VALIDATION_ERROR' ? 400 : error.code === 'SIGNAL_ACCEPTANCE_UNAVAILABLE' ? 503 : 500;
    res.status(status).json({ error: error.code || 'SIGNAL_ACCEPTANCE_FAILED', message: error.message });
  }
});

app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'online',
    service: 'TrustRx API',
    deploymentMode: signalIngressEnabled ? 'synthetic_or_approved_pilot_only' : 'ingress_disabled',
    signalAcceptance: commitmentSecret ? 'configured' : 'not_configured',
    integrityAnchor: hederaService.isReady() ? 'configured' : 'not_configured'
  });
});

// Start server
if (require.main === module) app.listen(PORT, () => console.log(`TrustRx API listening on ${PORT}`));

module.exports = { app, hederaService, signalService };
