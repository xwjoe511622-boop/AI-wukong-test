import type { Stage } from './game-data'

export interface OwnedMonkey {
  id: string
  stage: Stage
  status: 'cultivating' | 'idle'
  contractValue: number
  cycleProgress: number
  cycleTotal: number
  cycleEndsAt: number
  createdAt: number
}

export interface InheritResult {
  stage: Stage
  original: number
  profit: number
  fee: number
  received: number
}

export type GameResult = OwnedMonkey | InheritResult | null
export type GameCommand =
  | { action: 'summon'; stage: Stage; requestId: string }
  | { action: 'cycle' | 'inherit'; id: string; requestId: string }

export interface LedgerEntry {
  id: string
  kind: 'welcome' | 'summon' | 'cycle' | 'inherit'
  amount: number
  balance: number
  createdAt: string
  result: GameResult
}

export interface PlayerSnapshot {
  playerId: string
  balance: number
  owned: OwnedMonkey[]
  ledger: LedgerEntry[]
}
