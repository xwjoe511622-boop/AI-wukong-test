'use client'

import { RealmCoverArt } from './realm-cover-art'
import Link from 'next/link'
import { LEVELS, starText } from '@/lib/game-data'
import { roundFor, rangeText, durationParts } from '@/lib/summon-preview'
import { useSummonPreview } from './summon-preview-provider'
import { REALM_STATUS_LABEL, realmStatus } from '@/lib/home'

export function RealmList() {
  const { now, ready, state } = useSummonPreview()
  return <ul className="flex flex-col gap-6">{LEVELS.map((level, index) => {
    const round = roundFor(level.id, now)
    // 顺序固定为成长顺序，只用高亮区分此刻状态
    const status = ready && level.isOpen ? realmStatus(level.id, state.entries, now) : null
    // 已参与的仙境不再看截止时间，直接看离系统匹配还有多久
    const left = status === 'reserved' ? round.deadline - now : round.left
    const day = round.tomorrow ? '明日 ' : ''
    const [h, m, s] = ready ? durationParts(Math.max(0, left)) : ['--', '--', '--']
    return <li key={level.id}><article aria-label={`${level.realm} · ${level.name}${level.isOpen ? '' : ' · 未开放'}`} className={`realm-cover flex flex-col overflow-hidden rounded-b-xl ${level.isOpen ? '' : 'grayscale-[.7]'} ${status ? `is-${status}` : ''}`}>
      <RealmCoverArt level={level} index={index} />
      <div className="realm-hud flex flex-col gap-3 px-4 pb-4 pt-3">
        <header className="flex items-start justify-between gap-3">
          <p className="flex flex-wrap items-center gap-2 font-display text-[13px] tracking-wider text-[var(--gold-100)]">{level.realm} · {level.name}{status && <span className={`realm-state is-${status}`}>{REALM_STATUS_LABEL[status]}</span>}{!level.isOpen && <span className="rounded-full border border-[var(--gold-600)]/50 px-2 py-0.5 text-[12px] tracking-wide text-[var(--gold-200)]">未开放</span>}</p>
          <div className="flex flex-col items-end">
            <span aria-label={`难度 ${level.stars} 星`} className="text-[12px] leading-none tracking-[0.15em] text-[var(--gold-400)]">{starText(level.stars)}</span>
            <span className="mt-1 text-[12px] text-[var(--gold-200)]/80">{level.tier}</span>
          </div>
        </header>
        {/* 只留三样：修炼范围、修炼加成、修炼天数；轮次、本轮修炼值进了仙境页再看 */}
        <dl className="realm-facts">
          <div><dt>修炼范围</dt><dd>{rangeText(level.id)}<span className="unit">USDT</span></dd></div>
          <div><dt>修炼加成</dt><dd className="text-gold">+{level.gainPct}%</dd></div>
          <div><dt>修炼天数</dt><dd>{level.cycleDays}<small>天</small></dd></div>
        </dl>
        {level.notes && <ul className="flex flex-col gap-1 rounded-lg border border-[var(--gold-600)]/40 bg-black/30 px-3 py-2 text-[12px] leading-5 text-[var(--gold-100)]">{level.notes.map(note => <li key={note}>· {note}</li>)}</ul>}
                {level.isOpen ? <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] text-[var(--gold-200)]/85">{status === 'reserved' || status === 'live-reserved' ? `已参与 · ${day}${level.summonStartTime} 匹配` : !ready || round.open ? `${day}${level.summonStopTime} 截止 · ${level.summonStartTime} 匹配` : round.ended ? '今日已结束 · 距开放明日召唤' : round.matching ? '本轮已匹配 · 距本轮结束' : '召唤已截止 · 距系统匹配'}</p>
            <p className="mt-1 font-latin text-xl font-bold leading-none tabular-nums text-[var(--gold-100)]" aria-live="off">{h}:{m}:{s}</p>
          </div>
          <Link href={`/world?stage=${level.id}`} className="btn-gold ornate-short inline-flex w-36 shrink-0 items-center justify-center whitespace-nowrap text-[12px]">{status === 'open' ? '召唤' : `进入${level.realm}`}</Link>
        </div> : <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] leading-5 text-[var(--gold-200)]/80">该阶段尚未开放召唤 · 静待天时</p>
          <Link href={`/world?stage=${level.id}`} className="btn-ghost-gold inline-flex w-36 shrink-0 items-center justify-center whitespace-nowrap text-[12px]">查看{level.realm}</Link>
        </div>}
      </div>
    </article></li>
  })}</ul>
}
