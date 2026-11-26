import { LEVEL_BY_ID } from './game-data'
import type { ProductState } from './product-state'
import { matchAt, type Entry } from './summon-preview'

/** 一笔暂扣中的蟠桃：点召唤时暂扣召唤蟠桃，召唤失败退还，悟空进猴舍时扣除 */
export type LockedItem = { key: string; entry: Entry; name: string; realm: string; cents: number; summonCents: number; trainCents: number; phase: 'reserved' | 'paying' | 'confirming'; status: string; next: string; until?: number; href: string }

export function lockedItems(state: ProductState | null | undefined): LockedItem[] {
  if (!state) return []
  const items: LockedItem[] = []
  for (const entry of state.entries) {
    const level = LEVEL_BY_ID[entry.stage]
    const summonCents = entry.summonFee ?? Math.round(level.summonCost * 100)
    const base = { key: entry.key, entry, name: level.name, realm: level.realm, cents: entry.paid, summonCents: Math.min(summonCents, entry.paid), trainCents: Math.max(0, entry.paid - summonCents) }
    if (entry.status === 'waiting') items.push({ ...base, phase: 'reserved', status: '已参与召唤 · 等待匹配', next: '召唤失败全额退还；召唤成功并完成支付结算、悟空进猴舍时扣除。', until: matchAt(entry), href: `/world?stage=${entry.stage}` })
    else if (entry.status === 'success') {
      const trade = state.trades.find(t => t.entryKey === entry.key && (t.status === 'awaiting_payment' || t.status === 'awaiting_confirm'))
      if (!trade) continue
      if (trade.status === 'awaiting_payment') items.push({ ...base, phase: 'paying', status: '召唤成功 · 待我支付', next: '按时完成支付结算、传承人确认后，悟空进猴舍并扣除；逾期未支付全部充公。', until: trade.deadline, href: `/me/trades/${encodeURIComponent(trade.id)}` })
      else items.push({ ...base, phase: 'confirming', status: '已支付 · 等传承人确认', next: '传承人确认到账后，悟空进猴舍并扣除。', href: `/me/trades/${encodeURIComponent(trade.id)}` })
    }
  }
  return items
}
export const lockedTotal = (items: LockedItem[]) => items.reduce((sum, item) => sum + item.cents, 0)
