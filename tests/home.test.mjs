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

test('11:00 之前：即将召唤石灵；10:30 后不能再预约它，提示下一个可预约的', () => {
  const early = currentSummon([], at('09:00'))
  assert.equal(early.kind, 'upcoming'); assert.equal(early.stage, 'stone_spirit'); assert.equal(early.until, at('11:00')); assert.equal(early.mine, 'none'); assert.equal(early.canReserve, true)
  const cut = currentSummon([], at('10:45'))
  assert.equal(cut.stage, 'stone_spirit'); assert.equal(cut.canReserve, false); assert.equal(cut.nextBookable, 'spirit_monkey')
})
test('召唤周期内：显示此刻轮到的仙境，以及我有没有预约', () => {
  const stone = currentSummon([], at('11:20'))
  assert.equal(stone.kind, 'live'); assert.equal(stone.stage, 'stone_spirit'); assert.equal(stone.until, at('12:00')); assert.equal(stone.mine, 'none')
  assert.equal(currentSummon([], at('12:00')).stage, 'spirit_monkey')
  assert.equal(currentSummon([], at('17:59')).stage, 'infinite_sage')
  const s = reserve(initial, 'wukong', '09:00')
  assert.equal(currentSummon(s.entries, at('13:10')).mine, 'reserved')
  // 点了召唤后显示结果
  const done = transition(s, { type: 'summon-cast', key: s.entries[0].key }, at('13:10')).state
  assert.equal(currentSummon(done.entries, at('13:11')).mine, 'success')
})
test('18:00 之后：今日结束，等明日 00:00', () => {
  const night = currentSummon([], at('18:30'))
  assert.equal(night.kind, 'closed'); assert.equal(night.until, Date.parse('2026-09-20T00:00:00+08:00'))
})
test('仙境状态：可预约 → 预约已截止 → 召唤中 → 今日已结束；预约过的在周期内可召唤', () => {
  assert.equal(realmStatus('stone_spirit', [], at('09:00')), 'open')
  assert.equal(realmStatus('stone_spirit', [], at('10:45')), 'cutoff')
  assert.equal(realmStatus('stone_spirit', [], at('11:30')), 'live')
  assert.equal(realmStatus('stone_spirit', [], at('12:00')), 'ended')
  const s = reserve(initial, 'stone_spirit', '09:00')
  assert.equal(realmStatus('stone_spirit', s.entries, at('09:30')), 'reserved')
  assert.equal(realmStatus('stone_spirit', s.entries, at('11:30')), 'live-reserved')
})
const status = (st, time) => dailyTodos(st, at(time)).map(t => t.status).join(',')
test('今日待办固定五行：预约、召唤、打款、修炼、收款，随流程推进变化', () => {
  assert.deepEqual(dailyTodos(initial, at('09:00')).map(t => t.kind), ['reserve', 'cast', 'pay', 'train', 'receive'])
  // 新用户：只有预约是待处理
  assert.equal(status(initial, '09:00'), 'todo,none,none,none,none')
  // 预约后：预约完成，召唤等待开始
  let s = reserve(initial, 'stone_spirit', '09:00')
  assert.equal(status(s, '09:30'), 'done,wait,none,none,none')
  // 召唤周期内：召唤可当场点
  const live = dailyTodos(s, at('11:10'))
  assert.equal(live[1].status, 'todo'); assert.equal(live[1].castKey, s.entries[0].key); assert.equal(live[1].until, at('12:00'))
  // 召唤成功：打款待处理，带金额和倒计时
  s = transition(s, { type: 'summon-cast', key: s.entries[0].key }, at('11:10')).state
  const pay = dailyTodos(s, at('11:11'))
  assert.equal(pay[1].status, 'done'); assert.equal(pay[2].status, 'todo'); assert.equal(pay[2].amountCents, 1000); assert.equal(pay[2].until, at('12:10'))
  assert.equal(dailyTodos({ ...s, usdt: 0 }, at('11:11'))[2].warn, true)
  // 打款后等乙方确认；入舍后今日待修
  s = transition(s, { type: 'trade-pay', id: s.trades[0].id }, at('11:12')).state
  assert.equal(dailyTodos(s, at('11:13'))[2].status, 'wait')
  s = transition(s, { type: 'tick' }, at('11:20')).state
  const housed = dailyTodos(s, at('11:20'))
  assert.equal(housed[2].status, 'none'); assert.equal(housed[3].status, 'todo'); assert.equal(housed[3].title, '今日待修 1 只')
  s = transition(s, { type: 'cultivate', action: { type: 'train', ids: [s.contracts[0].id], accelerate: false, expected: 10 } }, at('11:21')).state
  assert.equal(dailyTodos(s, at('11:21'))[3].status, 'done')
  // 18:00 后今日预约全部截止
  assert.equal(dailyTodos(initial, at('18:30'))[0].status, 'none')
})
