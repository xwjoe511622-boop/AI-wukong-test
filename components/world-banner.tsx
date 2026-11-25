'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Countdown } from './countdown'
import { Jewel } from './ornate'
import { nextUpcoming } from '@/lib/schedule'
import { useSummonPreview } from './summon-preview-provider'
import { beijingDate } from '@/lib/summon-preview'
import { RESERVATION_CUTOFF_MINUTES } from '@/lib/game-data'

export function WorldBanner() {
  const { now } = useSummonPreview()
  const { level, target, msLeft } = nextUpcoming(new Date(now))
  const tomorrow = beijingDate(target.getTime()) !== beijingDate(now)
  const cutoff = target.getTime() - RESERVATION_CUTOFF_MINUTES * 60_000
  const booking = now < cutoff

  return (
    <Link
      href={`/world?stage=${level.id}`}
      aria-label={`进入${level.realm}，召唤${level.name}`}
      className="group relative -mx-4 -mt-4 block w-[calc(100%+2rem)] overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold-400)]"
    >
      {/* 仙境作背景铺满，透明底人物立于其上：横幅读作舞台而不是另一张卡 */}
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src={level.realmCover}
          alt=""
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="animate-hero-drift object-cover object-center"
        />
        <div
          className="absolute left-1/2 top-[28%] size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-2xl"
          style={{ background: `radial-gradient(circle, ${level.accent}, transparent 62%)` }}
          aria-hidden="true"
        />
        <Image
          src={level.characterImage}
          alt={level.name}
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="realm-banner-figure object-contain object-bottom"
        />
        {/* dim only where text sits: a soft top-left pocket and the bottom band */}
        <div className="absolute inset-0 bg-[radial-gradient(70%_45%_at_0%_0%,rgba(5,5,6,0.55),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,6,0.28)_0%,rgba(5,5,6,0.06)_30%,rgba(5,5,6,0.08)_55%,rgba(5,5,6,0.94)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,207,92,0.6),transparent)]" />

        {/* bottom info */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <div className="mb-2 flex items-end justify-between">
            <div>
              <p className="font-display text-[13px] tracking-[0.25em] text-[var(--gold-400)]">{level.realm}</p>
              <h1 className="font-display text-3xl font-black leading-tight text-gold">{level.name}</h1>
            </div>
            <Jewel className="mb-1 h-3 w-3" />
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-display text-[11px] text-[var(--gold-200)]">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-[var(--ember)]" />
              {tomorrow ? '距明日预约截止' : booking ? '距本轮预约截止' : '距自动匹配开始'}
            </span>
            <Countdown ms={booking ? cutoff - now : msLeft} big />
          </div>
        </div>
      </div>
    </Link>
  )
}
