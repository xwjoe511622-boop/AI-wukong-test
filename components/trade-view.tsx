'use client'

import { shortAddress } from '@/lib/wallet'
import Link from 'next/link'
import { useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { LEVEL_BY_ID, PAYMENT_WINDOW_HOURS } from '@/lib/game-data'
import { dateTime, money } from '@/lib/cultivation-preview'
import { TRADE_ROLE_LABEL, tradeTitle } from '@/lib/trade'
import { useProduct } from './product-provider'
import { SettlementFacts } from './settlement-dialog'
import { UsdtValue } from './peach-value'
import { PageBar, ProfileButton, ProfileButtonLink, ProfileEmpty } from './profile-ui'
import { Countdown, TradeChip, TradeSteps } from './trade-ui'

export function TradeView({ id }: { id: string }) {
  const { state, ready, now, act, notice } = useProduct()
  const [confirming, setConfirming] = useState(false)
  if (!ready || !state) return <p role="status" className="py-12 text-center text-sm text-[var(--profile-muted)]">正在读取交易…</p>
  const trade = state.trades.find(t => t.id === id)
  if (!trade) return <><PageBar title="交易详情" back="/me/trades" /><ProfileEmpty title="没有找到这笔交易">这笔交易可能已经归档。</ProfileEmpty></>
  const level = LEVEL_BY_ID[trade.stage]
  const payer = trade.role === 'payer'
  const contract = [...state.contracts, ...state.history].find(c => c.id === (trade.contractId ?? `summon-${trade.entryKey}`))
  const short = payer && state.usdt < trade.amountCents
  const left = trade.deadline - now

  return <div className="flex flex-col gap-5">
    <PageBar title="交易详情" back="/me/trades" />
    <header>
      <div className="flex flex-wrap items-center gap-2"><TradeChip trade={trade} /><span className="text-[11px] text-[var(--profile-muted)]">{TRADE_ROLE_LABEL[trade.role]}</span></div>
      <h2 className="mt-2 font-display text-2xl font-bold text-[var(--gold-100)]">{tradeTitle(trade)}</h2>
      <p className="mt-1 text-xs text-[var(--profile-muted)]">{level.realm} · 匹配于 {dateTime(trade.matchedAt)}（北京时间）</p>
    </header>

    <section className="profile-surface text-center" aria-label="交易金额">
      <p className="text-xs text-[var(--profile-muted)]">{payer ? '应支付修炼值' : '本次传承应收'}</p>
      <UsdtValue cents={trade.amountCents} size="xl" className="mt-2" />
      {trade.status === 'awaiting_payment' && <p className="mt-3 text-xs text-[var(--profile-muted)]">{payer ? '支付剩余时间' : '承接人支付剩余时间'}　<Countdown ms={left} /></p>}
      {payer && trade.status === 'awaiting_payment' && <p className="mt-2 text-[11px] leading-5 text-[#f0b49a]">超过 {PAYMENT_WINDOW_HOURS} 小时未支付判定逾期违约，暂扣的召唤蟠桃全部充公、不予退还。</p>}
    </section>

    <section className="profile-surface"><h2 className="profile-heading mb-3">交易进度</h2><TradeSteps trade={trade} /></section>

    <section className="profile-surface" aria-label={payer ? '传承人信息' : '承接人信息'}>
      <h2 className="profile-heading mb-3">{payer ? '传承人信息' : '承接人信息'}</h2>
      <dl className="flex flex-col gap-3">
        <div className="trade-field"><dt>{payer ? '传承人' : '承接人'}钱包地址</dt><dd><code className="break-all">{trade.counterparty.uid}</code></dd></div>
        <p className="rounded-lg border border-[#e0a05a66] bg-[#3a220c80] px-3 py-2 text-[11.5px] leading-5 text-[#f3d6a8]">支付结算在平台内完成，从你的 USDT 余额扣除。请勿向该地址直接转账，链上转账无法到账，也无法找回。</p>
        {trade.paidAt && <div className="trade-field"><dt>支付时间</dt><dd>{dateTime(trade.paidAt)}</dd></div>}
        {trade.confirmedAt && <div className="trade-field"><dt>确认到账时间</dt><dd>{dateTime(trade.confirmedAt)}</dd></div>}
      </dl>
    </section>

    {!payer && contract && trade.status !== 'awaiting_payment' && <section className="profile-surface" aria-label="传承所得"><h2 className="profile-heading mb-3">传承所得</h2><SettlementFacts contract={contract} /></section>}

    {/* 操作区：只在需要我处理时出现 */}
    {payer && trade.status === 'awaiting_payment' && <section className="profile-surface" aria-label="支付结算">
      <p className="flex items-center justify-between text-xs text-[var(--profile-muted)]"><span>可用 USDT 余额</span><UsdtValue cents={state.usdt} size="sm" muted /></p>
      {short ? <><p role="alert" className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#f0b49a]"><AlertTriangle className="mt-0.5 size-4 shrink-0" />USDT 余额不足，还差 {money(trade.amountCents - state.usdt)} USDT。请先补足 USDT 余额，再回来支付。</p><div className="mt-3"><ProfileButtonLink href="/me/wallet" size="large">查看我的资产</ProfileButtonLink></div></>
        : confirming ? <div className="trade-confirm mt-3"><p className="text-xs leading-6">将从 USDT 余额向传承人 <code>{shortAddress(trade.counterparty.uid)}</code> 支付 <strong className="text-[var(--gold-100)]">{money(trade.amountCents)} USDT</strong>。支付后无法撤回，系统会通知传承人核实到账。</p><div className="mt-3 grid grid-cols-2 gap-2"><ProfileButton secondary onClick={() => setConfirming(false)}>取消</ProfileButton><ProfileButton onClick={() => { act({ type: 'trade-pay', id: trade.id }); setConfirming(false) }}>确认支付</ProfileButton></div></div>
        : <div className="mt-3"><ProfileButton size="large" onClick={() => setConfirming(true)}>立即支付 {money(trade.amountCents)} USDT</ProfileButton></div>}
    </section>}

    {!payer && trade.status === 'awaiting_confirm' && <section className="profile-surface" aria-label="确认收款">
      <p className="flex items-start gap-2 text-xs leading-6 text-[var(--profile-muted)]"><ShieldCheck className="mt-1 size-4 shrink-0 text-[var(--gold-300)]" />请核实承接人的支付款已实际到账、金额无误后再确认。确认后交易完成，无法撤回；不得无故拖延或拒绝确认。</p>
      {confirming ? <div className="trade-confirm mt-3"><p className="text-xs leading-6">确认已收到承接人的支付款 <strong className="text-[var(--gold-100)]">{money(trade.amountCents)} USDT</strong>？</p><div className="mt-3 grid grid-cols-2 gap-2"><ProfileButton secondary onClick={() => setConfirming(false)}>再核实一下</ProfileButton><ProfileButton onClick={() => { act({ type: 'trade-confirm', id: trade.id }); setConfirming(false) }}>确认已收到</ProfileButton></div></div>
        : <div className="mt-3"><ProfileButton size="large" onClick={() => setConfirming(true)}>确认已收到 {money(trade.amountCents)} USDT</ProfileButton></div>}
    </section>}

    {trade.status === 'awaiting_confirm' && payer && <p className="profile-surface text-center text-xs leading-6 text-[var(--profile-muted)]">已支付，等待传承人核实到账并确认。确认后 {level.name} 自动进入猴舍。</p>}
    {trade.status === 'awaiting_payment' && !payer && <p className="profile-surface text-center text-xs leading-6 text-[var(--profile-muted)]">已匹配到承接人，等待对方在支付期内完成支付结算。到账后这里会提示你确认收款。</p>}
    {trade.status === 'completed' && <section className="profile-surface text-center">
      <p className="text-sm text-[var(--gold-100)]">{payer ? `交易完成，${level.name}已进入猴舍` : `传承完成，${money(trade.amountCents)} USDT 已转入 USDT 余额`}</p>
      <div className="mt-3 flex justify-center">{payer ? <Link href={`/house/room/${trade.stage}`} className="btn-gold profile-button inline-flex items-center justify-center">进入猴舍修炼</Link> : <Link href="/house/history" className="btn-ghost-gold profile-button inline-flex items-center justify-center">查看传承历史</Link>}</div>
    </section>}
    {trade.status === 'overdue' && <section className="profile-surface text-center">
      <p className="text-sm text-[#f0b49a]">召唤成功后 {PAYMENT_WINDOW_HOURS} 小时内未完成支付结算，判定逾期违约</p>
      <p className="mt-2 text-xs leading-6 text-[var(--profile-muted)]">暂扣的召唤蟠桃已全部充公，不予退还，系统保留违约记录。可继续参与后续召唤。</p>
      <div className="mt-3 flex justify-center"><Link href="/world" className="btn-ghost-gold profile-button inline-flex items-center justify-center">返回悟空世界</Link></div>
    </section>}

    <p role="status" aria-live="polite" className="min-h-4 text-center text-[11px] leading-5 text-[var(--gold-200)]">{notice}</p>
    <p className="text-center text-xs text-[var(--profile-muted)]">这笔交易有问题？<Link href="/me/support" className="ml-1 text-[var(--gold-200)] underline underline-offset-4">联系客服申诉</Link></p>
  </div>
}
