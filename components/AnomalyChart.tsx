'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

const chartData = [
  { time: '12 hrs ago', baseline: 120, current: 125 },
  { time: '10 hrs ago', baseline: 130, current: 128 },
  { time: '8 hrs ago', baseline: 125, current: 130 },
  { time: '6 hrs ago', baseline: 135, current: 145 },
  { time: '4 hrs ago', baseline: 140, current: 220 },
  { time: '2 hrs ago', baseline: 145, current: 380 },
  { time: 'Now', baseline: 150, current: 520 },
]

export function AnomalyChart() {
  return (
    <div className="bg-card border border-card-border rounded-lg p-6">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-accent-red" />
        AI Anomaly Detection Chart
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value) => [value.toString(), '']}
          />
          <Line
            type="monotone"
            dataKey="baseline"
            stroke="#f1f5f9"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Historical Baseline"
          />
          <Line
            type="monotone"
            dataKey="current"
            stroke="#ef4444"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            name="Current Symptom Frequency"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 flex gap-8 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-foreground rounded-full"></div>
          <span className="text-text-secondary">Historical Baseline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent-red rounded-full"></div>
          <span className="text-text-secondary">Current Symptom Frequency</span>
        </div>
      </div>
    </div>
  )
}
