'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { INHERITANCE_FEE_PCT, PAYMENT_WINDOW_HOURS, type WukongLevel } from '@/lib/game-data'
import { money } from '@/lib/cultivation-preview'
import { peachWhole } from '@/lib/summon-preview'
import { PeachValue, UsdtValue } from './peach-value'

/** 确认预约：把这一轮怎么算的摆出来——修炼值、修炼加成、手续费、预计传承所得，以及蟠桃消耗 */
export function SummonPreviewConfirm({ level, cost, balance, usdt, expired, onClose, onConfirm }: { level: WukongLevel; cost: number; balance: number; usdt: number; expired: boolean; onClose: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const node = ref.current; node?.showModal(); node?.scrollTo(0, 0); return () => node?.close() }, [])
  const lock = Math.round(level.summonCost * 100)
  const growth = Math.round(cost * level.gainPct / 100)
  const fee = Math.round(growth * INHERITANCE_FEE_PCT / 100)
  const trainTotal = Math.round(level.perCycleCost * level.cycleDays * 100)
  const blocked = expired || balance < lock + trainTotal || usdt < cost
  return <dialog ref={ref} aria-labelledby="summon-confirm-title" onCancel={onClose} className="cultivation-dialog">
    <h2 id="summon-confirm-title" tabIndex={-1} autoFocus className="font-display text-xl text-gold outline-none">预约召唤</h2><p className="mt-2 text-xs text-[var(--gold-200)]">{level.realm} · {level.name}</p>

    {!!level.lifecycleCost && <div className="lock-total">
      <p>本次预约一共暂扣</p>
      <PeachValue cents={lock + trainTotal} size="xl" className="lock-value" />
      <p className="lock-split">召唤 {peachWhole(level.summonCost)} + 修炼 {peachWhole(level.perCycleCost * level.cycleDays)}（每日 {peachWhole(level.perCycleCost)} × {level.cycleDays} 天）</p>
    </div>}

    <h3 className="confirm-heading">修炼值怎么算</h3>
    <dl className="cultivation-facts">
      <div><dt>本轮修炼值 · 成功后向传承人打款</dt><dd><UsdtValue cents={cost} size="sm" /></dd></div>
      <div><dt>修炼增长 · {money(cost)} × {level.gainPct}%（修炼加成）</dt><dd><UsdtValue cents={growth} size="sm" sign="+" /></dd></div>
      <div><dt>手续费 · 修炼增长的 {INHERITANCE_FEE_PCT}%</dt><dd><UsdtValue cents={fee} size="sm" sign="-" /></dd></div>
      <div className="border-t border-[var(--gold-600)]/25 pt-3"><dt className="!text-[var(--gold-100)]">预计传承所得</dt><dd><UsdtValue cents={cost + growth - fee} size="lg" /></dd></div>
    </dl>

    <h3 className="confirm-heading">蟠桃怎么算</h3>
    {level.lifecycleCost ? <dl className="cultivation-facts">
      <div><dt>召唤</dt><dd><PeachValue cents={lock} size="sm" /></dd></div>
      <div><dt>修炼 · 每日 {peachWhole(level.perCycleCost)} × {level.cycleDays} 天</dt><dd><PeachValue cents={trainTotal} size="sm" /></dd></div>
      <div className="border-t border-[var(--gold-600)]/25 pt-3"><dt className="!text-sm !text-[var(--gold-100)]">一共暂扣</dt><dd><PeachValue cents={lock + trainTotal} size="lg" /></dd></div>
    </dl> : <p className="text-xs text-[var(--gold-200)]">本阶段召唤与修炼均不消耗蟠桃。</p>}
    {!!level.lifecycleCost && <p className="mt-2 text-xs leading-5 text-[var(--gold-200)]/80">召唤失败：全额退还。悟空进猴舍：正式扣除，之后自动修炼，不用每天操作。召唤成功却逾期未打款：全部充公。</p>}

    <h3 className="confirm-heading">我的余额</h3>
    <dl className="cultivation-facts"><div><dt>蟠桃</dt><dd><PeachValue cents={balance} size="sm" muted /></dd></div><div><dt>USDT</dt><dd><UsdtValue cents={usdt} size="sm" muted /></dd></div></dl>

    <p className="mt-4 text-[11px] leading-5 text-[var(--gold-200)]/80">{level.summonStopTime} 预约截止，{level.summonWindow}（北京时间）回来点「召唤」，当场公布结果；预约不等于召唤成功。成功后须在 {PAYMENT_WINDOW_HOURS} 小时内向传承人打款。传承所得为预计值，以实际匹配和到账为准。</p>
    {blocked && <p role="alert" className="mt-3 text-sm text-[#f0a58a]">{expired ? '本轮预约已截止。' : balance < lock + trainTotal ? '蟠桃不足，无法预约本次召唤。' : 'USDT 余额不足以完成本轮修炼值打款。'}</p>}
    <button type="button" className="btn-gold mt-4 w-full text-sm" disabled={blocked} onClick={onConfirm}>确认预约</button><button type="button" className="mt-3 min-h-11 w-full text-sm text-[var(--gold-200)] underline underline-offset-4" onClick={onClose}>暂不预约</button>
  </dialog>
}

/** 预约成功：告诉用户约上了、暂扣了多少、什么时候回来点召唤 */
export function SummonReserved({ level, paid, onClose }: { level: WukongLevel; paid: number; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const node = ref.current; node?.showModal(); return () => node?.close() }, [])
  return <dialog ref={ref} aria-labelledby="reserved-title" onCancel={onClose} className="cultivation-dialog text-center">
    <div className="reserve-done" aria-hidden><Check className="size-8" strokeWidth={2.4} /></div>
    <h2 id="reserved-title" className="font-display text-2xl text-gold">预约成功</h2>
    <p className="mt-2 text-sm text-[var(--gold-200)]">{level.realm} · {level.name}</p>
    {paid > 0 && <div className="lock-total"><p>已暂扣</p><PeachValue cents={paid} size="xl" className="lock-value" /><p className="lock-split">召唤失败全额退还 · 悟空进猴舍时扣除</p></div>}
    <p className="mt-4 text-sm leading-6 text-[var(--gold-100)]">请在 <strong className="font-latin text-base text-gold">{level.summonWindow}</strong>（北京时间）<br />回来点「召唤」</p>
    <p className="mt-1 text-xs leading-5 text-[var(--gold-200)]/80">预约不等于召唤成功，结果在点召唤后当场公布。</p>
    <button autoFocus type="button" className="btn-gold mt-5 w-full text-sm" onClick={onClose}>知道了</button>
    {paid > 0 && <Link href="/me/locked" className="mt-2 flex min-h-11 items-center justify-center text-sm text-[var(--gold-200)] underline underline-offset-4">查看暂扣明细</Link>}
  </dialog>
}
