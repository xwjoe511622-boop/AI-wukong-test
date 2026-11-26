'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Hourglass } from 'lucide-react'
import { DAY, RULES, dateTime, dayIndex, due, endsAt, journal, liveValue, phase, progress, shownDays, streak, trainedDays, type Contract } from '@/lib/cultivation-preview'
import { useCultivationPreview } from './cultivation-preview-provider'
import { PeachValue, UsdtValue } from './peach-value'
import { cycleText } from '@/lib/game-data'
import { durationText } from '@/lib/summon-preview'
import { nextMatchAfter } from '@/lib/trade'
import { useProduct } from './product-provider'
import { useSound } from '@/lib/sound'

/** 按住运功多久算完成（毫秒） */
const HOLD_MS = 1400

function countdown(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(Math.max(0, ms) / DAY)}天 ${[Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).join(':')}`
}

/** 同类型角色以召唤日期、修炼值和进度区分，不显示编号。 */
export function ContractSlip({ contract: c }: { contract: Contract }) {
  const { now, act, state } = useCultivationPreview()
  const trade = useProduct().state?.trades.find(t => t.contractId === c.id)
  const rule = RULES[c.stage]
  const status = phase(c, now)
  const p = progress(c, now)
  const notes = journal(c, now)
  // 每天自己点修炼：点了才扣当天的蟠桃、才有当天的修炼加成；漏了不能补
  const canTrain = due(c, now) > 0
  const trained = new Set(trainedDays(c))
  const slot = (i: number) => Math.min(rule.days - 1, Math.floor(i / rule.dayFactor))
  const current = p.done ? -1 : dayIndex(c, now)
  const doneDays = shownDays(c.stage, c.completed)
  const short = state.balance < rule.daily
  const run = streak(c, now)
  const { play } = useSound()
  // 按住运功：按满 HOLD_MS 才算修炼，中途松手不算
  const [holding, setHolding] = useState(false)
  const [burst, setBurst] = useState(0)
  const [roll, setRoll] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const train = () => {
    setHolding(false)
    act({ type: 'train', ids: [c.id], accelerate: false, expected: rule.daily })
    play('breakthrough')
    setBurst(n => n + 1)
  }
  const press = () => { if (short || timer.current) return; play('tap'); setHolding(true); timer.current = setTimeout(() => { timer.current = null; train() }, HOLD_MS) }
  const release = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null } setHolding(false) }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  // 修炼那一刻：修炼值的小数快速滚动一小段
  useEffect(() => {
    if (!burst) return
    const started = Date.now()
    const id = setInterval(() => { if (Date.now() - started > 1100) { setRoll(null); clearInterval(id) } else setRoll(String(Math.floor(Math.random() * 10000)).padStart(4, '0')) }, 60)
    return () => { clearInterval(id); setRoll(null) }
  }, [burst])
  // 修炼值在眼前慢慢涨：整数部分大，小数四位，看得见它在动
  const [whole, fraction] = liveValue(c, now).toFixed(4).split('.')
  return <article className={`contract-slip ${status === '修炼中' && canTrain ? 'is-due' : 'is-done'} ${burst ? 'is-burst' : ''}`} aria-label={`${rule.name}修炼台`}>
    {burst > 0 && <Image key={burst} src="/assets/peach.png" alt="" width={34} height={34} className="slip-fly" aria-hidden />}
    {burst > 0 && rule.daily > 0 && <p key={`s${burst}`} className="slip-spent" role="status">−{(rule.daily / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}<Image src="/assets/peach.png" alt="蟠桃" width={26} height={26} /></p>}
    <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4"><h2 className="font-display text-base font-semibold text-[var(--gold-100)]">{rule.name}<span className="ml-2 text-[11px] font-normal text-stone-400">{dateTime(c.started)} 召唤</span></h2><span className={`house-chip ${status === '传承完成' ? 'is-claim' : ''}`}>{status === '传承完成' ? '待确认收款' : status}</span></header>

    <section aria-label="修炼值" className="px-4 pt-4 text-center">
      <p className="text-[11px] tracking-[.2em] text-[var(--gold-200)]/80">修炼值</p>
      <p key={`v${burst}`} className={`slip-value ${burst ? 'is-surge' : ''}`} aria-live="off">{Number(whole).toLocaleString('zh-CN')}<span>.{roll ?? fraction}</span><em className="unit not-italic">USDT</em></p>
      <p className="mt-1 text-[11px] text-stone-400">已修炼 {doneDays} / {p.total} 天 · 每天都修炼可得修炼加成 +{rule.gain}%</p>
    </section>

    <section aria-label="修炼进度" className="px-4 pt-4">
      <ol className="slip-beads" aria-label={`共 ${p.total} 天，已修炼 ${doneDays} 天${p.done ? '' : `，现在是第 ${p.day} 天`}`}>{Array.from({ length: p.total }, (_, i) => <li key={i} className={trained.has(slot(i)) ? `is-lit ${burst && slot(i) === current ? 'is-pop' : ''}` : slot(i) === current ? 'is-now' : slot(i) < current || p.done ? 'is-missed' : ''} />)}</ol>
      <p className="mt-2.5 flex items-center justify-between text-xs text-[var(--gold-200)]"><span>{p.done ? `修炼周期已结束 · 共修炼 ${doneDays} 天` : `第 ${p.day} 天 / 共 ${p.total} 天 · ${canTrain ? (rule.days > 1 ? '今日还没修炼' : '还没修炼') : (rule.days > 1 ? '今日已修炼' : '已修炼')}`}</span>{!p.done && <span className="font-mono text-[var(--gold-100)]">{countdown(endsAt(c) - now)}</span>}</p>
    </section>

    <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
      {status === '修炼中' && (canTrain ? <>
        <button type="button" className={`cultivation-primary slip-hold flex w-full items-center justify-center gap-1.5 ${holding ? 'is-holding' : ''}`} style={{ '--hold': `${HOLD_MS}ms` } as React.CSSProperties} disabled={short} aria-label={`按住修炼${rule.daily > 0 ? `，消耗 ${rule.daily / 100} 蟠桃` : ''}`}
          onPointerDown={e => { if (e.button === 0) press() }} onPointerUp={release} onPointerLeave={release} onPointerCancel={release} onContextMenu={e => e.preventDefault()}
          onClick={e => { if (e.detail === 0 && !short) train() }}>
          <span className="slip-hold-fill" aria-hidden />
          <span className="relative flex items-center gap-1.5">{holding ? '运功中…' : <>按住{rule.dayFactor > 1 ? `修炼 ${rule.dayFactor} 天` : '修炼'}{rule.daily > 0 && <> · 消耗 <PeachValue cents={rule.daily} size="sm" /></>}</>}</span>
        </button>
        <p className={`text-center text-[11px] leading-5 ${short ? 'text-[#f0a58a]' : 'text-stone-400'}`}>{short ? <>蟠桃不足，<Link href="/me/wallet?mode=buy" className="underline underline-offset-2">去购买蟠桃</Link></> : rule.days > 1 ? '按住不放，运功完成才算；过了今天不能补。' : '按住不放，运功完成才算；修炼周期结束后不能补。'}</p>
      </> : <p className="rounded-lg border border-[var(--gold-600)]/30 bg-black/30 py-2.5 text-center text-xs text-[var(--gold-100)]"><span className="inline-flex flex-wrap items-center justify-center gap-1">{rule.days > 1 ? '今日已修炼' : '已修炼'} ✓{rule.daily > 0 && <> · 本次消耗 <PeachValue cents={rule.daily} size="sm" /></>}</span>{rule.days > 1 && run > 1 ? ` · 已连续修炼 ${shownDays(c.stage, run)} 天` : ''}{rule.days > 1 && current < rule.days - 1 ? ' · 明天记得再来' : ''}</p>)}
      {status === '传承中' && (trade ? <Link href={`/me/trades/${encodeURIComponent(trade.id)}`} className="flex flex-col items-center gap-1 text-center text-xs text-[var(--gold-200)]"><span className="flex items-center gap-2"><Hourglass className="size-4" aria-hidden />传承中 · 已匹配承接人，等待对方支付</span><span className="text-[11px] text-stone-400">支付剩余 <span className="font-mono text-[var(--gold-100)]">{durationText(Math.max(0, trade.deadline - now))}</span> · 查看交易</span></Link>
        : <p className="flex flex-col items-center gap-1 text-center text-xs text-[var(--gold-200)]"><span className="flex items-center gap-2"><Hourglass className="size-4" aria-hidden />传承中 · 等待下一轮召唤匹配承接人</span><span className="text-[11px] text-stone-400">预计 {dateTime(nextMatchAfter(c.stage, Math.max(endsAt(c), now)))} 匹配</span></p>)}
      {status === '传承完成' && trade && <Link href={`/me/trades/${encodeURIComponent(trade.id)}`} className="cultivation-primary flex w-full items-center justify-center">承接人已支付 · 去确认收款</Link>}

      <section aria-label="修炼手记" className="border-t border-[var(--gold-600)]/25 pt-3">
        <h3 className="text-[11px] tracking-[.2em] text-[var(--gold-200)]/80">修炼手记</h3>
        <ol className="slip-journal">{notes.map(n => <li key={n.day} className={`${n.missed ? 'is-missed' : ''} ${burst && !n.missed && n.day === notes[0].day ? 'is-new' : ''}`}><span>第{n.day}日</span>{n.text}</li>)}</ol>
      </section>
    </div>
    <details className="cultivation-details !mx-4"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-xs text-stone-300">修炼详情<ChevronDown className="size-4" aria-hidden /></summary><dl className="cultivation-facts pb-4"><div><dt>本轮修炼值</dt><dd><UsdtValue cents={c.principal} size="xs" muted /></dd></div><div><dt>修炼天数</dt><dd>{cycleText(rule)}</dd></div><div><dt>修炼加成</dt><dd>+{rule.gain}%</dd></div><div><dt>每日修炼消耗</dt><dd>{rule.perCycleCost ? <PeachValue cents={Math.round(rule.perCycleCost * 100)} size="xs" muted /> : '不消耗'}</dd></div><div><dt>已修炼</dt><dd>{doneDays} / {p.total} 天</dd></div><div><dt>已消耗修炼蟠桃</dt><dd>{rule.perCycleCost ? <PeachValue cents={c.completed * rule.daily} size="xs" muted /> : '不消耗'}</dd></div></dl></details>
  </article>
}
