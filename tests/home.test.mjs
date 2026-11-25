import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
process.env.NEXT_PUBLIC_WUKONG_TRIAL = '1'
const require = createRequire(import.meta.url)
require('../scripts/register-typescript.cjs')
const { currentSummon, realmStatus } = require('../lib/home.ts')
const { roundFor, matchAt } = require('../lib/summon-preview.ts')
const { createProduct, productTransition: transition } = require('../lib/product-state.ts')
const at = time => Date.parse(`2026-09-19T${time}:00+08:00`)
const initial = createProduct(at('09:00'), '01234567-89ab-cdef-0123-456789abcdef')

test('没有预约：显示最快截止的可预约仙境', () => {
  const morning = currentSummon([], at('09:00'))
  assert.equal(morning.kind, 'open'); assert.equal(morning.stage, 'stone_spirit'); assert.equal(morning.until, at('10:30')); assert.equal(morning.openCount, 7)
  // 石灵 10:30 截止后，轮到灵猴
  const later = currentSummon([], at('10:45'))
  assert.equal(later.stage, 'spirit_monkey'); assert.equal(later.openCount, 6)
})
test('有预约：显示我预约的仙境，匹配开始后变为匹配中', () => {
  const s = transition(initial, { type: 'summon', action: { type: 'join', stage: 'wukong', now: at('09:00') } }, at('09:00')).state
  const before = currentSummon(s.entries, at('09:30'))
  assert.equal(before.kind, 'reserved'); assert.equal(before.stage, 'wukong'); assert.equal(before.until, at('13:00')); assert.equal(before.openCount, 6)
  const during = currentSummon(s.entries, at('13:00'))
  assert.equal(during.kind, 'matching'); assert.equal(during.until, matchAt(s.entries[0]))
  assert.equal(realmStatus('wukong', s.entries, at('09:30')), 'reserved')
})
test('今日全部结束：等明日 00:00', () => {
  const night = currentSummon([], at('18:30'))
  assert.equal(night.kind, 'closed'); assert.equal(night.until, Date.parse('2026-09-20T00:00:00+08:00'))
})
test('仙境状态：可预约 → 预约已截止 → 匹配中 → 今日已结束', () => {
  assert.equal(realmStatus('stone_spirit', [], at('09:00')), 'open')
  assert.equal(realmStatus('stone_spirit', [], at('10:45')), 'cutoff')
  assert.equal(realmStatus('stone_spirit', [], at('11:30')), 'matching')
  assert.equal(realmStatus('stone_spirit', [], at('12:00')), 'ended')
  assert.equal(roundFor('stone_spirit', at('09:00')).open, true)
})
