'use client'

import { createContext, useContext } from 'react'
import { useProduct } from '@/components/product-provider'
import { endsAt, quote, RULES, settlement } from './cultivation-preview'
import type { Stage } from './game-data'
import { InitialTimeContext } from './use-now'
import type { InheritResult, OwnedMonkey, PlayerSnapshot } from './game-types'
export type { OwnedMonkey, InheritResult } from './game-types'

interface GameState {
  balance: number
  owned: OwnedMonkey[]
  ledger: PlayerSnapshot['ledger']
  playerId?: string
  loading: boolean
  error: string | null
  pending: boolean
  retry: () => void
  summon: (stage: Stage) => Promise<OwnedMonkey>
  completeCycle: (id: string) => Promise<void>
  inherit: (id: string) => Promise<InheritResult>
  getById: (id: string) => OwnedMonkey | undefined
}

const GameContext = createContext<GameState | null>(null)

export function GameProvider({ children, initialNow }: { children: React.ReactNode; initialNow: number }) {
  const { state, ready, act, now } = useProduct()
  const owned: OwnedMonkey[] = (state?.contracts ?? []).map(c => ({ id: c.id, stage: c.stage, status: c.completed === RULES[c.stage].days ? 'idle' : 'cultivating', contractValue: c.principal / 100, cycleProgress: c.completed, cycleTotal: RULES[c.stage].days, cycleEndsAt: endsAt(c), createdAt: c.started }))
  const ledger: PlayerSnapshot['ledger'] = (state?.records ?? []).filter(r => ['welcome', 'summon', 'cycle', 'inherit'].includes(r.kind)).map(r => ({ id: r.id, kind: r.kind as PlayerSnapshot['ledger'][number]['kind'], amount: r.amountCents / 100, balance: (state?.balance ?? 0) / 100, createdAt: r.createdAt, result: null }))
  const value: GameState = {
    balance: (state?.balance ?? 0) / 100, owned, ledger, playerId: state?.playerId,
    loading: !ready, error: null, pending: !ready, retry: () => {},
    summon: async () => { throw new Error('请前往悟空世界发起召唤，成功即进入猴舍。') },
    completeCycle: async (id) => {
      const estimate = quote(state?.contracts.filter(c => c.id === id) ?? [], now, false)
      act({ type: 'cultivate', action: { type: 'train', ids: [id], accelerate: false, expected: estimate.total } })
    },
    inherit: async (id) => {
      const c = state?.contracts.find(item => item.id === id)
      if (!c || !act({ type: 'cultivate', action: { type: 'claim', id } })) throw new Error('传承尚未完成。')
      const result = settlement(c)
      return { stage: c.stage, original: c.principal / 100, profit: result.profit / 100, fee: result.fee / 100, received: result.received / 100 }
    },
    getById: (id) => owned.find(monkey => monkey.id === id),
  }
  return (
    <InitialTimeContext.Provider value={initialNow}>
      <GameContext.Provider value={value}>{children}</GameContext.Provider>
    </InitialTimeContext.Provider>
  )
}

export function useGame(): GameState {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
