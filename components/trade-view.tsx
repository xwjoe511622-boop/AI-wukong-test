'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { LEVEL_BY_ID, PAYMENT_WINDOW_HOURS } from '@/lib/game-data'
import { dateTime, money } from '@/lib/cultivation-preview'
import { COUNTERPARTY_NOTE, TRADE_ROLE_LABEL, tradeTitle } from '@/lib/trade'
import { useProduct } from './product-provider'
import { SettlementFacts } from './settlement-dialog'
import { UsdtValue } from './peach-value'
import { ProfileButton, ProfileButtonLink, ProfileEmpty } from './profile-ui'
import { Countdown, TradeChip, TradeSteps } from './trade-ui'

export function TradeView({ id }: { id: string }) {
  const { state, ready, now, act, notice } = useProduct()
  const [confirming, setConfirming] = useState(false)
  if (!ready || !state) return <p role="status" className="py-12 text-center text-sm text-[var(--profile-muted)]">正在读取交易…</p>
  const trade = state.trades.find(t => t.id === id)
  if (!trade) return <><Back /><ProfileEmpty title="没有找到这笔交易">交易可能已归档，或保存在另一台设备的浏览器中。</ProfileEmpty></>
  const level = LEVEL_BY_ID[trade.stage]
  const payer = trade.role === 'payer'
  const contract = [...state.contracts, ...state.history].find(c => c.id === (trade.contractId ?? `summon-${trade.entryKey}`))
  const short = payer && state.usdt < trade.amountCents
  const left = trade.deadline - now

  return <div className="flex flex-col gap-5">
    <Back />
    <header>
      <div className="flex flex-wrap items-center gap-2"><TradeChip trade={trade} /><span className="text-[11px] text-[var(--profile-muted)]">{TRADE_ROLE_LABEL[trade.role]}</span></div>
      <h1 className="mt-2 font-display text-2xl font-bold text-[var(--gold-100)]">{tradeTitle(trade)}</h1>
      <p className="mt-1 text-xs text-[var(--profile-muted)]">{level.realm} · 匹配于 {dateTime(trade.matchedAt)}（北京时间）</p>
    </header>

    <section className="profile-surface text-center" aria-label="交易金额">
      <p className="text-xs text-[var(--profile-muted)]">{payer ? '应打款修炼值' : '本次传承应收'}</p>
      <UsdtValue cents={trade.amountCents} size="xl" className="mt-2" />
      {trade.status === 'awaiting_payment' && <p className="mt-3 text-xs text-[var(--profile-muted)]">{payer ? '打款剩余时间' : '承接人打款剩余时间'}　<Countdown ms={left} /></p>}
      {payer && trade.status === 'awaiting_payment' && <p className="mt-2 text-[11px] leading-5 text-[#f0b49a]">超过 {PAYMENT_WINDOW_HOURS} 小时未打款判定逾期违约，暂扣的召唤蟠桃与修炼蟠桃全部充公、不予退还。</p>}
    </section>

    <section className="profile-surface"><h2 className="profile-heading mb-3">交易进度</h2><TradeSteps trade={trade} /></section>

    <section className="profile-surface" aria-label={payer ? '传承人信息' : '承接人信息'}>
      <h2 className="profile-heading mb-3">{payer ? '传承人信息' : '承接人信息'}</h2>
      <dl className="flex flex-col gap-3">
        <div className="trade-field"><dt>{payer ? '传承人' : '承接人'} UID</dt><dd><code>{trade.counterparty.uid}</code></dd></div>
        {trade.paidAt && <div className="trade-field"><dt>打款时间</dt><dd>{dateTime(trade.paidAt)}</dd></div>}
        {trade.confirmedAt && <div className="trade-field"><dt>确认到账时间</dt><dd>{dateTime(trade.confirmedAt)}</dd></div>}
      </dl>
    </section>

    {!payer && contract && trade.status !== 'awaiting_payment' && <section className="profile-surface" aria-label="传承所得"><h2 className="profile-heading mb-3">传承所得</h2><SettlementFacts contract={contract} /></section>}

    {/* 操作区：只在需要我处理时出现 */}
    {payer && trade.status === 'awaiting_payment' && <section className="profile-surface" aria-label="打款">
      <p className="flex items-center justify-between text-xs text-[var(--profile-muted)]"><span>可用 USDT 余额</span><UsdtValue cents={state.usdt} size="sm" muted /></p>
      {short ? <><p role="alert" className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#f0b49a]"><AlertTriangle className="mt-0.5 size-4 shrink-0" />USDT 余额不足，还差 {money(trade.amountCents - state.usdt)} USDT。请先补足 USDT 余额，再回来打款。</p><div className="mt-3"><ProfileButtonLink href="/me/wallet" size="large">查看我的资产</ProfileButtonLink></div></>
        : confirming ? <div className="trade-confirm mt-3"><p className="text-xs leading-6">将从 USDT 余额向传承人 <code>{trade.counterparty.uid}</code> 打款 <strong className="text-[var(--gold-100)]">{money(trade.amountCents)} USDT</strong>。打款后无法撤回，系统会通知传承人核实到账。</p><div className="mt-3 grid grid-cols-2 gap-2"><ProfileButton secondary onClick={() => setConfirming(false)}>取消</ProfileButton><ProfileButton onClick={() => { act({ type: 'trade-pay', id: trade.id }); setConfirming(false) }}>确认打款</ProfileButton></div></div>
        : <div className="mt-3"><ProfileButton size="large" onClick={() => setConfirming(true)}>向传承人打款 {money(trade.amountCents)} USDT</ProfileButton></div>}
    </section>}

    {!payer && trade.status === 'awaiting_confirm' && <section className="profile-surface" aria-label="确认收款">
      <p className="flex items-start gap-2 text-xs leading-6 text-[var(--profile-muted)]"><ShieldCheck className="mt-1 size-4 shrink-0 text-[var(--gold-300)]" />请核实承接人打款已实际到账、金额无误后再确认。确认后交易完成，无法撤回；不得无故拖延或拒绝确认。</p>
      {confirming ? <div className="trade-confirm mt-3"><p className="text-xs leading-6">确认已收到承接人打款 <strong className="text-[var(--gold-100)]">{money(trade.amountCents)} USDT</strong>？</p><div className="mt-3 grid grid-cols-2 gap-2"><ProfileButton secondary onClick={() => setConfirming(false)}>再核实一下</ProfileButton><ProfileButton onClick={() => { act({ type: 'trade-confirm', id: trade.id }); setConfirming(false) }}>确认已收到</ProfileButton></div></div>
        : <div className="mt-3"><ProfileButton size="large" onClick={() => setConfirming(true)}>确认已收到 {money(trade.amountCents)} USDT</ProfileButton></div>}
    </section>}

    {trade.status === 'awaiting_confirm' && payer && <p className="profile-surface text-center text-xs leading-6 text-[var(--profile-muted)]">已打款，等待传承人核实到账并确认。确认后 {level.name} 自动进入猴舍。</p>}
    {trade.status === 'awaiting_payment' && !payer && <p className="profile-surface text-center text-xs leading-6 text-[var(--profile-muted)]">已匹配到承接人，等待对方在打款期内完成打款。到账后这里会提示你确认收款。</p>}
    {trade.status === 'completed' && <section className="profile-surface text-center">
      <p className="text-sm text-[var(--gold-100)]">{payer ? `交易完成，${level.name}已进入猴舍` : `传承所得完成，${money(trade.amountCents)} USDT 已转入 USDT 余额`}</p>
      <div className="mt-3 flex justify-center">{payer ? <Link href={`/house/room/${trade.stage}`} className="btn-gold profile-button inline-flex items-center justify-center">进入猴舍修炼</Link> : <Link href="/house/history" className="btn-ghost-gold profile-button inline-flex items-center justify-center">查看传承历史</Link>}</div>
    </section>}
    {trade.status === 'overdue' && <section className="profile-surface text-center">
      <p className="text-sm text-[#f0b49a]">召唤成功后 {PAYMENT_WINDOW_HOURS} 小时内未完成打款，判定逾期违约</p>
      <p className="mt-2 text-xs leading-6 text-[var(--profile-muted)]">预约时暂扣的召唤蟠桃与修炼蟠桃已全部充公，不予退还，系统保留违约记录。可继续参与后续召唤。</p>
      <div className="mt-3 flex justify-center"><Link href="/world" className="btn-ghost-gold profile-button inline-flex items-center justify-center">返回悟空世界</Link></div>
    </section>}

    <p role="status" aria-live="polite" className="min-h-4 text-center text-[11px] leading-5 text-[var(--gold-200)]">{notice}</p>
    <p className="text-center text-xs text-[var(--profile-muted)]">这笔交易有问题？<Link href="/me/support" className="ml-1 text-[var(--gold-200)] underline underline-offset-4">联系客服申诉</Link></p>
    <p className="text-center text-[10px] leading-5 text-[var(--profile-muted)]">{COUNTERPARTY_NOTE}</p>
  </div>
}

function Back() {
  return <div><ProfileButtonLink href="/me/trades" size="small" secondary>返回我的交易</ProfileButtonLink></div>
}
