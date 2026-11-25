'use client'

import { RealmCoverArt } from './realm-cover-art'
import Link from 'next/link'
import { LEVELS, starText, cycleText } from '@/lib/game-data'
import { roundFor, rangeText, durationParts, peachWhole } from '@/lib/summon-preview'
import { useSummonPreview } from './summon-preview-provider'
import { REALM_STATUS_LABEL, realmStatus } from '@/lib/home'

export function RealmList() {
  const { now, ready, state } = useSummonPreview()
  return <ul className="flex flex-col gap-6">{LEVELS.map((level, index) => {
    const round = roundFor(level.id, now)
    // 顺序固定为成长顺序，只用高亮区分此刻状态
    const status = ready && level.isOpen ? realmStatus(level.id, state.entries, now) : null
    // 已预约的仙境不再看预约截止，直接看离匹配开始还有多久
    const left = status === 'reserved' ? round.deadline - now : round.left
    const [h, m, s] = ready ? durationParts(Math.max(0, left)) : ['--', '--', '--']
    return <li key={level.id}><article aria-label={`${level.realm} · ${level.name}${level.isOpen ? '' : ' · 未开放'}`} className={`realm-cover flex flex-col overflow-hidden rounded-b-xl ${level.isOpen ? '' : 'grayscale-[.7]'} ${status ? `is-${status}` : ''}`}>
      <RealmCoverArt level={level} index={index} />
      <div className="realm-hud flex flex-col gap-3 px-4 pb-4 pt-3">
        <header className="flex items-start justify-between gap-3">
          <p className="flex flex-wrap items-center gap-2 font-display text-[13px] tracking-wider text-[var(--gold-100)]">{level.realm} · {level.name}{status && <span className={`realm-state is-${status}`}>{REALM_STATUS_LABEL[status]}</span>}{!level.isOpen && <span className="rounded-full border border-[var(--gold-600)]/50 px-2 py-0.5 text-[10px] tracking-widest text-[var(--gold-200)]">未开放</span>}</p>
          <div className="flex flex-col items-end">
            <span aria-label={`难度 ${level.stars} 星`} className="text-[12px] leading-none tracking-[0.15em] text-[var(--gold-400)]">{starText(level.stars)}</span>
            <span className="mt-1 text-[10px] text-[var(--gold-200)]/80">{level.tier}</span>
          </div>
        </header>
        <div className="flex items-end justify-between gap-3 rounded-lg border border-[var(--gold-600)]/40 bg-black/30 px-3 py-2">
          <div>
            <p className="text-[10px] text-[var(--gold-200)]/70">当前轮次</p>
            <p className="mt-1 font-display text-base font-bold leading-none tracking-wider text-[var(--gold-100)]">第{round.number}轮</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--gold-200)]/70">本轮修炼值</p>
            <p className="mt-1 flex items-baseline justify-end gap-1 font-latin text-xl font-bold leading-none tabular-nums text-gold">{peachWhole(level.cost)}<span className="unit">USDT</span></p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <div><dt className="text-[10px] text-[var(--gold-200)]/70">修炼值</dt><dd className="mt-0.5 flex items-baseline gap-1 whitespace-nowrap font-latin text-sm font-bold leading-none sm:text-lg text-[var(--gold-100)]">{rangeText(level.id)}<span className="unit">USDT</span></dd></div>
          <div className="text-right"><dt className="text-[10px] text-[var(--gold-200)]/70">修炼加成</dt><dd className="mt-0.5 font-latin text-lg font-bold leading-none text-gold">+{level.gainPct}%</dd></div>
          <div><dt className="text-[10px] text-[var(--gold-200)]/70">修炼周期</dt><dd className="mt-0.5 whitespace-nowrap text-[12px] text-[var(--gold-100)]">{cycleText(level)}</dd></div>
          <div className="text-right"><dt className="text-[10px] text-[var(--gold-200)]/70">召唤时间</dt><dd className="mt-0.5 text-[12px] leading-5 text-[var(--gold-100)]"><span className="whitespace-nowrap"><span className="font-latin tabular-nums">{level.summonStopTime}</span> 预约截止</span><br /><span className="whitespace-nowrap text-[var(--gold-200)]/80"><span className="font-latin tabular-nums">{level.summonWindow}</span> 召唤</span></dd></div>
        </dl>
        {level.notes && <ul className="flex flex-col gap-1 rounded-lg border border-[var(--gold-600)]/40 bg-black/30 px-3 py-2 text-[11px] leading-5 text-[var(--gold-100)]">{level.notes.map(note => <li key={note}>· {note}</li>)}</ul>}
        <div className="gold-line h-px w-full opacity-60" />
        {level.isOpen ? <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-[var(--gold-200)]/70">{status === 'live-reserved' ? '已预约 · 现在可以召唤 · 距本轮结束' : status === 'reserved' ? '已预约 · 距召唤开始' : !ready || round.open ? '距本轮预约截止' : round.ended ? '本轮已结束 · 距下一轮开放预约' : round.matching ? '召唤中 · 未预约本轮 · 距本轮结束' : '预约已截止 · 距召唤开始'}</p>
            <p className="mt-0.5 font-latin text-base font-bold leading-none tabular-nums text-[var(--gold-100)]" aria-live="off">{h} : {m} : {s}</p>
          </div>
          <Link href={`/world?stage=${level.id}`} className="btn-gold ornate-short inline-flex w-36 shrink-0 items-center justify-center whitespace-nowrap text-[11px]">{status === 'live-reserved' ? '去召唤' : status === 'open' ? '预约召唤' : `进入${level.realm}`}</Link>
        </div> : <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] leading-5 text-[var(--gold-200)]/80">该阶段尚未开放召唤 · 静待天时</p>
          <Link href={`/world?stage=${level.id}`} className="btn-ghost-gold inline-flex w-36 shrink-0 items-center justify-center whitespace-nowrap text-[11px]">查看{level.realm}</Link>
        </div>}
      </div>
    </article></li>
  })}</ul>
}
