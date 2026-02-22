'use client'

import { AlertCircle, MapPin } from 'lucide-react'
import { useState } from 'react'

export function EpiRadarMap() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  return (
    <div className="bg-card border border-card-border rounded-lg p-6 col-span-2 row-span-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent-amber" />
          Epi-Radar Map
        </h2>
        <span className="text-xs text-accent-red font-semibold uppercase">ALERT</span>
      </div>

      {/* Heat Grid Map */}
      <div className="relative w-full h-96 bg-background border border-card-border rounded-lg overflow-hidden mb-6">
        {/* Grid background */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Kano Region Heat Cluster */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Outer glow circle */}
          <div className="absolute w-48 h-48 bg-accent-red rounded-full opacity-20 blur-3xl -translate-x-24 -translate-y-24 pulse-alert"></div>
          
          {/* Heat gradient circles */}
          <div className="absolute w-32 h-32 border-2 border-accent-red/40 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute w-24 h-24 border-2 border-accent-red/60 rounded-full -translate-x-12 -translate-y-12"></div>
          
          {/* Center cluster - bright red pulsing */}
          <div className="absolute w-16 h-16 bg-accent-red rounded-full opacity-80 -translate-x-8 -translate-y-8 pulse-alert"></div>
          <div className="absolute w-10 h-10 bg-accent-red rounded-full opacity-100 -translate-x-5 -translate-y-5 animate-pulse"></div>

          {/* Tooltip on hover */}
          {hoveredRegion === 'kano' && (
            <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 bg-background border border-accent-red/50 rounded-lg p-3 w-72 z-50 shadow-lg shadow-accent-red/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-accent-red flex-shrink-0 mt-1" />
                <div>
                  <p className="text-accent-red font-semibold text-sm">AI Alert: Kano Region</p>
                  <p className="text-foreground text-sm mt-1">400% spike in Hemorrhagic Symptoms over 48hrs</p>
                  <p className="text-text-secondary text-xs mt-2">Last updated: 2 minutes ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hover trigger area */}
        <button
          onMouseEnter={() => setHoveredRegion('kano')}
          onMouseLeave={() => setHoveredRegion(null)}
          className="absolute inset-0 cursor-pointer"
          aria-label="Kano Region Alert"
        />

        {/* Region Labels */}
        <div className="absolute bottom-4 left-4 text-text-secondary text-xs space-y-2">
          <p>Kano Region</p>
          <p className="text-accent-red font-semibold">CRITICAL</p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-accent-green rounded"></div>
          <span className="text-text-secondary">Normal (&lt; 10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-accent-amber rounded"></div>
          <span className="text-text-secondary">Warning (10-50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-accent-red rounded"></div>
          <span className="text-text-secondary">Critical (&gt; 50%)</span>
        </div>
      </div>
    </div>
  )
}
