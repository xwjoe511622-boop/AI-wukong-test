import { LEVEL_BY_ID, PAYMENT_WINDOW_HOURS, TRIAL_MODE, type Stage } from './game-data'
import { matchDelay, roundFor } from './summon-preview'

/**
 * 甲乙双方交易。
 * - 甲方（payer，打款方）：召唤成功后，在打款期内把配套金额打给系统匹配的乙方。
 * - 乙方（receiver，收款方/释放方）：悟空完成修炼且原周期结束后进入传承中，
 *   等下一轮同阶段召唤匹配到甲方；甲方打款后，乙方核实到账并确认，传承结算完成。
 *
 * 中心化撮合：匹配由平台完成，打款从平台内 USDT 余额划转，没有链上地址与付款凭证。
 * 当前没有接入后端撮合，对方的操作由本地模拟（见 COUNTERPARTY_DELAY_MS）。
 * 接入后端后，这里的模拟逻辑由接口返回的交易状态替代，页面不需要改动。
 */
export type TradeRole = 'payer' | 'receiver'
export type TradeStatus = 'awaiting_payment' | 'awaiting_confirm' | 'completed' | 'overdue'
export type Trade = {
  id: string
  role: TradeRole
  stage: Stage
  /** 本笔交易金额（USDT 分）：甲方为配套金额，乙方为本次传承结算 */
  amountCents: number
  /** 系统匹配完成、交易开始的时刻 */
  matchedAt: number
  /** 甲方打款截止时刻 */
  deadline: number
  /** 系统匹配的对方：只展示 UID，打款在平台内 USDT 余额间划转 */
  counterparty: { uid: string }
  status: TradeStatus
  paidAt?: number
  confirmedAt?: number
  overdueAt?: number
  /** 甲方交易对应的召唤场次 */
  entryKey?: string
  /** 乙方交易对应的悟空 */
  contractId?: string
}

export const PAYMENT_WINDOW_MS = PAYMENT_WINDOW_HOURS * 3600_000
/** 模拟对方完成操作（甲方打款 / 乙方确认到账）所需时间 */
export const COUNTERPARTY_DELAY_MS = 2 * 60_000

export const TRADE_ROLE_LABEL: Record<TradeRole, string> = { payer: '甲方 · 打款方', receiver: '乙方 · 收款方' }

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

/** 时刻 t 之后（含）该阶段下一次有甲方召唤成功的时刻（模拟）：传承中的悟空在这一刻匹配到甲方 */
export function nextMatchAfter(stage: Stage, t: number) {
  for (let day = 0; day < 3; day++) {
    const round = roundFor(stage, t + day * 86_400_000)
    const at = round.deadline + matchDelay(round.key)
    if (at >= t) return at
  }
  return t
}

/** 需要我本人处理的交易：甲方待打款、乙方待确认收款 */
export function needsMyAction(trade: Trade) {
  return (trade.role === 'payer' && trade.status === 'awaiting_payment') || (trade.role === 'receiver' && trade.status === 'awaiting_confirm')
}
/** 待办按紧急程度排序：有打款截止时间的排前面 */
export function pendingTrades(trades: Trade[]) {
  return trades.filter(needsMyAction).sort((a, b) => (a.role === 'payer' ? a.deadline : Infinity) - (b.role === 'payer' ? b.deadline : Infinity) || a.matchedAt - b.matchedAt)
}
export function tradeStatusText(trade: Trade) {
  if (trade.status === 'completed') return '交易完成'
  if (trade.status === 'overdue') return '逾期未打款'
  if (trade.role === 'payer') return trade.status === 'awaiting_payment' ? '待打款' : '等待乙方确认'
  return trade.status === 'awaiting_payment' ? '等待甲方打款' : '待确认收款'
}
export function tradeTitle(trade: Trade) {
  return `${LEVEL_BY_ID[trade.stage].name} · ${trade.role === 'payer' ? '召唤打款' : '传承收款'}`
}
export const COUNTERPARTY_NOTE = `${TRIAL_MODE ? '体验版' : '当前版本'}未接入真实撮合，对方为系统模拟，约 ${COUNTERPARTY_DELAY_MS / 60_000} 分钟内自动完成操作；不产生真实转账。`

export function isTrade(value: unknown): value is Trade {
  if (!value || typeof value !== 'object') return false
  const t = value as Trade
  return typeof t.id === 'string' && ['payer', 'receiver'].includes(t.role) && Object.hasOwn(LEVEL_BY_ID, t.stage)
    && Number.isSafeInteger(t.amountCents) && t.amountCents >= 0 && Number.isFinite(t.matchedAt) && Number.isFinite(t.deadline)
    && !!t.counterparty && typeof t.counterparty.uid === 'string'
    && ['awaiting_payment', 'awaiting_confirm', 'completed', 'overdue'].includes(t.status)
}
