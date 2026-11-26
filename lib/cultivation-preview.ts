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
/* completed = 实际点过修炼的次数；trainedDays = 点过的是第几天（从 0 起）。漏掉的那天不能补，也没有当天的修炼加成。 */
export type Contract = { id: string; stage: Stage; principal: number; started: number; completed: number; trainedDays?: number[]; contractedAt?: number; trainingCompletedAt?: number; finishedAt?: number }
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
/** 按正式周期显示：现在是修炼的第几天（1 起），以及 0–1 的进度 */
export function progress(c: Contract, now: number) {
  const total = RULES[c.stage].cycleDays
  const ratio = Math.min(1, Math.max(0, (now - c.started) / (endsAt(c) - c.started)))
  return { ratio, total, day: Math.min(total, Math.floor(ratio * total) + 1), done: now >= endsAt(c) }
}
/** 现在是第几次修炼的时段（从 0 起）；一次修炼对应正式版的一天，体验版整个周期只有一次 */
export const dayIndex = (c: Contract, now: number) => Math.min(RULES[c.stage].days - 1, Math.max(0, Math.floor((now - c.started) / DAY)))
/** 点过修炼的时段；旧记录没有逐天明细时，按从头连续点过处理 */
export const trainedDays = (c: Contract) => c.trainedDays ?? Array.from({ length: c.completed }, (_, i) => i)
/** 这一时段是否已经点过修炼 */
export const trainedNow = (c: Contract, now: number) => trainedDays(c).includes(dayIndex(c, now))
/** 已连续修炼几次：今天还没点不算断，昨天漏了就归零 */
export function streak(c: Contract, now: number) {
  const trained = new Set(trainedDays(c))
  let i = now >= endsAt(c) ? RULES[c.stage].days - 1 : dayIndex(c, now)
  if (!trained.has(i) && now < endsAt(c)) i -= 1
  let count = 0
  while (i >= 0 && trained.has(i)) { count += 1; i -= 1 }
  return count
}
/** 修炼手记：每过一天多一行；漏掉修炼的那天如实记下 */
const JOURNAL = ['吐纳灵气，根基初成', '静坐观心，杂念渐消', '引气入体，筋骨微鸣', '灵光内敛，气息绵长', '踏云而行，身轻如叶', '夜观星斗，心有所悟', '运转周天，灵气充盈', '破障一重，目中有光', '听风辨势，耳聪目明', '凝神聚气，金光隐现', '行走山川，与万物同息', '闭关三刻，气海翻涌', '心猿归位，意马收缰', '淬炼筋骨，力贯双臂', '明心见性，尘念不生', '吞吐日月，光华护体', '一念通达，万法随心', '御气凌空，俯瞰云海', '道心稳固，不动如山', '功行将满，只待圆满']
/** 到现在为止的修炼手记，最新的在前。missed = 这一天没有修炼 */
export function journal(c: Contract, now: number) {
  const p = progress(c, now)
  const days = p.done ? p.total : p.day
  const factor = RULES[c.stage].dayFactor
  const trained = new Set(trainedDays(c))
  const current = p.done ? -1 : dayIndex(c, now)
  return Array.from({ length: days }, (_, i) => {
    const slot = Math.min(RULES[c.stage].days - 1, Math.floor(i / factor))
    const ok = trained.has(slot)
    return { day: i + 1, missed: !ok, text: ok ? JOURNAL[i % JOURNAL.length] : slot === current ? '等待修炼' : '未修炼 · 当日无修炼加成' }
  }).reverse()
}
/** 已经算进去的修炼次数（带小数）：点过的时段随时间逐渐累积，没点的时段不算 */
function accrued(c: Contract, now: number) {
  const days = RULES[c.stage].days
  const done = now >= endsAt(c)
  const current = dayIndex(c, now)
  return trainedDays(c).reduce((sum, i) => sum + (done || i < current ? 1 : i === current ? Math.min(1, Math.max(0, (now - c.started) / DAY - i)) : 0), 0) / days
}
/** 此刻的修炼值（USDT，带小数）：只有点过修炼的时段才增长，仅用于展示 */
export function liveValue(c: Contract, now: number) {
  const growth = c.principal * RULES[c.stage].gain / 100
  return (c.principal + growth * accrued(c, now)) / 100
}
/** 现在能点的修炼次数：周期内、这一时段还没点过就是 1，否则 0。漏掉的不能补 */
export function due(c: Contract, now: number) {
  return c.finishedAt || now >= endsAt(c) || now < c.started || trainedNow(c, now) ? 0 : 1
}
/**
 * 每天自己点修炼：点了扣当天的蟠桃、算当天的修炼加成；没点就没有，过后不能补。
 * 周期结束后不管点了几次都进入「传承中」，修炼增长只按点过的次数算。
 */
