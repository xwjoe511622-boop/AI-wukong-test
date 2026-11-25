import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
process.env.NEXT_PUBLIC_WUKONG_TRIAL = '1'
const require = createRequire(import.meta.url)
require('../scripts/register-typescript.cjs')
const { currentSummon, realmStatus, todayTodos } = require('../lib/home.ts')
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
test('今日待办：按紧急程度排序，随流程推进而变化', () => {
  // 新用户：只有一条「预约召唤」
  const fresh = todayTodos(initial, at('09:00'))
  assert.deepEqual(fresh.map(t => [t.tone, t.cta]), [['action', '去预约']])
  // 预约后：等待召唤开始，不再提示预约
  let s = reserve(initial, 'stone_spirit', '09:00')
  assert.deepEqual(todayTodos(s, at('09:30')).map(t => t.tone), ['wait'])
  // 召唤周期内：可以当场召唤
  const live = todayTodos(s, at('11:10'))
  assert.equal(live[0].castKey, s.entries[0].key); assert.equal(live[0].cta, '召唤')
  // 召唤成功：待打款排第一，带倒计时
  s = transition(s, { type: 'summon-cast', key: s.entries[0].key }, at('11:10')).state
  const pay = todayTodos(s, at('11:11'))
  assert.equal(pay[0].tone, 'urgent'); assert.equal(pay[0].cta, '去打款'); assert.equal(pay[0].until, at('12:10')); assert.equal(pay[0].amountCents, 1000)
  // 打款后：等乙方确认；确认入舍后：今日修炼
  s = transition(s, { type: 'trade-pay', id: s.trades[0].id }, at('11:12')).state
  assert.ok(todayTodos(s, at('11:13')).some(t => t.tone === 'wait' && t.title.includes('等待乙方确认')))
  s = transition(s, { type: 'tick' }, at('11:20')).state
  const after = todayTodos(s, at('11:20'))
  assert.ok(after.some(t => t.id === 'train' && t.tone === 'action'))
  assert.ok(after.some(t => t.tone === 'done' && t.title.includes('召唤成功')))
  assert.deepEqual(after.map(t => t.tone), [...after.map(t => t.tone)].sort((a, b) => ['urgent', 'action', 'wait', 'done'].indexOf(a) - ['urgent', 'action', 'wait', 'done'].indexOf(b)))
})
