'use client'

import { useEffect, useRef, useState } from 'react'
import { RealmCardHero } from './realm-card-hero'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LEVEL_BY_ID, INHERITANCE_FEE_PCT, PEACH_UNIT_TEXT, PAYMENT_WINDOW_HOURS, isFreeStage, type Stage } from '@/lib/game-data'
import { roundFor, durationText, peachText, peachWhole, rangePosition, costCents, matchAt, lockCents as lockOf, matchStage, ROUND_LABEL } from '@/lib/summon-preview'
import { useSummonPreview } from './summon-preview-provider'
import { SummonPreviewConfirm, SummonReserved } from './summon-preview-confirm'
import { SummonPreviewEntry } from './summon-preview-entry'
import { MATCH_STEPS, matchStep } from './summon-matching'
import { PeachIcon } from './peach'
import { PeachValue } from './peach-value'
import { PageBar } from './profile-ui'
import { useProduct } from './product-provider'
import { useWallet } from './wallet-gate'
import { useSound } from '@/lib/sound'

/**
 * 仙境页：本轮修炼值、修炼天数、修炼加成、每日修炼消耗、修炼范围，然后是召唤按钮和流程；
 * 页面少字：三个数、一条范围、一个按钮、一条流程线，细则收起。数值一律按正式版显示。
 */