export function phase(c: Contract, now: number): Phase {
  if (now < endsAt(c)) return '修炼中'
  return c.finishedAt ? '传承完成' : '传承中'
}
export function settlement(c: Contract) {
  // 修炼增长只算点过修炼的次数：一次没点就按原修炼值传承
  const profit = Math.round(c.principal * RULES[c.stage].gain / 100 * Math.min(1, c.completed / RULES[c.stage].days))
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
/** 今日应修 = 现在可以点修炼的悟空只数；漏掉的不能补，所以没有待补 */
export function summarize(contracts: Contract[], now: number) {
  const s = { total: 0, byPhase: Object.fromEntries(PHASES.map(p => [p, 0])) as Record<Phase, number>, todayMonkeys: 0, backlog: 0, dueCount: 0 }
  for (const c of contracts) {
    s.byPhase[phase(c, now)] += 1
    s.total += 1
    const d = due(c, now)
    s.dueCount += d
    s.todayMonkeys += d
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
  if (s.todayMonkeys) return { tone: 'due', text: `今日待修炼 ${s.todayMonkeys}只` }
  if (s.byPhase.传承完成) return { tone: 'ok', text: `承接人已结算 ${s.byPhase.传承完成}只 · 待确认收款` }
  if (s.byPhase.修炼中) return { tone: 'ok', text: `修炼中 ${s.byPhase.修炼中}只` }
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
  const valid = (c: Contract) => c && typeof c.id === 'string' && Object.hasOwn(RULES, c.stage) && Number.isSafeInteger(c.principal) && c.principal >= 0 && Number.isFinite(c.started) && Number.isInteger(c.completed) && c.completed >= 0 && c.completed <= RULES[c.stage].days && (c.finishedAt === undefined || Number.isFinite(c.finishedAt)) && (c.trainedDays === undefined || (Array.isArray(c.trainedDays) && c.trainedDays.length === c.completed && c.trainedDays.every(i => Number.isInteger(i) && i >= 0 && i < RULES[c.stage].days) && new Set(c.trainedDays).size === c.trainedDays.length)) && (c.contractedAt === undefined || (Number.isFinite(c.contractedAt) && c.contractedAt >= c.started)) && (c.trainingCompletedAt === undefined || (Number.isFinite(c.trainingCompletedAt) && c.trainingCompletedAt >= c.started))
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
    if (!q.items.length) return { state, message: '现在没有可修炼的悟空：今日已修炼，或修炼周期已结束' }
    if (q.total !== action.expected) return { state, message: '修炼状态已变化，请重新确认费用' }
    if (state.balance < q.total) return { state, message: '蟠桃不足' }
    return { state: { ...state, balance: state.balance - q.total, contracts: state.contracts.map(c => { const count = q.items.find(i => i.id === c.id)?.count ?? 0; return count ? { ...c, completed: c.completed + 1, trainedDays: [...trainedDays(c), dayIndex(c, now)], trainingCompletedAt: c.completed + 1 === RULES[c.stage].days ? now : c.trainingCompletedAt } : c }) }, message: `${q.items.length}只悟空已修炼，消耗 ${money(q.total)} 蟠桃` }
  }
  const c = state.contracts.find(c => c.id === action.id)
  if (!c) return { state, message: '这只悟空已归档' }
  if (action.type === 'claim') {
    if (phase(c, now) !== '传承完成') return { state, message: '需修炼周期结束、承接人完成资金结算后方可确认' }
    return { state: { ...state, contracts: state.contracts.filter(item => item.id !== c.id), history: [{ ...c, claimedAt: now }, ...state.history] }, message: '已确认传承所得（USDT），本次传承已归档' }
  }
  const days = RULES[c.stage].days
  const changed = { ...c, finishedAt: undefined, trainedDays: undefined, started: now - DAY * .2, completed: 0 } as Contract
  if (action.scenario === '待完成修炼') Object.assign(changed, { started: now - DAY * (days + .2), completed: days - 1 })
  if (action.scenario === '修炼圆满') changed.completed = days
  if (action.scenario === '传承中' || action.scenario === '传承完成') Object.assign(changed, { started: now - DAY * (days + .2), completed: days })
  if (action.scenario === '传承完成') changed.finishedAt = now
  return { state: { ...state, contracts: state.contracts.map(item => item.id === c.id ? changed : item) }, message: `仅演示：已切换为${action.scenario}` }
}
