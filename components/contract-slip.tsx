'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, ChevronDown, Hourglass } from 'lucide-react'
import { DAY, RULES, dateTime, due, endsAt, phase, quote, type Contract } from '@/lib/cultivation-preview'
import { useCultivationPreview } from './cultivation-preview-provider'
import { PeachValue, UsdtValue } from './peach-value'
import { cycleText } from '@/lib/game-data'
import { durationText } from '@/lib/summon-preview'
import { nextMatchAfter } from '@/lib/trade'
import { useProduct } from './product-provider'
import { CultivationConfirm } from './cultivation-confirm'

function countdown(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(Math.max(0, ms) / DAY)}天 ${[Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).join(':')}`
}

/** 同类型角色以召唤日期、配套金额和进度区分，不显示编号。 */
export function ContractSlip({ contract: c }: { contract: Contract }) {
  const { now, state, busy, act } = useCultivationPreview()
  const trade = useProduct().state?.trades.find(t => t.contractId === c.id)
  const [confirmation, setConfirmation] = useState<'train' | null>(null)
  const rule = RULES[c.stage]
  const status = phase(c, now)
  const pending = due(c, now)
  const q = quote([c], now, false)
  const complete = c.completed === rule.days
  const ended = now >= endsAt(c)
  return <article className={`contract-slip ${pending ? 'is-due' : 'is-done'}`} aria-label={`${rule.name}生命周期`}>
    <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4"><h2 className="font-display text-base font-semibold text-[var(--gold-100)]">{rule.name}</h2><span className={`house-chip ${pending ? 'is-due' : ''}`}>{status}</span></header>
    <dl className="contract-slip-grid px-4 pt-3"><div><dt>召唤日期 · 北京时间</dt><dd className="!text-xs">{dateTime(c.started)}</dd></div><div><dt>配套金额</dt><dd><UsdtValue cents={c.principal} size="sm" muted /></dd></div><div className="col-span-2"><dt>原生命周期结束</dt><dd className="!text-xs">{dateTime(endsAt(c))}</dd></div></dl>
    <div className="flex flex-col gap-4 px-4 pb-4 pt-4">
      <section aria-label="修炼任务" className="border-t border-[var(--gold-600)]/25 pt-3"><h3 className="flex justify-between text-xs text-[var(--gold-200)]"><span>今日修炼</span><span>{c.completed} / {rule.days}</span></h3><progress aria-label="修炼进度" className="cultivation-progress mt-3" value={c.completed} max={rule.days} />
        {!complete && <><p className="mt-3 text-xs leading-5 text-stone-300">{pending ? `待完成修炼：${pending}次${pending > 1 ? '，包含此前漏修' : ''}` : '今日已修炼，明日继续'}{ended ? '；原周期已结束，补齐后即可检查传承。' : ''}</p>{pending > 0 && <button type="button" className="cultivation-primary mt-3 w-full" disabled={busy} onClick={() => setConfirmation('train')}>{pending > 1 || ended ? '一键完成修炼' : '开始修炼'}&nbsp;{q.total ? <PeachValue cents={q.total} size="sm" className="!text-inherit" /> : '· 不消耗'}</button>}</>}
        {complete && <p className="mt-3 flex items-center justify-center gap-2 text-xs text-[var(--gold-200)]"><Check className="size-4" aria-hidden />修炼圆满 · 全部修炼已完成</p>}
      </section>
      {complete && !ended && <p className="text-center text-[11px] leading-5 text-stone-400">等待传承 · 原生命周期不变<br /><span className="font-mono text-[var(--gold-100)]">{countdown(endsAt(c) - now)}</span></p>}
      {ended && !complete && <p className="text-center text-xs leading-6 text-[var(--gold-200)]">{status}。补齐修炼后进入传承，等待匹配甲方。</p>}
      {status === '传承中' && (trade ? <Link href={`/me/trades/${encodeURIComponent(trade.id)}`} className="flex flex-col items-center gap-1 text-center text-xs text-[var(--gold-200)]"><span className="flex items-center gap-2"><Hourglass className="size-4" aria-hidden />传承中 · 已匹配甲方，等待对方打款</span><span className="text-[11px] text-stone-400">打款剩余 <span className="font-mono text-[var(--gold-100)]">{durationText(Math.max(0, trade.deadline - now))}</span> · 查看交易</span></Link>
        : <p className="flex flex-col items-center gap-1 text-center text-xs text-[var(--gold-200)]"><span className="flex items-center gap-2"><Hourglass className="size-4" aria-hidden />传承中 · 等待下一轮召唤匹配甲方</span><span className="text-[11px] text-stone-400">预计 {dateTime(nextMatchAfter(c.stage, Math.max(endsAt(c), c.trainingCompletedAt ?? endsAt(c), now)))} 匹配</span></p>)}
      {status === '传承完成' && trade && <Link href={`/me/trades/${encodeURIComponent(trade.id)}`} className="cultivation-primary flex w-full items-center justify-center">甲方已打款 · 去确认收款</Link>}
    </div>
    <details className="cultivation-details !mx-4"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-xs text-stone-300">修炼详情<ChevronDown className="size-4" aria-hidden /></summary><dl className="cultivation-facts pb-4"><div><dt>修炼周期</dt><dd>{cycleText(rule)}</dd></div><div><dt>圆满增幅</dt><dd>+{rule.gain}%</dd></div><div><dt>每日修炼</dt><dd>{rule.daily ? <PeachValue cents={rule.daily} size="xs" muted /> : '不消耗'}</dd></div><div><dt>全周期修炼消耗</dt><dd>{rule.daily ? <PeachValue cents={rule.daily * rule.days} size="xs" muted /> : '不消耗'}</dd></div></dl></details>
    {confirmation === 'train' && <CultivationConfirm estimate={q} balance={state.balance} busy={busy} onClose={() => setConfirmation(null)} onConfirm={() => { act({ type: 'train', ids: [c.id], accelerate: false, expected: q.total }); setConfirmation(null) }} />}
  </article>
}
