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

export const metadata: Metadata = {
  title: 'AI WUKONG · AI悟空数字生命',
  description: `AI WUKONG$：AI 悟空数字生命的世界设定，经历召唤、修炼、圆满与传承。`,
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
          href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Cinzel:wght@600;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SoundProvider>
          <ProductProvider>
            <GameProvider initialNow={initialNow}>
              <AppOpening>
                <AppShell>{children}</AppShell>
              </AppOpening>
            </GameProvider>
          </ProductProvider>
        </SoundProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
