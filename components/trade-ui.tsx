'use client'

import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'
import { LEVEL_BY_ID } from '@/lib/game-data'
import { dateTime, money } from '@/lib/cultivation-preview'
import { durationText } from '@/lib/summon-preview'
import { needsMyAction, tradeStatusText, tradeTitle, type Trade } from '@/lib/trade'
import { cn } from '@/lib/utils'

export type TradeTone = 'todo' | 'wait' | 'done' | 'fail'
export function tradeTone(trade: Trade): TradeTone {
  if (trade.status === 'overdue') return 'fail'
  if (trade.status === 'completed') return 'done'
  return needsMyAction(trade) ? 'todo' : 'wait'
}
export function TradeChip({ trade, className }: { trade: Trade; className?: string }) {
  return <span className={cn('trade-chip', `is-${tradeTone(trade)}`, className)}>{tradeStatusText(trade)}</span>
}

const STEPS = {
  payer: ['召唤成功 · 匹配乙方', '向乙方打款', '乙方确认到账', '悟空进入猴舍'],
  receiver: ['传承 · 匹配甲方', '甲方打款', '我确认到账', '传承结算完成'],
} as const
/** 交易进度：已完成的步骤打勾，当前步骤高亮 */
export function TradeSteps({ trade }: { trade: Trade }) {
  const current = trade.status === 'completed' ? 4 : trade.status === 'awaiting_confirm' ? 2 : 1
  return <ol className="trade-steps" aria-label="交易进度">
    {STEPS[trade.role].map((label, i) => {
      const state = trade.status === 'overdue' && i === 1 ? 'fail' : i < current ? 'done' : i === current ? 'now' : 'next'
      return <li key={label} className={`is-${state}`} aria-current={state === 'now' ? 'step' : undefined}><span className="trade-step-dot">{state === 'done' ? <Check className="size-3" /> : i + 1}</span><span>{state === 'fail' ? '逾期未打款' : label}</span></li>
    })}
  </ol>
}

/** 剩余时间：不足 10 分钟时变红 */
export function Countdown({ ms }: { ms: number }) {
  return <span className={cn('font-latin tabular-nums', ms < 10 * 60_000 ? 'text-[#f08a6a]' : 'text-[var(--gold-100)]')}>{durationText(Math.max(0, ms))}</span>
}

/** 列表里的一笔交易 */
export function TradeRow({ trade, now }: { trade: Trade; now: number }) {
  const ticking = trade.status === 'awaiting_payment'
  return <li><Link href={`/me/trades/${encodeURIComponent(trade.id)}`} className={cn('trade-row', needsMyAction(trade) && 'is-todo')}>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2"><TradeChip trade={trade} /><span className="text-[10px] text-[var(--profile-muted)]">{trade.role === 'payer' ? '甲方' : '乙方'} · {LEVEL_BY_ID[trade.stage].realm}</span></div>
      <p className="mt-1.5 truncate font-display text-sm text-[var(--gold-100)]">{tradeTitle(trade)}</p>
      <p className="mt-1 text-[11px] text-[var(--profile-muted)]">{ticking ? <>{trade.role === 'payer' ? '打款剩余' : '甲方打款剩余'} <Countdown ms={trade.deadline - now} /></> : dateTime(trade.confirmedAt ?? trade.overdueAt ?? trade.paidAt ?? trade.matchedAt)}</p>
    </div>
    <div className="shrink-0 text-right"><p className="font-latin text-base font-bold tabular-nums text-gold">{trade.role === 'payer' ? '−' : '+'}{money(trade.amountCents)}</p><p className="text-[10px] text-[var(--profile-muted)]">USDT</p></div>
    <ChevronRight className="size-4 shrink-0 text-[var(--gold-400)]" />
  </Link></li>
}
