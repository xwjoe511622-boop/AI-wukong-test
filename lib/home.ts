import { LEVELS, type Stage } from './game-data'
import { matchAt, roundFor, type Entry } from './summon-preview'

/**
 * 首页「当前召唤」：跟着玩家自己的状态走，只给出一条最该看的信息。
 * 1. 我有预约在等结果 → 最快出结果的那一个（已预约 / 匹配中）
 * 2. 没有预约但现在有仙境可预约 → 最快截止的那一个
 * 3. 今日全部结束 → 明日 00:00 开放预约
 */
export type CurrentSummon =
  | { kind: 'reserved' | 'matching'; stage: Stage; until: number; reservedCount: number; openCount: number }
  | { kind: 'open'; stage: Stage; until: number; reservedCount: 0; openCount: number }
  | { kind: 'closed'; until: number; reservedCount: 0; openCount: 0 }

export function currentSummon(entries: Entry[], now: number): CurrentSummon {
  const rounds = LEVELS.filter(l => l.isOpen).map(level => ({ level, round: roundFor(level.id, now) }))
  // 现在还能预约、且我没预约过的仙境，按截止时间从近到远
  const open = rounds.filter(({ round }) => round.open && !entries.some(e => e.key === round.key)).sort((a, b) => a.round.cutoff - b.round.cutoff)
  const waiting = entries.filter(e => e.status === 'waiting').sort((a, b) => matchAt(a) - matchAt(b))
  if (waiting.length) {
    const entry = waiting[0]
    const matching = now >= entry.deadline
    return { kind: matching ? 'matching' : 'reserved', stage: entry.stage, until: matching ? matchAt(entry) : entry.deadline, reservedCount: waiting.length, openCount: open.length }
  }
  if (open.length) return { kind: 'open', stage: open[0].level.id, until: open[0].round.cutoff, reservedCount: 0, openCount: open.length }
  return { kind: 'closed', until: rounds[0]?.round.nextOpen ?? now, reservedCount: 0, openCount: 0 }
}

/** 悟空世界列表里每个仙境此刻的状态，用于高亮 */
export type RealmStatus = 'reserved' | 'open' | 'cutoff' | 'matching' | 'ended'
export function realmStatus(stage: Stage, entries: Entry[], now: number): RealmStatus {
  const round = roundFor(stage, now)
  if (round.ended) return 'ended'
  if (entries.some(e => e.key === round.key && e.status === 'waiting')) return 'reserved'
  if (round.open) return 'open'
  return round.matching ? 'matching' : 'cutoff'
}
export const REALM_STATUS_LABEL: Record<RealmStatus, string> = { reserved: '已预约', open: '可预约', cutoff: '预约已截止', matching: '匹配中', ended: '今日已结束' }
