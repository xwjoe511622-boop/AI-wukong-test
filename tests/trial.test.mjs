import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
// 体验版：必须在加载配置前打开
process.env.NEXT_PUBLIC_WUKONG_TRIAL = '1'
const require = createRequire(import.meta.url)
require('../scripts/register-typescript.cjs')
const { LEVELS, TRIAL_MODE } = require('../lib/game-data.ts')
const { RULES, DAY, quote } = require('../lib/cultivation-preview.ts')
const { roundFor, matchAt } = require('../lib/summon-preview.ts')
const { createProduct, productTransition: transition, parseProduct, walletAddress } = require('../lib/product-state.ts')
const { COUNTERPARTY_DELAY_MS, PAYMENT_WINDOW_MS, nextMatchAfter } = require('../lib/trade.ts')
// 承接人完成支付结算后，传承人（模拟）确认到账，悟空入舍
const payAndEnter = (s, at) => transition(transition(s, { type: 'trade-pay', id: s.trades.find(t => t.role === 'payer' && t.status === 'awaiting_payment').id }, at).state, { type: 'tick' }, at + COUNTERPARTY_DELAY_MS).state
const now = Date.parse('2026-09-19T10:00:00+08:00')
const initial = createProduct(now, '01234567-89ab-cdef-0123-456789abcdef')
const other = '0x' + 'ab'.repeat(20)

