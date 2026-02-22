'use client'

import { Activity } from 'lucide-react'

export function Header() {
  return (
    <div className="bg-card border-b border-card-border p-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-accent-red/10 rounded-lg">
              <Activity className="w-8 h-8 text-accent-red" />
            </div>
            TrustRx: National Syndromic Surveillance
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            Real-time epidemiological surveillance system powered by AI and blockchain
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-accent-green/10 rounded-lg border border-accent-green/30">
          <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse"></div>
          <span className="text-accent-green font-medium text-sm">Live Status: Hedera HCS Connected</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-background border border-card-border rounded-lg p-4">
          <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">Active CHW Nodes</p>
          <p className="text-2xl font-bold text-foreground">4,210</p>
          <p className="text-text-secondary text-xs mt-1">Offline SMS Enabled</p>
        </div>
        <div className="bg-background border border-card-border rounded-lg p-4">
          <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">Total SMS Logged</p>
          <p className="text-2xl font-bold text-foreground">124,592</p>
          <p className="text-text-secondary text-xs mt-1">Past 30 days</p>
        </div>
        <div className="bg-background border border-card-border rounded-lg p-4 border-accent-red/50 bg-accent-red/5">
          <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">AI Anomalies</p>
          <p className="text-2xl font-bold text-accent-red">1 Critical</p>
          <p className="text-accent-red/80 text-xs mt-1">Requires immediate attention</p>
        </div>
      </div>
    </div>
  )
}
