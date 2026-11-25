'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, ScrollText } from 'lucide-react'
import { LEVELS } from '@/lib/game-data'
import { RULES, phase, quote, settlement, summarize, type Contract } from '@/lib/cultivation-preview'
import { useCultivationPreview } from './cultivation-preview-provider'
import { CultivationConfirm } from './cultivation-confirm'
import { RoomEntry } from './room-entry'
import { PeachValue, PeachText, UsdtValue } from './peach-value'

export function HouseView() {
  const { state, now, act, message, busy } = useCultivationPreview()
  const [confirmation, setConfirmation] = useState<ReturnType<typeof quote> | null>(null)
  const summary = summarize(state.contracts, now)
  const today = quote(state.contracts, now, false)
  const claimable = state.contracts.filter(c => phase(c, now) === '传承完成')
  const short = state.balance < today.total

  return <div className="house-overview flex flex-col gap-5">
    <h1 className="sr-only">猴舍</h1>

    {/* ① 蟠桃余额 */}
    <section aria-label="蟠桃余额" className="flex items-end justify-between gap-3 px-1 pt-1">
      <div>
        <p className="text-[11px] tracking-[.2em] text-stone-400">蟠桃余额</p>
        <PeachValue cents={state.balance} size="xl" className="mt-1 leading-none" />
      </div>
      <Link href="/me/wallet" className="text-xs text-[var(--gold-200)] underline underline-offset-4">个人地址</Link>
    </section>

    {/* ② 当前悟空总览 */}
    <section aria-labelledby="contracts-title" className="house-hud px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="contracts-title" className="font-display text-sm font-semibold text-[var(--gold-200)]">当前悟空</h2>
        <p className="font-latin text-lg font-bold tabular-nums text-[var(--gold-100)]">{summary.total}<span className="ml-0.5 font-display text-xs font-normal text-stone-300">只</span></p>
      </div>
      <p className="mt-1.5 text-xs text-stone-300">
        修炼中 <span className="tabular-nums text-stone-100">{summary.byPhase.修炼中}</span>
        <span className="mx-1.5 text-stone-600">·</span>修炼圆满 <span className="tabular-nums text-stone-100">{summary.byPhase.修炼圆满 + summary.byPhase.等待传承}</span>
        <span className="mx-1.5 text-stone-600">·</span>传承中 <span className="tabular-nums text-stone-100">{summary.byPhase.传承中}</span>
      </p>
      {(summary.byPhase.待完成修炼 > 0 || claimable.length > 0) && <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 border-t border-[rgba(197,155,82,0.2)] pt-2.5">
        {summary.byPhase.待完成修炼 > 0 && <span className="house-chip is-due">待完成修炼 {summary.byPhase.待完成修炼}只</span>}
        {claimable.length > 0 && <span className="house-chip is-claim">待确认收款 {claimable.length}只</span>}
      </div>}
    </section>


    {/* ③④⑤ 今日修炼 */}
    <section aria-labelledby="daily-title" className="cultivation-daily">
      <h2 id="daily-title" className="font-display text-sm font-semibold text-[var(--gold-200)]">今日待办</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div className="house-stat"><dt>当前悟空</dt><dd>{summary.total}只</dd></div>
        <div className="house-stat"><dt>今日应修</dt><dd>{summary.todayMonkeys}只</dd></div>
        <div className="house-stat"><dt>此前待补</dt><dd className={summary.backlog ? '!text-[#f0c98a]' : ''}>{summary.backlog}次</dd></div>
        <div className="house-stat"><dt>共待完成</dt><dd>{summary.dueCount}次</dd></div>
      </dl>
      <div className="mt-3 flex items-end justify-between gap-3 border-t border-[rgba(197,155,82,0.2)] pt-3">
        <p className="text-[11px] text-stone-400">今日修炼所需</p>
        <PeachValue cents={today.total} size="lg" />
      </div>
      {summary.total ? <button type="button" className="cultivation-primary mt-3 w-full" disabled={busy || !today.items.length || short} onClick={() => setConfirmation(today)}>
        {today.items.length ? <>一键完成修炼&nbsp;<PeachValue cents={today.total} size="sm" className="!text-inherit" /></> : <><Check className="mr-1 size-3.5" />今日修炼已完成</>}
      </button> : <Link href="/world" className="cultivation-primary mt-3 flex w-full items-center justify-center">前往悟空世界召唤第一只悟空</Link>}
      <p className="mt-2 text-center text-[11px] text-stone-400">{summary.total ? '仅补齐当前已到期修炼，不产生额外费用' : '第一轮召唤已开启 · 猴舍尚无悟空'}</p>
      {summary.total > 0 && <p className="mt-2 text-center text-[10px] text-stone-500">{short ? <span className="text-[#e2a08a]">蟠桃不足，无法全部修炼</span> : summary.backlog ? '已包含此前未完成修炼，不产生额外费用' : '无待补修炼'}</p>}
    </section>

    {/* ⑥ 甲方已打款、待确认收款（仅存在时出现） */}
    {claimable.length > 0 && <section aria-labelledby="inherit-title" className="flex flex-col gap-2">
      <h2 id="inherit-title" className="sr-only">传承完成</h2>
      {claimable.map(c => <div key={c.id} className="house-inherit flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <p className="house-chip is-claim">待确认收款</p>
          <p className="mt-1 font-display text-base font-semibold text-[var(--gold-100)]">{RULES[c.stage].name}<span className="ml-1.5 text-xs font-normal text-stone-300">· 甲方已打款</span></p>
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


    {confirmation && <CultivationConfirm estimate={confirmation} balance={state.balance} busy={busy} title="一键完成修炼" onClose={() => setConfirmation(null)} onConfirm={() => { act({ type: 'train', ids: confirmation.items.map(i => i.id), accelerate: false, expected: confirmation.total }); setConfirmation(null) }} />}
  </div>
}
