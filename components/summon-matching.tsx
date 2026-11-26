'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { LEVEL_BY_ID } from '@/lib/game-data'
import { matchAt, matchStage } from '@/lib/summon-preview'
import { useProduct } from './product-provider'

/** 匹配过程里依次出现的三句话；后端没出结果就一直停在最后一句 */
export const MATCH_STEPS = ['排队中', '正在为你匹配', '结果即将揭晓']
export const matchStep = (elapsed: number) => elapsed < 4000 ? 0 : elapsed < 9000 ? 1 : 2

/** 不在仙境页、首页时：顶部滑下一条「正在匹配」，点了过去看 */
export function MatchBanner() {
  const { state, now, ready } = useProduct()
  const pathname = usePathname()
  const search = useSearchParams()
  if (!ready || !state) return null
  const entry = state.entries.filter(e => matchStage(e, now)).sort((a, b) => a.deadline - b.deadline)[0]
  if (!entry) return null
  // 首页待办那一行、仙境页本身已经在演，不重复
  if (pathname === '/' || (pathname === '/world' && search.get('stage') === entry.stage)) return null
  const stage = matchStage(entry, now)
  const name = LEVEL_BY_ID[entry.stage].name
  return <div className="pointer-events-none fixed inset-x-0 top-0 z-[55] mx-auto w-full max-w-[480px] pt-[env(safe-area-inset-top)]">
    <Link href={`/world?stage=${entry.stage}#summon-action`} className="match-banner">
      <span className="match-banner-dot" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{stage === 'soon' ? `${name} · ${Math.max(0, Math.ceil((matchAt(entry) - now) / 1000))} 秒后开始匹配` : `${name} · 系统正在匹配…`}</span>
      <span className="flex shrink-0 items-center text-[var(--gold-200)]">去看<ChevronRight className="size-3.5" aria-hidden /></span>
    </Link>
  </div>
}
