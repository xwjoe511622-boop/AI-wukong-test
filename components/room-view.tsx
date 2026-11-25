'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Stage } from '@/lib/game-data'
import { ROOMS, RULES, phase, quote, sortContracts, summarize, type Contract } from '@/lib/cultivation-preview'
import { useCultivationPreview } from './cultivation-preview-provider'
import { CultivationVideo } from './cultivation-video'
import { ContractSlip } from './contract-slip'
import { PeachValue, PeachText } from './peach-value'

export function RoomView({ stage }: { stage: Stage }) {
  const { state, now, message } = useCultivationPreview()
  const rule = RULES[stage]
  const room = ROOMS[stage]
  const contracts = sortContracts(state.contracts.filter(c => c.stage === stage), now)
  const summary = summarize(contracts, now)

  return <div className="house-overview flex flex-col gap-4">
    <header className="flex items-start gap-3 pr-12">
      <Link href="/house" aria-label="返回猴舍" className="mt-0.5 flex size-10 shrink-0 items-center justify-center border border-amber-200/20 text-amber-100"><ArrowLeft className="size-4" /></Link>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-xl font-bold leading-tight text-[var(--gold-100)]">{room.room}</h1><p className="mt-1 text-[11px] tracking-widest text-[var(--gold-400)]">{rule.realm}</p>
        <p className="mt-1 flex flex-wrap items-center gap-y-0.5 text-xs text-stone-300"><span className="whitespace-nowrap">当前悟空 <span className="tabular-nums text-stone-100">{summary.total}</span>只</span>
          {summary.byPhase.修炼中 > 0 && <span className="whitespace-nowrap"><span className="mx-1.5 text-stone-600">·</span>修炼中 <span className="tabular-nums text-stone-100">{summary.byPhase.修炼中}</span>只</span>}
        </p>
      </div>
    </header>

    <section aria-label={`${rule.name}修炼之境`} className="cultivation-current">
      <CultivationVideo key={`${stage}-${contracts.length > 0}`} stage={stage} locked={!contracts.length} empty={!state.contracts.length} />
    </section>

    {contracts.length > 0 && <section aria-label="本室悟空">
      {contracts.length > 1 && <p className="mb-2 text-center text-[11px] text-stone-400">本室共 {contracts.length} 只 · 左右滑动查看</p>}
      <div className={contracts.length > 1 ? 'room-swipe' : ''}>{contracts.map(c => <ContractSlip key={c.id} contract={c} />)}</div>
    </section>}

    <p role="status" aria-live="polite" className="min-h-4 text-center text-[11px] leading-5 text-amber-100/80"><PeachText>{message || `${room.room} · 修炼有时，传承有序。`}</PeachText></p>


  </div>
}
