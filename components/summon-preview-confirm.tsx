'use client'

import { useEffect, useRef } from 'react'
import { INHERITANCE_FEE_PCT, PAYMENT_WINDOW_HOURS, type WukongLevel } from '@/lib/game-data'
import { money } from '@/lib/cultivation-preview'
import { peachWhole } from '@/lib/summon-preview'
import { PeachValue, UsdtValue } from './peach-value'

/** 确认预约：把这一轮怎么算的摆出来——修炼值、修炼加成、手续费、预计传承所得，以及蟠桃消耗 */
export function SummonPreviewConfirm({ level, cost, balance, usdt, expired, onClose, onConfirm }: { level: WukongLevel; cost: number; balance: number; usdt: number; expired: boolean; onClose: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const node = ref.current; node?.showModal(); return () => node?.close() }, [])
  const lock = Math.round(level.summonCost * 100)
  const growth = Math.round(cost * level.gainPct / 100)
  const fee = Math.round(growth * INHERITANCE_FEE_PCT / 100)
  const trainTotal = Math.round(level.perCycleCost * level.cycleDays * 100)
  const blocked = expired || balance < lock || usdt < cost
  return <dialog ref={ref} aria-labelledby="summon-confirm-title" onCancel={onClose} className="cultivation-dialog">
    <h2 id="summon-confirm-title" className="font-display text-xl text-gold">预约召唤</h2><p className="mt-2 text-xs text-[var(--gold-200)]">{level.realm} · {level.name}</p>

    <h3 className="confirm-heading">修炼值怎么算</h3>
    <dl className="cultivation-facts">
      <div><dt>本轮修炼值 · 成功后向传承人打款</dt><dd><UsdtValue cents={cost} size="sm" /></dd></div>
      <div><dt>修炼增长 · {money(cost)} × {level.gainPct}%（修炼加成）</dt><dd><UsdtValue cents={growth} size="sm" sign="+" /></dd></div>
      <div><dt>手续费 · 修炼增长的 {INHERITANCE_FEE_PCT}%</dt><dd><UsdtValue cents={fee} size="sm" sign="-" /></dd></div>
      <div className="border-t border-[var(--gold-600)]/25 pt-3"><dt className="!text-[var(--gold-100)]">预计传承所得</dt><dd><UsdtValue cents={cost + growth - fee} size="lg" /></dd></div>
    </dl>

    <h3 className="confirm-heading">蟠桃怎么算</h3>
    {level.lifecycleCost ? <dl className="cultivation-facts">
      <div><dt>召唤 · 预约时暂扣，失败全额退还</dt><dd><PeachValue cents={lock} size="sm" /></dd></div>
      <div><dt>修炼 · 每日 {peachWhole(level.perCycleCost)} × {level.cycleDays} 天</dt><dd><PeachValue cents={trainTotal} size="sm" /></dd></div>
      <div className="border-t border-[var(--gold-600)]/25 pt-3"><dt className="!text-[var(--gold-100)]">本阶段共消耗</dt><dd><PeachValue cents={lock + trainTotal} size="md" /></dd></div>
    </dl> : <p className="text-xs text-[var(--gold-200)]">本阶段召唤与修炼均不消耗蟠桃。</p>}

    <h3 className="confirm-heading">我的余额</h3>
    <dl className="cultivation-facts"><div><dt>蟠桃</dt><dd><PeachValue cents={balance} size="sm" muted /></dd></div><div><dt>USDT</dt><dd><UsdtValue cents={usdt} size="sm" muted /></dd></div></dl>

    <p className="mt-4 text-[11px] leading-5 text-[var(--gold-200)]/80">{level.summonStopTime} 预约截止，{level.summonWindow}（北京时间）回来点「召唤」，当场公布结果；预约不等于召唤成功。成功后须在 {PAYMENT_WINDOW_HOURS} 小时内向传承人打款，逾期召唤蟠桃充公。传承所得为预计值，以实际匹配和到账为准。</p>
    {blocked && <p role="alert" className="mt-3 text-sm text-[#f0a58a]">{expired ? '本轮预约已截止。' : balance < lock ? '蟠桃不足，无法预约本次召唤。' : 'USDT 余额不足以完成本轮修炼值打款。'}</p>}
    <button type="button" className="btn-gold mt-4 w-full text-sm" disabled={blocked} onClick={onConfirm}>确认预约</button><button autoFocus type="button" className="mt-3 min-h-11 w-full text-sm text-[var(--gold-200)] underline underline-offset-4" onClick={onClose}>暂不预约</button>
  </dialog>
}
