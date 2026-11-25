import 'server-only'
import { randomUUID } from 'node:crypto'
import { and, count, eq } from 'drizzle-orm'
import { db } from './db'
import { players, relations, rewards } from './db/schema'
import { rewardParts, tribeTier } from './profile-rules'

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
export async function distributeSettlementRewards(tx: Transaction, sourceUserId: string, sourceSettlementId: string, profitCents: number) {
  if (profitCents <= 0) return
  // Recipients can only come from the authenticated source member's persisted ancestor chain.
  const ancestors = await tx.select().from(relations).where(eq(relations.memberId, sourceUserId)).orderBy(relations.userId)
  for (const ancestor of ancestors) {
    const userId = ancestor.userId
    const [members] = await tx.select({ n: count() }).from(relations).where(eq(relations.userId, userId))
    const [direct] = await tx.select({ n: count() }).from(relations).where(and(eq(relations.userId, userId), eq(relations.generation, 1)))
    const tier = tribeTier(direct.n, members.n)
    const parts = rewardParts(profitCents, ancestor.generation, tier?.level ?? 0)
    if (!parts.length) continue
    const [recipient] = await tx.select({ balance: players.balanceCents }).from(players).where(eq(players.userId, userId)).for('update')
    if (!recipient) throw new Error('奖励接收账户不存在')
    let credit = 0
    for (const part of parts) {
      const inserted = await tx.insert(rewards).values({
        id: randomUUID(), userId, rewardType: part.type,
        relationshipGeneration: part.type === 'companion' ? ancestor.generation : null,
        tribeLevel: part.type === 'tribe' ? tier!.level : null, rewardRate: part.rate,
        sourceUserId, sourceSettlementId, sourceProfitCents: profitCents, amountCents: part.amountCents,
      }).onConflictDoNothing({ target: [rewards.userId, rewards.sourceSettlementId, rewards.rewardType] }).returning({ amount: rewards.amountCents })
      credit += inserted[0]?.amount ?? 0
    }
    if (credit) {
      const next = recipient.balance + credit
      if (!Number.isSafeInteger(next) || next > 1000000000000) throw new Error('奖励余额超过支持范围')
      await tx.update(players).set({ balanceCents: next }).where(eq(players.userId, userId))
    }
  }
}
