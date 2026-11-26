'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from './bottom-nav'
import { useGame } from '@/lib/game-context'
import { TrialRibbon } from './trial-notice'
import { NoticeBell, NoticeToast } from './notifications'
import { MatchBanner } from './summon-matching'
import { ConnectCard, WalletButton, useWallet } from './wallet-gate'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, error, retry } = useGame()
  const pathname = usePathname()
  const wallet = useWallet()
  const connected = !!wallet.session
  // 猴舍和「我的」要看账户：没连接钱包时显示连接卡片。百科、公告、客服、关于不用连接也能看
  const OPEN_PAGES = ['/me/encyclopedia', '/me/announcements', '/me/support', '/me/about']
  const needsWallet = !connected && (pathname === '/house' || pathname.startsWith('/house/') || pathname === '/me' || (pathname.startsWith('/me/') && !OPEN_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'))))

  if (pathname === '/') return (
    <div className="relative isolate min-h-dvh">
      <TrialRibbon />
      <NoticeToast />
      <MatchBanner />
      {connected && <NoticeBell />}
      <div className={`wallet-slot ${connected ? 'is-connected' : ''}`}><WalletButton /></div>
      <main>{children}</main>
      <BottomNav />
    </div>
  )

  const isCultivationPreview = pathname === '/house' || pathname.startsWith('/house/') || pathname === '/world' || pathname.startsWith('/world/')
  return (
    <div className="app-plain relative isolate min-h-dvh">
      <TrialRibbon />
      <NoticeToast />
      <MatchBanner />
      {connected && <NoticeBell />}
      {/* 「我的」页头部已经显示地址，右上角不再重复钱包图标 */}
      {!needsWallet && !(connected && pathname === '/me') && <div className={`wallet-slot ${connected ? 'is-connected' : ''}`}><WalletButton /></div>}
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
        <main className="flex-1 px-4 pb-40 pt-4">
          {needsWallet ? <ConnectCard links={pathname === '/me'} title={pathname.startsWith('/house') ? '连接钱包，进入你的猴舍' : undefined} note={pathname.startsWith('/house') ? '连接后可以看到你的悟空，并每天为它修炼。' : undefined} /> : isCultivationPreview ? children : error ? (
            <div role="alert" className="panel rounded-2xl p-6 text-center">
              <h1 className="font-display text-lg text-gold">连接中断</h1>
              <p className="my-4 text-sm leading-relaxed">{error}</p>
              <button onClick={retry} className="btn-gold rounded-lg px-6 py-2">重新连接</button>
            </div>
          ) : loading ? (
            <div role="status" className="panel rounded-2xl p-8 text-center text-sm">正在读取…</div>
          ) : children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
