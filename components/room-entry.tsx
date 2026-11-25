'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ROOMS, RULES, endsAt, progress, roomStatus, type Contract } from '@/lib/cultivation-preview'
import type { Stage } from '@/lib/game-data'

export function RoomEntry({ stage, contracts, now, priority }: { stage: Stage; contracts: Contract[]; now: number; priority?: boolean }) {
  const rule = RULES[stage]
  const room = ROOMS[stage]
  const status = roomStatus(contracts, now)
  const empty = status.tone === 'empty'
  const closed = !rule.isOpen
  const href = empty ? `/world?stage=${stage}` : `/house/room/${stage}`
  const tone = empty ? 'is-empty' : status.tone === 'due' ? 'is-due' : 'is-live'
  // 空房间不占一整屏：缩成一行，点了去对应仙境召唤
  if (empty) {
    const row = <><span className="font-display text-sm tracking-[.14em] text-[#8a8378]">{room.room}</span><span className="text-[11px] text-stone-500">{closed ? `${rule.name}未开放` : '空 · 前往召唤'}</span></>
    return closed ? <div className="room-row" aria-label={`${room.room}，${rule.name}未开放`}>{row}</div>
      : <Link href={href} className="room-row" aria-label={`${room.room}，暂无修炼中的${rule.name}，前往召唤`}>{row}</Link>
  }
  // 门上直接显示最快圆满的那只的进度
  const lead = [...contracts].sort((a, b) => endsAt(a) - endsAt(b))[0]
  const p = progress(lead, now)
  return (
    <Link href={href} className={`room-door ${tone}`} aria-label={`${room.room}，${empty ? `暂无修炼中的${rule.name}，前往召唤` : status.text}`}>
      <span className="room-plaque">
        <span className="font-display text-[15px] font-bold tracking-[.18em] text-[var(--gold-100)]">{room.room}</span>
      </span>
      <span className="room-opening">
        <Image src={room.cover} alt="" fill priority={priority} sizes="(max-width:480px) 100vw, 448px" className="object-cover object-center" />
        {!empty && <span className="room-dust" aria-hidden />}
        <span className="room-glow" aria-hidden />
      </span>
      <span className="room-sill">
        {empty ? (
          <span className="text-xs text-stone-400">暂无修炼中的{rule.name}</span>
        ) : status.tone === 'ok' && status.text.startsWith('修炼中') ? (
          <span className="flex flex-col gap-0.5 text-xs text-stone-200"><span>{status.text}</span><span className="text-[11px] text-[var(--gold-200)]">第 {p.day} 天 / 共 {p.total} 天</span></span>
        ) : (
          <span className={`house-chip ${status.tone === 'due' ? 'is-due' : status.tone === 'ok' ? 'is-claim' : ''}`}>{status.text}</span>
        )}
        <span className={`${empty ? 'cultivation-secondary' : 'cultivation-primary'} ornate-short btn-compact shrink-0 font-display text-xs font-semibold`}>
          {empty ? '前往召唤' : '进入'}
        </span>
      </span>
    </Link>
  )
}
