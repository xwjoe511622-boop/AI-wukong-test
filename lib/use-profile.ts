'use client'
import { useProduct } from '@/components/product-provider'
import { beijingDate } from './summon-preview'
import { tribeTier, type ProfileList, type ProfileSummary } from './profile-rules'

export type MemberSort = 'newest' | 'oldest' | 'reward'
export const MEMBER_SORTS: [MemberSort, string][] = [['newest', '最新加入'], ['oldest', '最早加入'], ['reward', '带来奖励最多']]
export function useProfile() {
  const { state, ready, now } = useProduct()
  // 门槛只统计有效用户（持有不少于 50 蟠桃）
  const companions = state?.members.filter(m => m.generation === 1 && m.valid !== false).length ?? 0
  const members = state?.members.filter(m => m.valid !== false).length ?? 0
  const sum = (type?: 'companion' | 'tribe') => (state?.rewards ?? []).filter(r => !type || r.rewardType === type).reduce((total, r) => total + r.amountCents, 0)
  const data: ProfileSummary | undefined = state ? { inviteCode: state.inviteCode, companions, members, level: tribeTier(companions, members)?.level ?? 0, companionCents: sum('companion'), tribeCents: sum('tribe'), totalCents: sum(), todayCents: state.rewards.filter(r => beijingDate(Date.parse(r.createdAt)) === beijingDate(now)).reduce((total, r) => total + r.amountCents, 0) } : undefined
  return { data, error: undefined as Error | undefined, isLoading: !ready, mutate: async () => data }
}
/** 成员可按代数（1 / 2 / 3 表示第三代及更深）和是否有效用户分类查询 */
export function useProfileList(section: string, filter = 'all', page = 0, validity: 'all' | 'valid' | 'invalid' = 'all', keyword = '', sort: MemberSort = 'newest') {
  const { state, ready } = useProduct()
  const kinds: Record<string, string[]> = { lock: ['summon_lock'], return: ['summon_return'], contracts: ['contract'], cultivation: ['cycle'], inherit: ['inherit'], inheritance: ['inherit'], summon: ['summon_lock', 'summon', 'summon_return'], companion: ['companion'], tribe: ['tribe'], recharge: ['recharge', 'buy_pay'], pay: ['summon_pay', 'summon_forfeit'], transfer: ['transfer_out', 'transfer_in'] }
  // 金额为 0 的流水只是状态说明（已由通知承担），不进资产明细
  const records = section === 'records' ? (state?.records ?? []).filter(r => r.amountCents !== 0).filter(r => filter === 'all' || (kinds[filter] ?? [filter]).includes(r.kind)) : []
  const rewards = section === 'rewards' ? (state?.rewards ?? []).filter(r => filter === 'all' || r.rewardType === filter) : []
  // 每位成员累计为我带来的奖励：同行奖励与部族奖励相加
  const rewardBy = new Map<string, number>()
  for (const r of state?.rewards ?? []) rewardBy.set(r.sourceUserId, (rewardBy.get(r.sourceUserId) ?? 0) + r.amountCents)
  const members = ['companions', 'tribe'].includes(section) ? (state?.members ?? []).filter(m => section === 'tribe' || m.generation <= 2).filter(m => filter === 'all' || (filter === '3' ? m.generation >= 3 : m.generation === Number(filter))).filter(m => validity === 'all' || (m.valid !== false) === (validity === 'valid')).filter(m => !keyword.trim() || m.uid.toLowerCase().includes(keyword.trim().toLowerCase())).map(m => ({ ...m, rewardCents: rewardBy.get(m.uid) ?? 0 })).sort((a, b) => sort === 'reward' ? b.rewardCents - a.rewardCents || Date.parse(b.joinedAt) - Date.parse(a.joinedAt) : (sort === 'oldest' ? 1 : -1) * (Date.parse(a.joinedAt) - Date.parse(b.joinedAt))) : []
  const data: (ProfileList & { total: number }) | undefined = state ? { total: Math.max(records.length, rewards.length, members.length), records: records.slice(page * 30, (page + 1) * 30), members: members.slice(page * 30, (page + 1) * 30), rewards: rewards.slice(page * 30, (page + 1) * 30), hasMore: Math.max(records.length, rewards.length, members.length) > (page + 1) * 30 } : undefined
  return { data, error: undefined as Error | undefined, isLoading: !ready, mutate: async () => data }
}
