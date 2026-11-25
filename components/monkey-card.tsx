'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LEVEL_BY_ID } from '@/lib/game-data'
import { splitDuration } from '@/lib/schedule'
import { useNow } from '@/lib/use-now'
import { useGame, type OwnedMonkey, type InheritResult } from '@/lib/game-context'
import { Countdown } from './countdown'
import { PeachAmount } from './peach'

export function MonkeyCard({
  monkey,
  onInherit,
}: {
  monkey: OwnedMonkey
  onInherit: (r: InheritResult) => void
}) {
  const now = useNow()
  const { completeCycle, inherit, pending } = useGame()
  const [error, setError] = useState<string | null>(null)
  const level = LEVEL_BY_ID[monkey.stage]

  const handleAction = async (action: 'cycle' | 'inherit') => {
    setError(null)
    try {
      if (action === 'cycle') await completeCycle(monkey.id)
      else onInherit(await inherit(monkey.id))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '操作失败，请重试。')
    }
  }

  const msLeft = monkey.cycleEndsAt - now.getTime()
  const cycleReady = msLeft <= 0
  const cyclesDone = monkey.cycleProgress >= monkey.cycleTotal
  const progressPct = Math.round((monkey.cycleProgress / monkey.cycleTotal) * 100)
  const profit = Math.max(0, monkey.contractValue - level.cost)

  return (
    <div className="panel gold-hairline overflow-hidden rounded-2xl">
      <div className="flex gap-3 p-3">
        {/* portrait */}
        <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-[rgba(212,148,26,0.4)]">
          <Image src={level.card || '/placeholder.svg'} alt={level.name} fill className="object-cover object-top" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-1 pt-4">
            <p className="text-center font-display text-[10px] tracking-wide text-gold">{level.realm}</p>
          </div>
        </div>

        {/* info */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-black text-gold">{level.name}</h3>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                cyclesDone
                  ? 'bg-[rgba(242,180,49,0.2)] text-[var(--gold-200)]'
                  : 'bg-[rgba(47,158,107,0.16)] text-[var(--jade)]',
              )}
            >
              {cyclesDone ? '可传承' : '修炼中'}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--gold-600)]">
            <span>结契消耗</span>
            <PeachAmount value={level.cost} size="sm" className="!gap-0.5" />
          </div>

          {/* progress */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--gold-600)]">修炼进度</span>
              <span className="font-latin font-bold text-gold">
                {monkey.cycleProgress} / {monkey.cycleTotal}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full border border-[rgba(212,148,26,0.35)] bg-[rgba(10,8,13,0.7)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ffe39a,#f2b431,#ff7a1a)] transition-all"
                style={{ width: `${progressPct}%`, boxShadow: '0 0 10px rgba(255,150,40,0.7)' }}
              />
            </div>
          </div>

          {/* current contract value */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-[var(--gold-600)]">本轮修炼</span>
            <span className="flex items-center gap-1">
              <PeachAmount value={monkey.contractValue} size="sm" className="!gap-0.5" />
              {profit > 0 && (
                <span className="font-latin text-[10px] font-bold text-[var(--jade)]">
                  +{((profit / level.cost) * 100).toFixed(1)}%
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* cycle timer + actions */}
      <div className="border-t border-[rgba(212,148,26,0.25)] bg-[rgba(10,8,13,0.4)] px-3 py-2.5">
        {!cyclesDone && (
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] text-[var(--gold-600)]">距离周期结束</span>
            {cycleReady ? (
              <span className="font-display text-xs font-bold text-[var(--jade)]">本期已就绪</span>
            ) : (
              <Countdown ms={msLeft} />
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!cyclesDone && (
            <button
              onClick={() => handleAction('cycle')}
              disabled={!cycleReady || pending}
              className={cn(
                'flex-1 rounded-lg py-2 font-display text-xs font-bold tracking-wide',
                cycleReady ? 'btn-gold' : 'btn-ghost-gold opacity-55',
              )}
            >
              {cycleReady ? '完成本期修炼' : '修炼进行中'}
            </button>
          )}
          <button
            onClick={() => handleAction('inherit')}
            disabled={pending}
            className={cn(
              'rounded-lg py-2 font-display text-xs font-bold tracking-wide',
              cyclesDone ? 'btn-gold flex-1' : 'btn-ghost-gold px-4',
            )}
          >
            传承
          </button>
        </div>
        {pending && <p role="status" className="mt-2 text-center text-xs">正在保存，请稍候…</p>}
        {error && <p role="alert" className="mt-2 text-center text-xs text-[var(--crimson-soft)]">{error}</p>}
        {!cyclesDone && !cycleReady && (
          <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-[var(--gold-600)]">
            <span>本期修炼所需</span>
            <PeachAmount value={level.perCycleCost} size="sm" className="!gap-0.5" />
          </div>
        )}
      </div>
    </div>
  )
}
