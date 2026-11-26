'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Check, ChevronRight, ScrollText } from 'lucide-react'
import { LEVELS } from '@/lib/game-data'
import { RULES, due, phase, quote, settlement, summarize } from '@/lib/cultivation-preview'
import { useSound } from '@/lib/sound'
import { useCultivationPreview } from './cultivation-preview-provider'
import { HoldButton } from './hold-button'
import { RoomEntry } from './room-entry'
import { PeachValue, PeachText, UsdtValue } from './peach-value'

/**
 * 猴舍首页：这是「我的家」，不是资产页，所以不放金额。
 * 顶部总览（几只悟空、今天还有几只没修炼、一键修炼）→ 七间修炼室的徽章 → 七间修炼室（空的折叠成一行）。
 */
export function HouseView() {
  const { state, now, message, act } = useCultivationPreview()
  const { play } = useSound()
  const [done, setDone] = useState(0)
  const summary = summarize(state.contracts, now)
  const claimable = state.contracts.filter(c => phase(c, now) === '传承完成')
  const dues = state.contracts.filter(c => due(c, now) > 0)
  const cost = quote(dues, now, false).total
  const short = state.balance < cost
  const firstDue = dues[0]
  const trainAll = () => {
    act({ type: 'train', ids: dues.map(c => c.id), accelerate: false, expected: cost })
    play('breakthrough'); setDone(n => n + 1)
  }

  return <div className="house-overview flex flex-col gap-5">
    <h1 className="sr-only">猴舍</h1>

    {/* ① 我的猴舍总览 */}
    <section aria-labelledby="house-title" className={`house-card ${done ? 'is-done' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div><h2 id="house-title" className="house-card-title">我的猴舍</h2><p className="house-card-count"><strong>{summary.total}</strong>只悟空</p></div>
        <Link href="/house/history" className="house-card-link"><ScrollText className="size-3.5" aria-hidden />传承历史<ChevronRight className="size-3.5" aria-hidden /></Link>
      </div>
      <dl className="house-card-stats">
        <div><dt>修炼中</dt><dd>{summary.byPhase.修炼中}</dd></div>
        <div><dt>传承中</dt><dd>{summary.byPhase.传承中}</dd></div>
        <div className={claimable.length ? 'is-on' : ''}><dt>待确认收款</dt><dd>{claimable.length}</dd></div>
      </dl>
      {summary.total === 0 ? <div className="house-card-foot"><p className="mb-3 text-center text-[13px] leading-6 text-[var(--gold-200)]">猴舍里还没有悟空。<br />召唤成功并完成支付结算后，悟空会住进来。</p><Link href="/world" className="btn-gold flex w-full items-center justify-center text-sm">召唤你的第一只悟空</Link></div>
        : dues.length > 0 ? <div className="house-card-foot is-due">
          <p className="flex items-center justify-between gap-2 text-[13px] text-[#f3d6a8]"><span>今日待修炼 <strong className="num text-base text-[#ffd27a]">{dues.length}</strong> 只</span>{firstDue && <Link href={`/house/room/${firstDue.stage}`} className="flex items-center text-[13px] text-[var(--gold-200)] underline underline-offset-4">逐只去修炼<ChevronRight className="size-3.5" aria-hidden /></Link>}</p>
          <div className="mt-3"><HoldButton onDone={trainAll} disabled={short} label={`按住一键修炼 ${dues.length} 只，消耗 ${cost / 100} 蟠桃`}>按住一键修炼{cost > 0 && <> · 消耗 <PeachValue cents={cost} size="sm" /></>}</HoldButton></div>
          <p className={`mt-2 text-center text-[12px] leading-5 ${short ? 'text-[#f0a58a]' : 'text-stone-400'}`}>{short ? <>蟠桃不足，<Link href="/me/wallet?mode=buy" className="underline underline-offset-2">去购买蟠桃</Link></> : '按住不放，运功完成后一次修炼全部；没修炼的那天没有修炼加成。'}</p>
        </div>
        : summary.byPhase.修炼中 > 0 ? <p className="house-card-foot is-ok"><Check className="size-4" aria-hidden />今日修炼已完成{done > 0 && cost === 0 ? '' : ''}</p>
        : <p className="house-card-foot text-center text-[13px] text-[var(--gold-200)]">没有修炼中的悟空，等待传承。</p>}
    </section>

    {/* ② 七间修炼室的徽章：亮着的有悟空，红点是今天还没修炼 */}
    <nav aria-label="七间修炼室" className="house-badges">{LEVELS.map(level => {
      const mine = state.contracts.filter(c => c.stage === level.id)
      const need = mine.filter(c => due(c, now) > 0).length
      const href = mine.length ? `/house/room/${level.id}` : `/world?stage=${level.id}`
      const body = <><span className="house-badge-art"><Image src={level.characterImage} alt="" width={96} height={144} sizes="52px" />{need > 0 && <i aria-hidden />}{mine.length > 1 && <b aria-hidden>{mine.length}</b>}</span><span className="house-badge-name">{level.name.length > 2 ? level.name.slice(0, 2) : level.name}</span></>
      const label = `${level.name}：${mine.length ? `${mine.length} 只${need ? `，${need} 只今日待修炼` : ''}，进入修炼室` : level.isOpen ? '还没有，去召唤' : '未开放'}`
      return level.isOpen || mine.length ? <Link key={level.id} href={href} aria-label={label} className={`house-badge ${mine.length ? 'is-on' : ''}`}>{body}</Link> : <span key={level.id} aria-label={label} className="house-badge">{body}</span>
    })}</nav>

    {/* ③ 承接人已支付、待确认收款（仅存在时出现） */}
    {claimable.length > 0 && <section aria-labelledby="inherit-title" className="flex flex-col gap-2">
      <h2 id="inherit-title" className="sr-only">传承完成</h2>
      {claimable.map(c => <div key={c.id} className="house-inherit flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <p className="house-chip is-claim">待确认收款</p>
          <p className="mt-1 font-display text-base font-semibold text-[var(--gold-100)]">{RULES[c.stage].name}<span className="ml-1.5 text-xs font-normal text-stone-300">· 承接人已支付</span></p>
          <p className="mt-1.5 flex items-center gap-2 text-[12px] text-stone-400">本次传承所得 <UsdtValue cents={settlement(c).received} size="sm" /></p>
        </div>
        <Link href={`/me/trades/${encodeURIComponent(`inherit-${c.id}`)}`} className="cultivation-primary ornate-short btn-compact shrink-0">确认收款</Link>
      </div>)}
    </section>}

    {/* ④ 七间修炼室：有悟空的展开，空的折叠成一行 */}
    <section aria-labelledby="rooms-title" className="flex flex-col gap-3">
      <div className="flex items-center gap-3 px-1">
        <h2 id="rooms-title" className="font-display text-sm font-semibold text-[var(--gold-200)]">修炼室</h2>
        <span className="house-divider flex-1" />
        <span className="text-[12px] text-stone-400">七境修行 · 各有所归</span>
      </div>
      {LEVELS.map((level, i) => <RoomEntry key={level.id} stage={level.id} now={now} priority={i === 0} contracts={state.contracts.filter(c => c.stage === level.id)} />)}
    </section>

    <p role="status" aria-live="polite" className="min-h-4 text-center text-[12px] leading-5 text-amber-100/80"><PeachText>{message || '修炼有时，传承有序。'}</PeachText></p>
  </div>
}
