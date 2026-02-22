'use client'

import { Header } from '@/components/Header'
import { EpiRadarMap } from '@/components/EpiRadarMap'
import { SMSFeed } from '@/components/SMSFeed'
import { AnomalyChart } from '@/components/AnomalyChart'
import { HederaLedger } from '@/components/HederaLedger'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <Header />

      {/* Main Bento Grid */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6 auto-rows-[400px] lg:auto-rows-[350px]">
          {/* Epi-Radar Map - 2x2 */}
          <EpiRadarMap />

          {/* SMS Feed - 1x2 */}
          <SMSFeed />

          {/* Anomaly Chart - 1.5x1 bottom left */}
          <div className="col-span-2">
            <AnomalyChart />
          </div>

          {/* Hedera Ledger - 1x1 bottom right */}
          <div className="col-span-1">
            <HederaLedger />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-card-border bg-card p-6 mt-8">
        <div className="flex justify-between items-center text-xs text-text-secondary">
          <p>© 2024 TrustRx - Decentralized Epidemiological Surveillance</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              API Status
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
