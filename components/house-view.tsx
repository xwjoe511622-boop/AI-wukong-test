'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, ScrollText } from 'lucide-react'
import { LEVELS } from '@/lib/game-data'
import { RULES, phase, quote, settlement, summarize, type Contract } from '@/lib/cultivation-preview'
import { useCultivationPreview } from './cultivation-preview-provider'
import { RoomEntry } from './room-entry'
import { PeachValue, PeachText, UsdtValue } from './peach-value'

export function HouseView() {
  const { state, now, message } = useCultivationPreview()
  const summary = summarize(state.contracts, now)
  const claimable = state.contracts.filter(c => phase(c, now) === '传承完成')

  return <div className="house-overview flex flex-col gap-5">
    <h1 className="sr-only">猴舍</h1>

    {/* ② 当前悟空总览 */}
    <section aria-labelledby="contracts-title" className="house-hud px-4 py-3">
      <div className="flex items-baseline justify-between gap-2 pr-12">
        <h2 id="contracts-title" className="font-display text-sm font-semibold text-[var(--gold-200)]">当前悟空</h2>
        <p className="font-latin text-lg font-bold tabular-nums text-[var(--gold-100)]">{summary.total}<span className="ml-0.5 font-display text-xs font-normal text-stone-300">只</span></p>
      </div>
      <p className="mt-1.5 text-xs text-stone-300">
        {summary.todayMonkeys > 0 && <><span className="text-[#f3b27a]">今日待修炼 <span className="tabular-nums">{summary.todayMonkeys}</span></span><span className="mx-1.5 text-stone-600">·</span></>}修炼中 <span className="tabular-nums text-stone-100">{summary.byPhase.修炼中}</span>
        <span className="mx-1.5 text-stone-600">·</span>传承中 <span className="tabular-nums text-stone-100">{summary.byPhase.传承中}</span>
      </p>
      {claimable.length > 0 && <div className="mt-2.5 border-t border-[rgba(197,155,82,0.2)] pt-2.5"><span className="house-chip is-claim">待确认收款 {claimable.length}只</span></div>}
      {summary.total === 0 ? <Link href="/world" className="cultivation-primary mt-3 flex w-full items-center justify-center">前往悟空世界召唤第一只悟空</Link> : <p className="mt-2.5 border-t border-[rgba(197,155,82,0.2)] pt-2.5 text-[11px] leading-5 text-stone-400">每天进修炼室点一次修炼；当天没点就没有当天的修炼加成，过后不能补。</p>}
    </section>


    {/* ⑥ 承接人已结算、待确认收款（仅存在时出现） */}
    {claimable.length > 0 && <section aria-labelledby="inherit-title" className="flex flex-col gap-2">
      <h2 id="inherit-title" className="sr-only">传承完成</h2>
      {claimable.map(c => <div key={c.id} className="house-inherit flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <p className="house-chip is-claim">待确认收款</p>
          <p className="mt-1 font-display text-base font-semibold text-[var(--gold-100)]">{RULES[c.stage].name}<span className="ml-1.5 text-xs font-normal text-stone-300">· 承接人已结算</span></p>
          <p className="mt-1.5 flex items-center gap-2 text-[11px] text-stone-400">本次结算 <UsdtValue cents={settlement(c).received} size="sm" /></p>
        </div>
        <Link href={`/me/trades/${encodeURIComponent(`inherit-${c.id}`)}`} className="cultivation-primary ornate-short btn-compact shrink-0">确认收款</Link>
      </div>)}
    </section>}

      {/* ⑦ 七间修炼室 */}
    <section aria-labelledby="rooms-title" className="flex flex-col gap-3">
      <div className="flex items-center gap-3 px-1">
        <h2 id="rooms-title" className="font-display text-sm font-semibold text-[var(--gold-200)]">修炼室</h2>
        <span className="house-divider flex-1" />
        <span className="text-[10px] text-stone-500">七境修行 · 各有所归</span>
      </div>
      {LEVELS.map((level, i) => <RoomEntry key={level.id} stage={level.id} now={now} priority={i === 0} contracts={state.contracts.filter(c => c.stage === level.id)} />)}
    </section>

    {/* ⑧ 传承历史 */}
    <Link href="/house/history" className="house-hud flex min-h-14 items-center justify-between gap-3 px-4">
      <span className="flex items-center gap-2.5"><ScrollText className="size-4 text-[var(--gold-300)]" /><span><span className="block font-display text-sm font-semibold text-[var(--gold-200)]">传承历史</span><span className="block text-[11px] text-stone-400">查看历次传承与结算</span></span></span>
      <span className="cultivation-secondary ornate-short btn-compact shrink-0">查看</span>
    </Link>

    <p role="status" aria-live="polite" className="min-h-4 text-center text-[11px] leading-5 text-amber-100/80"><PeachText>{message || '修炼有时，传承有序。'}</PeachText></p>


  </div>
}
