'use client'

import { useLang } from './lang-provider'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSound } from '@/lib/sound'
import { pendingTrades } from '@/lib/trade'
import { useProduct } from './product-provider'

const ITEMS = [
  { href: '/', label: '首页', asset: 'home' },
  { href: '/world', label: '召唤', asset: 'world' },
  { href: '/house', label: '猴舍', asset: 'house' },
  { href: '/me', label: '我的', asset: 'me' },
] as const

/** 导航图标上的中文字是画在图里的；英文模式下用同样位置的文字牌盖住 */
const EN_LABELS: Record<string, string> = { '/': 'Home', '/world': 'Summon', '/house': 'Den', '/me': 'Me' }

export function BottomNav() {
  const pathname = usePathname()
  const { play } = useSound()
  const { lang } = useLang()
  const { state } = useProduct()
  const todo = pendingTrades(state?.trades ?? []).length

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] pb-[env(safe-area-inset-bottom)]"
      aria-label="主导航"
    >
      <div className="relative isolate px-5 pb-2">
        <div aria-hidden="true" className="absolute inset-x-5 bottom-3 -z-10 h-12 rounded-[50%] bg-black/90 blur-md" />
        <Image
          src="/assets/nav-rail.png?v=2"
          alt=""
          width={2172}
          height={210}
          priority
          className="absolute inset-x-0 bottom-1 -z-10 h-14 w-full object-fill"
        />
        <div className="flex items-end justify-between">
          {ITEMS.map(({ href, label, asset }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => { if (!active) play('nav') }}
                aria-label={href === '/me' && todo ? `${label}，${todo} 笔交易待处理` : label}
                aria-current={active ? 'page' : undefined}
                className="pointer-events-auto relative block w-1/4 max-w-[104px] rounded-xl outline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--gold-300)]"
              >
                <Image
                  src={`/assets/nav-${asset}-default.png?v=3`}
                  alt=""
                  width={274}
                  height={332}
                  priority
                  className={cn('block h-auto w-full transition-opacity duration-200 motion-reduce:transition-none', active ? 'opacity-0' : 'opacity-100')}
                />
                <Image
                  src={`/assets/nav-${asset}-active.png?v=3`}
                  alt=""
                  width={274}
                  height={332}
                  priority
                  className={cn('absolute inset-0 h-auto w-full transition-opacity duration-200 motion-reduce:transition-none', active ? 'opacity-100' : 'opacity-0')}
                />
                {lang === 'en' && <span className="nav-en" data-no-i18n aria-hidden="true">{EN_LABELS[href]}</span>}
                {href === '/me' && todo > 0 && <span className="nav-badge" aria-hidden="true">{todo > 9 ? '9+' : todo}</span>}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