export function SummonPreview({ stage }: { stage: Stage }) {
  const { state, now, ready, act, currentTime } = useSummonPreview()
  const product = useProduct()
  const wallet = useWallet()
  const { play } = useSound()
  const usdt = product.state?.usdt ?? 0
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [reserved, setReserved] = useState<string | null>(null)
  const [error, setError] = useState('')
  const level = LEVEL_BY_ID[stage]
  const free = isFreeStage(level)
  const round = roundFor(stage, now)
  const entry = state.entries.find(e => e.key === round.key)
  const cost = costCents(stage)
  // 点召唤时只暂扣召唤蟠桃；修炼蟠桃每天点修炼时才扣
  const lockCents = lockOf(stage)
  const previous = state.entries.filter(e => e.stage === stage && e.key !== round.key).slice().reverse()
  const position = rangePosition(stage)
  const settled = !!entry && entry.status !== 'waiting'
  // 整点前 10 秒倒数、整点起匹配中：召唤按钮变成金光流动的「匹配中」
  const matching = entry ? matchStage(entry, now) : null
  const secondsLeft = entry ? Math.max(0, Math.ceil((matchAt(entry) - now) / 1000)) : 0
  const step = entry ? matchStep(now - matchAt(entry)) : 0
  // 倒数每秒一声，最后 3 秒更响；揭晓的一刻震动一下
  useEffect(() => { if (matching === 'soon' && secondsLeft > 0) play(secondsLeft <= 3 ? 'nav' : 'tap') }, [matching, secondsLeft, play])
  const wasMatching = useRef(false)
  useEffect(() => {
    if (wasMatching.current && settled) { try { navigator.vibrate?.(entry?.status === 'success' ? [80, 60, 160] : 120) } catch {} }
    wasMatching.current = matching === 'matching'
  }, [matching, settled, entry?.status])
  const steps = [
    ['召唤', `${level.summonStopTime} 前`],
    ['匹配', level.summonStartTime],
    ['支付结算', `${PAYMENT_WINDOW_HOURS} 小时内`],
    ['修炼', `${level.cycleDays} 天`],
    ['传承', '到期后'],
  ]

  return <div className="stage-page flex flex-col gap-4">
    {/* 返回条固定在最上面，往下翻也一直在；和下面的立绘之间不留空隙 */}
    <PageBar title={level.realm} back="/world" />

    <div className="stage-hero -mx-4 -mt-4"><RealmCardHero key={stage} level={level} /></div>

    {/* 本轮已出结果：成功待支付 / 已入舍 / 未成功 */}
    {ready && settled && <div id="summon-action" className="scroll-mt-20"><SummonPreviewEntry entry={entry} /></div>}

    {/* 本轮数据：修炼值、修炼天数、修炼加成、每日修炼消耗、修炼范围 */}
    <section aria-labelledby="round-title" className="hud-panel rounded-xl px-4 py-4">
      <h2 id="round-title" className="text-[12px] tracking-wider text-[var(--gold-200)]/80">{ROUND_LABEL} · {level.name}</h2>
      <dl className="stage-sum mt-3">
        <div><dt>本轮修炼值</dt><dd className="font-latin text-gold">{peachText(cost)}<span className="unit">USDT</span></dd></div>
        <div><dt>修炼天数</dt><dd className="text-[var(--gold-100)]">{level.cycleDays}<small>天</small></dd></div>
        <div><dt>本轮修炼加成</dt><dd className="font-latin text-gold">+{level.gainPct}<small>%</small></dd></div>
        <div><dt>每日修炼消耗</dt><dd className="flex items-center justify-center gap-1.5 text-[var(--gold-100)]">{free ? <span className="text-base font-normal">不消耗</span> : <>{peachWhole(level.perCycleCost)}<PeachIcon size={16} /></>}</dd></div>
      </dl>
      <div className="mt-4 border-t border-[var(--gold-600)]/25 pt-3">
        <p className="flex items-baseline justify-between text-[12px] text-[var(--gold-200)]/80"><span>修炼范围</span><span>{peachWhole(level.rangeMin)} – {peachWhole(level.rangeMax)}<span className="unit">USDT</span></span></p>
        <div className="stage-range mt-2" role="img" aria-label={`修炼范围 ${level.rangeMin} 到 ${level.rangeMax}，本轮修炼值 ${level.cost}`}><span style={{ width: `${Math.max(3, position * 100)}%` }} /></div>
        <p className="mt-1.5 flex justify-between text-[12px] text-[var(--gold-200)]/85"><span>起点</span><span>上限</span></p>
      </div>
      {level.notes && <ul className="mt-4 flex flex-col gap-1 rounded-lg border border-[var(--gold-600)]/40 bg-black/30 px-3 py-2 text-[12px] leading-5 text-[var(--gold-100)]">{level.notes.map(note => <li key={note}>· {note}</li>)}</ul>}
    </section>

    {/* 操作区：紧跟在算账卡下面，不固定在屏幕底部，不挡导航栏 */}
    {!settled && <ActionBar />}
    {/* 匹配期间整页四周一圈金光在收紧放松 */}
    {matching && <div className="match-vignette" aria-hidden />}

    {/* 流程线 */}
    <section aria-label="流程" className="hud-panel rounded-xl px-3 py-4">
      <ol className="stage-steps">{steps.map(([name, when], i) => <li key={name}><span className="stage-step-dot">{i + 1}</span><strong>{name}</strong><em>{when}</em></li>)}</ol>
    </section>

    <details className="hud-panel rounded-xl">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm text-[var(--gold-100)]">召唤规则<ChevronRight className="size-4 text-[var(--gold-400)]" aria-hidden /></summary>
      <ul className="flex flex-col gap-2 px-4 pb-4 text-[12px] leading-5 text-[var(--gold-200)]">
        <li>每晚 19:00（北京时间）起可以召唤次日的悟空，到次日 {level.summonStopTime} 截止。截止前点「召唤」即参与，每轮每人一次；{level.summonStartTime} 系统自动匹配并公布结果，不需要再操作。没在截止前点召唤的，不参与本轮匹配。</li>
        <li>修炼值以 USDT 计，由承接人向传承人完成支付结算；蟠桃只是召唤与修炼的消耗单位，{PEACH_UNIT_TEXT}。</li>
        <li>{free ? '本阶段不需要消耗蟠桃：召唤与修炼均不扣费。' : `蟠桃消耗：召唤 ${peachWhole(level.summonCost)}，点召唤时暂扣，召唤失败全额退还，悟空进猴舍时正式扣除；修炼每日 ${peachWhole(level.perCycleCost)}，每天点修炼时扣当天的。`}</li>
        <li>召唤成功后，承接人须在 {PAYMENT_WINDOW_HOURS} 小时内向系统匹配的传承人完成支付结算（从 USDT 余额扣除）；传承人确认到账后，悟空进入猴舍。超过 {PAYMENT_WINDOW_HOURS} 小时未支付判定逾期违约，暂扣的召唤蟠桃全部充公、不予退还。</li>
        <li>修炼周期 {level.cycleDays} 天，从召唤成功时刻起算。需要每天进修炼室点一次「修炼」：点了扣当天的蟠桃、算当天的修炼加成；当天没点就没有当天的加成，过后不能补。周期结束后进入传承。</li>
        <li>修炼加成 +{level.gainPct}% 是每天都修炼时的总加成，按实际修炼的天数计：修炼增长 = 修炼值 × {level.gainPct}% × 已修炼天数 ÷ {level.cycleDays}。一天都没修炼，就按原修炼值传承。传承时平台只对修炼增长收取 {INHERITANCE_FEE_PCT}% 手续费，不对修炼值收费。</li>
      </ul>
    </details>

    {previous.length > 0 && <details className="hud-panel rounded-xl">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm text-[var(--gold-100)]">我的往期召唤 · {previous.length}<ChevronRight className="size-4 text-[var(--gold-400)]" aria-hidden /></summary>
      <div className="flex flex-col gap-3 px-4 pb-4">{previous.map(record => <SummonPreviewEntry key={record.key} entry={record} compact />)}</div>
    </details>}

    {confirmation && <SummonPreviewConfirm tomorrow={round.tomorrow} level={level} cost={cost} balance={state.balance} usdt={usdt} expired={!round.open || confirmation !== round.key} onClose={() => setConfirmation(null)} onConfirm={() => {
      const timestamp = currentTime()
      if (roundFor(stage, timestamp).key !== confirmation) setError('轮次已变更，请重新确认本轮。')
      else { act({ type: 'join', stage, now: timestamp }); setReserved(confirmation) }
      setConfirmation(null)
    }} />}
    {reserved && entry?.key === reserved && entry.status === 'waiting' && <SummonReserved tomorrow={round.tomorrow} level={level} paid={entry.paid} onClose={() => setReserved(null)} />}
  </div>

  function ActionBar() {
    const shortPeach = state.balance < lockCents
    const shortUsdt = usdt < cost
    // 左边：状态和倒计时；右边：此刻唯一能点的按钮
    let label: string, until: number | null, button: React.ReactNode
    if (!level.isOpen) { label = '本阶段尚未开放'; until = null; button = <button type="button" className="btn-gold stage-cta" disabled>未开放</button> }
    else if (product.guest && round.open) { label = '距召唤截止'; until = round.cutoff; button = <button type="button" className="btn-gold stage-cta" onClick={() => { play('nav'); wallet.connect() }}>召唤</button> }
    else if (entry && matching) { label = matching === 'soon' ? '即将开始匹配' : '系统正在匹配'; until = null; button = <button type="button" className={`btn-gold stage-cta match-cta is-step-${matching === 'soon' ? 0 : step + 1}`} aria-disabled="true" tabIndex={-1}><span className="match-sweep" aria-hidden /><span className="relative">{matching === 'soon' ? '即将匹配' : '匹配中'}</span></button> }
    else if (entry) { label = round.tomorrow ? '已参与明日召唤 · 距系统匹配' : '已参与召唤 · 距系统匹配'; until = matchAt(entry); button = <button type="button" className="btn-gold stage-cta" disabled>等待匹配</button> }
    else if (round.open) { label = round.tomorrow ? '明日这一轮 · 距召唤截止' : '距召唤截止'; until = round.cutoff; button = <button type="button" className="btn-gold stage-cta" disabled={!ready || shortPeach || shortUsdt} onClick={() => { play('nav'); setConfirmation(round.key); setError('') }}>召唤</button> }
    else if (round.ended) { label = '今日已结束 · 距开放明日召唤'; until = round.nextOpen; button = <button type="button" className="btn-gold stage-cta" disabled>已结束</button> }
    else { label = round.matching ? '本轮已匹配 · 未参与' : '本轮召唤已截止 · 未参与'; until = round.matching ? round.windowEnd : round.deadline; button = <button type="button" className="btn-gold stage-cta" disabled>已截止</button> }
    const canReserve = level.isOpen && !entry && round.open
    return <section id="summon-action" className={`stage-action scroll-mt-20 ${matching ? `is-matching is-${matching}` : ''}`} aria-label="召唤操作" aria-live={matching ? 'polite' : undefined}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1"><p className={`truncate text-[12px] ${matching ? 'text-[#ffd27a]' : 'text-[var(--gold-200)]/80'}`}>{label}</p>
          {matching === 'soon' ? <p key={secondsLeft} className={`match-count ${secondsLeft <= 3 ? 'is-final' : ''}`}>{secondsLeft}<small>秒</small></p>
            : matching ? <p key={step} className="match-step">{MATCH_STEPS[step]}<span className="match-dots" aria-hidden><i /><i /><i /></span></p>
            : <p className="mt-0.5 font-latin text-xl font-bold leading-none tabular-nums text-[var(--gold-100)]">{ready && until !== null ? durationText(Math.max(0, until - now)) : '--:--:--'}</p>}
        </div>
        {button}
      </div>
      {matching === 'matching' && <ol className="match-track" aria-hidden>{MATCH_STEPS.map((_, i) => <li key={i} className={i <= step ? 'is-on' : ''} />)}</ol>}
      <p className={`mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[12px] ${!product.guest && canReserve && (shortPeach || shortUsdt) ? 'text-[#f0a58a]' : 'text-[var(--gold-200)]/85'}`}>
        {product.guest ? <>连接钱包后即可召唤<button type="button" onClick={wallet.connect} className="underline underline-offset-2">连接钱包</button></> : matching ? (matching === 'soon' ? '不需要操作，结果会立即揭晓' : '请留在此页，结果马上揭晓') : error ? error : product.notice && !entry ? product.notice
          : entry ? null
          : canReserve && shortPeach ? <>蟠桃不足：召唤需暂扣 {peachText(lockCents)}，余额 {peachText(state.balance)}<PeachIcon size={11} /><Link href="/me/wallet?mode=buy" className="underline underline-offset-2">购买蟠桃</Link></>
          : canReserve && shortUsdt ? <>USDT 不足：本轮修炼值 {peachText(cost)}，余额 {peachText(usdt)}<Link href="/me/wallet?mode=deposit" className="underline underline-offset-2">去充值</Link></>
          : canReserve ? <>{free ? '本阶段不消耗蟠桃' : <>召唤暂扣 {peachText(lockCents)}<PeachIcon size={11} /></>} · 余额 {peachText(state.balance)}<PeachIcon size={11} /> · {round.tomorrow ? '明日 ' : ''}{level.summonStartTime} 自动匹配</>
          : '可继续参与其他仙境的召唤'}
      </p>
      {entry && entry.paid > 0 && <Link href="/me/locked" className="stage-locked">已暂扣<PeachValue cents={entry.paid} size="md" /><em>明细<ChevronRight className="size-3.5" aria-hidden /></em></Link>}
    </section>
  }
}
