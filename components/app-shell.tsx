'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from './bottom-nav'
import { SoundToggle } from './sound-toggle'
import { useGame } from '@/lib/game-context'
import { useDemoControls } from '@/lib/use-demo-controls'
import { TrialRibbon, TrialWelcome } from './trial-notice'

const sectionBackgrounds = {
  world: '/assets/wukong-world-daylight.png',
  house: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Codex%20Image%202026%E5%B9%B49%E6%9C%8819%E6%97%A5%2005_12_44-zlzBPYW6zI7l3ugeGy8WoyZ4zo6rwz.png',
  me: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Codex%20Image%202026%E5%B9%B49%E6%9C%8819%E6%97%A5%2005_09_27-i6tWKRYVpj6gPgJIIcVpkabzI3UBKw.png',
}

function AtmosphereBackground({ section }: { section: string }) {
  const isWorld = section === 'world'
  const background = sectionBackgrounds[section as keyof typeof sectionBackgrounds]
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--ink-900)]" aria-hidden data-background={section}>
      {background && (
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: `url('${background}')`, backgroundPosition: 'center top' }}
        />
      )}
      {/* drifting cloud haze */}
      <div
        className="absolute inset-0"
        style={{
          opacity: background ? 1 : 0.7,
          background: isWorld
            ? 'linear-gradient(180deg, rgba(5,5,6,.08), rgba(5,5,6,.16) 50%, rgba(5,5,6,.3))'
            : background
            ? 'linear-gradient(180deg, rgba(5,5,6,.8), rgba(5,5,6,.68) 30%, rgba(5,5,6,.74) 60%, rgba(5,5,6,.86) 100%)'
            : 'radial-gradient(60% 40% at 20% 12%, rgba(120,90,30,0.22), transparent 60%), radial-gradient(50% 45% at 85% 8%, rgba(80,60,120,0.14), transparent 60%), radial-gradient(70% 60% at 50% 110%, rgba(160,20,20,0.14), transparent 60%)',
        }}
      />
      {/* subtle animated smoke */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(2px 2px at 30% 40%, rgba(255,207,92,0.5), transparent), radial-gradient(2px 2px at 70% 60%, rgba(255,207,92,0.35), transparent), radial-gradient(1px 1px at 50% 80%, rgba(255,207,92,0.4), transparent)',
          backgroundSize: '900px 900px, 700px 700px, 500px 500px',
          animation: 'cloud-pan 60s linear infinite',
        }}
      />
      {/* rising embers */}
      {[12, 34, 58, 72, 88].map((left, i) => (
        <span
          key={left}
          className="absolute bottom-24 h-1 w-1 rounded-full bg-[var(--gold-300)]"
          style={{
            left: `${left}%`,
            animation: `ember-drift ${6 + i}s ease-in ${i * 1.4}s infinite`,
            boxShadow: '0 0 8px rgba(255,207,92,0.9)',
          }}
        />
      ))}
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, error, retry } = useGame()
  const pathname = usePathname()
  // 在外壳里读取一次 ?demo=1 / ?demo=0，这样从任何页面（包括首页）进入都能生效
  useDemoControls()

  if (pathname === '/') return (
    <div className="relative isolate min-h-dvh">
      <TrialRibbon />
      <SoundToggle />
      <main>{children}</main>
      <BottomNav />
    </div>
  )

  const isCultivationPreview = pathname === '/house' || pathname.startsWith('/house/') || pathname === '/world' || pathname.startsWith('/world/')
  return (
    <div className="relative isolate min-h-dvh">
      <TrialRibbon />
      <TrialWelcome />
      <SoundToggle />
      <AtmosphereBackground section={pathname.split('/')[1]} />
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
        <main className="flex-1 px-4 pb-40 pt-4">
          {isCultivationPreview ? children : error ? (
            <div role="alert" className="panel rounded-2xl p-6 text-center">
              <h1 className="font-display text-lg text-gold">存档连接中断</h1>
              <p className="my-4 text-sm leading-relaxed">{error}</p>
              <button onClick={retry} className="btn-gold rounded-lg px-6 py-2">重新连接</button>
            </div>
          ) : loading ? (
            <div role="status" className="panel rounded-2xl p-8 text-center text-sm">正在读取匿名存档…</div>
          ) : children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
