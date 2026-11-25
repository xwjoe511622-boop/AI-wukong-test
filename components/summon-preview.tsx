'use client'

import { useState } from 'react'
import { RealmCardHero } from './realm-card-hero'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LEVEL_BY_ID, INHERITANCE_FEE_PCT, PEACH_UNIT_TEXT, PAYMENT_WINDOW_HOURS, TRIAL_MODE, TRIAL_NOTE, cycleText, runCost, isFreeStage, type Stage } from '@/lib/game-data'
import { roundFor, durationParts, peachText, peachWhole, rangePosition, costCents } from '@/lib/summon-preview'
import { useSummonPreview } from './summon-preview-provider'
import { SummonDemoControls } from './summon-demo-controls'
import { SummonPreviewConfirm } from './summon-preview-confirm'
import { SummonPreviewEntry } from './summon-preview-entry'
import { PeachIcon } from './peach'
import { useProduct } from './product-provider'

/** 蟠桃数值；0 显示为「不消耗」 */
function Cost({ value, suffix, end }: { value: number; suffix?: string; end?: boolean }) {
  if (value === 0) return <>不消耗</>
  return <span className={`flex items-center gap-1 ${end ? 'justify-end' : ''}`}>{peachWhole(value)}<PeachIcon size={12} />{suffix}</span>
}

function Fact({ label, value, align = 'left', gold = false, note }: { label: string; value: React.ReactNode; align?: 'left' | 'right'; gold?: boolean; note?: React.ReactNode }) {
  return <div className={align === 'right' ? 'text-right' : ''}>
    <dt className="text-[10px] text-[var(--gold-200)]/70">{label}</dt>
    <dd className={`mt-0.5 text-sm ${gold ? 'font-latin font-bold text-gold' : 'text-[var(--gold-100)]'}`}>{value}</dd>
    {note && <p className="mt-0.5 text-[10px] leading-4 text-[var(--gold-200)]/60">{note}</p>}
  </div>
}

