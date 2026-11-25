'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Stage } from '@/lib/game-data'
import { ROOMS, RULES, phase, quote, sortContracts, summarize, type Contract } from '@/lib/cultivation-preview'
import { useCultivationPreview } from './cultivation-preview-provider'
import { CultivationVideo } from './cultivation-video'
import { CultivationConfirm } from './cultivation-confirm'
import { ContractSlip } from './contract-slip'
import { PeachValue, PeachText } from './peach-value'
import { SummonDemoControls } from './summon-demo-controls'

export function RoomView({ stage }: { stage: Stage }) {
  const { state, now, act, message, busy } = useCultivationPreview()
  const [confirmation, setConfirmation] = useState<ReturnType<typeof quote> | null>(null)
  const rule = RULES[stage]
  const room = ROOMS[stage]
  const contracts = sortContracts(state.contracts.filter(c => c.stage === stage), now)
  const summary = summarize(contracts, now)
  const today = quote(contracts, now, false)
  const short = state.balance < today.total
  // 石灵通常只有一只：保留更沉浸的单角色布局；两只及以上自动切换为列表
  const immersive = stage === 'stone_spirit' && contracts.length === 1

  return <div className="house-overview flex flex-col gap-4">
    <header className="flex items-start gap-3 pr-12">
      <Link href="/house" aria-label="返回猴舍" className="mt-0.5 flex size-10 shrink-0 items-center justify-center border border-amber-200/20 text-amber-100"><ArrowLeft className="size-4" /></Link>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-xl font-bold leading-tight text-[var(--gold-100)]">{room.room}</h1><p className="mt-1 text-[11px] tracking-widest text-[var(--gold-400)]">{rule.realm}</p>
        <p className="mt-1 flex flex-wrap items-center gap-y-0.5 text-xs text-stone-300"><span className="whitespace-nowrap">当前悟空 <span className="tabular-nums text-stone-100">{summary.total}</span>只</span>
          {summary.todayMonkeys > 0 && <span className="whitespace-nowrap"><span className="mx-1.5 text-stone-600">·</span>今日待修 <span className="tabular-nums text-[#f0c98a]">{summary.todayMonkeys}</span>只</span>}
          {summary.byPhase.待完成修炼 > 0 && <span className="whitespace-nowrap"><span className="mx-1.5 text-stone-600">·</span>待完成 <span className="tabular-nums text-[#f0c98a]">{summary.byPhase.待完成修炼}</span>只</span>}
        </p>
      </div>
      <PeachValue cents={state.balance} size="sm" className="shrink-0 pt-1" />
    </header>

    <section aria-label={`${rule.name}修炼之境`} className="cultivation-current">
      <CultivationVideo key={`${stage}-${contracts.length > 0}`} stage={stage} locked={!contracts.length} empty={!state.contracts.length} />
      {immersive && <ContractSlip contract={contracts[0]} />}
    </section>

    {contracts.length > 0 && !immersive && <>
      <section aria-labelledby="room-daily" className="cultivation-daily">
        <div className="flex items-center justify-between gap-2">
          <h2 id="room-daily" className="font-display text-sm font-semibold text-[var(--gold-200)]">本室修炼</h2>
          <p className="text-xs text-stone-300">{today.items.length ? <>{today.items.length}只待修 · 共 {summary.dueCount}次</> : '今日暂无待修'}</p>
        </div>
        <p className="mt-2 text-[11px] text-stone-400">漏修不罚款、不清零、不重置。</p>
        {today.items.length > 0 && <>
          <button type="button" className="cultivation-primary mt-3 w-full" disabled={busy || short} onClick={() => setConfirmation(today)}>本室全部修炼&nbsp;<PeachValue cents={today.total} size="sm" className="!text-inherit" /></button>
          <p className="mt-1.5 text-center text-[10px] text-stone-500">{short ? <span className="text-[#e2a08a]">蟠桃不足</span> : summary.backlog ? `已包含此前未完成 ${summary.backlog}次，不产生额外费用` : '无待补修炼'}</p>
        </>}
      </section>
      <section aria-label="本室悟空" className="flex flex-col gap-3">
        {contracts.map(c => <ContractSlip key={c.id} contract={c} />)}
      </section>
    </>}


    <p role="status" aria-live="polite" className="min-h-4 text-center text-[11px] leading-5 text-amber-100/80"><PeachText>{message || `${room.room} · 修炼有时，传承有序。`}</PeachText></p>


    <SummonDemoControls />
    {confirmation && <CultivationConfirm estimate={confirmation} balance={state.balance} busy={busy} title="一键完成修炼" onClose={() => setConfirmation(null)} onConfirm={() => { act({ type: 'train', ids: confirmation.items.map(i => i.id), accelerate: false, expected: confirmation.total }); setConfirmation(null) }} />}
  </div>
}
