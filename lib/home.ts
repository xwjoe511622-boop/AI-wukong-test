import { LEVELS, LEVEL_BY_ID, PAYMENT_WINDOW_HOURS, type Stage } from './game-data'
import { beijingDate, matchAt, roundFor, type Entry } from './summon-preview'
import { due, endsAt, phase, RULES, dayIndex, type Contract } from './cultivation-preview'
import { nextMatchAfter, type Trade } from './trade'

/** 我在某一轮里的情况 */
export type MyRound = 'none' | 'reserved' | 'success' | 'refunded' | 'forfeited'
const mine = (entries: Entry[], key: string): MyRound => {
  const entry = entries.find(e => e.key === key)
  return !entry ? 'none' : entry.status === 'waiting' ? 'reserved' : entry.status
}

/**
 * 首页「当前召唤」：此刻轮到哪个仙境。
 * - live：正在召唤周期内（例如 11:00–12:00 是石灵），系统已自动匹配
 * - upcoming：今天下一个要开始的仙境（例如 11:00 之前是石灵）
 * - closed：今日七个周期全部结束，可参与明日
 * nextBookable：现在还能点召唤、且我没参与的最近一个仙境
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
export const REALM_STATUS_LABEL: Record<RealmStatus, string> = { live: '匹配中', 'live-reserved': '匹配中', reserved: '已召唤 · 等待匹配', open: '可召唤', cutoff: '召唤已截止', ended: '今日已结束' }

// ───────── 首页：今日待办 ─────────
/**
 * 一只悟空的一生里，玩家要亲手做的事只有四种，首页固定显示这四行，顺序不变：
 * 召唤 → 支付结算 → 修炼 → 收款。
 * 召唤只点一次，到点系统自动匹配；修炼要每天自己点，没点的那天没有修炼加成，过后不能补。
 * 每行四种状态：todo 待处理（可以现在做）、wait 等待中（等时间或等对方）、done 今日已完成、none 今日无。
 */
