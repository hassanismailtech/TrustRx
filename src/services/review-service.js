const crypto = require('node:crypto');
const { assertValidTransition } = require('../domain/signal-state');

class ReviewService {
  constructor({ store, now = () => new Date() }) { this.store = store; this.now = now; }

  async transition({ signalId, toState, reviewerRef, rationale }) {
    if (!reviewerRef || typeof reviewerRef !== 'string') {
      const error = new Error('reviewerRef is required');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    const signal = await this.store.findById(signalId);
    if (!signal) {
      const error = new Error('Signal not found');
      error.code = 'SIGNAL_NOT_FOUND';
      throw error;
    }
    assertValidTransition(signal.state, toState);
    const occurredAt = this.now().toISOString();
    const updated = await this.store.save({ ...signal, state: toState, updatedAt: occurredAt });
    await this.store.appendAudit({
      id: crypto.randomUUID(), signalId, actorRef: reviewerRef, action: 'signal.state_transition',
      fromState: signal.state, toState, rationale: rationale || null, occurredAt,
    });
    return updated;
  }
}

module.exports = { ReviewService };
