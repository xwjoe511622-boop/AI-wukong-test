'use client'

import { useState } from 'react'
import { RealmCardHero } from './realm-card-hero'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LEVEL_BY_ID, INHERITANCE_FEE_PCT, PEACH_UNIT_TEXT, PAYMENT_WINDOW_HOURS, isFreeStage, type Stage } from '@/lib/game-data'
import { roundFor, durationText, peachText, peachWhole, rangePosition, costCents, matchAt, lockCents as lockOf } from '@/lib/summon-preview'
import { useSummonPreview } from './summon-preview-provider'
import { SummonPreviewConfirm } from './summon-preview-confirm'
import { SummonPreviewEntry } from './summon-preview-entry'
import { PeachIcon } from './peach'
import { useProduct } from './product-provider'
import { useSound } from '@/lib/sound'

/**
 * 仙境页：本轮修炼值、修炼天数、修炼加成、每日修炼消耗、修炼范围，然后是预约/召唤按钮和流程；
 * 页面少字：三个数、一条范围、一个按钮、一条流程线，细则收起。数值一律按正式版显示。
 */
export function SummonPreview({ stage }: { stage: Stage }) {
  const { state, now, ready, act, currentTime } = useSummonPreview()
  const product = useProduct()
  const { play } = useSound()
  const usdt = product.state?.usdt ?? 0
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [error, setError] = useState('')
  const level = LEVEL_BY_ID[stage]
  const free = isFreeStage(level)
  const round = roundFor(stage, now)
  const entry = state.entries.find(e => e.key === round.key)
  const cost = costCents(stage)
  // 预约时一起暂扣：召唤蟠桃 + 整个周期的修炼蟠桃
  const lockCents = lockOf(stage)
  const previous = state.entries.filter(e => e.stage === stage && e.key !== round.key).slice().reverse()
  const position = rangePosition(stage)
  const settled = !!entry && entry.status !== 'waiting'
  const steps = [
    ['预约', `${level.summonStopTime} 前`],
    ['召唤', level.summonWindow],
    ['打款', `成功后 ${PAYMENT_WINDOW_HOURS} 小时内`],
    ['修炼', `自动 ${level.cycleDays} 天`],
    ['传承', '圆满后收款'],
  ]

  return <div className="stage-page flex flex-col gap-4">
    {/* 返回条固定在最上面，往下翻也一直在；和下面的立绘之间不留空隙 */}
    <header className="stage-bar">
      <Link href="/world" className="flex min-h-11 items-center text-xs text-[var(--gold-200)]">← 返回</Link>
      <h1 className="font-display text-base tracking-wider text-gold">{level.realm}</h1>
      <span aria-hidden />
    </header>

    <div className="stage-hero -mx-4 -mt-4"><RealmCardHero key={stage} level={level} /></div>

    {/* 本轮已出结果：成功待打款 / 已入舍 / 未成功 */}
    {ready && settled && <div id="summon-action" className="scroll-mt-20"><SummonPreviewEntry entry={entry} /></div>}

    {/* 本轮数据：修炼值、修炼天数、修炼加成、每日修炼消耗、修炼范围 */}
    <section aria-labelledby="round-title" className="hud-panel rounded-xl px-4 py-4">
      <h2 id="round-title" className="text-[11px] tracking-wider text-[var(--gold-200)]/80">第{round.number}轮 · {level.name}</h2>
      <dl className="stage-sum mt-3">
        <div><dt>本轮修炼值</dt><dd className="font-latin text-gold">{peachText(cost)}<small>USDT</small></dd></div>
        <div><dt>修炼天数</dt><dd className="text-[var(--gold-100)]">{level.cycleDays}<small>天</small></dd></div>
        <div><dt>本轮修炼加成</dt><dd className="font-latin text-gold">+{level.gainPct}<small>%</small></dd></div>
        <div><dt>每日修炼消耗</dt><dd className="flex items-center justify-center gap-1.5 text-[var(--gold-100)]">{free ? <span className="text-base font-normal">不消耗</span> : <>{peachWhole(level.perCycleCost)}<PeachIcon size={16} /></>}</dd></div>
      </dl>
      <div className="mt-4 border-t border-[var(--gold-600)]/25 pt-3">
        <p className="flex items-baseline justify-between text-[11px] text-[var(--gold-200)]/80"><span>修炼范围</span><span>{peachWhole(level.rangeMin)} – {peachWhole(level.rangeMax)} USDT</span></p>
        <div className="stage-range mt-2" role="img" aria-label={`修炼范围 ${level.rangeMin} 到 ${level.rangeMax}，本轮修炼值 ${level.cost}`}><span style={{ width: `${Math.max(3, position * 100)}%` }} /></div>
        <p className="mt-1.5 flex justify-between text-[10px] text-[var(--gold-200)]/70"><span>起点</span><span>上限</span></p>
      </div>
      {level.notes && <ul className="mt-4 flex flex-col gap-1 rounded-lg border border-[var(--gold-600)]/40 bg-black/30 px-3 py-2 text-[11px] leading-5 text-[var(--gold-100)]">{level.notes.map(note => <li key={note}>· {note}</li>)}</ul>}
    </section>

    {/* 操作区：紧跟在算账卡下面，不固定在屏幕底部，不挡导航栏 */}
    {!settled && <ActionBar />}

    {/* 流程线：和首页五行待办是同一套步骤 */}
    <section aria-label="流程" className="hud-panel rounded-xl px-3 py-4">
      <ol className="stage-steps">{steps.map(([name, when], i) => <li key={name}><span className="stage-step-dot">{i + 1}</span><strong>{name}</strong><em>{when}</em></li>)}</ol>
    </section>

    <details className="hud-panel rounded-xl">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm text-[var(--gold-100)]">召唤规则<ChevronRight className="size-4 text-[var(--gold-400)]" aria-hidden /></summary>
      <ul className="flex flex-col gap-2 px-4 pb-4 text-[11px] leading-5 text-[var(--gold-200)]">
        <li>召唤周期 {level.summonWindow}（北京时间）。{level.summonStopTime} 预约截止，未预约不能召唤；{level.summonStartTime} 起进入本周期，预约过的玩家点「召唤」，系统当场匹配并公布结果。预约了但整个周期都没点召唤的，周期结束时由系统按该阶段剩余名额处理。</li>
        <li>修炼值以 USDT 计，由承接人向传承人打款；蟠桃只是召唤与修炼的消耗单位，{PEACH_UNIT_TEXT}。</li>
        <li>{free ? '本阶段不需要消耗蟠桃：召唤与修炼均不扣费。' : `蟠桃消耗：召唤 ${peachWhole(level.summonCost)}；修炼每日 ${peachWhole(level.perCycleCost)} × ${level.cycleDays} 天 = ${peachWhole(level.perCycleCost * level.cycleDays)}。两项在预约时一起暂扣，召唤失败全额退还，悟空进猴舍时正式扣除。`}</li>
        <li>每个召唤周期每人预约一次。召唤失败不产生交易，可继续参与后续召唤。</li>
        <li>召唤成功后，承接人须在 {PAYMENT_WINDOW_HOURS} 小时内向系统匹配的传承人完成打款（从 USDT 余额扣除）；传承人确认到账后，悟空进入猴舍。超过 {PAYMENT_WINDOW_HOURS} 小时未打款判定逾期违约，暂扣的召唤蟠桃与修炼蟠桃全部充公、不予退还。</li>
        <li>修炼周期 {level.cycleDays} 天，从召唤成功时刻起算。修炼蟠桃已一次扣除，悟空自动修炼，不需要每天操作；周期结束后进入传承。</li>
        <li>修炼加成 +{level.gainPct}%：修炼增长 = 修炼值 × {level.gainPct}%。传承时平台只对修炼增长收取 {INHERITANCE_FEE_PCT}% 手续费，不对修炼值收费。</li>
      </ul>
    </details>

    {previous.length > 0 && <details className="hud-panel rounded-xl">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm text-[var(--gold-100)]">我的往期召唤 · {previous.length}<ChevronRight className="size-4 text-[var(--gold-400)]" aria-hidden /></summary>
      <div className="flex flex-col gap-3 px-4 pb-4">{previous.map(record => <SummonPreviewEntry key={record.key} entry={record} compact />)}</div>
    </details>}

    {confirmation && <SummonPreviewConfirm level={level} cost={cost} balance={state.balance} usdt={usdt} expired={!round.open || confirmation !== round.key} onClose={() => setConfirmation(null)} onConfirm={() => {
      const timestamp = currentTime()
      if (roundFor(stage, timestamp).key !== confirmation) setError('轮次已变更，请重新确认本轮。')
      else act({ type: 'join', stage, now: timestamp })
      setConfirmation(null)
    }} />}
  </div>

  function ActionBar() {
    const live = !!entry && now >= entry.deadline
    const shortPeach = state.balance < lockCents
    const shortUsdt = usdt < cost
    // 左边：状态和倒计时；右边：此刻唯一能点的按钮
    let label: string, until: number | null, button: React.ReactNode
    if (!level.isOpen) { label = '本阶段尚未开放'; until = null; button = <button type="button" className="btn-gold stage-cta" disabled>未开放</button> }
    else if (entry && live) { label = '召唤进行中 · 距本轮结束'; until = matchAt({ deadline: entry.deadline }); button = <button type="button" className="btn-gold stage-cta" onClick={() => { play('nav'); product.act({ type: 'summon-cast', key: entry.key }) }}>召唤</button> }
    else if (entry) { label = '已预约 · 距召唤开始'; until = entry.deadline; button = <button type="button" className="btn-gold stage-cta" disabled>{level.summonStartTime} 召唤</button> }
    else if (round.open) { label = '距预约截止'; until = round.cutoff; button = <button type="button" className="btn-gold stage-cta" disabled={!ready || shortPeach || shortUsdt} onClick={() => { setConfirmation(round.key); setError('') }}>预约召唤</button> }
    else if (round.ended) { label = '本轮已结束 · 距下一轮开放预约'; until = round.nextOpen; button = <button type="button" className="btn-gold stage-cta" disabled>已结束</button> }
    else { label = round.matching ? '召唤进行中 · 未预约本轮' : '预约已截止 · 未预约不能召唤'; until = round.matching ? round.windowEnd : round.deadline; button = <button type="button" className="btn-gold stage-cta" disabled>未预约</button> }
    const canReserve = level.isOpen && !entry && round.open
    return <section id="summon-action" className="stage-action scroll-mt-20" aria-label="召唤操作">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1"><p className="truncate text-[10.5px] text-[var(--gold-200)]/80">{label}</p><p className="mt-0.5 font-latin text-xl font-bold leading-none tabular-nums text-[var(--gold-100)]">{ready && until !== null ? durationText(Math.max(0, until - now)) : '--:--:--'}</p></div>
        {button}
      </div>
      <p className={`mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[10.5px] ${canReserve && (shortPeach || shortUsdt) ? 'text-[#f0a58a]' : 'text-[var(--gold-200)]/70'}`}>
        {error ? error : product.notice && !entry ? product.notice
          : entry ? <>已暂扣 {peachText(entry.paid)}<PeachIcon size={11} /> · 进猴舍时扣除，召唤失败全额退还</>
          : canReserve && shortPeach ? <>蟠桃不足：预约需暂扣 {peachText(lockCents)}（召唤 + 修炼），余额 {peachText(state.balance)}<PeachIcon size={11} /><Link href="/me/wallet?mode=buy" className="underline underline-offset-2">购买蟠桃</Link></>
          : canReserve && shortUsdt ? <>USDT 不足：本轮修炼值 {peachText(cost)}，余额 {peachText(usdt)}<Link href="/me/wallet?mode=in" className="underline underline-offset-2">去接收</Link></>
          : canReserve ? <>{free ? '本阶段不消耗蟠桃' : <>预约暂扣 {peachText(lockCents)}<PeachIcon size={11} />（召唤 {peachWhole(level.summonCost)} + 修炼 {peachWhole(level.perCycleCost * level.cycleDays)}）</>} · 余额 {peachText(state.balance)}<PeachIcon size={11} /></>
          : '可继续预约其他仙境'}
      </p>
    </section>
  }
}
