import { createPreview, isPreview, transition as cultivate, endsAt, quote, settlement, money, dateTime, RULES, type Action as CultivationAction, type Contract } from './cultivation-preview'
import { initialPreview, parsePreview, transition as summon, costCents, matchAt, type PreviewAction, type Entry } from './summon-preview'
import { LEVEL_BY_ID, PREVIEW_INHERITANCE_DELAY_MS, TRIAL_MODE, TRIAL_PEACH, TRIAL_USDT, VALID_USER_MIN_PEACH } from './game-data'
import { rewardParts, tribeTier, type AccountRecord, type MemberRecord, type RewardRecord } from './profile-rules'

// 换键：契约功能取消后旧存档不再载入，新存档以预置猴舍开始。
// 正式版与体验版各用各的存档，互不影响
export const PRODUCT_KEY = TRIAL_MODE ? 'wukong-trial-v7' : 'wukong-official-v7'
export type DemoMember = MemberRecord & { generation: number }
export type Currency = 'peach' | 'usdt'
export const CURRENCY_LABEL: Record<Currency, string> = { peach: '蟠桃', usdt: 'U' }
/** 个人地址：由玩家 ID 派生的演示地址，用于接收蟠桃与 U */
export const walletAddress = (playerId: string) => { const hex = playerId.replace(/[^0-9a-f]/gi, '').toLowerCase() || '0'; return `0x${hex.repeat(Math.ceil(40 / hex.length)).slice(0, 40)}` }
export const isWalletAddress = (value: string) => /^0x[0-9a-fA-F]{40}$/.test(value)
export type ProductState = {
  version: 5; playerId: string; inviteCode: string; inviter?: string;
  /** balance = 蟠桃（分）；usdt = U 余额（分） */
  balance: number; usdt: number; entries: Entry[]; offset: number; demoOutcome: 'success' | 'refunded';
  contracts: ReturnType<typeof createPreview>['contracts']; history: ReturnType<typeof createPreview>['history'];
  records: AccountRecord[]; rewards: RewardRecord[]; members: DemoMember[]; demoSettlements: string[];
}
export type ProductAction =
  | { type: 'summon'; action: PreviewAction }
  | { type: 'cultivate'; action: CultivationAction }
  | { type: 'invite'; code: string }
  | { type: 'tick' }
  | { type: 'demo-clock'; offset: number }
  | { type: 'demo-outcome'; result: 'success' | 'refunded' }
  | { type: 'demo-network' }
  /** generation 为 0 时自动挑下一位尚未结算的有效成员 */
  | { type: 'demo-reward'; generation: number; invalid?: boolean }
  | { type: 'transfer'; currency: Currency; amountCents: number; address: string }
  | { type: 'demo-receive'; currency: Currency; amountCents: number }
  | { type: 'buy-peach'; amountCents: number }
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
/** 示例部族 160 人：第一代 16、第二代 44、更深层 100；每 16 人中 1 人持有蟠桃不足，不算有效用户 */
function sampleMembers(now: number): DemoMember[] {
  return Array.from({ length: 160 }, (_, index) => ({ uid: `demo-member-${String(index + 1).padStart(3, '0')}`, generation: index < 16 ? 1 : index < 60 ? 2 : 3, joinedAt: new Date(now).toISOString(), days: 0, valid: index % 16 !== 15 }))
}
/** 新存档的初始内容。正式版从零开始；体验版只多赠送余额，不预置悟空和成员 */
export type ProductSeed = { balance: number; usdt: number; starters?: boolean }
export const defaultSeed = (): ProductSeed => TRIAL_MODE ? { balance: TRIAL_PEACH * 100, usdt: TRIAL_USDT * 100 } : { balance: 0, usdt: 0 }
export function createProduct(now: number, playerId: string, seed: ProductSeed = defaultSeed()): ProductState {
  return { version: 5, playerId, inviteCode: `WK${playerId.replaceAll('-', '').slice(0, 16).toUpperCase()}`, balance: seed.balance, usdt: seed.usdt, entries: [], contracts: seed.starters ? starterContracts(now) : [], history: [], records: [], rewards: [], members: [], demoSettlements: [], offset: 0, demoOutcome: 'success' }
}
function record(state: ProductState, kind: string, amountCents: number, description: string, now: number, currency: Currency = 'peach'): ProductState {
  return { ...state, records: [{ id: `${now}-${state.records.length}-${kind}`, kind, amountCents, description, createdAt: new Date(now).toISOString(), ...(currency === 'usdt' ? { currency } : {}) }, ...state.records] }
}
function summonedContract(entry: Entry): Contract {
  return { id: `summon-${entry.key}`, stage: entry.stage, principal: entry.amount ?? costCents(entry.stage), started: matchAt(entry), completed: 0 }
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
      next = record(next, part.type, part.amountCents, `演示成员 ${member.uid} 传承完成，修炼盈利 ${money(profit)} USDT；${part.type === 'companion' ? '同行' : '部族'}奖励 ${part.rate}%，返 U，不扣成员盈利。`, now, 'usdt')
    }
    return { state: next, message: '示例成员已完成传承，同行奖励与部族奖励已分别返到 U 余额（演示数据）。' }
  }
  if (action.type === 'tick') {
    let next = state
    let message = ''
    for (const entry of state.entries) {
      // 自动匹配完成的时刻才公布结果；生命周期与打款倒计时都从这一刻起算
      const published = matchAt(entry)
      if (entry.status !== 'waiting' || now < published) continue
      const level = LEVEL_BY_ID[entry.stage]
      const result = summon({ ...initialPreview(), balance: next.balance, entries: next.entries }, { type: 'settle', key: entry.key, result: next.demoOutcome, now: published })
      const settled = result.state.entries.find(e => e.key === entry.key)!
      next = { ...next, balance: result.state.balance, entries: result.state.entries }
      message = result.message
      if (settled.status === 'success') {
        const contract = summonedContract(entry)
        if (next.usdt < contract.principal) {
          // U 余额不足以完成配套打款：按逾期违约处理，召唤蟠桃充公
          next = { ...next, entries: next.entries.map(e => e.key === entry.key ? { ...e, status: 'forfeited' as const } : e) }
          next = record(next, 'summon_forfeit', 0, `${level.name}召唤成功，但 U 余额不足以完成配套金额 ${money(contract.principal)} USDT 打款，判定逾期违约，已扣除的召唤蟠桃充公。`, published)
          message = `${level.name}召唤成功但未完成打款，判定逾期违约，召唤蟠桃已充公。`
          continue
        }
        if (![...next.contracts, ...next.history].some(c => c.id === contract.id)) next = { ...next, usdt: next.usdt - contract.principal, contracts: [...next.contracts, contract] }
        next = record(next, 'summon_pay', -contract.principal, `${level.name}召唤成功，${TRIAL_MODE ? '体验版' : '当前版本'}自动完成甲方打款：配套金额 ${money(contract.principal)} USDT 已从 U 余额转给乙方。`, published, 'usdt')
        next = record(next, 'summon', 0, `${level.name}召唤成功，${entry.paid ? `提交时暂扣的 ${money(entry.paid)} 蟠桃已自动扣除` : '本阶段不消耗蟠桃'}；已进入猴舍，按日修炼。`, published)
      } else next = record(next, 'summon_return', entry.paid, '召唤未成功，本次召唤使用的蟠桃全额退还，可继续参与后续召唤。', published)
    }
    const matured = next.contracts.filter(c => !c.finishedAt && c.completed === RULES[c.stage].days && now >= Math.max(endsAt(c), c.trainingCompletedAt ?? endsAt(c)) + PREVIEW_INHERITANCE_DELAY_MS)
    if (matured.length) next = { ...next, contracts: next.contracts.map(c => matured.some(m => m.id === c.id) ? { ...c, finishedAt: now } : c) }
    return { state: next, message }
  }
  if (action.type === 'invite') {
    const code = action.code.trim().toUpperCase()
    if (!/^WK[A-F0-9]{16}$/.test(code)) return { state, message: '请输入有效的18位邀请码。' }
    if (code === state.inviteCode) return { state, message: '不能接受自己的邀请。' }
    if (state.inviter) return { state, message: '你已建立同行关系，无需重复接受。' }
    return { state: { ...state, inviter: code }, message: '同行关系已记录；尚未校验真实用户，不产生真实人数或奖励。' }
  }
  if (action.type === 'summon') {
    if (action.action.type !== 'join') return { state, message: '请使用演示控制选择结果，等待本轮结果公布。' }
    if (LEVEL_BY_ID[action.action.stage].isOpen && state.usdt < costCents(action.action.stage)) return { state, message: 'U 余额不足以完成本轮配套金额打款，暂不能提交召唤。' }
    const result = summon({ ...initialPreview(), balance: state.balance, entries: state.entries }, { ...action.action, now })
    if (result.state.entries === state.entries) return { state, message: result.message }
    const entry = result.state.entries.at(-1)!
    const next = record({ ...state, balance: result.state.balance, entries: result.state.entries }, 'summon_lock', -entry.paid, `${LEVEL_BY_ID[entry.stage].name}召唤：暂扣召唤蟠桃，成功后自动扣除，失败全额退还。`, now)
    return { state: next, message: result.message }
  }
  if (action.type === 'buy-peach') {
    // 1 蟠桃 = 1 USDT：用 U 余额购买蟠桃，到账后显示在个人地址页
    if (!Number.isSafeInteger(action.amountCents) || action.amountCents <= 0) return { state, message: '请输入有效的购买数量，最多两位小数。' }
    if (state.usdt < action.amountCents) return { state, message: 'U余额不足，无法购买。' }
    let next: ProductState = { ...state, usdt: state.usdt - action.amountCents, balance: state.balance + action.amountCents }
    next = record(next, 'buy_pay', -action.amountCents, `购买 ${money(action.amountCents)} 蟠桃，支付 ${money(action.amountCents)} USDT（1蟠桃 = 1 USDT）。`, now, 'usdt')
    next = record(next, 'recharge', action.amountCents, `购买到账 ${money(action.amountCents)} 蟠桃，已显示在个人地址页。`, now)
    return { state: next, message: `已购买 ${money(action.amountCents)} 蟠桃。` }
  }
  if (action.type === 'transfer' || action.type === 'demo-receive') {
    const label = CURRENCY_LABEL[action.currency]
    const key = action.currency === 'usdt' ? 'usdt' as const : 'balance' as const
    if (!label) return { state, message: '不支持的资产类型。' }
    if (!Number.isSafeInteger(action.amountCents) || action.amountCents <= 0) return { state, message: '请输入有效的数量，最多两位小数。' }
    if (action.type === 'demo-receive') {
      if (state[key] + action.amountCents > 1e12) return { state, message: '超出演示余额上限。' }
      return { state: record({ ...state, [key]: state[key] + action.amountCents }, 'transfer_in', action.amountCents, `演示：个人地址收到 ${money(action.amountCents)} ${label === 'U' ? 'USDT' : label}。`, now, action.currency), message: `演示：已接收 ${money(action.amountCents)} ${label}。` }
    }
    const address = action.address.trim()
    if (!isWalletAddress(address)) return { state, message: '请输入有效的接收地址（0x 开头，共 42 位）。' }
    if (address.toLowerCase() === walletAddress(state.playerId)) return { state, message: '不能转给自己的地址。' }
    if (state[key] < action.amountCents) return { state, message: `${label}余额不足。` }
    return { state: record({ ...state, [key]: state[key] - action.amountCents }, 'transfer_out', -action.amountCents, `转出 ${money(action.amountCents)} ${label === 'U' ? 'USDT' : label} 至 ${address.slice(0, 8)}…${address.slice(-6)}（${TRIAL_MODE ? '体验版' : '当前版本'}不产生真实转账）。`, now, action.currency), message: `已转出 ${money(action.amountCents)} ${label}。` }
  }
  // 未知或已下线的操作（例如旧版本的加速召唤）一律不处理
  if (action.type !== 'cultivate') return { state, message: '当前操作不可用。' }
  const operation = action.action
  if (!['train', 'claim'].includes(operation.type)) return { state, message: '当前操作不可用。' }
  const input = { version: 2 as const, balance: state.balance, contracts: state.contracts, history: state.history }
  const result = cultivate(input, operation, now)
  if (result.state === input) return { state, message: result.message }
  const next = { ...state, balance: result.state.balance, contracts: result.state.contracts, history: result.state.history }
  let description = result.message
  if (operation.type === 'train') {
    const selected = state.contracts.filter(c => operation.ids.includes(c.id))
    const estimate = quote(selected, now, false)
    description = `${[...new Set(selected.map(c => RULES[c.stage].name))].join('、')} · ${estimate.items.length}只，共${estimate.items.reduce((sum, item) => sum + item.count, 0)}次修炼，消耗 ${money(estimate.total)} 蟠桃；漏修不额外收费。`
  } else if (operation.type === 'claim') {
    const selected = state.contracts.find(c => c.id === operation.id)!
    const identity = `${RULES[selected.stage].name} · ${dateTime(selected.started)}召唤`
    {
      const amounts = settlement(selected)
      description = `${identity}。配套金额 ${money(selected.principal)} USDT，修炼盈利 ${money(amounts.profit)} USDT，平台手续费 ${money(amounts.fee)} USDT，本次传承结算 ${money(amounts.received)} USDT，已转入 U 余额。`
    }
  }
  if (operation.type === 'claim') {
    const received = settlement(state.contracts.find(c => c.id === operation.id)!).received
    return { state: record({ ...next, usdt: next.usdt + received }, 'inherit', received, description, now, 'usdt'), message: `传承结算 ${money(received)} USDT 已转入 U 余额，本次传承已归档。` }
  }
  return { state: record(next, 'cycle', next.balance - state.balance, description, now), message: result.message }
}
export function parseProduct(raw: string): ProductState {
  const data = JSON.parse(raw)
  if (!data || data.version !== 5 || !Number.isSafeInteger(data.usdt) || data.usdt < 0 || data.usdt > 1e12 || typeof data.playerId !== 'string' || !/^WK[A-F0-9]{16}$/.test(data.inviteCode) || !Number.isFinite(data.offset) || Math.abs(data.offset) > 36600 * 86400000 || !['success', 'refunded'].includes(data.demoOutcome)) throw new Error('V2存档格式无效')
  if (!Array.isArray(data.records) || !data.records.every((r: AccountRecord) => typeof r.id === 'string' && typeof r.kind === 'string' && Number.isSafeInteger(r.amountCents) && typeof r.description === 'string' && Number.isFinite(Date.parse(r.createdAt)))) throw new Error('账本格式无效')
  if (!isPreview({ version: 2, balance: data.balance, contracts: data.contracts, history: data.history })) throw new Error('生命周期格式无效')
  parsePreview(JSON.stringify({ version: 2, balance: data.balance, offset: data.offset, entries: data.entries }))
  if (!Array.isArray(data.members) || !data.members.every((m: DemoMember) => typeof m.uid === 'string' && Number.isInteger(m.generation) && m.generation > 0 && Number.isFinite(Date.parse(m.joinedAt)))) throw new Error('成员格式无效')
  if (!Array.isArray(data.rewards) || !data.rewards.every((r: RewardRecord) => typeof r.id === 'string' && ['companion', 'tribe'].includes(r.rewardType) && Number.isSafeInteger(r.amountCents) && r.amountCents > 0 && Number.isSafeInteger(r.sourceProfitCents) && Number.isFinite(r.rewardRate) && Number.isFinite(Date.parse(r.createdAt)))) throw new Error('奖励格式无效')
  if (!Array.isArray(data.demoSettlements) || !data.demoSettlements.every((id: unknown) => typeof id === 'string')) throw new Error('结算格式无效')
  return data
}
