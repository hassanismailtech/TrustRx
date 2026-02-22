import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        foreground: '#f1f5f9',
        card: '#1e293b',
        'card-border': '#334155',
        'accent-red': '#ef4444',
        'accent-green': '#22c55e',
        'accent-amber': '#f59e0b',
        'text-secondary': '#94a3b8',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
