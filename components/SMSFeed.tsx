'use client'

import { Smartphone, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SMSReport {
  id: string
  sender: string
  location: string
  symptoms: string[]
  status: string
  timestamp: Date
}

const mockSmsReports: SMSReport[] = [
  {
    id: '1',
    sender: '[+234...89]',
    location: 'KN-04',
    symptoms: ['Fever', 'Bleeding'],
    status: 'Logged',
    timestamp: new Date(Date.now() - 2 * 60000),
  },
  {
    id: '2',
    sender: '[+234...12]',
    location: 'KN-02',
    symptoms: ['High Fever', 'Vomiting'],
    status: 'Logged',
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: '3',
    sender: '[+234...45]',
    location: 'KN-07',
    symptoms: ['Fever', 'Headache', 'Body Pain'],
    status: 'Logged',
    timestamp: new Date(Date.now() - 8 * 60000),
  },
  {
    id: '4',
    sender: '[+234...67]',
    location: 'KN-03',
    symptoms: ['Bleeding', 'Weakness'],
    status: 'Logged',
    timestamp: new Date(Date.now() - 12 * 60000),
  },
  {
    id: '5',
    sender: '[+234...78]',
    location: 'KN-01',
    symptoms: ['High Fever', 'Bleeding'],
    status: 'Logged',
    timestamp: new Date(Date.now() - 15 * 60000),
  },
  {
    id: '6',
    sender: '[+234...90]',
    location: 'KN-05',
    symptoms: ['Fever'],
    status: 'Logged',
    timestamp: new Date(Date.now() - 20 * 60000),
  },
]

export function SMSFeed() {
  const [reports, setReports] = useState<SMSReport[]>(mockSmsReports)

  useEffect(() => {
    // Simulate new incoming reports
    const interval = setInterval(() => {
      setReports((prev) => {
        const newReport: SMSReport = {
          id: Date.now().toString(),
          sender: `[+234...${Math.floor(Math.random() * 100)}]`,
          location: `KN-${Math.floor(Math.random() * 10).toString().padStart(2, '0')}`,
          symptoms: [
            ['Fever', 'Bleeding'],
            ['High Fever', 'Vomiting'],
            ['Fever', 'Headache'],
            ['Bleeding', 'Weakness'],
          ][Math.floor(Math.random() * 4)],
          status: 'Logged',
          timestamp: new Date(),
        }
        return [newReport, ...prev.slice(0, 4)]
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-card border border-card-border rounded-lg p-6 col-span-1 row-span-2 flex flex-col">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
        <Smartphone className="w-5 h-5 text-accent-green" />
        TrustRx-Lite Live SMS Feed
      </h2>

      {/* Scrollable SMS List */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-2">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-background border border-card-border rounded-lg p-4 hover:border-accent-green/50 transition-colors text-xs font-mono"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-accent-green">{report.sender}</span>
              <span className="text-text-secondary flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(report.timestamp)}
              </span>
            </div>

            <div className="space-y-1 text-text-secondary">
              <p>
                <span className="text-foreground">LOC:</span> {report.location}
              </p>
              <p>
                <span className="text-foreground">SYMP:</span> {report.symptoms.join(', ')}
              </p>
              <p>
                <span className="text-foreground">STATUS:</span>{' '}
                <span className="text-accent-green">{report.status}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-card-border text-xs text-text-secondary">
        <p>Latest feed from {reports.length} active nodes</p>
      </div>
    </div>
  )
}
