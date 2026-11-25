'use client'

import { useEffect, useRef } from 'react'
import { RULES, shownDays, type quote } from '@/lib/cultivation-preview'
import { PeachValue } from './peach-value'

export function CultivationConfirm({ estimate, balance, busy, title = '今日修炼', onClose, onConfirm }: { estimate: ReturnType<typeof quote>; balance: number; busy: boolean; title?: string; onClose: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close() }, [])
  const insufficient = balance < estimate.total
  return <dialog ref={dialog} className="cultivation-dialog" aria-labelledby="cultivation-confirm-title" onCancel={onClose}>
    <h2 id="cultivation-confirm-title" className="font-display text-xl text-gold">{title}</h2>
    <ul className="my-4 flex max-h-40 flex-col gap-3 overflow-auto text-xs text-stone-300">{estimate.items.map((item, index) => <li key={item.id} className="flex items-center justify-between gap-2"><span>{RULES[item.stage].name} · 待修 {shownDays(item.stage, item.count)} 天{estimate.items.length > 1 ? `（第${index + 1}份）` : ''}</span><PeachValue cents={item.cost} size="xs" /></li>)}</ul>
    <dl className="cultivation-facts border-y border-[var(--gold-600)]/25 py-4"><div><dt>本次消耗</dt><dd><PeachValue cents={estimate.total} size="lg" /></dd></div><div><dt>当前蟠桃余额</dt><dd><PeachValue cents={balance} size="sm" /></dd></div></dl>
    <p className="my-4 text-xs leading-6 text-stone-300">仅补齐当前已到期但未完成的修炼。漏修不罚款、不清零、不重置，不增加额外费用。原生命周期不变。</p>
    {insufficient && <p role="alert" className="mb-3 text-sm text-[var(--gold-200)]">蟠桃不足，修炼进度保留。</p>}
    <button type="button" className="cultivation-primary w-full" disabled={busy || insufficient || !estimate.items.length} onClick={onConfirm}>确认修炼</button>
    <button autoFocus type="button" className="cultivation-secondary mt-2 w-full" onClick={onClose}>取消</button>
  </dialog>
}
