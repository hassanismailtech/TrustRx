'use client'

import { Lock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LogEntry {
  id: string
  message: string
  timestamp: Date
}

const mockLogEntries: LogEntry[] = [
  {
    id: '1',
    message: 'Hashing SMS payload...',
    timestamp: new Date(Date.now() - 30000),
  },
  {
    id: '2',
    message: 'HCS txId: 0.0.345892@167888...',
    timestamp: new Date(Date.now() - 25000),
  },
  {
    id: '3',
    message: 'Status: IMMUTABLE ANCHOR CONFIRMED',
    timestamp: new Date(Date.now() - 20000),
  },
  {
    id: '4',
    message: 'HL7-FHIR resource generated and sent to SORMAS API',
    timestamp: new Date(Date.now() - 15000),
  },
  {
    id: '5',
    message: 'Merkle tree updated',
    timestamp: new Date(Date.now() - 10000),
  },
  {
    id: '6',
    message: 'Consensus reached - Block finalized',
    timestamp: new Date(Date.now() - 5000),
  },
]

export function HederaLedger() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogEntries)

  useEffect(() => {
    // Simulate new log entries
    const interval = setInterval(() => {
      const messages = [
        'Hashing SMS payload...',
        'HCS txId: 0.0.345892@167888...',
        'Status: IMMUTABLE ANCHOR CONFIRMED',
        'HL7-FHIR resource generated and sent to SORMAS API',
        'Merkle tree updated',
        'Consensus reached - Block finalized',
        'Transaction verified across 13 mirror nodes',
        'Data integrity check: PASSED',
      ]

      setLogs((prev) => {
        const newLog: LogEntry = {
          id: Date.now().toString(),
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date(),
        }
        return [newLog, ...prev.slice(0, 6)]
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-black border-2 border-accent-green/50 rounded-lg p-6 terminal-glow">
      <h2 className="text-lg font-bold text-accent-green flex items-center gap-2 mb-6 font-mono">
        <Lock className="w-5 h-5" />
        Hedera HCS Cryptographic Ledger
      </h2>

      {/* Terminal-like log output */}
      <div className="bg-black rounded-lg p-4 font-mono text-sm space-y-2 h-64 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="text-accent-green opacity-90 flex items-start gap-3 animate-in fade-in duration-300">
            <span className="text-accent-green/60 flex-shrink-0 mt-1">{'>'}</span>
            <div className="flex-1">
              <p className="break-words">{log.message}</p>
              <p className="text-accent-green/40 text-xs mt-0.5">
                [{log.timestamp.toLocaleTimeString()}]
              </p>
            </div>
          </div>
        ))}

        {/* Blinking cursor */}
        <div className="text-accent-green font-mono text-sm flex items-center gap-1">
          <span>{'>'}</span>
          <span className="animate-pulse">_</span>
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-4 pt-4 border-t border-accent-green/30 grid grid-cols-3 gap-4 text-xs text-accent-green">
        <div>
          <p className="text-accent-green/60">Transactions</p>
          <p className="font-bold">847</p>
        </div>
        <div>
          <p className="text-accent-green/60">Block Height</p>
          <p className="font-bold">12,847</p>
        </div>
        <div>
          <p className="text-accent-green/60">Network Health</p>
          <p className="font-bold">100%</p>
        </div>
      </div>
    </div>
  )
}
