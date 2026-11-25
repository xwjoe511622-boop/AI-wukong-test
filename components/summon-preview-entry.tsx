'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LEVEL_BY_ID, RESERVATION_CUTOFF_MINUTES, TRIAL_MODE, cycleText } from '@/lib/game-data'
import { durationText, roundNumber, matchAt, type Entry } from '@/lib/summon-preview'
import { DAY, dateTime } from '@/lib/cultivation-preview'
import { useProduct } from './product-provider'
import { PeachValue, UsdtValue } from './peach-value'

export function SummonPreviewEntry({ entry, compact = false }: { entry: Entry; compact?: boolean }) {
  const { state, now } = useProduct()
  const level = LEVEL_BY_ID[entry.stage]
  const contract = [...(state?.contracts ?? []), ...(state?.history ?? [])].find(c => c.id === `summon-${entry.key}`)
  if (entry.status === 'success' && !compact && now < matchAt(entry) + 1800) return <section role="status" aria-label="悟空召唤仪式" className="hud-panel panel-glow flex flex-col items-center gap-4 rounded-xl px-4 py-12"><Image src="/assets/player-seal.png" alt="" width={88} height={88} className="motion-safe:animate-pulse" /><h2 className="font-display text-xl tracking-widest text-gold">灵印初醒，悟空现世</h2><p className="text-xs text-[var(--gold-200)]">正在开启本轮数字生命旅程…</p></section>
  if (entry.status === 'success') return <section aria-label="召唤成功" className={`hud-panel rounded-xl p-4 text-center ${compact ? '' : 'panel-glow'}`}>
    <p className="text-[10px] text-[var(--gold-200)]">第{roundNumber(entry.enteredAt)}轮 · {level.realm}</p>
    <h2 className="mt-2 font-display text-2xl font-bold text-gold">召唤成功</h2>
    <p className="mt-2 text-sm text-[var(--gold-100)]">{level.name}现世 · 已进入猴舍</p>
    <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--gold-600)]/40 px-3 py-1 text-[11px] text-[var(--gold-200)]">配套金额已从 U 余额打款给乙方</p>
    <p className="mb-1 mt-4 text-xs text-[var(--gold-200)]">配套金额 · 已打款</p><UsdtValue cents={entry.amount ?? Math.round(level.cost * 100)} size="xl" /><p className="mt-2 flex items-center justify-center gap-2 text-[11px] text-[var(--gold-200)]">已扣除召唤蟠桃 <PeachValue cents={entry.paid} size="xs" /></p>
    <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-[var(--gold-200)]"><div><dt>修炼周期</dt><dd className="mt-1 text-[var(--gold-100)]">{cycleText(level)}</dd></div><div><dt>圆满增幅</dt><dd className="mt-1 text-gold">+{level.gainPct}%</dd></div><div className="col-span-2"><dt>预计传承</dt><dd className="mt-1">{dateTime(matchAt(entry) + level.runDays * DAY)}</dd></div></dl>
    <div className="mt-4 border-y border-[var(--gold-600)]/30 py-3 text-left text-xs leading-7 text-[var(--gold-100)]"><h3 className="text-[var(--gold-200)]">生命周期任务</h3><p>{contract?.completed === level.runDays ? '已完成全部修炼' : `待完成修炼 · ${contract?.completed ?? 0} / ${level.runDays}`}</p></div>
    <Link href={`/house/room/${entry.stage}`} className="btn-gold mt-4 inline-flex w-full items-center justify-center text-sm">进入猴舍</Link>
    <p className="mt-2 text-[11px] leading-5 text-[var(--gold-200)]/80">召唤成功后须在 1 小时内完成打款，乙方确认到账后释放。{TRIAL_MODE ? '体验版' : '当前版本'}自动从 U 余额完成打款，悟空直接进入猴舍；全部修炼完成且原周期结束才可传承，结算返回 U 余额。</p>
  </section>
  if (entry.status === 'forfeited') return <section aria-label="逾期违约" className="hud-panel rounded-xl p-4 text-center"><h2 className="font-display text-xl text-[var(--gold-100)]">召唤成功 · 逾期未打款</h2><div className="mt-4"><PeachValue cents={entry.paid} size="lg" sign="-" /></div><p className="mt-2 text-xs leading-6 text-[var(--gold-200)]">U 余额不足以完成配套金额打款，判定逾期违约：本次召唤所扣除的蟠桃已充公，不予退还。可继续参与后续召唤。</p><Link href="/me/wallet" className="btn-ghost-gold mt-4 inline-flex w-full items-center justify-center text-sm">查看个人地址</Link></section>
  if (entry.status === 'refunded') return <section aria-label="本轮召唤未成功" className="hud-panel rounded-xl p-4 text-center"><h2 className="font-display text-xl text-[var(--gold-100)]">本轮召唤未成功</h2><div className="mt-4"><PeachValue cents={entry.paid} size="lg" /></div><p className="mt-2 text-xs text-[var(--gold-200)]">本次召唤使用的蟠桃已全额退还，可继续参与后续召唤</p><Link href="/world" className="btn-ghost-gold mt-4 inline-flex w-full items-center justify-center text-sm">返回悟空世界</Link></section>
  const closed = now >= entry.deadline - RESERVATION_CUTOFF_MINUTES * 60_000
  const matching = now >= entry.deadline
  return <section aria-label="召唤已预约" className="hud-panel rounded-xl p-4 text-center">
    <p className="text-[10px] text-[var(--gold-200)]">{level.realm} · 召唤已预约</p><h2 className="mt-2 font-display text-xl text-gold">{matching ? '自动匹配中' : closed ? '预约已截止' : '召唤已预约'}</h2>
    <p className="mt-3 text-xs text-[var(--gold-200)]">{matching ? '系统正在自动匹配 · 匹配完成后立即公布结果' : `${level.summonStopTime} 预约截止 · ${level.summonWindow} 自动匹配`}</p>
    {matching ? <p className="mt-4 font-display text-lg tracking-widest text-[var(--gold-100)] motion-safe:animate-pulse">匹配中…</p> : <><p className="mt-3 text-[11px] text-[var(--gold-200)]">距自动匹配开始</p><p className="mt-1 font-latin text-3xl tabular-nums text-[var(--gold-100)]">{durationText(Math.max(0, entry.deadline - now))}</p></>}
    <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--gold-200)]">已暂扣召唤蟠桃 <PeachValue cents={entry.paid} size="sm" /></p>
    <button type="button" className="btn-gold mt-4 w-full text-sm" disabled>已预约本轮召唤，无需重复参与</button>
  </section>
}
