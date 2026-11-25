import 'server-only'
import { randomBytes } from 'node:crypto'
import { and, count, desc, eq, gte, inArray, sum } from 'drizzle-orm'
import { db } from './db'
import { ledger, profiles, relations, rewards } from './db/schema'
import { GameError } from './game-service'
import { LEVEL_BY_ID } from './game-data'
import { generationName, tribeTier, type ProfileSummary, type ProfileList } from './profile-rules'

export async function ensureProfile(userId: string) {
  await db.insert(profiles).values({ userId, inviteCode: `WK${randomBytes(8).toString('hex').toUpperCase()}` }).onConflictDoNothing({ target: profiles.userId })
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  return profile
}
export async function readProfile(userId: string): Promise<ProfileSummary> {
  const profile = await ensureProfile(userId)
  const now = new Date()
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const [counts, direct, totals, today] = await Promise.all([
    db.select({ value: count() }).from(relations).where(eq(relations.userId, userId)),
    db.select({ value: count() }).from(relations).where(and(eq(relations.userId, userId), eq(relations.generation, 1))),
    db.select({ type: rewards.rewardType, value: sum(rewards.amountCents) }).from(rewards).where(eq(rewards.userId, userId)).groupBy(rewards.rewardType),
    db.select({ value: sum(rewards.amountCents) }).from(rewards).where(and(eq(rewards.userId, userId), gte(rewards.createdAt, new Date(`${date}T00:00:00+08:00`)))),
  ])
  const companionCents = Number(totals.find(t => t.type === 'companion')?.value ?? 0)
  const tribeCents = Number(totals.find(t => t.type === 'tribe')?.value ?? 0)
  return { inviteCode: profile.inviteCode, companions: direct[0].value, members: counts[0].value, level: tribeTier(direct[0].value, counts[0].value)?.level ?? 0, companionCents, tribeCents, todayCents: Number(today[0].value ?? 0), totalCents: companionCents + tribeCents }
}
export async function joinInvitation(userId: string, code: string) {
  await ensureProfile(userId)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.transaction(async tx => {
        // Invite codes are public lookup keys; all relationship writes are scoped to the authenticated invitee.
        const [inviter] = await tx.select({ userId: profiles.userId }).from(profiles).where(eq(profiles.inviteCode, code)).limit(1)
        if (!inviter) throw new GameError('邀请码无效，请向邀请者确认。')
        if (inviter.userId === userId) throw new GameError('不能接受自己的邀请。')
        const [self] = await tx.select().from(profiles).where(eq(profiles.userId, userId)).for('update')
        if (self.invitedBy === inviter.userId) return { ok: true }
        if (self.invitedBy) throw new GameError('你已经建立同行关系，不能重复绑定。', 409)
        const [existing] = await tx.select({ n: count() }).from(relations).where(eq(relations.userId, userId))
        if (existing.n) throw new GameError('已有同行者，不能再变更所属关系。', 409)
        const ancestors = await tx.select().from(relations).where(eq(relations.memberId, inviter.userId))
        if (ancestors.some(a => a.userId === userId)) throw new GameError('不能形成循环同行关系。', 409)
        await tx.update(profiles).set({ invitedBy: inviter.userId, joinedAt: new Date() }).where(eq(profiles.userId, userId))
        await tx.insert(relations).values([{ userId: inviter.userId, memberId: userId, generation: 1 }, ...ancestors.map(a => ({ userId: a.userId, memberId: userId, generation: a.generation + 1 }))])
        return { ok: true }
      }, { isolationLevel: 'serializable' })
    } catch (error) {
      const e = error as { code?: string; cause?: { code?: string } }
      if ((e.code === '40001' || e.cause?.code === '40001') && attempt < 2) continue
      throw error
    }
  }
}
export async function readProfileList(userId: string, section: string, filter: string, offset: number): Promise<ProfileList> {
  const result: ProfileList = { rewards: [], members: [], records: [], hasMore: false }
  const limit = 30
  if (section === 'companions' || section === 'tribe') {
    const rows = await db.select({ memberId: relations.memberId, joinedAt: relations.createdAt }).from(relations)
      .where(and(eq(relations.userId, userId), section === 'companions' ? eq(relations.generation, 1) : undefined))
      .orderBy(desc(relations.createdAt), desc(relations.memberId)).offset(offset).limit(limit + 1)
    result.hasMore = rows.length > limit
    result.members = rows.slice(0, limit).map(r => ({ uid: `${r.memberId.slice(0, 8)}…`, joinedAt: r.joinedAt.toISOString(), days: Math.max(0, Math.floor((Date.now() - r.joinedAt.getTime()) / 86400000)) }))
  } else if (section === 'rewards') {
    const rows = await db.select().from(rewards).where(and(eq(rewards.userId, userId), filter === 'companion' || filter === 'tribe' ? eq(rewards.rewardType, filter) : undefined)).orderBy(desc(rewards.createdAt), desc(rewards.id)).offset(offset).limit(limit + 1)
    result.hasMore = rows.length > limit
    result.rewards = rows.slice(0, limit).map(r => ({ id: r.id, rewardType: r.rewardType, relationshipGeneration: r.relationshipGeneration, tribeLevel: r.tribeLevel, rewardRate: r.rewardRate, sourceUserId: `${r.sourceUserId.slice(0, 8)}…`, sourceProfitCents: r.sourceProfitCents, amountCents: r.amountCents, createdAt: r.createdAt.toISOString() }))
  } else {
    const kinds = filter === 'summon' || filter === 'contracts' ? ['summon'] : filter === 'cultivation' ? ['cycle'] : filter === 'inherit' ? ['inherit'] : filter === 'all' ? undefined : filter === 'lock' ? ['summon_lock'] : filter === 'return' ? ['summon_return'] : filter === 'recharge' ? ['recharge'] : filter === 'companion' || filter === 'tribe' ? [] : undefined
    const rows = kinds?.length === 0 ? [] : await db.select().from(ledger).where(and(eq(ledger.userId, userId), kinds ? inArray(ledger.kind, kinds as (typeof ledger.$inferSelect.kind)[]) : undefined)).orderBy(desc(ledger.createdAt), desc(ledger.id)).limit(offset + limit + 1)
    const rewardRows = filter === 'all' || filter === 'companion' || filter === 'tribe' ? await db.select().from(rewards).where(and(eq(rewards.userId, userId), filter === 'all' ? undefined : eq(rewards.rewardType, filter))).orderBy(desc(rewards.createdAt), desc(rewards.id)).limit(offset + limit + 1) : []
    const all = [
      ...rows.map(r => ({ id: r.id, kind: r.kind, amountCents: r.amountCents, createdAt: r.createdAt.toISOString(), description: r.result ? `${LEVEL_BY_ID[r.result.stage].name} · ${r.kind === 'inherit' ? '传承完成' : r.kind === 'cycle' ? '今日修炼' : '悟空结契'}` : '初入悟空世界' })),
      ...rewardRows.map(r => ({ id: r.id, kind: r.rewardType, amountCents: r.amountCents, createdAt: r.createdAt.toISOString(), description: r.rewardType === 'companion' ? `${generationName(r.relationshipGeneration ?? 0)}同行关系` : `${['','Ⅰ','Ⅱ','Ⅲ'][r.tribeLevel ?? 0]}阶部族 · ${r.rewardRate}%` })),
    ].sort((a,b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
    result.hasMore = all.length > offset + limit
    result.records = all.slice(offset, offset + limit)
  }
  return result
}
