'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { RULES, contractDay, settlement, type Contract } from '@/lib/cultivation-preview'
import { UsdtValue } from './peach-value'
import { INHERITANCE_FEE_PCT } from '@/lib/game-data'

export function SettlementFacts({ contract }: { contract: Contract }) {
  const amounts = settlement(contract)
  return <dl className="cultivation-facts">
    <div><dt>修炼值</dt><dd><UsdtValue cents={contract.principal} size="sm" muted /></dd></div>
    <div><dt>修炼增长（+{RULES[contract.stage].gain}%）</dt><dd><UsdtValue cents={amounts.profit} size="sm" sign="+" /></dd></div>
    <div><dt>平台手续费（修炼增长的 {INHERITANCE_FEE_PCT}%）</dt><dd><UsdtValue cents={amounts.fee} size="sm" sign="-" /></dd></div>
    <div className="border-t border-amber-200/15 pt-3"><dt className="!text-amber-100">本次传承所得</dt><dd><UsdtValue cents={amounts.received} size="lg" /></dd></div>
  </dl>
}

export function SettlementDialog({ contract, busy, onClose, onClaim }: { contract: Contract; busy: boolean; onClose: () => void; onClaim: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close() }, [])
  return <dialog ref={dialog} className="cultivation-dialog" aria-labelledby="settle-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="flex items-start justify-between gap-3">
      <div><p className="mb-2 text-xs tracking-widest text-stone-400">{contractDay(contract.started)} · 结缘</p><h2 id="settle-title" className="font-display text-xl font-bold text-amber-200">传承完成</h2><p className="mt-1 font-display text-sm text-[var(--gold-100)]">{RULES[contract.stage].name}</p></div>
      <button type="button" autoFocus onClick={onClose} aria-label="关闭结算弹窗" className="flex size-10 items-center justify-center text-stone-300"><X className="size-5" /></button>
    </div>
    <div className="my-5 border-y border-amber-200/15 py-4"><SettlementFacts contract={contract} /></div>
    <p className="mb-4 text-xs leading-6 text-stone-300">修炼值不参与平台手续费；结算以 USDT 计，确认后转入 USDT 余额；已消耗的召唤与修炼蟠桃不退还。确认后本次传承归档至传承历史。</p>
    <button type="button" className="cultivation-primary w-full" disabled={busy} onClick={onClaim}>{busy ? '处理中…' : '确认支付'}</button>
    <button type="button" className="cultivation-secondary mt-2 w-full" onClick={onClose}>稍后再看</button>
  </dialog>
}
