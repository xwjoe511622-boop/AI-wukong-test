'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ScrollText } from 'lucide-react'
import { LEVELS, type Stage } from '@/lib/game-data'
import { RULES, contractDay, dateTime } from '@/lib/cultivation-preview'
import { useCultivationPreview } from './cultivation-preview-provider'
import { SettlementFacts as SettlementDetails } from './settlement-dialog'

export function CultivationHistory() {
  const { state } = useCultivationPreview()
  const [filter, setFilter] = useState<Stage | 'all'>('all')
  const entries = state.history.filter(c => filter === 'all' || c.stage === filter)
  return <div className="house-overview space-y-5">
    <header className="flex items-center gap-3"><Link href="/house" aria-label="返回猴舍" className="flex size-10 items-center justify-center border border-amber-200/20 text-amber-100"><ArrowLeft className="size-4" /></Link><div><h1 className="font-display text-xl font-bold text-amber-100">传承历史</h1><p className="mt-1 text-xs text-stone-200">修行有迹，传承有序</p></div></header>
    <div className="flex flex-wrap gap-2" role="group" aria-label="按悟空类型筛选历史">{[{ id: 'all', name: '全部' }, ...LEVELS].map(item => <button type="button" key={item.id} onClick={() => setFilter(item.id as Stage | 'all')} aria-pressed={filter === item.id} className={filter === item.id ? 'cultivation-primary !min-h-9' : 'cultivation-secondary !min-h-9'}>{item.name}</button>)}</div>
    <p className="text-xs text-stone-200">共 {entries.length} 条传承记录 · 金额单位为 USDT</p>
    {entries.length ? <ul className="space-y-4">{entries.map(c => <li key={c.id} className="read-panel px-4 py-5"><div className="mb-5 flex items-start justify-between gap-2"><div><h2 className="font-display text-lg font-semibold text-amber-100">{RULES[c.stage].name}</h2><p className="mt-1 text-xs text-stone-400">{contractDay(c.started)}结缘 · 传承 {dateTime(c.finishedAt ?? c.claimedAt)}</p></div><span className="text-xs text-amber-200">传承完成 · 已结算</span></div><SettlementDetails contract={c} /></li>)}</ul> : <div className="read-panel px-4 py-16 text-center"><ScrollText className="mx-auto mb-4 size-8 text-amber-200/50" /><h2 className="font-display text-base text-amber-100">暂无{filter === 'all' ? '' : RULES[filter].name}传承记录</h2><p className="mt-3 text-xs leading-6 text-stone-400">传承完成后，确认结算后即可在这里查看。</p><Link href="/house" className="cultivation-secondary mt-5">返回猴舍</Link></div>}
  </div>
}