export type DailyKind = 'summon' | 'pay' | 'train' | 'receive'
export type DailyStatus = 'todo' | 'wait' | 'done' | 'none'
export type DailyTodo = {
  kind: DailyKind; label: string; status: DailyStatus; title: string; sub: string
  /** 倒计时终点 */
  until?: number
  amountCents?: number
  href: string; cta?: string
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
  const settled = mine.filter(e => e.status !== 'waiting')
  const rounds = LEVELS.filter(l => l.isOpen).map(level => ({ level, round: roundFor(level.id, now) }))
  const bookable = rounds.filter(({ round }) => round.open && !state.entries.some(e => e.key === round.key)).sort((a, b) => a.round.cutoff - b.round.cutoff)

  // 1. 召唤：截止前点一次，到点系统自动匹配
  let summon: DailyTodo
  if (bookable.length && !mine.length) summon = { kind: 'summon', label: '召唤', status: 'todo', title: `可召唤 · ${bookable[0].level.name}`, sub: `${bookable[0].level.summonStartTime} 自动匹配${bookable.length > 1 ? ` · 另有 ${bookable.length - 1} 个仙境可召唤` : ''}`, until: bookable[0].round.cutoff, href: `/world?stage=${bookable[0].level.id}#summon-action`, cta: '去召唤' }
  else if (waiting.length) summon = { kind: 'summon', label: '召唤', status: 'wait', title: `${LEVEL_BY_ID[waiting[0].stage].name} · 已参与，等待匹配`, sub: `${LEVEL_BY_ID[waiting[0].stage].summonStartTime} 系统自动匹配${waiting.length > 1 ? ` · 共 ${waiting.length} 个在等` : ''}${bookable.length ? ` · 还可召唤 ${bookable.length} 个` : ''}`, until: matchAt(waiting[0]), href: `/world?stage=${waiting[0].stage}#summon-action` }
  else if (settled.length) { const ok = settled.filter(e => e.status !== 'refunded'); summon = { kind: 'summon', label: '召唤', status: 'done', title: bookable.length ? `还可召唤 ${bookable.length} 个仙境` : '今日召唤已完成', sub: `${ok.length ? `成功 ${names(ok.map(e => e.stage))}` : ''}${ok.length && ok.length < settled.length ? ' · ' : ''}${ok.length < settled.length ? `未成功 ${settled.length - ok.length} 个，蟠桃已退还` : ''}`, until: bookable[0]?.round.cutoff, href: bookable.length ? '/world' : '/me/summons' } }
  else summon = { kind: 'summon', label: '召唤', status: 'none', title: '今日召唤已全部截止', sub: '明日 00:00 重新开放', until: rounds[0]?.round.nextOpen, href: '/world' }

  // 2. 支付结算（我是承接人）
  const toPay = state.trades.filter(t => t.role === 'payer' && t.status === 'awaiting_payment').sort((a, b) => a.deadline - b.deadline)
  const paid = state.trades.filter(t => t.role === 'payer' && t.status === 'awaiting_confirm')
  let pay: DailyTodo
  if (toPay.length) { const short = state.usdt < toPay[0].amountCents; pay = { kind: 'pay', label: '支付结算', status: 'todo', title: `${LEVEL_BY_ID[toPay[0].stage].name} · 待我支付${toPay.length > 1 ? `（共 ${toPay.length} 笔）` : ''}`, sub: short ? 'USDT 余额不足，请先充值' : `逾期 ${PAYMENT_WINDOW_HOURS} 小时未支付，暂扣的蟠桃全部充公`, until: toPay[0].deadline, amountCents: toPay[0].amountCents, href: tradeHref(toPay), cta: '去支付', warn: short } }
  else if (paid.length) pay = { kind: 'pay', label: '支付结算', status: 'wait', title: `已支付 · 等待传承人确认${paid.length > 1 ? `（${paid.length} 笔）` : ''}`, sub: `确认到账后，${names(paid.map(t => t.stage))}进入猴舍`, href: tradeHref(paid) }
  else pay = { kind: 'pay', label: '支付结算', status: 'none', title: '无待支付', sub: '召唤成功后，在这里完成支付结算', href: '/me/trades' }

  // 3. 修炼：每天自己点，没点的那天没有修炼加成，过后不能补
  const training = state.contracts.filter(c => phase(c, now) === '修炼中')
  const dues = training.filter(c => due(c, now) > 0)
  let train: DailyTodo
  if (dues.length) {
    const cost = dues.reduce((sum, c) => sum + RULES[c.stage].daily, 0)
    const short = state.balance < Math.min(...dues.map(c => RULES[c.stage].daily))
    // 这一次修炼的时段什么时候过去：过了就不能补
    const until = Math.min(...dues.map(c => Math.min(endsAt(c), c.started + (dayIndex(c, now) + 1) * 86_400_000)))
    train = { kind: 'train', label: '修炼', status: 'todo', title: `${dues.length} 只悟空待修炼`, sub: short ? '蟠桃不足，请先购买蟠桃' : `${names(dues.map(c => c.stage))} · 需 ${(cost / 100).toLocaleString('zh-CN')} 蟠桃 · 过时不能补`, until, href: dues.length === 1 ? `/house/room/${dues[0].stage}` : '/house', cta: '去修炼', warn: short }
  } else if (training.length) train = { kind: 'train', label: '修炼', status: 'done', title: '今日修炼已完成', sub: `${names(training.map(c => c.stage))} 修炼中`, href: '/house' }
  else train = { kind: 'train', label: '修炼', status: 'none', title: '猴舍里没有修炼中的悟空', sub: '悟空进猴舍后，每天在这里提醒你修炼', href: '/house' }

  // 4. 收款（传承，我是传承人）
  const toConfirm = state.trades.filter(t => t.role === 'receiver' && t.status === 'awaiting_confirm')
  const matched = state.trades.filter(t => t.role === 'receiver' && t.status === 'awaiting_payment').sort((a, b) => a.deadline - b.deadline)
  const unmatched = state.contracts.filter(c => phase(c, now) === '传承中' && !state.trades.some(t => t.contractId === c.id))
  let receive: DailyTodo
  if (toConfirm.length) receive = { kind: 'receive', label: '收款', status: 'todo', title: `${LEVEL_BY_ID[toConfirm[0].stage].name} · 确认收款${toConfirm.length > 1 ? `（共 ${toConfirm.length} 笔）` : ''}`, sub: '承接人已支付，核实到账后确认', amountCents: toConfirm[0].amountCents, href: tradeHref(toConfirm), cta: '去确认' }
  else if (matched.length) receive = { kind: 'receive', label: '收款', status: 'wait', title: `${LEVEL_BY_ID[matched[0].stage].name} · 等待承接人支付`, sub: '传承已匹配到承接人', until: matched[0].deadline, amountCents: matched[0].amountCents, href: tradeHref(matched) }
  else if (unmatched.length) receive = { kind: 'receive', label: '收款', status: 'wait', title: `${names(unmatched.map(c => c.stage))} · 传承中`, sub: '等待下一轮召唤匹配承接人', until: Math.min(...unmatched.map(c => nextMatchAfter(c.stage, Math.max(endsAt(c), now)))), href: '/me/trades' }
  else receive = { kind: 'receive', label: '收款', status: 'none', title: '无待收款', sub: '悟空传承时，在这里确认收款', href: '/me/trades' }

  return [summon, pay, train, receive]
}