export function SummonPreview({ stage }: { stage: Stage }) {
  const { state, now, ready, act, currentTime } = useSummonPreview()
  const product = useProduct()
  const usdt = product.state?.usdt ?? 0
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [error, setError] = useState('')
  const level = LEVEL_BY_ID[stage]
  const free = isFreeStage(level)
  // 体验版周期缩短为 1 天：页面以体验版实际数值为主，旁边始终标出正式版数值
  const trialDiff = TRIAL_MODE && level.runDays !== level.cycleDays
  const round = roundFor(stage, now)
  const entry = state.entries.find(e => e.key === round.key)
  const cost = costCents(stage)
  const [h, m, s] = ready ? durationParts(round.left) : ['--', '--', '--']
  const totalLocked = Math.round(level.summonCost * 100)
  const previous = state.entries.filter(e => e.stage === stage && e.key !== round.key).slice().reverse()
  const position = rangePosition(stage)

  return <div className="flex flex-col gap-4">
    <header className="hud-panel mr-12 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5">
      <Link href="/world" className="flex min-h-9 items-center text-xs text-[var(--gold-200)]">← 返回</Link>
      <h1 className="font-display text-base tracking-wider text-gold">{level.realm}</h1>
      <span className="flex items-center gap-1 font-latin text-xs font-bold tabular-nums text-[var(--gold-100)]">{ready ? peachText(state.balance) : '—'}<PeachIcon size={14} /></span>
    </header>

    <RealmCardHero key={stage} level={level} />

    <section aria-labelledby="round-title" className="hud-panel rounded-xl px-4 pb-4 pt-3">
      <p className="text-[10px] tracking-wider text-[var(--gold-200)]/70">第{round.number}轮召唤</p>
      <h2 id="round-title" className="mt-1 text-xs text-[var(--gold-200)]">本轮配套金额</h2>
      <p className="mt-1 flex items-baseline gap-1.5 font-latin text-4xl font-bold leading-none text-gold">{peachText(cost)}<span className="text-sm font-normal opacity-80">USDT</span></p>
      <div className="mt-4">
        <p className="text-[10px] text-[var(--gold-200)]/70">配套金额范围 · USDT</p>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--gold-100)]">
          <span className="font-latin tabular-nums">{peachWhole(level.rangeMin)}</span>
          <div className="range-track flex-1" role="img" aria-label={`本轮配套金额位于范围 ${Math.round(position * 100)}% 处`}><span className="range-node" style={{ left: `${position * 100}%` }} /></div>
          <span className="font-latin tabular-nums">{peachWhole(level.rangeMax)}</span>
        </div>
      </div>
      <div className="gold-line my-4 h-px w-full opacity-50" />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Fact label="修炼周期" value={cycleText(level)} />
        <Fact label="圆满增幅" value={`+${level.gainPct}%`} align="right" gold note="完成修炼周期后获得" />
        <Fact label="召唤时间" value={<span className="whitespace-nowrap"><span className="font-latin">{level.summonStopTime}</span> 预约截止</span>} note={<span className="whitespace-nowrap">{level.summonWindow} 自动匹配</span>} />
        <Fact label="每轮修炼次数" value={`${level.runDays}次`} align="right" note={trialDiff ? `正式版 ${level.cultivationCount} 次` : undefined} />
        <Fact label="每日修炼" value={<Cost value={level.perCycleCost} suffix=" / 天" />} />
        <Fact label="全程修炼" value={<Cost value={level.perCycleCost * level.runDays} end />} align="right" note={trialDiff ? `正式版 ${peachWhole(level.perCycleCost * level.cycleDays)}` : undefined} />
        <Fact label="召唤成功消耗" value={<Cost value={level.summonCost} />} />
        <Fact label="生命周期养成消耗" value={<Cost value={runCost(level)} end />} align="right" note={free ? '本阶段召唤与修炼均不消耗蟠桃' : trialDiff ? `正式版 ${peachWhole(level.lifecycleCost)}` : '召唤 + 每日修炼 × 修炼天数；不含配套金额和传承手续费'} />
      </dl>
      {level.notes && <ul className="mt-4 flex flex-col gap-1 rounded-lg border border-[var(--gold-600)]/40 bg-black/30 px-3 py-2 text-[11px] leading-5 text-[var(--gold-100)]">{level.notes.map(note => <li key={note}>· {note}</li>)}</ul>}
    </section>

    {!level.isOpen
      ? <section aria-label="阶段未开放" className="hud-panel rounded-xl px-4 py-6 text-center">
        <p className="font-display text-xl tracking-widest text-[var(--gold-100)]">{level.name} · 未开放</p>
        <p className="mt-2 text-xs leading-6 text-[var(--gold-200)]">对应时间段 {level.summonWindow}（北京时间）。当前不开放召唤与交易，机制数据仅供预览。</p>
        <Link href="/world" className="btn-ghost-gold mt-4 inline-flex w-full items-center justify-center text-sm">返回七大仙境</Link>
      </section>
      : ready && entry
      ? <SummonPreviewEntry entry={entry} />
      : <section aria-label="发起召唤" className="hud-panel rounded-xl px-4 pb-4 pt-3 text-center">
        <p className="text-[10px] text-[var(--gold-200)]/70">{round.open || !ready ? '距本轮预约截止' : round.ended ? '本轮已结束 · 距下一轮开放预约' : round.matching ? '自动匹配中 · 距本周期结束' : '预约已截止 · 距自动匹配开始'}</p>
        <p className="mt-1 font-latin text-3xl font-bold leading-none tabular-nums text-[var(--gold-100)]">{h} : {m} : {s}</p>
        <button type="button" className="btn-gold mt-4 w-full text-sm" disabled={!ready || !round.open || state.balance < totalLocked || usdt < cost} onClick={() => { setConfirmation(round.key); setError('') }}>{!ready ? '读取中…' : round.ended ? '本轮已结束' : !round.open ? '本轮预约已截止' : state.balance < totalLocked ? '蟠桃不足' : usdt < cost ? 'USDT 余额不足' : '发起召唤'}</button>
        <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-[var(--gold-200)]">{round.open ? <>提交时暂扣召唤蟠桃 {peachText(totalLocked)}<PeachIcon size={12} /> · 失败全额退还</> : '可继续参与后续召唤：下一轮自次日 00:00 起预约'}</p>
        {error && <p role="alert" className="mt-2 text-xs text-[var(--gold-200)]">{error}</p>}
      </section>}

    <details className="hud-panel rounded-xl">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm text-[var(--gold-100)]">召唤规则<ChevronRight className="size-4 text-[var(--gold-400)]" aria-hidden /></summary>
      <ul className="flex flex-col gap-2 px-4 pb-4 text-[11px] leading-5 text-[var(--gold-200)]">
        <li>召唤周期 {level.summonWindow}（北京时间）。{level.summonStopTime} 停止召唤，即预约截止；{level.summonStartTime} 起进入本周期，系统在周期内自动匹配。匹配完成后立即公布结果，无需等待整点，例如 {level.summonStartTime.slice(0, 3)}05 完成匹配即在 {level.summonStartTime.slice(0, 3)}05 公布。</li>
        <li>配套金额以 USDT 计，由甲方向乙方打款；蟠桃只是召唤与修炼的消耗单位。{free ? '本阶段不消耗召唤蟠桃。' : `召唤成功后系统自动扣除召唤蟠桃 ${peachWhole(level.summonCost)}；召唤失败全额退还本次召唤使用的蟠桃。`}</li>
        <li>每个召唤周期每人提交一次。召唤失败不产生交易，可继续参与后续召唤。</li>
        <li>{free ? '本阶段不需要消耗蟠桃：召唤与修炼均不扣费。' : `蟠桃消耗：召唤 ${peachWhole(level.summonCost)}，一次性扣除；修炼每日 ${peachWhole(level.perCycleCost)}，共 ${level.runDays} 天；本阶段合计 ${peachWhole(runCost(level))}${trialDiff ? `（正式版 ${level.cycleDays} 天，合计 ${peachWhole(level.lifecycleCost)}）` : ''}。`}{PEACH_UNIT_TEXT}。契约功能已取消，不再参与任何召唤流程。</li>
        <li>召唤成功后立即进入甲乙双方交易：甲方（打款方）须在 {PAYMENT_WINDOW_HOURS} 小时内向系统匹配的乙方完成打款（从 USDT 余额扣除）；乙方（释放方）确认实际到账后立即释放对应权益。</li>
        <li>甲方超过 {PAYMENT_WINDOW_HOURS} 小时仍未完成打款，判定为逾期违约：本次召唤所扣除的蟠桃直接充公、不予退还，系统保留违约记录。</li>
        <li>乙方确认到账后悟空进入猴舍，生命周期从召唤成功时刻起算，共 {level.runDays} 天，不需要再次购买或领养。</li>
        {TRIAL_MODE && <li>{TRIAL_NOTE}</li>}
        <li>每日修炼一次，漏修可补。全部修炼完成且原生命周期结束后才可传承；未完成的悟空仍留在猴舍。</li>
        <li>圆满增幅 +{level.gainPct}%，每 {level.runDays} 天一期{trialDiff ? `（正式版 ${level.cycleDays} 天）` : ''}；传承平台手续费仅针对本次修炼盈利收取{INHERITANCE_FEE_PCT}%。</li>
      </ul>
    </details>

    {previous.length > 0 && <details className="hud-panel rounded-xl">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm text-[var(--gold-100)]">我的往期召唤 · {previous.length}<ChevronRight className="size-4 text-[var(--gold-400)]" aria-hidden /></summary>
      <div className="flex flex-col gap-3 px-4 pb-4">{previous.map(record => <SummonPreviewEntry key={record.key} entry={record} compact />)}</div>
    </details>}

    {level.isOpen && <SummonDemoControls stage={stage} />}

    {confirmation && <SummonPreviewConfirm level={level} cost={cost} balance={state.balance} usdt={usdt} expired={!round.open || confirmation !== round.key} onClose={() => setConfirmation(null)} onConfirm={() => {
      const timestamp = currentTime()
      if (roundFor(stage, timestamp).key !== confirmation) setError('轮次已变更，请重新确认本轮。')
      else act({ type: 'join', stage, now: timestamp })
      setConfirmation(null)
    }} />}
  </div>
}
