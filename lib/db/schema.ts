import { bigint, index, integer, jsonb, pgTable, primaryKey, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import type { GameResult, LedgerEntry, OwnedMonkey } from '../game-types'

export const players = pgTable('wukong_players', {
  userId: uuid('userId').primaryKey(),
  balanceCents: bigint('balance_cents', { mode: 'number' }).notNull().default(888888),
  owned: jsonb('owned').$type<OwnedMonkey[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sessions = pgTable('wukong_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: uuid('userId').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const ledger = pgTable('wukong_ledger', {
  id: uuid('id').primaryKey(),
  userId: uuid('userId').notNull(),
  requestId: uuid('request_id').notNull(),
  kind: text('kind').$type<LedgerEntry['kind']>().notNull(),
  amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
  balanceCents: bigint('balance_cents', { mode: 'number' }).notNull(),
  result: jsonb('result').$type<GameResult>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [unique().on(table.userId, table.requestId)])

export const profiles = pgTable('wukong_profiles', {
  userId: uuid('userId').primaryKey(),
  inviteCode: text('invite_code').notNull().unique(),
  invitedBy: uuid('invited_by'),
  joinedAt: timestamp('joined_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
export const relations = pgTable('wukong_relations', {
  userId: uuid('userId').notNull(),
  memberId: uuid('member_id').notNull(),
  generation: integer('generation').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [primaryKey({ columns: [t.userId, t.memberId] }), index('wukong_relations_member_idx').on(t.memberId)])
export const rewards = pgTable('wukong_rewards', {
  id: uuid('id').primaryKey(),
  userId: uuid('userId').notNull(),
  rewardType: text('reward_type').$type<'companion' | 'tribe'>().notNull(),
  relationshipGeneration: integer('relationship_generation'),
  tribeLevel: integer('tribe_level'),
  rewardRate: integer('reward_rate').notNull(),
  sourceUserId: uuid('source_user_id').notNull(),
  sourceSettlementId: uuid('source_settlement_id').notNull(),
  sourceProfitCents: bigint('source_profit_cents', { mode: 'number' }).notNull(),
  amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [unique().on(t.userId, t.sourceSettlementId, t.rewardType), index('wukong_rewards_user_created_idx').on(t.userId, t.createdAt.desc(), t.id.desc())])