test('体验版：赠送 1000 蟠桃和 10000 USDT、七阶段全部开放、时间加速为 1 天', () => {
  assert.equal(TRIAL_MODE, true)
  assert.equal(initial.balance, 100_000)
  assert.equal(initial.usdt, 1_000_000)
  assert.ok(LEVELS.every(l => l.isOpen && l.runDays === 1))
  assert.deepEqual(LEVELS.map(l => l.cycleDays), [1, 3, 5, 8, 12, 15, 20])
  assert.ok(Object.values(RULES).every(r => r.days === 1))
  // 不预置悟空和成员，也没有任何额外加速
  assert.equal(initial.contracts.length, 0)
  assert.equal(initial.members.length, 0)
  assert.equal(initial.offset, 0)
})
test('体验版没有秒级加速：召唤按钟点匹配，修炼后要等满真实的 1 天才能传承', () => {
  const round = roundFor('stone_spirit', now)
  const pub = matchAt({ key: round.key, deadline: round.deadline })
  let s = transition(initial, { type: 'summon', action: { type: 'join', stage: 'stone_spirit', now } }, now).state
  assert.equal(s.offset, 0)
  assert.equal(transition(s, { type: 'tick' }, pub - 1).state.entries[0].status, 'waiting')
  s = transition(s, { type: 'tick' }, pub).state
  // 打款期与正式版相同：1 小时
  assert.equal(s.trades[0].deadline - pub, PAYMENT_WINDOW_MS)
  s = payAndEnter(s, pub)
  const c = s.contracts[0]
  assert.equal(s.offset, 0)
  // 原周期 1 天结束后，等下一轮同阶段召唤匹配到承接人
  const matchTime = nextMatchAfter('stone_spirit', pub + DAY)
  const almost = transition(s, { type: 'tick' }, matchTime - 1).state
  assert.equal(almost.trades.filter(t => t.role === 'receiver').length, 0)
  const done = transition(s, { type: 'tick' }, matchTime + COUNTERPARTY_DELAY_MS).state
  assert.notEqual(done.contracts[0].finishedAt, undefined)
  assert.equal(transition(s, { type: 'trial-summon', stage: 'stone_spirit' }, pub).state, s)
})
test('体验版：第七阶段召唤暂扣 100 蟠桃；进猴舍后点一次修炼扣满整个周期的 300，一天后传承返 USDT', () => {
  const round = roundFor('infinite_sage', now)
  const pub = matchAt({ key: round.key, deadline: round.deadline })
  let s = transition(initial, { type: 'summon', action: { type: 'join', stage: 'infinite_sage', now } }, now).state
  // 点召唤时只暂扣召唤蟠桃 100
  assert.equal(s.balance, initial.balance - 10_000)
  assert.equal(s.usdt, initial.usdt)
  s = transition(s, { type: 'tick' }, pub).state
  assert.equal(s.usdt, initial.usdt)
  s = payAndEnter(s, pub)
  assert.equal(s.usdt, initial.usdt - 500_000)
  let c = s.contracts.find(item => item.id.startsWith('summon-'))
  // 体验版每只悟空只点一次修炼：这一次扣 15 × 20 = 300 蟠桃，算整个周期
  const at = pub + COUNTERPARTY_DELAY_MS + 1000
  assert.equal(quote([c], at, false).total, 30_000)
  s = transition(s, { type: 'cultivate', action: { type: 'train', ids: [c.id], accelerate: false, expected: 30_000 } }, at).state
  c = s.contracts.find(item => item.id === c.id)
  assert.equal(c.completed, 1)
  assert.equal(quote([c], at + 1000, false).items.length, 0)
  const end = nextMatchAfter('infinite_sage', pub + DAY) + COUNTERPARTY_DELAY_MS
  s = transition(parseProduct(JSON.stringify(s)), { type: 'tick' }, end).state
  s = transition(s, { type: 'cultivate', action: { type: 'claim', id: c.id } }, end).state
  assert.equal(s.usdt, initial.usdt - 500_000 + 500_000 + 125_000 - 3_750)
  assert.equal(s.balance, initial.balance - 40_000)
})
test('USDT 余额不足以结算，1 小时后判定逾期违约，暂扣的召唤蟠桃全部充公', () => {
  const round = roundFor('infinite_sage', now)
  const pub = matchAt({ key: round.key, deadline: round.deadline })
  let s = transition(initial, { type: 'summon', action: { type: 'join', stage: 'infinite_sage', now } }, now).state
  s = transition(s, { type: 'transfer', currency: 'usdt', amountCents: 900_000, address: other }, now).state
  s = transition(s, { type: 'tick' }, pub).state
  assert.equal(transition(s, { type: 'trade-pay', id: s.trades[0].id }, pub).state, s)
  s = transition(s, { type: 'tick' }, pub + PAYMENT_WINDOW_MS).state
  assert.equal(s.entries[0].status, 'forfeited')
  assert.equal(s.trades[0].status, 'overdue')
  assert.equal(s.contracts.length, initial.contracts.length)
  assert.equal(s.balance, initial.balance - 10_000)
  assert.equal(s.usdt, 100_000)
  assert.deepEqual(parseProduct(JSON.stringify(parseProduct(JSON.stringify(s)))), parseProduct(JSON.stringify(s)))
})
test('USDT 余额不足时不能提交召唤', () => {
  const poor = { ...initial, usdt: 100 }
  assert.equal(transition(poor, { type: 'summon', action: { type: 'join', stage: 'stone_spirit', now } }, now).state, poor)
})
test('蟠桃和 USDT 可以转出与接收，并分别记账', () => {
  let s = transition(initial, { type: 'transfer', currency: 'peach', amountCents: 5_000, address: other }, now).state
  assert.equal(s.balance, initial.balance - 5_000)
  s = transition(s, { type: 'transfer', currency: 'usdt', amountCents: 20_000, address: other }, now).state
  assert.equal(s.usdt, initial.usdt - 20_000)
  s = transition(s, { type: 'demo-receive', currency: 'peach', amountCents: 1_000 }, now).state
  s = transition(s, { type: 'demo-receive', currency: 'usdt', amountCents: 2_000 }, now).state
  assert.equal(s.balance, initial.balance - 4_000)
  assert.equal(s.usdt, initial.usdt - 18_000)
  assert.deepEqual(s.records.map(r => [r.kind, r.currency ?? 'peach', r.amountCents]), [['transfer_in', 'usdt', 2_000], ['transfer_in', 'peach', 1_000], ['transfer_out', 'usdt', -20_000], ['transfer_out', 'peach', -5_000]])
})
test('转出校验：地址格式、不能转给自己、不能超额、数量有效', () => {
  for (const action of [
    { type: 'transfer', currency: 'peach', amountCents: 100, address: 'abc' },
    { type: 'transfer', currency: 'peach', amountCents: 100, address: walletAddress(initial.playerId) },
    { type: 'transfer', currency: 'peach', amountCents: initial.balance + 1, address: other },
    { type: 'transfer', currency: 'usdt', amountCents: 0, address: other },
    { type: 'transfer', currency: 'usdt', amountCents: 1.5, address: other },
    { type: 'demo-receive', currency: 'usdt', amountCents: -1 },
  ]) assert.equal(transition(initial, action, now).state, initial)
  assert.match(walletAddress(initial.playerId), /^0x[0-9a-f]{40}$/)
})
test('用 USDT 购买蟠桃：1蟠桃 = 1 USDT，分别记账；USDT 不足或数量无效时不变', () => {
  const s = transition(initial, { type: 'buy-peach', amountCents: 25_050 }, now).state
  assert.equal(s.balance, initial.balance + 25_050)
  assert.equal(s.usdt, initial.usdt - 25_050)
  assert.deepEqual(s.records.map(r => [r.kind, r.currency ?? 'peach', r.amountCents]), [['recharge', 'peach', 25_050], ['buy_pay', 'usdt', -25_050]])
  assert.deepEqual(parseProduct(JSON.stringify(parseProduct(JSON.stringify(s)))), parseProduct(JSON.stringify(s)))
  for (const amountCents of [0, -5, 1.5, initial.usdt + 1]) assert.equal(transition(initial, { type: 'buy-peach', amountCents }, now).state, initial)
})
test('体验版只是时间加速：各阶段蟠桃消耗与正式版相同', () => {
  const { runCost } = require('../lib/game-data.ts')
  assert.deepEqual(LEVELS.map(runCost), [0.2, 2, 7.5, 21, 85, 200, 400])
  // 一次修炼扣满正式周期的修炼蟠桃；显示时按正式天数换算
  assert.deepEqual(LEVELS.map(l => RULES[l.id].daily / 100), LEVELS.map(l => l.perCycleCost * l.cycleDays))
  assert.deepEqual(LEVELS.map(l => RULES[l.id].dayFactor), [1, 3, 5, 8, 12, 15, 20])
  assert.equal(LEVELS[0].notes, undefined)
})
test('有效用户：未达标成员不产生奖励，自己未达标不能拿奖励，且都不补发', () => {
  const team = transition(initial, { type: 'demo-network' }, now).state
  assert.equal(team.members.length, 160)
  // 来源成员未达标
  const fromInvalid = transition(team, { type: 'demo-reward', generation: 1, invalid: true }, now)
  assert.equal(fromInvalid.state.rewards.length, 0)
  assert.equal(fromInvalid.state.usdt, team.usdt)
  assert.match(fromInvalid.message, /不产生奖励/)
  assert.equal(transition(fromInvalid.state, { type: 'demo-reward', generation: 1, invalid: true }, now).state, fromInvalid.state)
  // 自己未达标（持有 49.99 蟠桃）
  const poor = { ...team, balance: 4_999 }
  const blocked = transition(poor, { type: 'demo-reward', generation: 1 }, now)
  assert.equal(blocked.state.rewards.length, 0)
  assert.equal(blocked.state.usdt, poor.usdt)
  assert.match(blocked.message, /无法获得/)
  assert.equal(transition({ ...blocked.state, balance: 100_000 }, { type: 'demo-reward', generation: 1 }, now).state.rewards.length, 0)
  // 刚好 50 蟠桃即达标
  const ok = transition({ ...team, balance: 5_000 }, { type: 'demo-reward', generation: 1 }, now).state
  assert.equal(ok.rewards.length, 2)
  assert.ok(ok.usdt > team.usdt)
})
