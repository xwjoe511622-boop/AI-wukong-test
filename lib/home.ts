import { LEVELS, type Stage } from './game-data'
import { roundFor, type Entry } from './summon-preview'

/** 我在某一轮里的情况 */
export type MyRound = 'none' | 'reserved' | 'success' | 'refunded' | 'forfeited'
const mine = (entries: Entry[], key: string): MyRound => {
  const entry = entries.find(e => e.key === key)
  return !entry ? 'none' : entry.status === 'waiting' ? 'reserved' : entry.status
}

/**
 * 首页「当前召唤」：此刻轮到哪个仙境。
 * - live：正在召唤周期内（例如 11:00–12:00 是石灵）。预约过的可以点召唤
 * - upcoming：今天下一个要开始的仙境（例如 11:00 之前是石灵）
 * - closed：今日七个周期全部结束，可预约明日
 * nextBookable：现在还能预约、且我没预约的最近一个仙境
 */
export type CurrentSummon =
  | { kind: 'live' | 'upcoming'; stage: Stage; until: number; mine: MyRound; canReserve: boolean; nextBookable: Stage | null }
  | { kind: 'closed'; until: number; nextBookable: Stage | null }

export function currentSummon(entries: Entry[], now: number): CurrentSummon {
  const rounds = LEVELS.filter(l => l.isOpen).map(level => ({ level, round: roundFor(level.id, now) }))
  const bookable = (except?: Stage) => rounds.filter(({ level, round }) => level.id !== except && round.open && !entries.some(e => e.key === round.key)).sort((a, b) => a.round.cutoff - b.round.cutoff)[0]?.level.id ?? null
  const live = rounds.find(({ round }) => round.matching)
  if (live) return { kind: 'live', stage: live.level.id, until: live.round.windowEnd, mine: mine(entries, live.round.key), canReserve: false, nextBookable: bookable(live.level.id) }
  const upcoming = rounds.filter(({ round }) => now < round.deadline).sort((a, b) => a.round.deadline - b.round.deadline)[0]
  if (upcoming) return { kind: 'upcoming', stage: upcoming.level.id, until: upcoming.round.deadline, mine: mine(entries, upcoming.round.key), canReserve: upcoming.round.open, nextBookable: bookable(upcoming.level.id) }
  return { kind: 'closed', until: rounds[0]?.round.nextOpen ?? now, nextBookable: null }
}

/** 悟空世界列表里每个仙境此刻的状态，用于高亮；顺序不变 */
export type RealmStatus = 'live' | 'live-reserved' | 'reserved' | 'open' | 'cutoff' | 'ended'
export function realmStatus(stage: Stage, entries: Entry[], now: number): RealmStatus {
  const round = roundFor(stage, now)
  if (round.ended) return 'ended'
  const reserved = mine(entries, round.key) === 'reserved'
  if (round.matching) return reserved ? 'live-reserved' : 'live'
  if (reserved) return 'reserved'
  return round.open ? 'open' : 'cutoff'
}
export const REALM_STATUS_LABEL: Record<RealmStatus, string> = { live: '召唤中', 'live-reserved': '召唤中 · 可召唤', reserved: '已预约', open: '可预约', cutoff: '预约已截止', ended: '今日已结束' }
