import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
require('../scripts/register-typescript.cjs')
const { DAY, due, quote, transition, endsAt, phase } = require('../lib/cultivation-preview.ts')
const { createProduct, productTransition } = require('../lib/product-state.ts')
const { COUNTERPARTY_DELAY_MS, nextMatchAfter } = require('../lib/trade.ts')
const now = Date.UTC(2026, 8, 19)
const pending = { id: 'pending', stage: 'wukong', principal: 50000, started: now - DAY, completed: 0 }
const makeState = () => ({ version: 2, balance: 10000, contracts: [pending], history: [] })

test('召唤成功后已到期两次，消耗2蟠桃，无需契约', () => {
  assert.equal(due(pending, now), 2)
  assert.equal(quote([pending], now, false).total, 200)
  const next = transition(makeState(), { type: 'train', ids: [pending.id], accelerate: false, expected: 200 }, now).state
  assert.equal(next.contracts[0].completed, 2)
  assert.equal(next.balance, 9800)
})
test('契约功能已取消：契约操作不可用，不扣蟠桃', () => {
  const product = { ...createProduct(now, '1234567890abcdef', { balance: 100_000, usdt: 1_000_000, starters: true }), contracts: [pending], history: [] }
  const result = productTransition(product, { type: 'cultivate', action: { type: 'contract', id: pending.id } }, now)
  assert.equal(result.state, product)
  assert.equal(result.message, '当前操作不可用。')
})
test('生命周期结束后补齐修炼进入传承，承接人打款前不能领取', () => {
  const late = endsAt(pending) + DAY
  let product = { ...createProduct(now, '1234567890abcdef', { balance: 100_000, usdt: 1_000_000, starters: true }), contracts: [pending], history: [] }
  assert.equal(phase(pending, late), '待完成修炼')
  product = productTransition(product, { type: 'cultivate', action: { type: 'train', ids: [pending.id], accelerate: false, expected: 500 } }, late).state
  assert.equal(phase(product.contracts[0], late), '传承中')
  assert.equal(productTransition(product, { type: 'cultivate', action: { type: 'claim', id: pending.id } }, late).state, product)
  // 等下一轮同阶段召唤匹配到承接人，承接人打款后变为传承完成（待确认收款）
  const paidAt = nextMatchAfter('wukong', late) + COUNTERPARTY_DELAY_MS
  product = productTransition(product, { type: 'tick' }, paidAt - 1).state
  assert.equal(phase(product.contracts[0], paidAt - 1), '传承中')
  product = productTransition(product, { type: 'tick' }, paidAt).state
  assert.equal(phase(product.contracts[0], paidAt), '传承完成')
})
test('批量报价去除已圆满任务，仅扣当前到期次数，无额外费', () => {
  const second = { ...pending, id: 'complete', completed: 5 }
  const q = quote([pending, second], now, false)
  assert.equal(q.items.length, 1)
  assert.equal(q.fee, 0)
  assert.equal(q.total, 200)
})
