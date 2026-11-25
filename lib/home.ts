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
 * 一只悟空的一生里，玩家每天可能要做的事只有五种，首页固定显示这五行，顺序不变：
 * 预约召唤 → 召唤 → 打款 → 修炼 → 收款。
 * 每行四种状态：todo 待处理（可以现在做）、wait 等待中（等时间或等对方）、done 今日已完成、none 今日无。
 */
export type DailyKind = 'reserve' | 'cast' | 'pay' | 'train' | 'receive'
export type DailyStatus = 'todo' | 'wait' | 'done' | 'none'
export type DailyTodo = {
  kind: DailyKind; label: string; status: DailyStatus; title: string; sub: string
  /** 倒计时终点 */
  until?: number
  amountCents?: number
  href: string; cta?: string
  /** 可在首页当场完成：点召唤 */
  castKey?: string
  /** 余额不足等需要提醒的情况 */
  warn?: boolean
}
type DailyState = { entries: Entry[]; trades: Trade[]; contracts: Contract[]; balance: number; usdt: number }
const tradeHref = (list: Trade[]) => list.length === 1 ? `/me/trades/${encodeURIComponent(list[0].id)}` : '/me/trades'
const names = (stages: Stage[]) => [...new Set(stages)].map(s => LEVEL_BY_ID[s].name).join('、')

