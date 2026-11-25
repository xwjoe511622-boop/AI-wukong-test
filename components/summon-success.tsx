'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSound } from '@/lib/sound'
import { Modal } from './modal'
import { GoldDivider, Jewel } from './ornate'
import { PeachAmount } from './peach'
import { LEVEL_BY_ID } from '@/lib/game-data'
import type { OwnedMonkey } from '@/lib/game-context'

export function SummonSuccess({ monkey, onClose }: { monkey: OwnedMonkey | null; onClose: () => void }) {
  const router = useRouter()
  const { play } = useSound()
  const playedForRef = useRef<string | null>(null)

  // 弹出结契成功时播放召唤高潮音；同一只猴只播一次（避免静音切换等重渲染触发重播）
  useEffect(() => {
    const key = monkey ? `${monkey.stage}-${monkey.id ?? ''}` : null
    if (key && playedForRef.current !== key) {
      playedForRef.current = key
      play('summon')
    }
    if (!monkey) playedForRef.current = null
  }, [monkey, play])

  if (!monkey) return null
  const level = LEVEL_BY_ID[monkey.stage]

  return (
    <Modal open={!!monkey} onClose={onClose}>
      <div className="panel panel-glow overflow-hidden rounded-3xl">
        <div className="relative px-6 pb-6 pt-6">
          {/* halo */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40"
            style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(255,180,60,0.28), transparent 70%)' }}
          />
          <div className="relative text-center">
            <p className="font-display text-xs tracking-[0.4em] text-[var(--gold-500)]">召唤成功</p>
            <h3 className="mt-1 font-display text-2xl font-black text-gold">{level.name}结契成功</h3>
            <div className="mx-auto mt-2 flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-[var(--ember)]" />
              <span className="font-display text-[11px] tracking-[0.25em] text-[var(--gold-400)]">
                {level.realm}
              </span>
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-[var(--ember)]" />
            </div>
          </div>

          <GoldDivider className="mt-4" />

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="结契消耗">
              <PeachAmount value={level.cost} size="sm" />
            </Stat>
            <Stat label="修炼周期">
              <span className="font-latin text-base font-bold text-gold">{level.cycleDays} 天</span>
            </Stat>
            <Stat label="修炼增幅">
              <span className="font-latin text-base font-bold text-[var(--jade)]">+{level.gainPct}%</span>
            </Stat>
            <Stat label="本期修炼所需">
              <PeachAmount value={level.perCycleCost} size="sm" />
            </Stat>
          </dl>

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onClose()
                router.push('/house')
              }}
              className="btn-gold flex items-center justify-center gap-2 rounded-xl py-3 font-display text-sm font-black tracking-wide"
            >
              <Jewel className="h-2 w-2 !bg-[#3a2504]" />
              前往猴舍查看修炼进度
            </button>
            <button
              onClick={() => {
                onClose()
                router.push('/house')
              }}
              className="btn-ghost-gold rounded-xl py-2.5 font-display text-sm font-bold tracking-wide"
            >
              稍后修炼
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="gold-hairline rounded-xl px-3 py-2.5 text-center">
      <dt className="text-[11px] text-[var(--gold-600)]">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}
