'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LEVELS, LEVEL_BY_ID, type Stage } from '@/lib/game-data'
import { isRealmOpen, todayOccurrence } from '@/lib/schedule'
import { useNow } from '@/lib/use-now'
import { useGame, type OwnedMonkey } from '@/lib/game-context'
import { Countdown } from './countdown'
import { GoldDivider, Jewel } from './ornate'
import { PeachAmount } from './peach'
import { SummonSuccess } from './summon-success'

export function SummonView() {
  const params = useSearchParams()
  const router = useRouter()
  const now = useNow()
  const { balance, summon, pending } = useGame()
  const [error, setError] = useState<string | null>(null)

  const initial = (params.get('stage') as Stage) || 'stone_spirit'
  const validInitial = LEVEL_BY_ID[initial] ? initial : 'stone_spirit'
  const [active, setActive] = useState<Stage>(validInitial)
  const [summoned, setSummoned] = useState<OwnedMonkey | null>(null)

  const level = LEVEL_BY_ID[active]
  const open = isRealmOpen(level, now)
  const target = open ? null : todayOccurrence(level.summonHour, now)
  const untilOpen = target ? target.getTime() - now.getTime() : 0
  const affordable = balance >= level.cost

  const handleSummon = async () => {
    if (!open || !affordable || pending) return
    setError(null)
    try {
      const monkey = await summon(active)
      setSummoned(monkey)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '召唤失败，请重试。')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* stage selector */}
      <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {LEVELS.map((l) => {
          const isActive = l.id === active
          return (
            <button
              key={l.id}
              onClick={() => setActive(l.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 transition-all',
                isActive ? 'btn-gold' : 'btn-ghost-gold',
              )}
            >
              <span className={cn('font-display text-xs font-bold tracking-wide')}>{l.realm}</span>
            </button>
          )
        })}
      </div>

      {/* character card */}
      <div className="relative mx-auto w-full max-w-[320px]">
        <div className="panel-glow panel overflow-hidden rounded-3xl p-2">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl">
            <Image
              src={level.card || '/placeholder.svg'}
              alt={level.name}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* realm + name */}
      <div className="text-center">
        <p className="font-display text-xs tracking-[0.3em] text-[var(--gold-500)]">{level.realm}</p>
        <h1 className="font-display text-2xl font-black text-gold">{level.name}</h1>
        <p className="mt-0.5 text-xs text-[var(--gold-600)]">{level.tagline}</p>
      </div>

      {/* contract info */}
      <div className="panel gold-hairline rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Jewel className="h-2 w-2" />
          <span className="font-display text-sm font-bold tracking-[0.2em] text-gold">结 契 信 息</span>
          <Jewel className="h-2 w-2" />
        </div>
        <GoldDivider className="mb-3" />
        <dl className="grid grid-cols-2 gap-3">
          <InfoCell label="结契消耗">
            <PeachAmount value={level.cost} size="sm" />
          </InfoCell>
          <InfoCell label="修炼周期">
            <span className="font-latin text-base font-bold text-gold">{level.cycleDays} 天</span>
          </InfoCell>
          <InfoCell label="修炼增幅">
            <span className="font-latin text-base font-bold text-[var(--jade)]">+{level.gainPct}%</span>
          </InfoCell>
          <InfoCell label="本期修炼所需">
            <PeachAmount value={level.perCycleCost} size="sm" />
          </InfoCell>
        </dl>
      </div>

      {/* summon status + action */}
      <div className="panel gold-hairline rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[var(--gold-600)]">召唤时间</p>
            <p className="whitespace-nowrap font-latin text-lg font-bold text-gold">{level.summonWindow}</p>
          </div>
          {open ? (
            <span className="rounded-full bg-[rgba(47,158,107,0.16)] px-3 py-1 font-display text-xs font-bold text-[var(--jade)]">
              召唤已开启
            </span>
          ) : (
            <div className="text-right">
              <p className="text-[11px] text-[var(--gold-600)]">距离开启</p>
              <Countdown ms={untilOpen} />
            </div>
          )}
        </div>

        <button
          onClick={handleSummon}
          disabled={!open || !affordable || pending}
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-display text-base font-black tracking-[0.15em] transition-all',
            open && affordable ? 'btn-gold' : 'btn-ghost-gold opacity-60',
          )}
        >
          {pending ? '正在保存契约…' : !open ? '未到召唤时刻' : !affordable ? '蟠桃不足' : `结契召唤 · ${level.name}`}
        </button>
        {error && <p role="alert" className="mt-3 text-center text-sm text-[var(--crimson-soft)]">{error}</p>}
        {open && !affordable && (
          <p className="mt-2 text-center text-[11px] text-[var(--crimson-soft)]">
            当前蟠桃 <PeachAmount value={balance} size="sm" className="!gap-0.5" /> ，不足以结契
          </p>
        )}
      </div>

      <button
        onClick={() => router.push('/world')}
        className="mx-auto mt-1 font-display text-xs tracking-[0.2em] text-[var(--gold-600)]"
      >
        返回六大仙境
      </button>

      <SummonSuccess monkey={summoned} onClose={() => setSummoned(null)} />
    </div>
  )
}

function InfoCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="gold-hairline rounded-xl px-3 py-2.5 text-center">
      <dt className="text-[11px] text-[var(--gold-600)]">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}
