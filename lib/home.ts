import { LEVELS, LEVEL_BY_ID, PAYMENT_WINDOW_HOURS, type Stage } from './game-data'
import { beijingDate, matchAt, roundFor, type Entry } from './summon-preview'
import { RULES, endsAt, money, phase, quote, type Contract } from './cultivation-preview'
import { nextMatchAfter, type Trade } from './trade'

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

// ───────── 首页：今日待办 ─────────

/**
 * urgent：有倒计时、逾期有损失；action：现在可以做；wait：等时间或等对方；done：今天已完成
 */
export type TodoTone = 'urgent' | 'action' | 'wait' | 'done'
export type Todo = {
  id: string; tone: TodoTone; title: string; sub: string
  /** 倒计时的终点 */
  until?: number
  amountCents?: number
  /** 去处理的页面 */
  href?: string; cta?: string
  /** 可以在首页当场完成的操作：点召唤 */
  castKey?: string
}
const TONE_ORDER: TodoTone[] = ['urgent', 'action', 'wait', 'done']
const tradeHref = (id: string) => `/me/trades/${encodeURIComponent(id)}`

export function todayTodos(state: { entries: Entry[]; trades: Trade[]; contracts: Contract[] }, now: number): Todo[] {
  const todos: Todo[] = []
  const today = beijingDate(now)
  // 1. 交易：待打款、待确认收款，以及等对方的
  for (const t of state.trades) {
    const name = LEVEL_BY_ID[t.stage].name
    if (t.role === 'payer' && t.status === 'awaiting_payment') todos.push({ id: t.id, tone: 'urgent', title: `${name} · 向乙方打款`, sub: `逾期 ${PAYMENT_WINDOW_HOURS} 小时未打款，召唤蟠桃充公`, until: t.deadline, amountCents: t.amountCents, href: tradeHref(t.id), cta: '去打款' })
    else if (t.role === 'receiver' && t.status === 'awaiting_confirm') todos.push({ id: t.id, tone: 'action', title: `${name} · 确认收款`, sub: '甲方已打款，核实到账后确认', amountCents: t.amountCents, href: tradeHref(t.id), cta: '去确认' })
    else if (t.role === 'payer' && t.status === 'awaiting_confirm') todos.push({ id: t.id, tone: 'wait', title: `${name} · 等待乙方确认到账`, sub: '确认后悟空进入猴舍', href: tradeHref(t.id) })
    else if (t.role === 'receiver' && t.status === 'awaiting_payment') todos.push({ id: t.id, tone: 'wait', title: `${name} · 等待甲方打款`, sub: '传承已匹配到甲方', until: t.deadline, href: tradeHref(t.id) })
  }
  // 2. 召唤：今天预约过的仙境
  for (const e of state.entries) {
    const level = LEVEL_BY_ID[e.stage]
    const href = `/world?stage=${e.stage}#summon-action`
    if (e.status === 'waiting' && now >= e.deadline) todos.push({ id: e.key, tone: 'action', title: `${level.name} · 现在可以召唤`, sub: `${level.summonWindow} 召唤周期进行中`, until: matchAt({ deadline: e.deadline }), castKey: e.key, cta: '召唤' })
    else if (e.status === 'waiting') todos.push({ id: e.key, tone: 'wait', title: `${level.name} · 已预约召唤`, sub: `${level.summonStartTime} 开始，届时回来点召唤`, until: e.deadline, href })
    else if (e.date === today && e.status === 'refunded') todos.push({ id: e.key, tone: 'done', title: `${level.name} · 本轮召唤未成功`, sub: '召唤蟠桃已全额退还', href })
    else if (e.date === today && e.status === 'success' && state.trades.some(t => t.entryKey === e.key && t.status === 'completed')) todos.push({ id: e.key, tone: 'done', title: `${level.name} · 召唤成功，已入猴舍`, sub: '打款完成，乙方已确认到账', href: `/house/room/${e.stage}` })
  }
  // 3. 修炼：今天还有几只没修
  const due = quote(state.contracts, now, false)
  if (due.items.length) todos.push({ id: 'train', tone: 'action', title: `今日修炼 · ${due.items.length} 只待修`, sub: due.total ? `需 ${money(due.total)} 蟠桃` : '本次不消耗蟠桃', href: '/house', cta: '去修炼' })
  else if (state.contracts.some(c => phase(c, now) === '修炼中')) todos.push({ id: 'train', tone: 'done', title: '今日修炼已完成', sub: '明日继续', href: '/house' })
  // 4. 传承中、还没匹配到甲方的悟空
  for (const c of state.contracts) {
    if (phase(c, now) !== '传承中' || state.trades.some(t => t.contractId === c.id)) continue
    todos.push({ id: `match-${c.id}`, tone: 'wait', title: `${RULES[c.stage].name} · 传承中`, sub: '等待下一轮召唤匹配甲方', until: nextMatchAfter(c.stage, Math.max(endsAt(c), c.trainingCompletedAt ?? endsAt(c), now)), href: `/house/room/${c.stage}` })
  }
  // 5. 今天还没有任何预约在等：提示最近一个可以预约的仙境
  if (!state.entries.some(e => e.status === 'waiting')) {
    const next = LEVELS.filter(l => l.isOpen).map(level => ({ level, round: roundFor(level.id, now) })).filter(({ round }) => round.open && !state.entries.some(e => e.key === round.key)).sort((a, b) => a.round.cutoff - b.round.cutoff)[0]
    if (next) todos.push({ id: `reserve-${next.round.key}`, tone: 'action', title: `预约召唤 · ${next.level.name}`, sub: `${next.level.summonWindow} 召唤，预约截止前可约`, until: next.round.cutoff, href: `/world?stage=${next.level.id}#summon-action`, cta: '去预约' })
  }
  return todos.sort((a, b) => TONE_ORDER.indexOf(a.tone) - TONE_ORDER.indexOf(b.tone) || (a.until ?? Infinity) - (b.until ?? Infinity))
}
