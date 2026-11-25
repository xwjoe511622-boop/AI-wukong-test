import { createPreview, isPreview, transition as cultivate, endsAt, quote, settlement, money, dateTime, RULES, type Action as CultivationAction, type Contract } from './cultivation-preview'
import { initialPreview, parsePreview, transition as summon, costCents, matchAt, type PreviewAction, type Entry } from './summon-preview'
import { LEVEL_BY_ID, PAYMENT_WINDOW_HOURS, TRIAL_MODE, TRIAL_PEACH, TRIAL_USDT, VALID_USER_MIN_PEACH } from './game-data'
import { COUNTERPARTY_DELAY_MS, PAYMENT_WINDOW_MS, demoCounterparty, isTrade, nextMatchAfter, type Trade } from './trade'
import { rewardParts, tribeTier, type AccountRecord, type MemberRecord, type RewardRecord } from './profile-rules'

// 换键：契约功能取消后旧存档不再载入，新存档以预置猴舍开始。
// 正式版与体验版各用各的存档，互不影响
export const PRODUCT_KEY = TRIAL_MODE ? 'wukong-trial-v8' : 'wukong-official-v8'
export type DemoMember = MemberRecord & { generation: number }
export type Currency = 'peach' | 'usdt'
export const CURRENCY_LABEL: Record<Currency, string> = { peach: '蟠桃', usdt: 'USDT' }
/** 个人地址：由玩家 ID 派生的演示地址，用于接收蟠桃与 USDT */
export const walletAddress = (playerId: string) => { const hex = playerId.replace(/[^0-9a-f]/gi, '').toLowerCase() || '0'; return `0x${hex.repeat(Math.ceil(40 / hex.length)).slice(0, 40)}` }
/** 头像只接受缩小后的图片 data URL，限制大小以免撑爆本地存档 */
export const AVATAR_MAX_CHARS = 200_000
export const isAvatar = (value: unknown): value is string => typeof value === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(value) && value.length <= AVATAR_MAX_CHARS
/** UID 的基本格式：字母、数字、短横线，8 到 64 位 */
export const isUid = (value: string) => /^[A-Za-z0-9-]{8,64}$/.test(value)
export const isWalletAddress = (value: string) => /^0x[0-9a-fA-F]{40}$/.test(value)
/** 站内通知：召唤结果、待打款、入舍、匹配到承接人、待确认收款、到账、违约 */
export type Notice = { id: string; title: string; body: string; at: number; href: string; read?: boolean }
export type ProductState = {
  version: 6; playerId: string; inviteCode: string; inviter?: string;
  /** 自己设置的头像（缩小后的图片 data URL）；未设置时显示默认图标 */
  avatar?: string;
  /** balance = 蟠桃（分）；usdt = USDT 余额（分） */
  balance: number; usdt: number; entries: Entry[]; offset: number; demoOutcome: 'success' | 'refunded';
  contracts: ReturnType<typeof createPreview>['contracts']; history: ReturnType<typeof createPreview>['history'];
  records: AccountRecord[]; rewards: RewardRecord[]; members: DemoMember[]; demoSettlements: string[];
  /** 承接人与传承人交易：召唤成功后的打款（承接人）与传承时的收款（传承人） */
  trades: Trade[];
  notifications: Notice[];
}
export type ProductAction =
  | { type: 'summon'; action: PreviewAction }
  /** 召唤周期内点「召唤」：系统当场匹配并公布结果。必须先预约 */
  | { type: 'summon-cast'; key: string }
  | { type: 'cultivate'; action: CultivationAction }
  | { type: 'invite'; code: string }
  /** 把站内通知全部标为已读 */
  | { type: 'read-notifications' }
  /** 设置头像；传 null 恢复默认图标 */
  | { type: 'set-avatar'; dataUrl: string | null }
  | { type: 'tick' }
  | { type: 'demo-clock'; offset: number }
  | { type: 'demo-outcome'; result: 'success' | 'refunded' }
  | { type: 'demo-network' }
  /** generation 为 0 时自动挑下一位尚未结算的有效成员 */
  | { type: 'demo-reward'; generation: number; invalid?: boolean }
  | { type: 'transfer'; currency: Currency; amountCents: number; address: string }
  | { type: 'demo-receive'; currency: Currency; amountCents: number }
  | { type: 'buy-peach'; amountCents: number }
  /** 平台内转账：按对方 UID 转蟠桃或 USDT */
  | { type: 'transfer-to'; currency: Currency; amountCents: number; uid: string }
  /** 承接人：从 USDT 余额向传承人打款修炼值 */
  | { type: 'trade-pay'; id: string }
  /** 传承人：核实到账后确认收款，完成传承所得 */
  | { type: 'trade-confirm'; id: string }
  /** 仅演示：让对方立即完成操作（打款 / 确认到账），或让传承中的悟空立即匹配到承接人 */
  | { type: 'demo-counterparty'; id: string }
  | { type: 'demo-match'; contractId: string }
