'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LEVEL_BY_ID, PAYMENT_WINDOW_HOURS, cycleText } from '@/lib/game-data'
import { durationText, ROUND_LABEL, matchAt, type Entry } from '@/lib/summon-preview'
import { DAY, dateTime } from '@/lib/cultivation-preview'
import { useProduct } from './product-provider'
import { PeachValue, UsdtValue } from './peach-value'
import { Countdown } from './trade-ui'

export function SummonPreviewEntry({ entry, compact = false }: { entry: Entry; compact?: boolean }) {
  const { state, now } = useProduct()
  const level = LEVEL_BY_ID[entry.stage]
  const contract = [...(state?.contracts ?? []), ...(state?.history ?? [])].find(c => c.id === `summon-${entry.key}`)
  const trade = state?.trades.find(t => t.entryKey === entry.key)
  const tradeHref = trade ? `/me/trades/${encodeURIComponent(trade.id)}` : '/me/trades'
  if (entry.status === 'success' && !compact && now < matchAt(entry) + 1800) return <section role="status" aria-label="悟空召唤仪式" className="hud-panel panel-glow flex flex-col items-center gap-4 rounded-xl px-4 py-12"><Image src="/assets/player-seal.png" alt="" width={88} height={88} className="motion-safe:animate-pulse" /><h2 className="font-display text-xl tracking-widest text-gold">灵印初醒，悟空现世</h2><p className="text-xs text-[var(--gold-200)]">正在开启本轮数字生命旅程…</p></section>
  // 召唤成功后先进入承接人与传承人交易：完成资金结算并经传承人确认到账后，悟空才进入猴舍
  if (entry.status === 'success' && trade && trade.status !== 'completed') return <section aria-label="召唤成功 · 待结算" className={`hud-panel rounded-xl p-4 text-center ${compact ? '' : 'panel-glow'}`}>
    <p className="text-[10px] text-[var(--gold-200)]">{ROUND_LABEL} · {level.realm}</p>
    <h2 className="mt-2 font-display text-2xl font-bold text-gold">召唤成功</h2>
    <p className="mt-2 text-sm text-[var(--gold-100)]">{trade.status === 'awaiting_payment' ? `请在 ${PAYMENT_WINDOW_HOURS} 小时内完成资金结算` : '已结算 · 等待传承人确认到账'}</p>
    <p className="mb-1 mt-4 text-xs text-[var(--gold-200)]">修炼值 · {trade.status === 'awaiting_payment' ? '待结算' : '已结算'}</p><UsdtValue cents={trade.amountCents} size="xl" />
    {trade.status === 'awaiting_payment' && <p className="mt-2 text-xs text-[var(--gold-200)]">结算剩余 <Countdown ms={trade.deadline - now} /></p>}
    <p className="mt-2 flex items-center justify-center gap-2 text-[11px] text-[var(--gold-200)]">已暂扣蟠桃 <PeachValue cents={entry.paid} size="xs" /></p>
    <Link href={tradeHref} className="btn-gold mt-4 inline-flex w-full items-center justify-center text-sm">{trade.status === 'awaiting_payment' ? '立即结算' : '查看交易'}</Link>
    <p className="mt-2 text-[11px] leading-5 text-[var(--gold-200)]/80">{trade.status === 'awaiting_payment' ? `超过 ${PAYMENT_WINDOW_HOURS} 小时未结算判定逾期违约，暂扣的蟠桃全部充公。` : `传承人确认到账后，${level.name}进入猴舍。`}</p>
  </section>
  if (entry.status === 'success') return <section aria-label="召唤成功" className={`hud-panel rounded-xl p-4 text-center ${compact ? '' : 'panel-glow'}`}>
    <p className="text-[10px] text-[var(--gold-200)]">{ROUND_LABEL} · {level.realm}</p>
    <h2 className="mt-2 font-display text-2xl font-bold text-gold">召唤成功</h2>
    <p className="mt-2 text-sm text-[var(--gold-100)]">{level.name}现世 · 已进入猴舍</p>
    <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--gold-600)]/40 px-3 py-1 text-[11px] text-[var(--gold-200)]">修炼值已结算 · 传承人已确认到账</p>
    <p className="mb-1 mt-4 text-xs text-[var(--gold-200)]">修炼值 · 已结算</p><UsdtValue cents={entry.amount ?? Math.round(level.cost * 100)} size="xl" /><p className="mt-2 flex items-center justify-center gap-2 text-[11px] text-[var(--gold-200)]">已扣除召唤蟠桃 <PeachValue cents={entry.paid} size="xs" /></p>
    <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-[var(--gold-200)]"><div><dt>修炼周期</dt><dd className="mt-1 text-[var(--gold-100)]">{cycleText(level)}</dd></div><div><dt>修炼加成</dt><dd className="mt-1 text-gold">+{level.gainPct}%</dd></div><div className="col-span-2"><dt>预计传承</dt><dd className="mt-1">{dateTime(matchAt(entry) + level.runDays * DAY)}</dd></div></dl>
    <div className="mt-4 border-y border-[var(--gold-600)]/30 py-3 text-left text-xs leading-7 text-[var(--gold-100)]"><h3 className="text-[var(--gold-200)]">修炼</h3><p>已修炼 {Math.round((contract?.completed ?? 0) * level.cycleDays / level.runDays)} / {level.cycleDays} 天 · 每天进修炼室点一次</p></div>
    <Link href={`/house/room/${entry.stage}`} className="btn-gold mt-4 inline-flex w-full items-center justify-center text-sm">进入猴舍</Link>
    <p className="mt-2 text-[11px] leading-5 text-[var(--gold-200)]/80">修炼周期结束后进入传承，等下一轮同阶段召唤匹配承接人；承接人完成资金结算、你确认到账后完成传承所得。没修炼的那天没有修炼加成。</p>
  </section>
  if (entry.status === 'forfeited') return <section aria-label="逾期违约" className="hud-panel rounded-xl p-4 text-center"><h2 className="font-display text-xl text-[var(--gold-100)]">召唤成功 · 逾期未结算</h2><div className="mt-4"><PeachValue cents={entry.paid} size="lg" sign="-" /></div><p className="mt-2 text-xs leading-6 text-[var(--gold-200)]">召唤成功后 {PAYMENT_WINDOW_HOURS} 小时内未完成修炼值的资金结算，判定逾期违约：暂扣的召唤蟠桃已全部充公，不予退还。可继续参与后续召唤。</p><Link href={tradeHref} className="btn-ghost-gold mt-4 inline-flex w-full items-center justify-center text-sm">查看交易</Link></section>
  if (entry.status === 'refunded') return <section aria-label="本轮召唤未成功" className="hud-panel rounded-xl p-4 text-center"><h2 className="font-display text-xl text-[var(--gold-100)]">本轮召唤未成功</h2><div className="mt-4"><PeachValue cents={entry.paid} size="lg" /></div><p className="mt-2 text-xs text-[var(--gold-200)]">本次召唤使用的蟠桃已全额退还，可继续参与后续召唤</p><Link href="/world" className="btn-ghost-gold mt-4 inline-flex w-full items-center justify-center text-sm">返回悟空世界</Link></section>
  return <section aria-label="已参与召唤" className="hud-panel rounded-xl p-4 text-center">
    <p className="text-[10px] text-[var(--gold-200)]">{level.realm} · {ROUND_LABEL}</p><h2 className="mt-2 font-display text-xl text-gold">已参与召唤，等待匹配</h2>
    <p className="mt-3 text-xs text-[var(--gold-200)]">{level.summonStartTime} 系统自动匹配，不需要再操作</p>
    <p className="mt-3 text-[11px] text-[var(--gold-200)]">距系统匹配</p><p className="mt-1 font-latin text-3xl tabular-nums text-[var(--gold-100)]">{durationText(Math.max(0, matchAt(entry) - now))}</p>
    <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--gold-200)]">已暂扣召唤蟠桃 <PeachValue cents={entry.paid} size="sm" /></p>
    <p className="mt-2 text-[11px] leading-5 text-[var(--gold-200)]/80">召唤成功扣除召唤蟠桃并进入资金结算；失败全额退还。</p>
  </section>
}
