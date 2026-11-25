'use client'

import { useEffect, useRef } from 'react'
import { TRIAL_MODE, type WukongLevel } from '@/lib/game-data'
import { PeachValue, UsdtValue } from './peach-value'

export function SummonPreviewConfirm({ level, cost, balance, usdt, expired, onClose, onConfirm }: { level: WukongLevel; cost: number; balance: number; usdt: number; expired: boolean; onClose: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const node = ref.current; node?.showModal(); return () => node?.close() }, [])
  const fee = Math.round(level.summonCost * 100)
  const blocked = expired || balance < fee || usdt < cost
  const word = '召唤'
  return <dialog ref={ref} aria-labelledby="summon-confirm-title" onCancel={onClose} className="cultivation-dialog">
    <h2 id="summon-confirm-title" className="font-display text-xl text-gold">发起召唤</h2><p className="mt-2 text-xs text-[var(--gold-200)]">{level.realm} · {level.name}</p>
    <dl className="cultivation-facts my-4 border-y border-[var(--gold-600)]/25 py-4"><div><dt>配套金额 · 成功后向乙方打款</dt><dd><UsdtValue cents={cost} size="sm" /></dd></div><div><dt>{level.summonCost ? '召唤蟠桃 · 提交时暂扣' : '召唤蟠桃'}</dt><dd>{level.summonCost ? <PeachValue cents={Math.round(level.summonCost * 100)} size="sm" /> : '不消耗'}</dd></div><div><dt>当前蟠桃余额</dt><dd><PeachValue cents={balance} size="sm" /></dd></div><div><dt>当前 U 余额</dt><dd><UsdtValue cents={usdt} size="sm" /></dd></div></dl>
    <p className="text-xs leading-6 text-[var(--gold-200)]">{level.summonStopTime} 预约截止，{level.summonWindow} 系统自动匹配（北京时间），匹配完成后立即公布结果。预约召唤不等于召唤成功。{level.summonCost ? '召唤成功后自动扣除召唤蟠桃；召唤失败全额退还，可继续参与后续召唤。' : '本阶段不消耗召唤蟠桃。'}成功后须在 1 小时内向乙方完成配套金额打款，逾期召唤蟠桃充公；{TRIAL_MODE ? '体验版' : '当前版本'}成功后自动从 U 余额打款，之后进入猴舍按日修炼。</p>
    <p className="mt-2 text-[11px] leading-5 text-stone-400">{TRIAL_MODE ? '体验版：蟠桃与 U 均为体验余额，不产生真实扣款。' : '当前版本尚未接入真实支付，不产生真实扣款。'}</p>
    {blocked && <p role="alert" className="mt-3 text-sm text-[var(--gold-100)]">{expired ? `本轮预约已截止。` : balance < fee ? '蟠桃不足，无法提交本次召唤。' : 'U 余额不足以完成本轮配套金额打款。'}</p>}
    <button type="button" className="btn-gold mt-4 w-full text-sm" disabled={blocked} onClick={onConfirm}>确认{word}</button><button autoFocus type="button" className="mt-3 min-h-11 w-full text-sm text-[var(--gold-200)] underline underline-offset-4" onClick={onClose}>暂不{word}</button>
  </dialog>
}