// 初始猴舍：除无极大圣外每个仙境各一只，刚完成第一天修炼。
const STARTER_STAGES = ['stone_spirit', 'spirit_monkey', 'wukong', 'battle_wukong', 'great_sage', 'destiny_sage'] as const
function starterContracts(now: number): Contract[] {
  const started = now - 0.3 * 86400000
  return STARTER_STAGES.map(stage => {
    const completed = 1
    return {
      id: `starter-${stage}`,
      stage,
      principal: LEVEL_BY_ID[stage].rangeMin * 100,
      started,
      completed,
      trainingCompletedAt: completed === RULES[stage].days ? started + 120000 : undefined,
    }
  })
}
/** 示例部族 160 人：第一代 16、第二代 44、更深层 100；每 16 人中 1 人持有蟠桃不足，不算有效用户。加入时间错开在近 30 天内，方便看排序 */
function sampleMembers(now: number): DemoMember[] {
  return Array.from({ length: 160 }, (_, index) => ({ uid: `demo-member-${String(index + 1).padStart(3, '0')}`, generation: index < 16 ? 1 : index < 60 ? 2 : 3, joinedAt: new Date(now - ((index * 37) % 30) * 86400000 - ((index * 53) % 24) * 3600000).toISOString(), days: (index * 37) % 30, valid: index % 16 !== 15 }))
}
/** 新存档的初始内容。正式版从零开始；体验版只多赠送余额，不预置悟空和成员 */
export type ProductSeed = { balance: number; usdt: number; starters?: boolean }
export const defaultSeed = (): ProductSeed => TRIAL_MODE ? { balance: TRIAL_PEACH * 100, usdt: TRIAL_USDT * 100 } : { balance: 0, usdt: 0 }
export function createProduct(now: number, playerId: string, seed: ProductSeed = defaultSeed()): ProductState {
  return { version: 6, playerId, inviteCode: `WK${playerId.replaceAll('-', '').slice(0, 16).toUpperCase()}`, balance: seed.balance, usdt: seed.usdt, entries: [], contracts: seed.starters ? starterContracts(now) : [], history: [], records: [], rewards: [], members: [], demoSettlements: [], trades: [], notifications: [], offset: 0, demoOutcome: 'success' }
}
function record(state: ProductState, kind: string, amountCents: number, description: string, now: number, currency: Currency = 'peach'): ProductState {
  return { ...state, records: [{ id: `${now}-${state.records.length}-${kind}`, kind, amountCents, description, createdAt: new Date(now).toISOString(), ...(currency === 'usdt' ? { currency } : {}) }, ...state.records] }
}
/** 加一条站内通知；同一件事只通知一次，最多保留 60 条 */
function notify(state: ProductState, id: string, title: string, body: string, at: number, href: string): ProductState {
  if (state.notifications.some(n => n.id === id)) return state
  return { ...state, notifications: [{ id, title, body, at, href }, ...state.notifications].slice(0, 60) }
}
const tradeLink = (id: string) => `/me/trades/${encodeURIComponent(id)}`
function summonedContract(entry: Entry): Contract {
  // 修炼蟠桃已在预约时暂扣、进猴舍时一次扣除，所以进舍即视为修炼全部安排好，之后自动修炼到周期结束
  return { id: `summon-${entry.key}`, stage: entry.stage, principal: entry.amount ?? costCents(entry.stage), started: matchAt(entry), completed: RULES[entry.stage].days, trainingCompletedAt: matchAt(entry) }
}
const updateTrade = (state: ProductState, id: string, patch: Partial<Trade>): ProductState => ({ ...state, trades: state.trades.map(t => t.id === id ? { ...t, ...patch } : t) })
/** 悟空修炼圆满且原周期结束的时刻：此后等下一轮同阶段召唤匹配承接人 */
const maturedAt = (c: Contract) => Math.max(endsAt(c), c.trainingCompletedAt ?? endsAt(c))

