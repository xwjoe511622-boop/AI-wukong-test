import { LEVELS, INHERITANCE_FEE_PCT, type Stage } from './game-data'

export const DAY = 86_400_000
export const RULES = Object.fromEntries(LEVELS.map(level => [level.id, {
  ...level, days: level.runDays, gain: level.gainPct,
  // 每次修炼实际扣的蟠桃（分）。体验版把正式周期压成 1 次修炼，这一次扣满全周期，所以总消耗与正式版相同
  daily: Math.round(level.perCycleCost * level.cycleDays / level.runDays * 100),
  // 一次修炼相当于正式版的几天：显示进度、次数时按正式版换算
  dayFactor: level.cycleDays / level.runDays,
}])) as Record<Stage, (typeof LEVELS)[number] & { days: number; gain: number; daily: number; dayFactor: number }>
/** 把实际修炼次数换算成正式版的天数，用于显示 */
export const shownDays = (stage: Stage, count: number) => Math.round(count * RULES[stage].dayFactor)
/** 猴舍首页七间修炼室入口封面（静态图），素材路径来自各阶段 roomCover，便于后续逐个替换 */
export const ROOMS = Object.fromEntries(LEVELS.map(level => [level.id, { room: `${level.name}修炼室`, cover: level.roomCover }])) as Record<Stage, { room: string; cover: string }>
/** 一只悟空的生命周期记录。契约功能已取消；contractedAt 仅为兼容旧存档保留，不再参与任何判断。 */
/* principal 为修炼值（USDT 分），不占用蟠桃余额；蟠桃仅用于召唤与每日修炼。 */
export type Contract = { id: string; stage: Stage; principal: number; started: number; completed: number; contractedAt?: number; trainingCompletedAt?: number; finishedAt?: number }
export type HistoryEntry = Contract & { claimedAt: number }
export type PreviewState = { version: 2; balance: number; contracts: Contract[]; history: HistoryEntry[] }
export type Phase = '修炼中' | '待完成修炼' | '修炼圆满' | '等待传承' | '传承中' | '传承完成'
export const PHASES: Phase[] = ['修炼中', '待完成修炼', '修炼圆满', '等待传承', '传承中', '传承完成']
export const money = (cents: number) => (cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const dateTime = (time: number) => new Date(time).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
const CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
const cnNumber = (n: number) => n <= 10 ? CN_DIGITS[n] : n < 20 ? `十${CN_DIGITS[n - 10]}` : `${CN_DIGITS[Math.floor(n / 10)]}十${n % 10 ? CN_DIGITS[n % 10] : ''}`
/** 召唤日期的中文写法，例如「九月十六」，用于区分同类型的多只悟空 */
export const contractDay = (time: number) => {
  const d = new Date(time + 8 * 3600000)
  return `${cnNumber(d.getUTCMonth() + 1)}月${cnNumber(d.getUTCDate())}`
}
export const endsAt = (c: Contract) => c.started + RULES[c.stage].days * DAY
export function due(c: Contract, now: number) {
  const days = RULES[c.stage].days
  return c.finishedAt ? 0 : Math.max(0, Math.min(days, Math.max(0, Math.floor((now - c.started) / DAY) + 1)) - c.completed)
}
export function phase(c: Contract, now: number): Phase {
  if (c.finishedAt && c.completed === RULES[c.stage].days && now >= endsAt(c)) return '传承完成'
  if (c.completed === RULES[c.stage].days) return now >= endsAt(c) ? '传承中' : '等待传承'
  return now >= endsAt(c) ? '待完成修炼' : '修炼中'
}
export function settlement(c: Contract) {
  const profit = Math.round(c.principal * RULES[c.stage].gain / 100)
  const fee = Math.round(profit * INHERITANCE_FEE_PCT / 100)
  return { profit, fee, received: c.principal + profit - fee }
}
export function quote(contracts: Contract[], now: number, accelerate: boolean) {
  const items = contracts.filter(c => !c.finishedAt).map(c => {
    const count = due(c, now)
    const cost = count * RULES[c.stage].daily
    const fee = 0
    return { id: c.id, stage: c.stage, count, cost, fee, completed: c.completed }
  }).filter(item => item.count > 0)
  return { items, cost: items.reduce((s, i) => s + i.cost, 0), fee: items.reduce((s, i) => s + i.fee, 0), total: items.reduce((s, i) => s + i.cost + i.fee, 0) }
}
/** 今日应修 = 需要修炼的悟空只数；此前待补 = 往日漏掉的修炼次数（不含今日那一次） */
export function summarize(contracts: Contract[], now: number) {
  const s = { total: 0, byPhase: Object.fromEntries(PHASES.map(p => [p, 0])) as Record<Phase, number>, todayMonkeys: 0, backlog: 0, dueCount: 0 }
  for (const c of contracts) {
    const p = phase(c, now)
    s.byPhase[p] += 1
    s.total += 1
    const d = due(c, now)
    if (!d) continue
    s.dueCount += d
    if (now >= endsAt(c)) { s.backlog += d; continue }
    s.todayMonkeys += 1
    s.backlog += d - 1
  }
  return s
}
const ORDER: Phase[] = ['待完成修炼', '修炼中', '修炼圆满', '等待传承', '传承中', '传承完成']
/** 先按「现在要处理的事」排，再按召唤日期 */
export function sortContracts(contracts: Contract[], now: number) {
  const rank = (c: Contract) => {
    const p = phase(c, now)
    if (p === '修炼中') return due(c, now) > 0 ? 1 : 2
    return ORDER.indexOf(p) + (ORDER.indexOf(p) > 1 ? 1 : 0)
  }
  return [...contracts].sort((a, b) => rank(a) - rank(b) || a.started - b.started)
}
/** 修炼室入口的一句话状态 */
export function roomStatus(contracts: Contract[], now: number): { tone: 'due' | 'ok' | 'idle' | 'empty'; text: string } {
  if (!contracts.length) return { tone: 'empty', text: '' }
  const s = summarize(contracts, now)
  if (s.byPhase.待完成修炼) return { tone: 'due', text: `待完成修炼 ${s.byPhase.待完成修炼}只` }
  if (s.todayMonkeys) return { tone: 'due', text: `今日待修 ${s.todayMonkeys}只${s.backlog ? ` · 待补${s.backlog}次` : ''}` }
  if (s.byPhase.传承完成) return { tone: 'ok', text: `承接人已打款 ${s.byPhase.传承完成}只 · 待确认收款` }
  if (s.byPhase.修炼中) return { tone: 'ok', text: '今日修炼已完成' }
  if (s.byPhase.等待传承) return { tone: 'idle', text: `修炼圆满 ${s.byPhase.等待传承}只 · 等待传承` }
  if (s.byPhase.修炼圆满) return { tone: 'idle', text: `修炼圆满 ${s.byPhase.修炼圆满}只` }
  return { tone: 'idle', text: `传承中 ${s.byPhase.传承中}只` }
}
export function createPreview(now = Date.now()): PreviewState {
  const make = (stage: Stage, ago: number, completed: number, suffix = '', principal = RULES[stage].cost): Contract => ({ id: `demo-${stage}${suffix}`, stage, principal: Math.round(principal * 100), started: now - ago * DAY, completed: Math.min(completed, RULES[stage].days) })
  return { version: 2, balance: 128650, contracts: [
    make('stone_spirit', .3, 0),
    make('spirit_monkey', .4, 0, '-a', 120), make('spirit_monkey', 1.3, 1, '-b', 90), make('spirit_monkey', 2.6, 2, '-c', 150),
    make('wukong', 3.5, 4, '-a', 300), make('wukong', 6.2, 5, '-b', 260),
    make('battle_wukong', 4.3, 5, '-a', 700), make('battle_wukong', 9.1, 8, '-b', 1000),
    make('great_sage', 4.3, 5, '-a', 1500), make('great_sage', 13.1, 12, '-b', 2200),
    make('destiny_sage', 15.2, 15, '-a', 3200), { ...make('destiny_sage', 16, 15, '-b', 4200), finishedAt: now - DAY * .1 },
  ], history: [{ ...make('stone_spirit', 4, 1, '-past'), finishedAt: now - 2 * DAY, claimedAt: now - 2 * DAY }] }
}
export function isPreview(value: unknown): value is PreviewState {
  if (!value || typeof value !== 'object') return false
  const s = value as PreviewState
  const valid = (c: Contract) => c && typeof c.id === 'string' && Object.hasOwn(RULES, c.stage) && Number.isSafeInteger(c.principal) && c.principal >= 0 && Number.isFinite(c.started) && Number.isInteger(c.completed) && c.completed >= 0 && c.completed <= RULES[c.stage].days && (c.finishedAt === undefined || Number.isFinite(c.finishedAt)) && (c.contractedAt === undefined || (Number.isFinite(c.contractedAt) && c.contractedAt >= c.started)) && (c.trainingCompletedAt === undefined || (Number.isFinite(c.trainingCompletedAt) && c.trainingCompletedAt >= c.started))
  return s.version === 2 && Number.isSafeInteger(s.balance) && s.balance >= 0 && Array.isArray(s.contracts) && Array.isArray(s.history) && s.contracts.every(valid) && s.history.every(c => valid(c) && Number.isFinite(c.claimedAt)) && new Set([...s.contracts, ...s.history].map(c => c.id)).size === s.contracts.length + s.history.length
}
export type Action = { type: 'train'; ids: string[]; accelerate: boolean; expected: number } | { type: 'claim'; id: string } | { type: 'scenario'; id: string; scenario: Phase } | { type: 'reset' } | { type: 'empty' } | { type: 'poor' }
export function transition(state: PreviewState, action: Action, now: number): { state: PreviewState; message: string } {
  if (action.type === 'reset') return { state: createPreview(now), message: '演示存档已重置' }
  if (action.type === 'empty') return { state: { ...state, contracts: [] }, message: '当前悟空已清空，演示历史保留' }
  if (action.type === 'poor') return { state: { ...state, balance: 0 }, message: '已模拟余额不足，可重置恢复' }
  if (action.type === 'train') {
    if (action.accelerate) return { state, message: '仅补齐当前已到期修炼，无额外费用，原生命周期不变。' }
    const q = quote(state.contracts.filter(c => action.ids.includes(c.id)), now, action.accelerate)
    if (!q.items.length) return { state, message: '无需重复修炼' }
    if (q.total !== action.expected) return { state, message: '修炼状态已变化，请重新确认费用' }
    if (state.balance < q.total) return { state, message: '蟠桃不足' }
    return { state: { ...state, balance: state.balance - q.total, contracts: state.contracts.map(c => { const count = q.items.find(i => i.id === c.id)?.count ?? 0; return count ? { ...c, completed: c.completed + count, trainingCompletedAt: c.completed + count === RULES[c.stage].days ? now : c.trainingCompletedAt } : c }) }, message: `${q.items.length}只悟空今日已修炼，已补齐到期任务；消耗 ${money(q.total)} 蟠桃` }
  }
  const c = state.contracts.find(c => c.id === action.id)
  if (!c) return { state, message: '这只悟空已归档' }
  if (action.type === 'claim') {
    if (phase(c, now) !== '传承完成') return { state, message: '需原周期结束且全部修炼完成后方可传承' }
    return { state: { ...state, contracts: state.contracts.filter(item => item.id !== c.id), history: [{ ...c, claimedAt: now }, ...state.history] }, message: '已确认传承所得（USDT），本次传承已归档' }
  }
  const days = RULES[c.stage].days
  const changed = { ...c, finishedAt: undefined, started: now - DAY * .2, completed: 0 } as Contract
  if (action.scenario === '待完成修炼') Object.assign(changed, { started: now - DAY * (days + .2), completed: days - 1 })
  if (action.scenario === '修炼圆满') changed.completed = days
  if (action.scenario === '传承中' || action.scenario === '传承完成') Object.assign(changed, { started: now - DAY * (days + .2), completed: days })
  if (action.scenario === '传承完成') changed.finishedAt = now
  return { state: { ...state, contracts: state.contracts.map(item => item.id === c.id ? changed : item) }, message: `仅演示：已切换为${action.scenario}` }
}
