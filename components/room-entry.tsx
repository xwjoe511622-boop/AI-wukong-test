'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { ROOMS, RULES, roomStatus, type Contract } from '@/lib/cultivation-preview'
import type { Stage } from '@/lib/game-data'

export function RoomEntry({ stage, contracts, now, priority }: { stage: Stage; contracts: Contract[]; now: number; priority?: boolean }) {
  const rule = RULES[stage]
  const room = ROOMS[stage]
  const status = roomStatus(contracts, now)
  const empty = status.tone === 'empty'
  const closed = !rule.isOpen
  const href = empty ? `/world?stage=${stage}` : `/house/room/${stage}`
  const tone = empty ? 'is-empty' : status.tone === 'due' ? 'is-due' : 'is-live'
  if (closed && empty) return (
    <div className="room-door is-empty grayscale-[.7]" aria-label={`${room.room}，${rule.name}未开放`}>
      <span className="room-plaque">
        <span className="font-display text-[15px] font-bold tracking-[.18em] text-[var(--gold-100)]">{room.room}</span>
      </span>
      <span className="room-opening">
        <Image src={room.cover} alt="" fill sizes="(max-width:480px) 100vw, 448px" className="object-cover object-center" />
        <span className="room-glow" aria-hidden />
      </span>
      <span className="room-sill">
        <span className="text-xs text-stone-400">{rule.name}未开放</span>
        <span className="cultivation-secondary ornate-short btn-compact shrink-0 font-display text-xs font-semibold opacity-60">未开放</span>
      </span>
    </div>
  )
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
          <span className="flex items-center gap-1.5 text-xs text-stone-200"><Check className="size-3.5 text-[var(--gold-300)]" />{status.text}</span>
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
