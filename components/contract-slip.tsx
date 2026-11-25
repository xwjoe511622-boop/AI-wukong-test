'use client'

import Link from 'next/link'
import { ChevronDown, Hourglass } from 'lucide-react'
import { DAY, RULES, dateTime, endsAt, journal, liveValue, phase, progress, type Contract } from '@/lib/cultivation-preview'
import { useCultivationPreview } from './cultivation-preview-provider'
import { PeachValue, UsdtValue } from './peach-value'
import { cycleText } from '@/lib/game-data'
import { durationText } from '@/lib/summon-preview'
import { nextMatchAfter } from '@/lib/trade'
import { useProduct } from './product-provider'

function countdown(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(Math.max(0, ms) / DAY)}天 ${[Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).join(':')}`
}

/** 同类型角色以召唤日期、修炼值和进度区分，不显示编号。 */
export function ContractSlip({ contract: c }: { contract: Contract }) {
  const { now } = useCultivationPreview()
  const trade = useProduct().state?.trades.find(t => t.contractId === c.id)
  const rule = RULES[c.stage]
  const status = phase(c, now)
  const p = progress(c, now)
  const notes = journal(c, now)
  // 修炼值在眼前慢慢涨：整数部分大，小数四位，看得见它在动
  const [whole, fraction] = liveValue(c, now).toFixed(4).split('.')
  return <article className="contract-slip is-done" aria-label={`${rule.name}修炼台`}>
    <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4"><h2 className="font-display text-base font-semibold text-[var(--gold-100)]">{rule.name}<span className="ml-2 text-[11px] font-normal text-stone-400">{dateTime(c.started)} 召唤</span></h2><span className={`house-chip ${status === '传承完成' ? 'is-claim' : ''}`}>{status === '传承完成' ? '待确认收款' : status}</span></header>

    <section aria-label="修炼值" className="px-4 pt-4 text-center">
      <p className="text-[11px] tracking-[.2em] text-[var(--gold-200)]/80">修炼值</p>
      <p className="slip-value" aria-live="off">{Number(whole).toLocaleString('zh-CN')}<span>.{fraction}</span><small>USDT</small></p>
      <p className="mt-1 text-[11px] text-stone-400">{p.done ? `已圆满 · 修炼加成 +${rule.gain}%` : `修炼加成 +${rule.gain}% · 圆满后生效`}</p>
    </section>

    <section aria-label="修炼进度" className="px-4 pt-4">
      <ol className="slip-beads" aria-label={`共 ${p.total} 天，${p.done ? '已圆满' : `现在是第 ${p.day} 天`}`}>{Array.from({ length: p.total }, (_, i) => <li key={i} className={p.done || i + 1 < p.day ? 'is-lit' : i + 1 === p.day ? 'is-now' : ''} />)}</ol>
      <p className="mt-2.5 flex items-center justify-between text-xs text-[var(--gold-200)]"><span>{p.done ? '修炼圆满' : `自动修炼中 · 第 ${p.day} 天 / 共 ${p.total} 天`}</span>{!p.done && <span className="font-mono text-[var(--gold-100)]">{countdown(endsAt(c) - now)}</span>}</p>
    </section>

    <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
      {status === '传承中' && (trade ? <Link href={`/me/trades/${encodeURIComponent(trade.id)}`} className="flex flex-col items-center gap-1 text-center text-xs text-[var(--gold-200)]"><span className="flex items-center gap-2"><Hourglass className="size-4" aria-hidden />传承中 · 已匹配承接人，等待对方打款</span><span className="text-[11px] text-stone-400">打款剩余 <span className="font-mono text-[var(--gold-100)]">{durationText(Math.max(0, trade.deadline - now))}</span> · 查看交易</span></Link>
        : <p className="flex flex-col items-center gap-1 text-center text-xs text-[var(--gold-200)]"><span className="flex items-center gap-2"><Hourglass className="size-4" aria-hidden />传承中 · 等待下一轮召唤匹配承接人</span><span className="text-[11px] text-stone-400">预计 {dateTime(nextMatchAfter(c.stage, Math.max(endsAt(c), c.trainingCompletedAt ?? endsAt(c), now)))} 匹配</span></p>)}
      {status === '传承完成' && trade && <Link href={`/me/trades/${encodeURIComponent(trade.id)}`} className="cultivation-primary flex w-full items-center justify-center">承接人已打款 · 去确认收款</Link>}

      <section aria-label="修炼手记" className="border-t border-[var(--gold-600)]/25 pt-3">
        <h3 className="text-[11px] tracking-[.2em] text-[var(--gold-200)]/80">修炼手记</h3>
        <ol className="slip-journal">{notes.map(n => <li key={n.day}><span>第{n.day}日</span>{n.text}</li>)}</ol>
      </section>
    </div>
    <details className="cultivation-details !mx-4"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-xs text-stone-300">修炼详情<ChevronDown className="size-4" aria-hidden /></summary><dl className="cultivation-facts pb-4"><div><dt>本轮修炼值</dt><dd><UsdtValue cents={c.principal} size="xs" muted /></dd></div><div><dt>修炼天数</dt><dd>{cycleText(rule)}</dd></div><div><dt>修炼加成</dt><dd>+{rule.gain}%</dd></div><div><dt>每日修炼消耗</dt><dd>{rule.perCycleCost ? <PeachValue cents={Math.round(rule.perCycleCost * 100)} size="xs" muted /> : '不消耗'}</dd></div><div><dt>修炼蟠桃 · 进猴舍时已一次扣除</dt><dd>{rule.perCycleCost ? <PeachValue cents={Math.round(rule.perCycleCost * rule.cycleDays * 100)} size="xs" muted /> : '不消耗'}</dd></div></dl></details>
  </article>
}
