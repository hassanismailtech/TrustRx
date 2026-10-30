const { createCommitment, createSignal } = require('../domain/signal');

class SignalService {
  constructor({ store, commitmentSecret, hederaService, now = () => new Date() }) {
    this.store = store; this.commitmentSecret = commitmentSecret; this.hederaService = hederaService; this.now = now;
  }
  async receive(input) {
    if (!this.commitmentSecret) {
      const error = new Error('Signal acceptance is not configured');
      error.code = 'SIGNAL_ACCEPTANCE_UNAVAILABLE';
      throw error;
    }
    const signal = createSignal(input, { receivedAt: this.now() });
    const commitment = createCommitment(signal, this.commitmentSecret);
    const saved = await this.store.save({ ...signal, integrity: { commitment, status: 'pending', hcsReceipt: null } });
    await this.store.appendAudit({ id: signal.id, signalId: signal.id, actorRef: signal.reporterCredentialRef, action: 'signal.received', occurredAt: signal.receivedAt });
    if (!this.hederaService.isReady()) return saved;
    try {
      const hcsReceipt = await this.hederaService.anchorCommitment({ commitment, schemaVersion: saved.schemaVersion, eventType: 'syndromic-signal' });
      return this.store.save({ ...saved, integrity: { commitment, status: 'anchored', hcsReceipt } });
    } catch { return saved; }
  }
}

module.exports = { SignalService };
