import 'server-only'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { and, desc, eq, gt } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { db } from './db'
import { ledger, players, sessions } from './db/schema'
import { LEVEL_BY_ID, PLATFORM_PROFIT_FEE } from './game-data'
import { isRealmOpen } from './schedule'
import { distributeSettlementRewards } from './profile-rewards'
import type { GameCommand, GameResult, InheritResult, OwnedMonkey, PlayerSnapshot } from './game-types'

export const SESSION_COOKIE = '__Host-wukong-session'
export const SESSION_AGE = 365 * 24 * 60 * 60
const DAY_MS = 24 * 60 * 60 * 1000
const WELCOME_CENTS = 888888
const cents = (value: number) => Math.round(value * 100)
const hash = (token: string) => createHash('sha256').update(token).digest('hex')

export class GameError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

export async function getPlayerId(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null
  const [session] = await db.select({ userId: sessions.userId }).from(sessions)
    .where(and(eq(sessions.tokenHash, hash(token)), gt(sessions.expiresAt, new Date()))).limit(1)
  return session?.userId ?? null
}

export async function createPlayer() {
  const token = randomBytes(32).toString('hex')
  const userId = randomUUID()
  await db.transaction(async (tx) => {
    await tx.insert(players).values({ userId, balanceCents: WELCOME_CENTS, owned: [] })
    await tx.insert(sessions).values({ tokenHash: hash(token), userId, expiresAt: new Date(Date.now() + SESSION_AGE * 1000) })
    await tx.insert(ledger).values({
      id: randomUUID(), userId, requestId: randomUUID(), kind: 'welcome',
      amountCents: WELCOME_CENTS, balanceCents: WELCOME_CENTS, result: null,
    })
  })
  return { token, userId }
}

export async function readPlayer(userId: string): Promise<PlayerSnapshot> {
  return db.transaction(async (tx) => {
    const [player] = await tx.select().from(players).where(eq(players.userId, userId)).for('share')
    if (!player) throw new GameError('匿名存档不存在，请刷新后重试。', 401)
    const entries = await tx.select().from(ledger).where(eq(ledger.userId, userId))
      .orderBy(desc(ledger.createdAt), desc(ledger.id)).limit(100)
    return {
      playerId: userId, balance: player.balanceCents / 100, owned: player.owned,
      ledger: entries.map((entry) => ({
        id: entry.id, kind: entry.kind, amount: entry.amountCents / 100,
        balance: entry.balanceCents / 100, createdAt: entry.createdAt.toISOString(), result: entry.result,
      })),
    }
  })
}

export async function executeGame(userId: string, command: GameCommand): Promise<GameResult> {
  return db.transaction(async (tx) => {
    // Lock the player before checking idempotency so concurrent requests serialize.
    const [player] = await tx.select().from(players).where(eq(players.userId, userId)).for('update')
    if (!player) throw new GameError('匿名会话已失效，请刷新。', 401)
    const [previous] = await tx.select().from(ledger)
      .where(and(eq(ledger.userId, userId), eq(ledger.requestId, command.requestId))).limit(1)
    if (previous) return previous.result

    const now = Date.now()
    let owned = [...player.owned]
    let delta = 0
    let result: GameResult
    if (command.action === 'summon') {
      const level = LEVEL_BY_ID[command.stage]
      if (!isRealmOpen(level, new Date(now))) throw new GameError('尚未到北京时间召唤时刻。')
      if (owned.length >= 200) throw new GameError('猴舍已满，请先完成传承。')
      delta = -cents(level.cost)
      const monkey: OwnedMonkey = {
        id: randomUUID(), stage: level.id, status: 'cultivating', contractValue: level.cost,
        cycleProgress: 0, cycleTotal: level.cycleDays, cycleEndsAt: now + DAY_MS, createdAt: now,
      }
      owned.unshift(monkey)
      result = monkey
    } else {
      const index = owned.findIndex((monkey) => monkey.id === command.id)
      if (index === -1) throw new GameError('悟空不存在，或已经完成传承。', 409)
      const monkey = owned[index]
      const level = LEVEL_BY_ID[monkey.stage]
      if (command.action === 'cycle') {
        if (monkey.cycleProgress >= monkey.cycleTotal) throw new GameError('所有修炼周期已完成。', 409)
        if (now < monkey.cycleEndsAt) throw new GameError('本期修炼尚未结束。', 409)
        delta = -cents(level.perCycleCost)
        const progress = monkey.cycleProgress + 1
        result = {
          ...monkey, cycleProgress: progress,
          contractValue: Math.round(cents(monkey.contractValue) * (100 + level.gainPct) / 100) / 100,
          cycleEndsAt: now + DAY_MS, status: progress >= monkey.cycleTotal ? 'idle' : 'cultivating',
        }
        owned[index] = result
      } else {
        const original = cents(level.cost)
        const profit = Math.max(0, cents(monkey.contractValue) - original)
        const fee = Math.round(profit * PLATFORM_PROFIT_FEE)
        delta = original + profit - fee
        result = { stage: monkey.stage, original: original / 100, profit: profit / 100, fee: fee / 100, received: delta / 100 } satisfies InheritResult
        owned = owned.filter((item) => item.id !== monkey.id)
      }
    }
    const balance = player.balanceCents + delta
    if (balance < 0) throw new GameError('蟠桃余额不足。', 409)
    if (!Number.isSafeInteger(balance) || balance > 1000000000000) throw new GameError('余额超过支持范围。')
    await tx.update(players).set({ balanceCents: balance, owned }).where(eq(players.userId, userId))
    const settlementId = randomUUID()
    await tx.insert(ledger).values({
      id: settlementId, userId, requestId: command.requestId, kind: command.action,
      amountCents: delta, balanceCents: balance, result,
    })
    if (command.action === 'inherit' && result && 'profit' in result) {
      await distributeSettlementRewards(tx, userId, settlementId, cents(result.profit))
    }
    return result
  })
}
