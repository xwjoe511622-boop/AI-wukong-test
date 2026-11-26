'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Stage } from '@/lib/game-data'
import { ROOMS, RULES, phase, sortContracts, summarize, trainedNow } from '@/lib/cultivation-preview'
import { useCultivationPreview } from './cultivation-preview-provider'
import { CultivationVideo } from './cultivation-video'
import { ContractSlip } from './contract-slip'
import { PageBar } from './profile-ui'
import { PeachValue, PeachText } from './peach-value'

export function RoomView({ stage }: { stage: Stage }) {
  const { state, now, message } = useCultivationPreview()
  const rule = RULES[stage]
  const room = ROOMS[stage]
  const contracts = sortContracts(state.contracts.filter(c => c.stage === stage), now)
  const summary = summarize(contracts, now)
  // 画面动不动，看今天修炼了没有：本室有悟空今天修炼过就循环播放，否则静止
  const training = contracts.filter(c => phase(c, now) === '修炼中')
  const active = training.some(c => trainedNow(c, now))
  const idleText = !training.length ? '修炼周期已结束 · 等待传承' : rule.days > 1 ? '今日尚未修炼 · 静候运功' : '尚未修炼 · 静候运功'

  return <div className="house-overview flex flex-col gap-4">
    <PageBar title={room.room} back="/house" />
    <p className="page-intro text-center">{rule.realm} · 当前悟空 {summary.total} 只{summary.byPhase.修炼中 > 0 ? ` · 修炼中 ${summary.byPhase.修炼中} 只` : ''}</p>

    <section aria-label={`${rule.name}修炼之境`} className="cultivation-current">
      <CultivationVideo key={`${stage}-${contracts.length > 0}`} stage={stage} locked={!contracts.length} empty={!state.contracts.length} active={active} idleText={idleText} />
    </section>

    {contracts.length > 0 && <section aria-label="本室悟空">
      {contracts.length > 1 && <p className="mb-2 text-center text-[11px] text-stone-400">本室共 {contracts.length} 只 · 左右滑动查看</p>}
      <div className={contracts.length > 1 ? 'room-swipe' : ''}>{contracts.map(c => <ContractSlip key={c.id} contract={c} />)}</div>
    </section>}

    <p role="status" aria-live="polite" className="min-h-4 text-center text-[11px] leading-5 text-amber-100/80"><PeachText>{message || `${room.room} · 修炼有时，传承有序。`}</PeachText></p>


  </div>
}
