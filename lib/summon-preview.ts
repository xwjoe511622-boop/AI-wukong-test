import { LEVELS, LEVEL_BY_ID, RESERVATION_CUTOFF_MINUTES, MATCH_WINDOW_HOURS, type Stage } from './game-data'
import { todayOccurrence, splitDuration } from './schedule'

// 换键让旧演示记录自然失效（配套金额改以 USDT 计，蟠桃仅暂扣召唤消耗）
export const SUMMON_PREVIEW_KEY = 'wukong-summon-preview-v4'
/** paid = 提交召唤时暂扣的召唤蟠桃（分）；amount = 本轮配套金额（USDT 分），不占用蟠桃 */
export type Entry = { key: string; stage: Stage; date: string; deadline: number; paid: number; amount?: number; enteredAt: number; status: 'waiting' | 'success' | 'refunded' | 'forfeited'; settledAt?: number; adoptedAt?: number; summonFee?: number }
export type PreviewState = { version: 2; balance: number; offset: number; entries: Entry[] }
export type PreviewAction = { type: 'join'; stage: Stage; now: number } | { type: 'settle'; key: string; result: 'success' | 'refunded'; now: number } | { type: 'clock'; offset: number } | { type: 'poor' } | { type: 'reset' }
export const initialPreview = (): PreviewState => ({ version: 2, balance: 128650, offset: 0, entries: [] })
export const isStage = (value: unknown): value is Stage => typeof value === 'string' && LEVELS.some(l => l.id === value)
export const peachText = (cents: number) => (cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const peachWhole = (value: number) => value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
export const rangeText = (stage: Stage) => `${peachWhole(LEVEL_BY_ID[stage].rangeMin)}–${peachWhole(LEVEL_BY_ID[stage].rangeMax)}`
export const costCents = (stage: Stage) => Math.round(LEVEL_BY_ID[stage].cost * 100)
export function beijingDate(now: number) { return new Date(now + 8 * 3600000).toISOString().slice(0, 10) }
const DAY_MS = 86_400_000
// 轮次从 2026-09-29（北京时间）起算，第一轮为该日；七境统一同轮
const ROUND_EPOCH = Date.UTC(2026, 8, 29) - 8 * 3600000
export function roundNumber(now: number) { return Math.max(1, Math.floor((now - ROUND_EPOCH) / DAY_MS) + 1) }
/**
 * 自动匹配在周期开始后进行，匹配完成立即公布结果，不必等到整点。
 * 目前没有接入真实撮合，用场次 key 确定性地给出 1–9 分钟的匹配耗时（例如 11:05 公布）。
 */
export function matchDelay(key: string) {
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return (1 + hash % 9) * 60_000
}
/** 本场次公布结果的时刻 = 周期开始 + 匹配耗时 */
export const matchAt = (entry: Pick<Entry, 'key' | 'deadline'>) => entry.deadline + matchDelay(entry.key)
/** 匹配耗时上限，供演示时钟一步跳到「已公布」 */
export const MATCH_MAX_MS = 10 * 60_000
export function roundFor(stage: Stage, now: number) {
  const date = beijingDate(now)
  const deadline = todayOccurrence(LEVEL_BY_ID[stage].summonHour, new Date(now)).getTime()
  const cutoff = deadline - RESERVATION_CUTOFF_MINUTES * 60_000
  const open = now < cutoff
  // deadline = 周期开始（自动匹配开始）；周期结束后本轮才算结束
  const windowEnd = deadline + MATCH_WINDOW_HOURS * 3600_000
  const matching = now >= deadline && now < windowEnd
  const ended = now >= windowEnd
  // 本轮结束后，下一轮自次日 00:00（北京时间）起可提交
  const nextOpen = Date.parse(`${date}T00:00:00+08:00`) + DAY_MS
  return { key: `${date}:${stage}`, date, deadline, cutoff, windowEnd, open, matching, ended, nextOpen, waiting: now >= cutoff && now < deadline, left: Math.max(0, (open ? cutoff : ended ? nextOpen : matching ? windowEnd : deadline) - now), number: roundNumber(now) }
}
/** 本轮修炼在修炼范围中的位置 0–1 */
export function rangePosition(stage: Stage) {
  const level = LEVEL_BY_ID[stage]
  return Math.min(1, Math.max(0, (level.cost - level.rangeMin) / (level.rangeMax - level.rangeMin)))
}
/** 往期轮次的修炼值（演示，确定性生成，落在修炼范围内） */
export function pastRoundValue(stage: Stage, round: number) {
  const level = LEVEL_BY_ID[stage]
  const seed = Math.abs(Math.sin(round * 12.9898 + level.order * 78.233)) % 1
  const span = level.rangeMax - level.rangeMin
  return Math.round(level.rangeMin + span * (0.25 + seed * 0.55))
}
export function roundHistory(stage: Stage, now: number, count = 6) {
  const current = roundNumber(now)
  return Array.from({ length: Math.min(count, current) }, (_, i) => {
    const round = current - i
    return { round, value: i === 0 ? LEVEL_BY_ID[stage].cost : pastRoundValue(stage, round), current: i === 0 }
  })
}
export function durationText(ms: number) { const { h, m, s } = splitDuration(ms); return `${h}:${m}:${s}` }
export function durationParts(ms: number) { const { h, m, s } = splitDuration(ms); return [h, m, s] }
export function participantCount(state: PreviewState, stage: Stage, now: number) {
  const round = roundFor(stage, now)
  const base = [128, 96, 76, 64, 53, 42, 0][LEVEL_BY_ID[stage].order]
  return base + Number(state.entries.some(e => e.key === round.key))
}
export function transition(state: PreviewState, action: PreviewAction): { state: PreviewState; message: string } {
  if (action.type === 'reset') return { state: initialPreview(), message: '演示记录已重置，不影响真实存档。' }
  if (action.type === 'poor') return { state: { ...state, balance: 0 }, message: '已模拟蟠桃不足，仅修改演示余额。' }
  if (action.type === 'clock') return Number.isFinite(action.offset) ? { state: { ...state, offset: action.offset }, message: '演示时钟已切换。' } : { state, message: '无效时间。' }
  if (!Number.isFinite(action.now)) return { state, message: '无效时间。' }
  if (action.type === 'join') {
    if (!LEVEL_BY_ID[action.stage].isOpen) return { state, message: `${LEVEL_BY_ID[action.stage].name}尚未开放，暂不可召唤。` }
    const round = roundFor(action.stage, action.now)
    if (!round.open) return { state, message: '本轮预约已截止，可继续参与后续召唤。' }
    if (state.entries.some(e => e.key === round.key)) return { state, message: '已发起本轮召唤，无需重复参与。' }
    const paid = Math.round(LEVEL_BY_ID[action.stage].summonCost * 100)
    const summonFee = paid
    if (state.balance < paid) return { state, message: '蟠桃不足，无法提交本次召唤。' }
    const entry: Entry = { key: round.key, date: round.date, deadline: round.deadline, stage: action.stage, paid, amount: costCents(action.stage), summonFee, enteredAt: action.now, status: 'waiting' }
    return { state: { ...state, balance: state.balance - paid, entries: [...state.entries, entry] }, message: `已提交召唤，${summonFee ? '召唤成功后自动扣除召唤蟠桃' : '本阶段不消耗蟠桃'}；失败全额退还。` }
  }
  const entry = state.entries.find(e => e.key === action.key)
  if (!entry || entry.status !== 'waiting') return { state, message: '没有召唤中的记录，或本轮已完成召唤。' }
  if (action.now < matchAt(entry)) return { state, message: '自动匹配尚未完成，不能展示结果。' }
  const success = action.result === 'success'
  const status = success ? 'success' as const : 'refunded' as const
  return { state: { ...state, balance: state.balance + (success ? 0 : entry.paid), entries: state.entries.map(e => e.key === entry.key ? { ...e, status, settledAt: action.now } : e) }, message: success ? `召唤成功，召唤蟠桃已自动扣除，${LEVEL_BY_ID[entry.stage].name}已进入猴舍，按日修炼即可。` : '本轮召唤未成功，本次召唤使用的蟠桃已全额退还，可继续参与后续召唤。' }
}
export function parsePreview(raw: string): PreviewState {
  const data = JSON.parse(raw)
  if (!data || data.version !== 2 || !Number.isSafeInteger(data.balance) || data.balance < 0 || data.balance > 1e12 || !Number.isFinite(data.offset) || Math.abs(data.offset) > 36600 * 86400000 || !Array.isArray(data.entries) || data.entries.length > 10000) throw new Error('无效演示存档')
  const keys = new Set<string>()
  for (const e of data.entries) {
    if (!e || !isStage(e.stage) || !Number.isFinite(e.enteredAt) || Math.abs(e.enteredAt) > 8e12) throw new Error('无效召唤记录')
    const round = roundFor(e.stage, e.enteredAt)
    if (e.key !== round.key || e.date !== round.date || e.deadline !== round.deadline || e.enteredAt >= e.deadline || keys.has(e.key) || !Number.isSafeInteger(e.paid) || e.paid < 0 || (e.amount !== undefined && (!Number.isSafeInteger(e.amount) || e.amount < 0)) || (e.summonFee !== undefined && (!Number.isSafeInteger(e.summonFee) || e.summonFee < 0)) || !['waiting', 'success', 'refunded', 'forfeited'].includes(e.status) || (e.status !== 'waiting' && (!Number.isFinite(e.settledAt) || e.settledAt < e.deadline))) throw new Error('无效召唤记录')
    keys.add(e.key)
  }
  return { version: 2, balance: data.balance, offset: data.offset, entries: data.entries }
}
