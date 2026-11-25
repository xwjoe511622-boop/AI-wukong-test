const { test } = require('node:test')
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
const fs = require('node:fs')
const ts = require('typescript')

// Transpile the app's TypeScript in memory; this test requires Node's react-server condition.
require.extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  })
  module._compile(output.outputText, filename)
}
const { db, pool } = require('../lib/db/index.ts')
const { players, relations, rewards } = require('../lib/db/schema.ts')
const { distributeSettlementRewards } = require('../lib/profile-rewards.ts')
const { eq } = require('drizzle-orm')

test('真实数据库事务：分账、叠加、防重复与完整回滚', { skip: !process.env.DATABASE_URL }, async () => {
  const userId = randomUUID()
  const rollback = new Error('TEST_ROLLBACK_ONLY')
  try {
    await db.transaction(async tx => {
      await tx.insert(players).values({ userId, balanceCents: 100000, owned: [] })
      const members = Array.from({ length: 100 }, (_, i) => ({ userId, memberId: randomUUID(), generation: i < 10 ? 1 : i === 10 ? 2 : i === 11 ? 3 : 4 }))
      await tx.insert(relations).values(members)
      for (const [index, expected] of [[0, 1200], [10, 1000], [11, 700], [12, 200]]) {
        const source = members[index]
        const settlement = randomUUID()
        await distributeSettlementRewards(tx, source.memberId, settlement, 10000)
        await distributeSettlementRewards(tx, source.memberId, settlement, 10000)
        const rows = await tx.select().from(rewards).where(eq(rewards.userId, userId))
        const current = rows.filter(r => r.sourceSettlementId === settlement)
        assert.equal(current.length, source.generation <= 3 ? 2 : 1)
        assert.equal(current.reduce((n, r) => n + r.amountCents, 0), expected)
        assert.ok(current.every(r => r.sourceProfitCents === 10000 && r.sourceUserId === source.memberId))
      }
      const [account] = await tx.select().from(players).where(eq(players.userId, userId))
      assert.equal(account.balanceCents, 103100)
      const rows = await tx.select().from(rewards).where(eq(rewards.userId, userId))
      assert.equal(rows.length, 7)
      throw rollback
    })
    assert.fail('验证事务必须回滚')
  } catch (error) {
    assert.equal(error, rollback)
    assert.deepEqual(await db.select({ id: players.userId }).from(players).where(eq(players.userId, userId)), [])
    assert.deepEqual(await db.select({ id: rewards.id }).from(rewards).where(eq(rewards.userId, userId)), [])
    assert.deepEqual(await db.select({ id: relations.memberId }).from(relations).where(eq(relations.userId, userId)), [])
  } finally {
    await pool.end()
  }
})
