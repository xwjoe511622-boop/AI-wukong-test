'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LEVEL_BY_ID } from '@/lib/game-data'
import { money, quote, summarize } from '@/lib/cultivation-preview'
import { durationText } from '@/lib/summon-preview'
import { currentSummon } from '@/lib/home'
import { pendingTrades, type Trade } from '@/lib/trade'
import { HomeHero } from './home-hero'
import { useProduct } from './product-provider'
import { PeachValue, UsdtValue } from './peach-value'
import { Countdown } from './trade-ui'

export function HomeView() {
  const { state, ready, now } = useProduct()
  const todo = pendingTrades(state?.trades ?? [])
  return <div className="home-page">
    <h1 className="sr-only">AI 悟空</h1>
    <HomeHero />
    <div className="home-body">
      {!ready || !state ? <p role="status" className="py-10 text-center text-sm text-stone-300">正在读取…</p> : <>
        {todo.length > 0 && <TodoCard trades={todo} now={now} />}
        <SummonCard now={now} />
        <HouseCard now={now} />
        <Link href="/me/wallet" className="home-card" aria-label="我的资产">
          <div className="flex items-center justify-between"><h2 className="home-card-title">我的资产</h2><ChevronRight className="size-4 text-[var(--gold-400)]" /></div>
          <div className="mt-3 grid grid-cols-2 gap-3"><div><p className="home-label">蟠桃</p><PeachValue cents={state.balance} size="lg" className="mt-1" /></div><div className="border-l border-[#b0904b38] pl-4"><p className="home-label">USDT</p><UsdtValue cents={state.usdt} size="lg" className="mt-1" /></div></div>
        </Link>
      </>}
    </div>
  </div>
}

/** 待办：待打款、待确认收款。有才显示，排在最前 */
function TodoCard({ trades, now }: { trades: Trade[]; now: number }) {
  const first = trades[0]
  const payer = first.role === 'payer'
  const more = trades.length > 1
  return <section className="home-card is-todo" aria-labelledby="home-todo-title">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="trade-chip is-todo">{payer ? '待打款' : '待确认收款'}{more ? ` · 共 ${trades.length} 笔待办` : ''}</p>
        <h2 id="home-todo-title" className="mt-1.5 font-display text-base font-bold text-[#ffe9c2]">{LEVEL_BY_ID[first.stage].name} · {payer ? '向乙方打款' : '甲方已打款'}</h2>
        <p className="mt-1.5 text-xs text-stone-300">{payer ? <>剩余 <Countdown ms={first.deadline - now} /> · 逾期召唤蟠桃充公</> : '请核实到账后确认收款'}</p>
      </div>
      <div className="shrink-0 text-right"><p className="font-latin text-[22px] font-bold leading-tight tabular-nums text-gold">{money(first.amountCents)}</p><p className="text-[10px] text-stone-300">USDT</p></div>
    </div>
    <div className="mt-3.5 flex items-center gap-3">
      <Link href={`/me/trades/${encodeURIComponent(first.id)}`} className="btn-gold inline-flex flex-1 items-center justify-center text-sm">{payer ? '去打款' : '去确认收款'}</Link>
      {more && <Link href="/me/trades" className="inline-flex shrink-0 items-center gap-0.5 text-xs text-[var(--gold-200)]">全部待办<ChevronRight className="size-3.5" /></Link>}
    </div>
  </section>
}

