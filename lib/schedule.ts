import { LEVELS, type WukongLevel } from './game-data'

const DAY_MS = 24 * 60 * 60 * 1000
// Summon hours use Beijing time (UTC+8), independent of the host timezone.
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000

/** Returns the next summon Date for a given hour, today if still in the future else tomorrow. */
export function nextOccurrence(hour: number, from: Date): Date {
  const today = todayOccurrence(hour, from).getTime()
  return new Date(today <= from.getTime() ? today + DAY_MS : today)
}

/** The summon time on the current Beijing calendar date. */
export function todayOccurrence(hour: number, from: Date): Date {
  const beijing = new Date(from.getTime() + BEIJING_OFFSET_MS)
  beijing.setUTCHours(hour, 0, 0, 0)
  return new Date(beijing.getTime() - BEIJING_OFFSET_MS)
}

/** A realm is "open" for summoning once its hour has arrived today (until midnight). */
export function isRealmOpen(level: WukongLevel, now: Date): boolean {
  return now.getTime() >= todayOccurrence(level.summonHour, now).getTime()
}

export interface UpcomingInfo {
  level: WukongLevel
  target: Date
  msLeft: number
}

/** The next open realm whose summon is upcoming (first hour strictly in the future). */
export function nextUpcoming(now: Date): UpcomingInfo {
  const future = LEVELS.filter((level) => level.isOpen !== false).map((level) => {
    const target = nextOccurrence(level.summonHour, now)
    return { level, target, msLeft: target.getTime() - now.getTime() }
  })
  future.sort((a, b) => a.msLeft - b.msLeft)
  return future[0]
}

export function formatHHMM(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

/** Split milliseconds into padded H, M, S strings. */
export function splitDuration(ms: number): { h: string; m: string; s: string; days: number } {
  const clamped = Math.max(0, ms)
  const totalSeconds = Math.floor(clamped / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const h = Math.floor((totalSeconds % 86400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return {
    days,
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  }
}
