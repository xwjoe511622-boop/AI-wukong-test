'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSound } from '@/lib/sound'

const ITEMS = [
  { href: '/', label: '首页', asset: 'home' },
  { href: '/world', label: '悟空世界', asset: 'world' },
  { href: '/house', label: '猴舍', asset: 'house' },
  { href: '/me', label: '我的', asset: 'me' },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const { play } = useSound()

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
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className="pointer-events-auto relative block w-1/4 max-w-[104px] rounded-xl outline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--gold-300)]"
              >
                <Image
                  src={`/assets/nav-${asset}-default.png?v=2`}
                  alt=""
                  width={274}
                  height={332}
                  priority
                  className={cn('block h-auto w-full transition-opacity duration-200 motion-reduce:transition-none', active ? 'opacity-0' : 'opacity-100')}
                />
                <Image
                  src={`/assets/nav-${asset}-active.png?v=2`}
                  alt=""
                  width={274}
                  height={332}
                  priority
                  className={cn('absolute inset-0 h-auto w-full transition-opacity duration-200 motion-reduce:transition-none', active ? 'opacity-100' : 'opacity-0')}
                />
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
