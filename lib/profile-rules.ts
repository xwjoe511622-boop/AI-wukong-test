import { COMPANION_REWARD, TRIBE_REWARD } from './game-data'
export const TRIBE_TIERS = Object.values(TRIBE_REWARD).map((tier, index) => ({
  level: index + 1, name: `部族${['Ⅰ', 'Ⅱ', 'Ⅲ'][index]}阶`, companions: tier.direct, members: tier.members, rate: tier.rate,
}))
export function tribeTier(companions: number, members: number) {
  return [...TRIBE_TIERS].reverse().find(t => companions >= t.companions && members >= t.members) ?? null
}
export function rewardParts(profitCents: number, generation: number, level: number) {
  if (!Number.isSafeInteger(profitCents) || profitCents <= 0) return []
  const parts: { type: 'companion' | 'tribe'; rate: number; amountCents: number }[] = []
  const companionRate = [0, ...Object.values(COMPANION_REWARD)][generation] ?? 0
  if (companionRate) parts.push({ type: 'companion', rate: companionRate, amountCents: Math.floor((profitCents * companionRate + 50) / 100) })
  const tier = TRIBE_TIERS.find(t => t.level === level)
  if (tier) parts.push({ type: 'tribe', rate: tier.rate, amountCents: Math.floor((profitCents * tier.rate + 50) / 100) })
  return parts.filter(p => p.amountCents > 0)
}
export const generationName = (generation: number) => ['','第一代','第二代'][generation] ?? '部族成员'
export const shortUid = (id: string) => `${id.slice(0, 8)}…`
export const profileTime = (time: string) => new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(time))
export const LEDGER_LABELS: Record<string, string> = { welcome: '新手赠送', summon: '召唤成功', adopt: '历史契约', contract: '历史契约', cycle: '修炼消耗', inherit: '传承所得', summon_lock: '召唤暂扣', summon_return: '召唤退还', companion: '同行奖励', tribe: '部族奖励', recharge: '购买蟠桃', buy_pay: '购买支付', summon_pay: '修炼值打款', summon_forfeit: '逾期违约', transfer_out: '转出', transfer_in: '接收' }
export type ProfileSummary = {
  inviteCode: string; companions: number; members: number; level: number;
  companionCents: number; tribeCents: number; todayCents: number; totalCents: number;
}
export type RewardRecord = {
  id: string; rewardType: 'companion' | 'tribe'; relationshipGeneration: number | null;
  tribeLevel: number | null; rewardRate: number; sourceUserId: string;
  sourceProfitCents: number; amountCents: number; createdAt: string;
}
export type MemberRecord = { uid: string; joinedAt: string; days: number; valid?: boolean; generation?: number; /** 成员自己设置的头像；没有则显示默认图标 */ avatar?: string; /** 这位成员累计为我带来的奖励（分） */ rewardCents?: number }
/** currency 缺省为蟠桃；usdt 记录显示为 USDT */
export type AccountRecord = { id: string; kind: string; amountCents: number; createdAt: string; description: string; currency?: 'peach' | 'usdt' }
export type ProfileList = { rewards: RewardRecord[]; members: MemberRecord[]; records: AccountRecord[]; hasMore: boolean }
