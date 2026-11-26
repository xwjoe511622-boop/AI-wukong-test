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

test('每天只能修炼当天那一次，消耗1蟠桃，漏掉的昨天不能补', () => {
  assert.equal(due(pending, now), 1)
  assert.equal(quote([pending], now, false).total, 100)
  const next = transition(makeState(), { type: 'train', ids: [pending.id], accelerate: false, expected: 100 }, now).state
  assert.equal(next.contracts[0].completed, 1)
  assert.deepEqual(next.contracts[0].trainedDays, [1])
  assert.equal(next.balance, 9900)
})
test('契约功能已取消：契约操作不可用，不扣蟠桃', () => {
  const product = { ...createProduct(now, '1234567890abcdef', { balance: 100_000, usdt: 1_000_000, starters: true }), contracts: [pending], history: [] }
  const result = productTransition(product, { type: 'cultivate', action: { type: 'contract', id: pending.id } }, now)
  assert.equal(result.state, product)
  assert.equal(result.message, '当前操作不可用。')
})
test('周期结束后不能再补修炼，直接进入传承；承接人支付前不能领取', () => {
  const late = endsAt(pending)
  let product = { ...createProduct(now, '1234567890abcdef', { balance: 100_000, usdt: 1_000_000, starters: true }), contracts: [pending], history: [] }
  assert.equal(phase(pending, late), '传承中')
  assert.equal(productTransition(product, { type: 'cultivate', action: { type: 'train', ids: [pending.id], accelerate: false, expected: 100 } }, late).state, product)
  assert.equal(productTransition(product, { type: 'cultivate', action: { type: 'claim', id: pending.id } }, late).state, product)
  // 等下一轮同阶段召唤匹配到承接人，承接人支付后变为传承完成（待确认收款）；一天没修炼，按原修炼值支付
  const paidAt = nextMatchAfter('wukong', late) + COUNTERPARTY_DELAY_MS
  product = productTransition(product, { type: 'tick' }, paidAt - 1).state
  assert.equal(phase(product.contracts[0], paidAt - 1), '传承中')
  product = productTransition(product, { type: 'tick' }, paidAt).state
  assert.equal(phase(product.contracts[0], paidAt), '传承完成')
  assert.equal(product.trades.find(t => t.contractId === pending.id).amountCents, pending.principal)
})
test('批量报价只算现在能修炼的悟空，无额外费', () => {
  const second = { ...pending, id: 'trained', completed: 1, trainedDays: [1] }
  const q = quote([pending, second], now, false)
  assert.equal(q.items.length, 1)
  assert.equal(q.fee, 0)
  assert.equal(q.total, 100)
})
test('修炼台的展示：点过的天才发光、才涨修炼值，漏掉的天如实记下', () => {
  const { progress, journal, liveValue, RULES } = require('../lib/cultivation-preview.ts')
  const total = RULES.wukong.cycleDays
  const c = { id: 'manual', stage: 'wukong', principal: 20000, started: now, completed: 0, trainedDays: [] }
  const span = RULES.wukong.days * DAY
  assert.equal(progress(c, now).day, 1)
  assert.equal(progress(c, now + span).done, true)
  assert.equal(journal(c, now).length, 1)
  assert.equal(journal(c, now)[0].text, '等待修炼')
  assert.equal(journal(c, now + span).length, total)
  assert.ok(journal(c, now + span).every(n => n.missed))
  // 一天没点：修炼值不涨
  assert.equal(liveValue(c, now + span), 200)
  // 只点了第一天：涨 1/5 的修炼加成，当天内逐渐累积
  const one = { ...c, completed: 1, trainedDays: [0] }
  assert.ok(liveValue(one, now + DAY / 2) > 200 && liveValue(one, now + DAY / 2) < liveValue(one, now + DAY))
  assert.ok(Math.abs(liveValue(one, now + span) - 200 * (1 + RULES.wukong.gain / 100 / 5)) < 1e-9)
  assert.equal(journal(one, now + span).filter(n => !n.missed).length, 1)
})
