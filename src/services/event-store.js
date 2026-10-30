class InMemoryEventStore {
  constructor() { this.signals = new Map(); this.auditEvents = []; }
  async save(signal) { this.signals.set(signal.id, structuredClone(signal)); return structuredClone(signal); }
  async findById(id) { const signal = this.signals.get(id); return signal ? structuredClone(signal) : null; }
  async appendAudit(event) { this.auditEvents.push(structuredClone(event)); return structuredClone(event); }
  async findAuditBySignalId(signalId) { return this.auditEvents.filter((event) => event.signalId === signalId).map((event) => structuredClone(event)); }
}

module.exports = { InMemoryEventStore };
