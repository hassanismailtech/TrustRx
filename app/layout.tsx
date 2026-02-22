import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TrustRx - National Syndromic Surveillance',
  description: 'Decentralized, AI-powered epidemiological surveillance system for real-time outbreak detection',
  keywords: ['epidemiology', 'surveillance', 'health', 'AI', 'blockchain'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