/** 传承人已确认到账：承接人交易完成，悟空进入猴舍（生命周期仍从召唤成功时刻起算） */
function payeeConfirms(state: ProductState, trade: Trade, at: number): ProductState {
  const entry = state.entries.find(e => e.key === trade.entryKey)
  let next = updateTrade(state, trade.id, { status: 'completed', confirmedAt: at })
  if (entry) {
    const contract = summonedContract(entry)
    if (![...next.contracts, ...next.history].some(c => c.id === contract.id)) next = { ...next, contracts: [...next.contracts, contract] }
  }
  next = notify(next, `housed-${trade.id}`, `${LEVEL_BY_ID[trade.stage].name}已进入猴舍`, '传承人已确认到账，悟空开始自动修炼。', at, `/house/room/${trade.stage}`)
  return record(next, 'summon', 0, `传承人已确认收到修炼值 ${money(trade.amountCents)} USDT，交易完成；${LEVEL_BY_ID[trade.stage].name}已进入猴舍，暂扣的召唤与修炼蟠桃正式扣除，自动修炼。`, at)
}
/** 承接人已打款：传承人需核实到账后确认收款 */
function payerPays(state: ProductState, trade: Trade, at: number): ProductState {
  let next = updateTrade(state, trade.id, { status: 'awaiting_confirm', paidAt: at })
  if (trade.role === 'receiver') next = notify(next, `paid-${trade.id}`, `${LEVEL_BY_ID[trade.stage].name} · 承接人已打款`, `请核实到账 ${money(trade.amountCents)} USDT 后确认收款。`, at, tradeLink(trade.id))
  return { ...next, contracts: next.contracts.map(c => c.id === trade.contractId ? { ...c, finishedAt: at } : c) }
}
/** 传承人：传承中的悟空匹配到承接人，开始等待承接人打款 */
function matchReceiver(state: ProductState, c: Contract, at: number): ProductState {
  const id = `inherit-${c.id}`
  const trade: Trade = { id, role: 'receiver', stage: c.stage, amountCents: settlement(c).received, matchedAt: at, deadline: at + PAYMENT_WINDOW_MS, counterparty: demoCounterparty(id), status: 'awaiting_payment', contractId: c.id }
  return notify({ ...state, trades: [...state.trades, trade] }, `matched-${id}`, `${RULES[c.stage].name} · 传承已匹配到承接人`, '等待对方打款，到账后会再通知你确认收款。', at, tradeLink(id))
}
/** 推进所有交易：匹配传承中的悟空、承接人逾期、模拟对方操作 */
function advanceTrades(state: ProductState, now: number): { state: ProductState; message: string } {
  let next = state
  let message = ''
  for (const c of next.contracts) {
    if (c.completed !== RULES[c.stage].days || next.trades.some(t => t.contractId === c.id)) continue
    if (c.finishedAt) {
      // 旧存档里已标记传承完成的悟空：视为承接人已打款，等待确认收款
      next = matchReceiver(next, c, c.finishedAt)
      next = updateTrade(next, `inherit-${c.id}`, { status: 'awaiting_confirm', paidAt: c.finishedAt })
      continue
    }
    const at = nextMatchAfter(c.stage, maturedAt(c))
    if (now < at) continue
    next = matchReceiver(next, c, at)
    message = `${RULES[c.stage].name}已匹配到承接人，等待对方打款。`
  }
  for (const trade of next.trades) {
    if (trade.role === 'payer' && trade.status === 'awaiting_payment' && now >= trade.deadline) {
      next = updateTrade(next, trade.id, { status: 'overdue', overdueAt: trade.deadline })
      next = { ...next, entries: next.entries.map(e => e.key === trade.entryKey ? { ...e, status: 'forfeited' as const } : e) }
      next = record(next, 'summon_forfeit', 0, `${LEVEL_BY_ID[trade.stage].name}召唤成功后 ${PAYMENT_WINDOW_HOURS} 小时内未完成修炼值 ${money(trade.amountCents)} USDT 打款，判定逾期违约，暂扣的召唤蟠桃与修炼蟠桃全部充公。`, trade.deadline)
      next = notify(next, `overdue-${trade.id}`, `${LEVEL_BY_ID[trade.stage].name} · 逾期未打款`, '已判定违约，暂扣的召唤蟠桃与修炼蟠桃全部充公。', trade.deadline, tradeLink(trade.id))
      message = `${LEVEL_BY_ID[trade.stage].name}逾期未打款，判定违约，暂扣的蟠桃已全部充公。`
    } else if (trade.role === 'payer' && trade.status === 'awaiting_confirm' && now >= (trade.paidAt ?? now) + COUNTERPARTY_DELAY_MS) {
      next = payeeConfirms(next, trade, (trade.paidAt ?? now) + COUNTERPARTY_DELAY_MS)
      message = `传承人已确认到账，${LEVEL_BY_ID[trade.stage].name}已进入猴舍。`
    } else if (trade.role === 'receiver' && trade.status === 'awaiting_payment' && now >= trade.matchedAt + COUNTERPARTY_DELAY_MS) {
      next = payerPays(next, trade, trade.matchedAt + COUNTERPARTY_DELAY_MS)
      message = `承接人已打款 ${money(trade.amountCents)} USDT，请核实到账后确认收款。`
    }
  }
  return { state: next, message }
}
export function productTransition(state: ProductState, action: ProductAction, now: number): { state: ProductState; message: string } {
  if (!Number.isFinite(now)) return { state, message: '时间无效，请重新进入页面。' }
  if (action.type === 'demo-clock') return Number.isFinite(action.offset) && Math.abs(action.offset) <= 36600 * 86400000 ? { state: { ...state, offset: action.offset }, message: '仅演示：时钟已调整，不影响真实账户。' } : { state, message: '演示时钟超出范围。' }
  if (action.type === 'demo-outcome') return { state: { ...state, demoOutcome: action.result }, message: `仅演示：下一次到点模拟${action.result === 'success' ? '成功' : '失败'}，不是真实召唤结果。` }
  if (action.type === 'demo-network') {
    if (state.members.length) return { state, message: '演示部族已载入，无需重复添加。' }
    const members = sampleMembers(now)
    return { state: { ...state, members }, message: `已载入演示部族：第一代有效同行者 15 人、部族有效成员 150 人（持有不少于 ${VALID_USER_MIN_PEACH} 蟠桃才算有效用户），达到部族Ⅱ阶；非真实用户。` }
  }
  if (action.type === 'demo-reward') {
    // invalid: true 时挑一名持有蟠桃不足的成员，用来演示「未达标成员不产生奖励」
    const member = action.generation === 0
      ? state.members.find(m => m.valid !== false && !state.demoSettlements.includes(`v2-demo-inheritance-${m.uid}`))
      : state.members.find(m => m.generation === action.generation && (m.valid !== false) === !action.invalid) ?? (action.invalid ? state.members.find(m => m.valid === false) : undefined)
    if (!member) return { state, message: state.members.length ? '示例成员都已完成过传承。' : '请先载入演示部族。' }
    const eventId = `v2-demo-inheritance-${member.uid}`
    if (state.demoSettlements.includes(eventId)) return { state, message: '该成员的演示传承已结算，不会重复发奖。' }
    // 有效用户规则：来源成员未达标不产生奖励；自己未达标不能拿奖励。两种情况本次传承都不补发
    if (member.valid === false) return { state: { ...state, demoSettlements: [...state.demoSettlements, eventId] }, message: `成员 ${member.uid} 持有蟠桃不足 ${VALID_USER_MIN_PEACH} 个，不是有效用户，本次传承不产生奖励。` }
    if (state.balance < VALID_USER_MIN_PEACH * 100) return { state: { ...state, demoSettlements: [...state.demoSettlements, eventId] }, message: `你持有的蟠桃不足 ${VALID_USER_MIN_PEACH} 个，不是有效用户，本次传承的同行与部族奖励无法获得。` }
    const source: Contract = { id: eventId, stage: 'great_sage', principal: LEVEL_BY_ID.great_sage.rangeMin * 100, started: now - RULES.great_sage.days * 86400000, completed: RULES.great_sage.days, finishedAt: now }
    const { profit } = settlement(source)
    const tier = tribeTier(state.members.filter(m => m.generation === 1 && m.valid !== false).length, state.members.filter(m => m.valid !== false).length)
    let next = { ...state, demoSettlements: [...state.demoSettlements, eventId] }
    for (const part of rewardParts(profit, member.generation, tier?.level ?? 0)) {
      const reward: RewardRecord = { id: `${eventId}-${part.type}`, rewardType: part.type, relationshipGeneration: member.generation, tribeLevel: part.type === 'tribe' ? tier!.level : null, rewardRate: part.rate, sourceUserId: member.uid, sourceProfitCents: profit, amountCents: part.amountCents, createdAt: new Date(now).toISOString() }
      next = { ...next, usdt: next.usdt + part.amountCents, rewards: [reward, ...next.rewards] }
      next = record(next, part.type, part.amountCents, `演示成员 ${member.uid} 传承完成，修炼增长 ${money(profit)} USDT；${part.type === 'companion' ? '同行' : '部族'}奖励 ${part.rate}%，返 USDT，不扣成员的修炼增长。`, now, 'usdt')
    }
    return { state: next, message: '示例成员已完成传承，同行奖励与部族奖励已分别返到 USDT 余额（演示数据）。' }
  }
  if (action.type === 'tick') {
    let next = state
    let message = ''
    for (const entry of state.entries) {
      // 玩家点下召唤（或周期结束系统代为处理）的时刻公布结果；生命周期与打款倒计时都从这一刻起算
      const published = matchAt(entry)
      if (entry.status !== 'waiting' || now < published) continue
      const level = LEVEL_BY_ID[entry.stage]
      const result = summon({ ...initialPreview(), balance: next.balance, entries: next.entries }, { type: 'settle', key: entry.key, result: next.demoOutcome, now: published })
      const settled = result.state.entries.find(e => e.key === entry.key)!
      next = { ...next, balance: result.state.balance, entries: result.state.entries }
      message = result.message
      if (settled.status === 'success') {
        // 召唤成功即进入承接人与传承人交易：承接人须在打款期内向系统匹配的传承人打款，传承人确认到账后悟空进入猴舍
        const contract = summonedContract(entry)
        const id = `pay-${entry.key}`
        if (!next.trades.some(t => t.id === id)) next = { ...next, trades: [...next.trades, { id, role: 'payer', stage: entry.stage, amountCents: contract.principal, matchedAt: published, deadline: published + PAYMENT_WINDOW_MS, counterparty: demoCounterparty(id), status: 'awaiting_payment', entryKey: entry.key }] }
        next = record(next, 'summon', 0, `${level.name}召唤成功，${entry.paid ? `预约时暂扣的 ${money(entry.paid)} 蟠桃将在进猴舍时正式扣除` : '本阶段不消耗蟠桃'}；请在 ${PAYMENT_WINDOW_HOURS} 小时内向传承人打款修炼值 ${money(contract.principal)} USDT。`, published)
        next = notify(next, `won-${id}`, `${level.name}召唤成功`, `请在 ${PAYMENT_WINDOW_HOURS} 小时内向传承人打款 ${money(contract.principal)} USDT，逾期暂扣的蟠桃全部充公。`, published, tradeLink(id))
        message = `${level.name}召唤成功！请在 ${PAYMENT_WINDOW_HOURS} 小时内完成修炼值打款。`
      } else {
        next = record(next, 'summon_return', entry.paid, '召唤未成功，暂扣的召唤蟠桃与修炼蟠桃全额退还，可继续参与后续召唤。', published)
        next = notify(next, `lost-${entry.key}`, `${level.name} · 本轮召唤未成功`, '暂扣的蟠桃已全额退还，可继续预约后续召唤。', published, `/world?stage=${entry.stage}`)
      }
    }
    const advanced = advanceTrades(next, now)
    return { state: advanced.state, message: advanced.message || message }
  }
  if (action.type === 'summon-cast') {
    const entry = state.entries.find(e => e.key === action.key)
    if (!entry) return { state, message: '没有预约本轮召唤，不能召唤。' }
    if (entry.status !== 'waiting') return { state, message: '本轮已召唤过。' }
    if (now < entry.deadline) return { state, message: `召唤周期尚未开始，请在 ${LEVEL_BY_ID[entry.stage].summonWindow} 召唤。` }
    return productTransition({ ...state, entries: state.entries.map(e => e.key === entry.key ? { ...e, summonedAt: now } : e) }, { type: 'tick' }, now)
  }
  if (action.type === 'trade-pay') {
    const trade = state.trades.find(t => t.id === action.id)
    if (!trade || trade.role !== 'payer' || trade.status !== 'awaiting_payment') return { state, message: '这笔交易当前无需打款。' }
    if (now >= trade.deadline) return { state, message: '已超过打款期限。' }
    if (state.usdt < trade.amountCents) return { state, message: 'USDT 余额不足，无法完成打款。请先补足 USDT。' }
    let next = payerPays({ ...state, usdt: state.usdt - trade.amountCents }, trade, now)
    next = record(next, 'summon_pay', -trade.amountCents, `${LEVEL_BY_ID[trade.stage].name}召唤：向传承人 ${trade.counterparty.uid} 打款修炼值 ${money(trade.amountCents)} USDT，等待传承人确认到账。`, now, 'usdt')
    return { state: next, message: `已打款 ${money(trade.amountCents)} USDT，等待传承人确认到账。` }
  }
  if (action.type === 'trade-confirm') {
    const trade = state.trades.find(t => t.id === action.id)
    if (!trade || trade.role !== 'receiver' || trade.status !== 'awaiting_confirm') return { state, message: '这笔交易当前无需确认收款。' }
    const contract = state.contracts.find(c => c.id === trade.contractId)
    if (!contract) return { state, message: '这只悟空已归档。' }
    const input = { version: 2 as const, balance: state.balance, contracts: state.contracts, history: state.history }
    const result = cultivate(input, { type: 'claim', id: contract.id }, now)
    if (result.state === input) return { state, message: result.message }
    const amounts = settlement(contract)
    let next: ProductState = { ...state, usdt: state.usdt + amounts.received, contracts: result.state.contracts, history: result.state.history }
    next = updateTrade(next, trade.id, { status: 'completed', confirmedAt: now })
    next = notify(next, `settled-${trade.id}`, `${RULES[contract.stage].name} · 传承所得已到账`, `${money(amounts.received)} USDT 已转入你的 USDT 余额。`, now, '/me/wallet')
    next = record(next, 'inherit', amounts.received, `${RULES[contract.stage].name} · ${dateTime(contract.started)}召唤。已确认收到承接人打款：修炼值 ${money(contract.principal)} USDT，修炼增长 ${money(amounts.profit)} USDT，平台手续费 ${money(amounts.fee)} USDT，本次传承所得 ${money(amounts.received)} USDT，已转入 USDT 余额。`, now, 'usdt')
    return { state: next, message: `已确认收款，传承所得 ${money(amounts.received)} USDT 已转入 USDT 余额，本次传承已归档。` }
  }
  if (action.type === 'demo-counterparty') {
    const trade = state.trades.find(t => t.id === action.id)
    if (trade?.role === 'payer' && trade.status === 'awaiting_confirm') return { state: payeeConfirms(state, trade, now), message: `仅演示：传承人已确认到账，${LEVEL_BY_ID[trade.stage].name}已进入猴舍。` }
    if (trade?.role === 'receiver' && trade.status === 'awaiting_payment') return { state: payerPays(state, trade, now), message: '仅演示：承接人已打款，请核实到账后确认收款。' }
    return { state, message: '这笔交易当前不需要对方操作。' }
  }
  if (action.type === 'demo-match') {
    const c = state.contracts.find(item => item.id === action.contractId)
    if (!c || c.completed !== RULES[c.stage].days || now < maturedAt(c) || state.trades.some(t => t.contractId === c.id)) return { state, message: '这只悟空当前不在等待匹配。' }
    return { state: matchReceiver(state, c, now), message: `仅演示：${RULES[c.stage].name}已匹配到承接人，等待对方打款。` }
  }
  if (action.type === 'read-notifications') return state.notifications.some(n => !n.read) ? { state: { ...state, notifications: state.notifications.map(n => n.read ? n : { ...n, read: true }) }, message: '' } : { state, message: '' }
  if (action.type === 'set-avatar') {
    if (action.dataUrl === null) { const { avatar: _removed, ...rest } = state; return { state: rest, message: '已恢复默认头像。' } }
    if (!isAvatar(action.dataUrl)) return { state, message: '头像图片无效或过大，请换一张。' }
    return { state: { ...state, avatar: action.dataUrl }, message: '头像已更新。' }
  }
  if (action.type === 'invite') {
    const code = action.code.trim().toUpperCase()
    if (!/^WK[A-F0-9]{16}$/.test(code)) return { state, message: '请输入有效的18位邀请码。' }
    if (code === state.inviteCode) return { state, message: '不能接受自己的邀请。' }
    if (state.inviter) return { state, message: '你已建立同行关系，无需重复接受。' }
    return { state: { ...state, inviter: code }, message: '已接受邀请，同行关系已建立。' }
  }
  if (action.type === 'summon') {
    if (action.action.type !== 'join') return { state, message: '请在召唤周期内点「召唤」。' }
    if (LEVEL_BY_ID[action.action.stage].isOpen && state.usdt < costCents(action.action.stage)) return { state, message: 'USDT 余额不足以完成本轮修炼值打款，暂不能预约召唤。' }
    const result = summon({ ...initialPreview(), balance: state.balance, entries: state.entries }, { ...action.action, now })
    if (result.state.entries === state.entries) return { state, message: result.message }
    const entry = result.state.entries.at(-1)!
    const next = record({ ...state, balance: result.state.balance, entries: result.state.entries }, 'summon_lock', -entry.paid, `${LEVEL_BY_ID[entry.stage].name}预约召唤：暂扣召唤蟠桃与修炼蟠桃，进猴舍时扣除，召唤失败全额退还。`, now)
    return { state: next, message: result.message }
  }
  if (action.type === 'buy-peach') {
    // 1 蟠桃 = 1 USDT：用 USDT 余额购买蟠桃，到账后显示在「我的资产」
    if (!Number.isSafeInteger(action.amountCents) || action.amountCents <= 0) return { state, message: '请输入有效的购买数量，最多两位小数。' }
    if (state.usdt < action.amountCents) return { state, message: 'USDT 余额不足，无法购买。' }
    let next: ProductState = { ...state, usdt: state.usdt - action.amountCents, balance: state.balance + action.amountCents }
    next = record(next, 'buy_pay', -action.amountCents, `购买 ${money(action.amountCents)} 蟠桃，支付 ${money(action.amountCents)} USDT（1蟠桃 = 1 USDT）。`, now, 'usdt')
    next = record(next, 'recharge', action.amountCents, `购买到账 ${money(action.amountCents)} 蟠桃，已显示在「我的资产」。`, now)
    return { state: next, message: `已购买 ${money(action.amountCents)} 蟠桃。` }
  }
  if (action.type === 'transfer-to') {
    const label = CURRENCY_LABEL[action.currency]
    const key = action.currency === 'usdt' ? 'usdt' as const : 'balance' as const
    const uid = action.uid.trim()
    if (!label) return { state, message: '不支持的资产类型。' }
    if (!isUid(uid)) return { state, message: '请输入对方的 UID。' }
    if (uid.toLowerCase() === state.playerId.toLowerCase()) return { state, message: '不能转给自己。' }
    if (!Number.isSafeInteger(action.amountCents) || action.amountCents <= 0) return { state, message: '请输入有效的数量，最多两位小数。' }
    if (state[key] < action.amountCents) return { state, message: `${label} 余额不足。` }
    return { state: record({ ...state, [key]: state[key] - action.amountCents }, 'transfer_out', -action.amountCents, `转给 ${uid}：${money(action.amountCents)} ${label}。`, now, action.currency), message: `已向 ${uid} 转出 ${money(action.amountCents)} ${label}。` }
  }
  if (action.type === 'transfer' || action.type === 'demo-receive') {
    const label = CURRENCY_LABEL[action.currency]
    const key = action.currency === 'usdt' ? 'usdt' as const : 'balance' as const
    if (!label) return { state, message: '不支持的资产类型。' }
    if (!Number.isSafeInteger(action.amountCents) || action.amountCents <= 0) return { state, message: '请输入有效的数量，最多两位小数。' }
    if (action.type === 'demo-receive') {
      if (state[key] + action.amountCents > 1e12) return { state, message: '超出演示余额上限。' }
      return { state: record({ ...state, [key]: state[key] + action.amountCents }, 'transfer_in', action.amountCents, `演示：个人地址收到 ${money(action.amountCents)} ${label}。`, now, action.currency), message: `演示：已接收 ${money(action.amountCents)} ${label}。` }
    }
    const address = action.address.trim()
    if (!isWalletAddress(address)) return { state, message: '请输入有效的接收地址（0x 开头，共 42 位）。' }
    if (address.toLowerCase() === walletAddress(state.playerId)) return { state, message: '不能转给自己的地址。' }
    if (state[key] < action.amountCents) return { state, message: `${label}余额不足。` }
    return { state: record({ ...state, [key]: state[key] - action.amountCents }, 'transfer_out', -action.amountCents, `转出 ${money(action.amountCents)} ${label} 至 ${address.slice(0, 8)}…${address.slice(-6)}（当前版本不产生真实转账）。`, now, action.currency), message: `已转出 ${money(action.amountCents)} ${label}。` }
  }
  // 未知或已下线的操作（例如旧版本的加速召唤）一律不处理
  if (action.type !== 'cultivate') return { state, message: '当前操作不可用。' }
  const operation = action.action
  if (operation.type === 'claim') {
    // 传承所得须承接人打款、传承人确认收款后完成
    const trade = state.trades.find(t => t.contractId === operation.id && t.role === 'receiver')
    if (!trade || trade.status !== 'awaiting_confirm') return { state, message: '需等承接人打款后，才能确认收款完成传承。' }
    return productTransition(state, { type: 'trade-confirm', id: trade.id }, now)
  }
  if (operation.type !== 'train') return { state, message: '当前操作不可用。' }
  const input = { version: 2 as const, balance: state.balance, contracts: state.contracts, history: state.history }
  const result = cultivate(input, operation, now)
  if (result.state === input) return { state, message: result.message }
  const next = { ...state, balance: result.state.balance, contracts: result.state.contracts, history: result.state.history }
  const selected = state.contracts.filter(c => operation.ids.includes(c.id))
  const estimate = quote(selected, now, false)
  const description = `${[...new Set(selected.map(c => RULES[c.stage].name))].join('、')} · ${estimate.items.length}只，共${estimate.items.reduce((sum, item) => sum + item.count, 0)}次修炼，消耗 ${money(estimate.total)} 蟠桃；漏修不额外收费。`
  return { state: record(next, 'cycle', next.balance - state.balance, description, now), message: result.message }
}
export function parseProduct(raw: string): ProductState {
  const data = JSON.parse(raw)
  // v5 存档没有交易记录：补上空列表后继续使用，原有悟空与余额保留
  if (data && data.version === 5) Object.assign(data, { version: 6, trades: [] })
  if (!data || data.version !== 6 || !Number.isSafeInteger(data.usdt) || data.usdt < 0 || data.usdt > 1e12 || typeof data.playerId !== 'string' || !/^WK[A-F0-9]{16}$/.test(data.inviteCode) || !Number.isFinite(data.offset) || Math.abs(data.offset) > 36600 * 86400000 || !['success', 'refunded'].includes(data.demoOutcome)) throw new Error('V2存档格式无效')
  if (!Array.isArray(data.records) || !data.records.every((r: AccountRecord) => typeof r.id === 'string' && typeof r.kind === 'string' && Number.isSafeInteger(r.amountCents) && typeof r.description === 'string' && Number.isFinite(Date.parse(r.createdAt)))) throw new Error('账本格式无效')
  if (!isPreview({ version: 2, balance: data.balance, contracts: data.contracts, history: data.history })) throw new Error('生命周期格式无效')
  // 修炼改为一次扣除、自动进行：旧存档里还没修完的悟空直接视为已安排好全部修炼
  data.contracts = data.contracts.map((c: Contract) => c.completed === RULES[c.stage].days ? c : { ...c, completed: RULES[c.stage].days, trainingCompletedAt: c.trainingCompletedAt ?? c.started })
  parsePreview(JSON.stringify({ version: 2, balance: data.balance, offset: data.offset, entries: data.entries }))
  if (!Array.isArray(data.members) || !data.members.every((m: DemoMember) => typeof m.uid === 'string' && Number.isInteger(m.generation) && m.generation > 0 && Number.isFinite(Date.parse(m.joinedAt)))) throw new Error('成员格式无效')
  if (!Array.isArray(data.rewards) || !data.rewards.every((r: RewardRecord) => typeof r.id === 'string' && ['companion', 'tribe'].includes(r.rewardType) && Number.isSafeInteger(r.amountCents) && r.amountCents > 0 && Number.isSafeInteger(r.sourceProfitCents) && Number.isFinite(r.rewardRate) && Number.isFinite(Date.parse(r.createdAt)))) throw new Error('奖励格式无效')
  if (!Array.isArray(data.demoSettlements) || !data.demoSettlements.every((id: unknown) => typeof id === 'string')) throw new Error('结算格式无效')
  if (!Array.isArray(data.trades) || !data.trades.every(isTrade)) throw new Error('交易格式无效')
  if (data.avatar !== undefined && !isAvatar(data.avatar)) delete data.avatar
  // 旧存档没有站内通知
  if (!Array.isArray(data.notifications) || !data.notifications.every((n: Notice) => n && typeof n.id === 'string' && typeof n.title === 'string' && typeof n.body === 'string' && Number.isFinite(n.at) && typeof n.href === 'string')) data.notifications = []
  return data
}
