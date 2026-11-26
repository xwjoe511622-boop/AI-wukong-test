import { TRIAL_MODE } from '@/lib/game-data'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { connection } from 'next/server'
import './globals.css'
import { GameProvider } from '@/lib/game-context'
import { AppShell } from '@/components/app-shell'
import { AppOpening } from '@/components/app-opening'
import { ProductProvider } from '@/components/product-provider'
import { SoundProvider } from '@/lib/sound'
import { WalletGate } from '@/components/wallet-gate'

export const metadata: Metadata = {
  title: 'AI WUKONG · AI悟空数字生命',
  description: 'AI WUKONG：每一只悟空都是一个 AI 智能体。召唤、修炼、传承，让东方神话由参与的人共同写下去。',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#050506',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await connection()
  const initialNow = Date.now()

  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SoundProvider>
          <WalletGate>
            <ProductProvider>
              <GameProvider initialNow={initialNow}>
                <AppOpening>
                  <AppShell>{children}</AppShell>
                </AppOpening>
              </GameProvider>
            </ProductProvider>
          </WalletGate>
        </SoundProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
