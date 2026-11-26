import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
process.env.NEXT_PUBLIC_WUKONG_TRIAL = '1'
const require = createRequire(import.meta.url)
require('../scripts/register-typescript.cjs')
const { currentSummon, realmStatus, dailyTodos } = require('../lib/home.ts')
const { createProduct, productTransition: transition } = require('../lib/product-state.ts')
const at = time => Date.parse(`2026-09-19T${time}:00+08:00`)
const initial = createProduct(at('09:00'), '01234567-89ab-cdef-0123-456789abcdef')
const reserve = (s, stage, time) => transition(s, { type: 'summon', action: { type: 'join', stage, now: at(time) } }, at(time)).state

test('11:00 之前：即将召唤石灵；10:30 后不能再参与它，提示下一个可召唤的', () => {
  const early = currentSummon([], at('09:00'))
  assert.equal(early.kind, 'upcoming'); assert.equal(early.stage, 'stone_spirit'); assert.equal(early.until, at('11:00')); assert.equal(early.mine, 'none'); assert.equal(early.canReserve, true)
  const cut = currentSummon([], at('10:45'))
  assert.equal(cut.stage, 'stone_spirit'); assert.equal(cut.canReserve, false); assert.equal(cut.nextBookable, 'spirit_monkey')
})
test('召唤周期内：显示此刻轮到的仙境，以及我有没有参与', () => {
  const stone = currentSummon([], at('11:20'))
  assert.equal(stone.kind, 'live'); assert.equal(stone.stage, 'stone_spirit'); assert.equal(stone.until, at('12:00')); assert.equal(stone.mine, 'none')
  assert.equal(currentSummon([], at('12:00')).stage, 'spirit_monkey')
  assert.equal(currentSummon([], at('17:59')).stage, 'infinite_sage')
  const s = reserve(initial, 'stone_spirit', '09:00')
  assert.equal(currentSummon(s.entries, at('10:59')).mine, 'reserved')
  // 到点系统自动匹配，不用再点
  const done = transition(s, { type: 'tick' }, at('11:00')).state
  assert.equal(currentSummon(done.entries, at('11:01')).mine, 'success')
})
test('18:00 之后：今日结束，等明日 00:00', () => {
  const night = currentSummon([], at('18:30'))
  assert.equal(night.kind, 'closed'); assert.equal(night.until, Date.parse('2026-09-20T00:00:00+08:00'))
})
test('仙境状态：可召唤 → 召唤已截止 → 匹配中 → 今日已结束', () => {
  assert.equal(realmStatus('stone_spirit', [], at('09:00')), 'open')
  assert.equal(realmStatus('stone_spirit', [], at('10:45')), 'cutoff')
  assert.equal(realmStatus('stone_spirit', [], at('11:30')), 'live')
  assert.equal(realmStatus('stone_spirit', [], at('12:00')), 'ended')
  const s = reserve(initial, 'stone_spirit', '09:00')
  assert.equal(realmStatus('stone_spirit', s.entries, at('09:30')), 'reserved')
  assert.equal(realmStatus('stone_spirit', s.entries, at('11:30')), 'live-reserved')
})
const status = (st, time) => dailyTodos(st, at(time)).map(t => t.status).join(',')
test('今日待办固定四行：召唤、支付结算、修炼、收款', () => {
  assert.deepEqual(dailyTodos(initial, at('09:00')).map(t => t.kind), ['summon', 'pay', 'train', 'receive'])
  assert.deepEqual(dailyTodos(initial, at('09:00')).map(t => t.label), ['召唤', '支付结算', '修炼', '收款'])
  // 新用户：只有召唤是待处理
  assert.equal(status(initial, '09:00'), 'todo,none,none,none')
  // 点过召唤：等待系统匹配，到点前不用再操作
  let s = reserve(initial, 'stone_spirit', '09:00')
  assert.equal(status(s, '09:30'), 'wait,none,none,none')
  assert.equal(dailyTodos(s, at('09:30'))[0].until, at('11:00'))
  // 11:00 自动匹配成功：支付结算待处理，带金额和倒计时
  s = transition(s, { type: 'tick' }, at('11:00')).state
  const pay = dailyTodos(s, at('11:01'))
  assert.equal(pay[0].status, 'done'); assert.equal(pay[1].status, 'todo'); assert.equal(pay[1].amountCents, 1000); assert.equal(pay[1].until, at('12:00'))
  assert.equal(dailyTodos({ ...s, usdt: 0 }, at('11:01'))[1].warn, true)
  // 支付后等传承人确认；入舍后修炼成为待办，点过就完成
  s = transition(s, { type: 'trade-pay', id: s.trades[0].id }, at('11:02')).state
  assert.equal(dailyTodos(s, at('11:03'))[1].status, 'wait')
  s = transition(s, { type: 'tick' }, at('11:10')).state
  assert.equal(s.contracts.length, 1)
  assert.equal(status(s, '11:10'), 'done,none,todo,none')
  assert.equal(dailyTodos({ ...s, balance: 0 }, at('11:10'))[2].warn, true)
  s = transition(s, { type: 'cultivate', action: { type: 'train', ids: [s.contracts[0].id], accelerate: false, expected: 10 } }, at('11:11')).state
  assert.equal(status(s, '11:12'), 'done,none,done,none')
  // 18:00 后今日召唤全部截止
  assert.equal(dailyTodos(initial, at('18:30'))[0].status, 'none')
})
