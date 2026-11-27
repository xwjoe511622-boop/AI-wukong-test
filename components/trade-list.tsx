'use client'

import { Hourglass } from 'lucide-react'
import { RULES, dateTime, endsAt, phase, settlement } from '@/lib/cultivation-preview'
import { liveTradeFor, nextMatchAfter, pendingTrades } from '@/lib/trade'
import { useProduct } from './product-provider'
import { UsdtValue } from './peach-value'
import { ProfileButton, ProfileEmpty, ProfilePageHeader } from './profile-ui'
import { TradeRow } from './trade-ui'

export function TradeList() {
  const { state, ready, now, act } = useProduct()
  if (!ready || !state) return <><ProfilePageHeader title="我的交易" /><p role="status" className="py-12 text-center text-sm text-[var(--profile-muted)]">正在读取交易…</p></>
  const todo = pendingTrades(state.trades)
  const waiting = state.trades.filter(t => !todo.includes(t) && (t.status === 'awaiting_payment' || t.status === 'awaiting_confirm')).sort((a, b) => b.matchedAt - a.matchedAt)
  const ended = state.trades.filter(t => t.status === 'completed' || t.status === 'overdue').sort((a, b) => (b.confirmedAt ?? b.overdueAt ?? 0) - (a.confirmedAt ?? a.overdueAt ?? 0))
  // 传承中、尚未匹配到承接人的悟空
  const matching = state.contracts.filter(c => phase(c, now) === '传承中' && !liveTradeFor(state.trades, c.id))

  return <div className="flex flex-col gap-5">
    <ProfilePageHeader title="我的交易" subtitle="召唤成功后向传承人支付（我是承接人），传承时等承接人支付并确认收款（我是传承人）。时间均为北京时间。" />
    {!state.trades.length && !matching.length && <ProfileEmpty title="暂无交易">召唤成功或悟空进入传承后，交易会出现在这里。</ProfileEmpty>}
    {todo.length > 0 && <section aria-labelledby="todo-title"><h2 id="todo-title" className="profile-heading mb-2">待我处理 · {todo.length}</h2><ul className="flex flex-col gap-2">{todo.map(t => <TradeRow key={t.id} trade={t} now={now} />)}</ul></section>}
    {waiting.length > 0 && <section aria-labelledby="wait-title"><h2 id="wait-title" className="profile-heading mb-2">等待对方</h2><ul className="flex flex-col gap-2">{waiting.map(t => <TradeRow key={t.id} trade={t} now={now} />)}</ul></section>}
    {matching.length > 0 && <section aria-labelledby="match-title"><h2 id="match-title" className="profile-heading mb-2">传承中 · 等待匹配承接人</h2><ul className="flex flex-col gap-2">{matching.map(c => <li key={c.id} className="trade-row">
      <Hourglass className="size-4 shrink-0 text-[var(--gold-300)]" />
      <div className="min-w-0 flex-1"><p className="font-display text-sm text-[var(--gold-100)]">{RULES[c.stage].name}</p><p className="mt-1 text-[12px] text-[var(--profile-muted)]">预计 {dateTime(nextMatchAfter(c.stage, Math.max(endsAt(c), c.trainingCompletedAt ?? endsAt(c), now)))} 随下一轮召唤匹配</p></div>
      <div className="shrink-0 text-right"><UsdtValue cents={settlement(c).received} size="sm" /><p className="text-[12px] text-[var(--profile-muted)]">预计应收</p></div>
    </li>)}</ul></section>}
    {ended.length > 0 && <section aria-labelledby="ended-title"><h2 id="ended-title" className="profile-heading mb-2">已结束</h2><ul className="flex flex-col gap-2">{ended.map(t => <TradeRow key={t.id} trade={t} now={now} />)}</ul></section>}
  </div>
}
