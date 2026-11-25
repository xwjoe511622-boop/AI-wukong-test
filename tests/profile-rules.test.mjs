import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
require('../scripts/register-typescript.cjs')
const { rewardParts, tribeTier } = require('../lib/profile-rules.ts')

test('部族晋升同时满足同行者与全部成员门槛', () => {
  for (const [direct, members, level] of [[0,0,0],[4,100,0],[20,49,0],[5,50,1],[14,150,1],[15,149,1],[15,150,2],[29,300,2],[30,299,2],[30,300,3],[100,1000,3]]) {
    assert.equal(tribeTier(direct, members)?.level ?? 0, level)
  }
})
test('Ⅱ阶部族：第一代10%+3%、第二代5%+3%、更深仅3%，分别记账', () => {
  for (const [generation, expected] of [[1,1300],[2,800],[3,300],[50,300]]) {
    const parts = rewardParts(10000, generation, 2)
    assert.equal(parts.reduce((n, p) => n + p.amountCents, 0), expected)
    assert.equal(parts.length, generation <= 2 ? 2 : 1)
    assert.equal(parts.find(p => p.type === 'tribe')?.amountCents, 300)
  }
})
test('第三代没有同行奖励，未达Ⅰ阶没有部族奖励', () => {
  assert.deepEqual(rewardParts(10000, 3, 0), [])
  assert.deepEqual(rewardParts(10000, 2, 0), [{ type: 'companion', rate: 5, amountCents: 500 }])
  assert.deepEqual(rewardParts(10000, 1, 0), [{ type: 'companion', rate: 10, amountCents: 1000 }])
})
test('无盈利、负数、非整数不发奖，最小单位正确舍入', () => {
  for (const amount of [0, -100, 100.5, NaN, Infinity]) assert.deepEqual(rewardParts(amount, 1, 3), [])
  assert.equal(rewardParts(5, 1, 0)[0].amountCents, 1)
  assert.deepEqual(rewardParts(1, 1, 1), [])
})
