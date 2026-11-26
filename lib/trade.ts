import { LEVEL_BY_ID, PAYMENT_WINDOW_HOURS, type Stage } from './game-data'
import { matchDelay, roundFor } from './summon-preview'

/**
 * 承接人与传承人交易。
 * - 承接人（payer，结算方）：召唤成功后，在结算期内把修炼值结算给系统匹配的传承人。
 * - 传承人（receiver，收款方/释放方）：悟空完成修炼且原周期结束后进入传承中，
 *   等下一轮同阶段召唤匹配到承接人；承接人完成资金结算后，传承人核实到账并确认，传承所得完成。
 *
 * 中心化撮合：匹配由平台完成，资金结算从平台内 USDT 余额划转，没有链上地址与付款凭证。
 * 当前没有接入后端撮合，对方的操作由本地模拟（见 COUNTERPARTY_DELAY_MS）。
 * 接入后端后，这里的模拟逻辑由接口返回的交易状态替代，页面不需要改动。
 */
export type TradeRole = 'payer' | 'receiver'
export type TradeStatus = 'awaiting_payment' | 'awaiting_confirm' | 'completed' | 'overdue'
export type Trade = {
  id: string
  role: TradeRole
  stage: Stage
  /** 本笔交易金额（USDT 分）：承接人为修炼值，传承人为本次传承所得 */
  amountCents: number
  /** 系统匹配完成、交易开始的时刻 */
  matchedAt: number
  /** 承接人资金结算截止时刻 */
  deadline: number
  /** 系统匹配的对方：只展示 UID，资金结算在平台内 USDT 余额间划转 */
  counterparty: { uid: string }
  status: TradeStatus
  paidAt?: number
  confirmedAt?: number
  overdueAt?: number
  /** 承接人交易对应的召唤场次 */
  entryKey?: string
  /** 传承人交易对应的悟空 */
  contractId?: string
}

export const PAYMENT_WINDOW_MS = PAYMENT_WINDOW_HOURS * 3600_000
/** 模拟对方完成操作（承接人资金结算 / 传承人确认到账）所需时间 */
export const COUNTERPARTY_DELAY_MS = 2 * 60_000

export const TRADE_ROLE_LABEL: Record<TradeRole, string> = { payer: '承接人 · 结算方', receiver: '传承人 · 收款方' }

function hashOf(seed: string) {
  let hash = 2166136261
  for (const ch of seed) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619) >>> 0
  return hash
}
function hexOf(seed: string, length: number) {
  let out = ''
  for (let i = 0; out.length < length; i++) out += hashOf(`${seed}:${i}`).toString(16).padStart(8, '0')
  return out.slice(0, length)
}
/** 演示用的对方身份：由交易编号确定性生成，不是真实用户 */
export function demoCounterparty(seed: string) {
  return { uid: `WK${hexOf(`uid:${seed}`, 16).toUpperCase()}` }
}

/** 时刻 t 之后（含）该阶段下一次有承接人召唤成功的时刻（模拟）：传承中的悟空在这一刻匹配到承接人 */
export function nextMatchAfter(stage: Stage, t: number) {
  for (let day = 0; day < 3; day++) {
    const round = roundFor(stage, t + day * 86_400_000)
    const at = round.deadline + matchDelay(round.key)
    if (at >= t) return at
  }
  return t
}

/** 需要我本人处理的交易：承接人待结算、传承人待确认收款 */
export function needsMyAction(trade: Trade) {
  return (trade.role === 'payer' && trade.status === 'awaiting_payment') || (trade.role === 'receiver' && trade.status === 'awaiting_confirm')
}
/** 待办按紧急程度排序：有结算截止时间的排前面 */
export function pendingTrades(trades: Trade[]) {
  return trades.filter(needsMyAction).sort((a, b) => (a.role === 'payer' ? a.deadline : Infinity) - (b.role === 'payer' ? b.deadline : Infinity) || a.matchedAt - b.matchedAt)
}
export function tradeStatusText(trade: Trade) {
  if (trade.status === 'completed') return '交易完成'
  if (trade.status === 'overdue') return '逾期未结算'
  if (trade.role === 'payer') return trade.status === 'awaiting_payment' ? '待我结算' : '等待传承人确认'
  return trade.status === 'awaiting_payment' ? '等待承接人结算' : '待确认收款'
}
export function tradeTitle(trade: Trade) {
  return `${LEVEL_BY_ID[trade.stage].name} · ${trade.role === 'payer' ? '召唤资金结算' : '传承收款'}`
}

export function isTrade(value: unknown): value is Trade {
  if (!value || typeof value !== 'object') return false
  const t = value as Trade
  return typeof t.id === 'string' && ['payer', 'receiver'].includes(t.role) && Object.hasOwn(LEVEL_BY_ID, t.stage)
    && Number.isSafeInteger(t.amountCents) && t.amountCents >= 0 && Number.isFinite(t.matchedAt) && Number.isFinite(t.deadline)
    && !!t.counterparty && typeof t.counterparty.uid === 'string'
    && ['awaiting_payment', 'awaiting_confirm', 'completed', 'overdue'].includes(t.status)
}
