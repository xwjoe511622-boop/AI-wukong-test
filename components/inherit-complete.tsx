'use client'

import { Modal } from './modal'
import { GoldDivider } from './ornate'
import { PeachAmount } from './peach'
import { LEVEL_BY_ID, INHERITANCE_FEE_PCT } from '@/lib/game-data'
import type { InheritResult } from '@/lib/game-context'

export function InheritComplete({ result, onClose }: { result: InheritResult | null; onClose: () => void }) {
  if (!result) return null
  const level = LEVEL_BY_ID[result.stage]

  return (
    <Modal open={!!result} onClose={onClose}>
      <div className="panel panel-glow overflow-hidden rounded-3xl">
        <div className="relative px-6 pb-6 pt-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40"
            style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(255,180,60,0.28), transparent 70%)' }}
          />
          <div className="relative text-center">
            <p className="font-display text-xs tracking-[0.4em] text-[var(--gold-500)]">传承完成</p>
            <h3 className="mt-1 font-display text-2xl font-black text-gold">{level.name}</h3>
          </div>

          <GoldDivider className="mt-4" />

          <dl className="mt-4 flex flex-col gap-2.5">
            <Row label="本轮修炼">
              <PeachAmount value={result.original} size="sm" />
            </Row>
            <Row label="修炼增长">
              <PeachAmount value={result.profit} size="sm" sign="+" />
            </Row>
            <Row label={`平台手续费（修炼增长的 ${INHERITANCE_FEE_PCT}%）`}>
              <PeachAmount value={result.fee} size="sm" sign="-" />
            </Row>
          </dl>

          <div className="mt-4 rounded-2xl bg-[radial-gradient(120%_120%_at_50%_0%,rgba(242,180,49,0.16),rgba(10,8,13,0.4))] p-4 text-center">
            <p className="font-display text-xs tracking-[0.3em] text-[var(--gold-500)]">本次获得</p>
            <div className="mt-1 flex justify-center">
              <PeachAmount value={result.received} size="xl" />
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-gold mt-5 w-full rounded-xl py-3 font-display text-sm font-black tracking-[0.15em]"
          >
            收入囊中
          </button>
        </div>
      </div>
    </Modal>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="gold-hairline flex items-center justify-between rounded-xl px-4 py-2.5">
      <dt className="text-xs text-[var(--gold-600)]">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
