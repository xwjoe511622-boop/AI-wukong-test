'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from './bottom-nav'
import { useGame } from '@/lib/game-context'
import { TrialRibbon } from './trial-notice'
import { NoticeBell, NoticeToast } from './notifications'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, error, retry } = useGame()
  const pathname = usePathname()

  if (pathname === '/') return (
    <div className="relative isolate min-h-dvh">
      <TrialRibbon />
      <NoticeToast />
      <NoticeBell />
      <main>{children}</main>
      <BottomNav />
    </div>
  )

  const isCultivationPreview = pathname === '/house' || pathname.startsWith('/house/') || pathname === '/world' || pathname.startsWith('/world/')
  return (
    <div className="app-plain relative isolate min-h-dvh">
      <TrialRibbon />
      <NoticeToast />
      <NoticeBell />
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
        <main className="flex-1 px-4 pb-40 pt-4">
          {isCultivationPreview ? children : error ? (
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