export function dailyTodos(state: DailyState, now: number): DailyTodo[] {
  const today = beijingDate(now)
  const mine = state.entries.filter(e => e.date === today)
  const waiting = mine.filter(e => e.status === 'waiting').sort((a, b) => a.deadline - b.deadline)
  const rounds = LEVELS.filter(l => l.isOpen).map(level => ({ level, round: roundFor(level.id, now) }))
  const bookable = rounds.filter(({ round }) => round.open && !state.entries.some(e => e.key === round.key)).sort((a, b) => a.round.cutoff - b.round.cutoff)

  // 1. 预约召唤
  let reserve: DailyTodo
  if (bookable.length && !waiting.length) reserve = { kind: 'reserve', label: '预约', status: 'todo', title: `可预约 · ${bookable[0].level.name}`, sub: `${bookable[0].level.summonWindow} 召唤${bookable.length > 1 ? ` · 另有 ${bookable.length - 1} 个仙境可约` : ''}`, until: bookable[0].round.cutoff, href: `/world?stage=${bookable[0].level.id}#summon-action`, cta: '去预约' }
  else if (bookable.length) reserve = { kind: 'reserve', label: '预约', status: 'done', title: `已预约 ${mine.length} 个仙境`, sub: `还可预约 ${bookable.length} 个 · 最近 ${bookable[0].level.name}`, until: bookable[0].round.cutoff, href: '/world' }
  else if (mine.length) reserve = { kind: 'reserve', label: '预约', status: 'done', title: `今日已预约 ${mine.length} 个仙境`, sub: '今日预约已全部截止', href: '/world' }
  else reserve = { kind: 'reserve', label: '预约', status: 'none', title: '今日预约已全部截止', sub: '明日 00:00 重新开放预约', until: rounds[0]?.round.nextOpen, href: '/world' }

  // 2. 召唤
  const live = waiting.filter(e => now >= e.deadline)
  const settled = mine.filter(e => e.status !== 'waiting')
  let cast: DailyTodo
  if (live.length) cast = { kind: 'cast', label: '召唤', status: 'todo', title: `${LEVEL_BY_ID[live[0].stage].name} · 现在可以召唤`, sub: `${LEVEL_BY_ID[live[0].stage].summonWindow} 召唤周期进行中`, until: matchAt({ deadline: live[0].deadline }), href: `/world?stage=${live[0].stage}#summon-action`, cta: '召唤', castKey: live[0].key }
  else if (waiting.length) cast = { kind: 'cast', label: '召唤', status: 'wait', title: `${LEVEL_BY_ID[waiting[0].stage].name} · ${LEVEL_BY_ID[waiting[0].stage].summonStartTime} 开始`, sub: waiting.length > 1 ? `共 ${waiting.length} 个预约等待召唤` : '到点回来点召唤', until: waiting[0].deadline, href: `/world?stage=${waiting[0].stage}#summon-action` }
  else if (settled.length) { const ok = settled.filter(e => e.status !== 'refunded'); cast = { kind: 'cast', label: '召唤', status: 'done', title: '今日召唤已完成', sub: `${ok.length ? `成功 ${names(ok.map(e => e.stage))}` : ''}${ok.length && ok.length < settled.length ? ' · ' : ''}${ok.length < settled.length ? `未成功 ${settled.length - ok.length} 个，蟠桃已退还` : ''}`, href: '/me/summons' } }
  else cast = { kind: 'cast', label: '召唤', status: 'none', title: '今日没有预约', sub: '预约后，到点在这里点召唤', href: '/world' }

  // 3. 打款（我是甲方）
  const toPay = state.trades.filter(t => t.role === 'payer' && t.status === 'awaiting_payment').sort((a, b) => a.deadline - b.deadline)
  const paid = state.trades.filter(t => t.role === 'payer' && t.status === 'awaiting_confirm')
  let pay: DailyTodo
  if (toPay.length) { const short = state.usdt < toPay[0].amountCents; pay = { kind: 'pay', label: '打款', status: 'todo', title: `${LEVEL_BY_ID[toPay[0].stage].name} · 向乙方打款${toPay.length > 1 ? `（共 ${toPay.length} 笔）` : ''}`, sub: short ? 'USDT 余额不足，请先接收 USDT' : `逾期 ${PAYMENT_WINDOW_HOURS} 小时，召唤蟠桃充公`, until: toPay[0].deadline, amountCents: toPay[0].amountCents, href: tradeHref(toPay), cta: '去打款', warn: short } }
  else if (paid.length) pay = { kind: 'pay', label: '打款', status: 'wait', title: `已打款 · 等待乙方确认${paid.length > 1 ? `（${paid.length} 笔）` : ''}`, sub: `确认到账后，${names(paid.map(t => t.stage))}进入猴舍`, href: tradeHref(paid) }
  else pay = { kind: 'pay', label: '打款', status: 'none', title: '无待打款', sub: '召唤成功后，在这里向乙方打款', href: '/me/trades' }

  // 4. 修炼
  const due = quote(state.contracts, now, false)
  let train: DailyTodo
  if (due.items.length) { const short = state.balance < due.total; train = { kind: 'train', label: '修炼', status: 'todo', title: `今日待修 ${due.items.length} 只`, sub: short ? `蟠桃不足，需 ${money(due.total)}` : due.total ? `需 ${money(due.total)} 蟠桃` : '本次不消耗蟠桃', href: '/house', cta: '去修炼', warn: short } }
  else if (state.contracts.length) train = { kind: 'train', label: '修炼', status: 'done', title: '今日修炼已完成', sub: `猴舍共 ${state.contracts.length} 只悟空`, href: '/house' }
  else train = { kind: 'train', label: '修炼', status: 'none', title: '猴舍还没有悟空', sub: '召唤成功并打款后开始修炼', href: '/house' }

  // 5. 收款（传承，我是乙方）
  const toConfirm = state.trades.filter(t => t.role === 'receiver' && t.status === 'awaiting_confirm')
  const matched = state.trades.filter(t => t.role === 'receiver' && t.status === 'awaiting_payment').sort((a, b) => a.deadline - b.deadline)
  const unmatched = state.contracts.filter(c => phase(c, now) === '传承中' && !state.trades.some(t => t.contractId === c.id))
  let receive: DailyTodo
  if (toConfirm.length) receive = { kind: 'receive', label: '收款', status: 'todo', title: `${LEVEL_BY_ID[toConfirm[0].stage].name} · 确认收款${toConfirm.length > 1 ? `（共 ${toConfirm.length} 笔）` : ''}`, sub: '甲方已打款，核实到账后确认', amountCents: toConfirm[0].amountCents, href: tradeHref(toConfirm), cta: '去确认' }
  else if (matched.length) receive = { kind: 'receive', label: '收款', status: 'wait', title: `${LEVEL_BY_ID[matched[0].stage].name} · 等待甲方打款`, sub: '传承已匹配到甲方', until: matched[0].deadline, amountCents: matched[0].amountCents, href: tradeHref(matched) }
  else if (unmatched.length) receive = { kind: 'receive', label: '收款', status: 'wait', title: `${names(unmatched.map(c => c.stage))} · 传承中`, sub: '等待下一轮召唤匹配甲方', until: Math.min(...unmatched.map(c => nextMatchAfter(c.stage, Math.max(endsAt(c), c.trainingCompletedAt ?? endsAt(c), now)))), href: '/me/trades' }
  else receive = { kind: 'receive', label: '收款', status: 'none', title: '无待收款', sub: '悟空传承时，在这里确认收款', href: '/me/trades' }

  return [reserve, cast, pay, train, receive]
}