/** 当前召唤：此刻轮到哪个仙境，以及我在这一轮里的情况 */
function SummonCard({ now }: { now: number }) {
  const { state } = useProduct()
  const current = currentSummon(state?.entries ?? [], now)
  if (current.kind === 'closed') return <section className="home-card" aria-labelledby="home-summon-title">
    <h2 id="home-summon-title" className="home-card-title">当前召唤</h2>
    <p className="mt-3 font-display text-base text-[var(--gold-100)]">今日召唤已结束</p>
    <p className="mt-1.5 text-xs text-stone-300">明日 00:00 开放预约 · 还有 <span className="font-latin tabular-nums text-[var(--gold-100)]">{durationText(Math.max(0, current.until - now))}</span></p>
    <Link href="/world" className="btn-ghost-gold mt-3.5 inline-flex w-full items-center justify-center text-sm">看看七大仙境</Link>
  </section>
  const level = LEVEL_BY_ID[current.stage]
  const live = current.kind === 'live'
  const next = current.nextBookable ? LEVEL_BY_ID[current.nextBookable] : null
  // 直接落到仙境页的操作区（召唤 / 预约召唤按钮），不用再往下翻
  const href = `/world?stage=${level.id}#summon-action`
  // 这一轮里我能做什么：召唤 / 预约召唤 / 看结果 / 什么都做不了
  const canCast = live && current.mine === 'reserved'
  const canReserve = !live && current.canReserve && current.mine === 'none'
  const settled = current.mine === 'success' || current.mine === 'refunded' || current.mine === 'forfeited'
  const mineText = current.mine === 'reserved' ? (live ? '已预约 · 现在可以召唤' : '已预约 · 等待召唤开始')
    : current.mine === 'success' ? '本轮召唤成功' : current.mine === 'refunded' ? '本轮召唤未成功 · 蟠桃已退还' : current.mine === 'forfeited' ? '本轮逾期未打款'
    : live ? '未预约本轮，不能召唤' : current.canReserve ? '尚未预约' : '预约已截止，本轮不能召唤'
  return <section className={`home-card !p-0 ${canCast ? 'is-todo' : ''}`} aria-labelledby="home-summon-title">
    <Link href={href} className="flex items-stretch gap-3 p-3">
      <span className="relative w-[104px] shrink-0 overflow-hidden rounded-lg border border-[#b0904b55]"><Image src={level.realmCover} alt="" fill sizes="104px" className="object-cover" /><Image src={level.characterImage} alt="" fill sizes="104px" className="object-contain object-bottom" /></span>
      <span className="flex min-w-0 flex-1 flex-col py-0.5">
        <span className="flex items-center justify-between gap-2"><span id="home-summon-title" className="home-card-title">{live ? '当前召唤' : '即将召唤'}</span><span className={`trade-chip ${live ? 'is-todo' : 'is-wait'}`}>{live ? '召唤中' : `${level.summonStartTime} 开始`}</span></span>
        <span className="mt-2 block truncate font-display text-lg font-bold leading-tight text-gold">{level.name}</span>
        <span className="mt-0.5 block text-[11px] text-[var(--gold-200)]">{level.realm} · {level.summonWindow}</span>
        <span className="mt-2 block text-xs text-stone-300">{live ? '距本轮结束' : '距召唤开始'} <span className="font-latin text-base font-bold tabular-nums text-[var(--gold-100)]">{durationText(Math.max(0, current.until - now))}</span></span>
        <span className={`mt-1 block text-[11px] ${canCast ? 'text-[#ffd9a0]' : 'text-stone-400'}`}>{mineText}</span>
      </span>
    </Link>
    <div className="flex items-center gap-3 border-t border-[#b0904b2e] px-3 py-2.5">
      {canCast ? <Link href={href} className="btn-gold inline-flex flex-1 items-center justify-center text-sm">去召唤</Link>
        : canReserve ? <Link href={href} className="btn-gold inline-flex flex-1 items-center justify-center text-sm">预约召唤</Link>
        : settled || current.mine === 'reserved' ? <Link href={href} className="btn-ghost-gold inline-flex flex-1 items-center justify-center text-sm">{settled ? '查看本轮结果' : '查看我的预约'}</Link>
        : next ? <Link href={`/world?stage=${next.id}#summon-action`} className="btn-gold inline-flex flex-1 items-center justify-center text-sm">预约下一个 · {next.name}</Link>
        : <Link href="/world" className="btn-ghost-gold inline-flex flex-1 items-center justify-center text-sm">看看七大仙境</Link>}
      <Link href="/world" className="inline-flex shrink-0 items-center gap-0.5 text-xs text-[var(--gold-200)]">七大仙境<ChevronRight className="size-3.5" /></Link>
    </div>
  </section>
}

/** 我的猴舍：有几只、今天还有几只没修炼 */
function HouseCard({ now }: { now: number }) {
  const { state } = useProduct()
  const contracts = state?.contracts ?? []
  const summary = summarize(contracts, now)
  const today = quote(contracts, now, false)
  const due = today.items.length
  return <Link href="/house" className="home-card" aria-label="我的猴舍">
    <div className="flex items-center justify-between"><h2 className="home-card-title">我的猴舍</h2><ChevronRight className="size-4 text-[var(--gold-400)]" /></div>
    {summary.total ? <div className="mt-3 flex items-end justify-between gap-3">
      <div><p className="home-label">当前悟空</p><p className="mt-1 font-latin text-2xl font-bold leading-none tabular-nums text-[var(--gold-100)]">{summary.total}<span className="ml-1 font-display text-xs font-normal text-stone-300">只</span></p></div>
      <div className="text-right">{due ? <><p className="trade-chip is-todo">今日待修炼 {due} 只</p><p className="mt-1.5 flex items-center justify-end gap-1.5 text-[11px] text-stone-300">需 <PeachValue cents={today.total} size="sm" /></p></> : <p className="trade-chip is-done">今日修炼已完成</p>}</div>
    </div> : <p className="mt-3 text-xs leading-6 text-stone-300">猴舍还没有悟空。召唤成功并完成打款后，悟空会住进这里。</p>}
  </Link>
}
