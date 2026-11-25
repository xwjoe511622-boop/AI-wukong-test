require('./register-typescript.cjs')
const assert = require('node:assert/strict')
const { DAY, RULES, createPreview, due, phase, quote, settlement, transition, isPreview, endsAt } = require(process.argv[2] || '../lib/cultivation-preview.ts')
const now = Date.UTC(2026, 8, 19, 12)
const c = { id: 'pending', stage: 'wukong', principal: 100000, started: now - 2 * DAY, completed: 0 }
const state = { version: 2, balance: 100000, contracts: [c], history: [] }
let passed = 0
function test(name, fn) { fn(); passed++; console.log(`PASS ${name}`) }
test('七阶段周期、成长比例、每日修炼', () => assert.deepEqual(Object.values(RULES).map(r => [r.days, r.gain, r.daily]), [[1,5,10],[3,6,50],[5,7,100],[8,11,200],[12,15,500],[15,18,1000],[20,25,1500]]))
test('召唤成功后即累计到期修炼', () => { assert.equal(due(c, now), 3); assert.equal(quote([c], now, false).total, 300); assert.equal(due({ ...c, started: now + DAY }, now), 0) })
test('漏修3次只扣3蟠桃，无需契约', () => { const result = transition(state, { type: 'train', ids: [c.id], accelerate: false, expected: 300 }, now).state; assert.equal(result.balance, state.balance - 300); assert.equal(result.contracts[0].completed, 3) })
test('未到期次数不能批量提前修炼', () => { assert.equal(quote([c], now, true).total, 300); assert.equal(transition(state, { type: 'train', ids: [c.id], accelerate: true, expected: 300 }, now).state, state) })
test('重复修炼不扣费', () => { const action = { type: 'train', ids: [c.id], accelerate: false, expected: 300 }; const updated = transition(state, action, now).state; assert.equal(transition(updated, action, now).state, updated) })
test('余额不足及过期报价无部分更新', () => { for (const s of [{ ...state, balance: 0 }, state]) { const result = transition(s, { type: 'train', ids: [c.id], accelerate: false, expected: s.balance ? 999 : 300 }, now); assert.equal(result.state, s) } })
test('原周期结束：未修完为待完成修炼，修完即传承中', () => { const end = endsAt(c); assert.equal(phase(c, end), '待完成修炼'); assert.equal(phase({ ...c, completed: 5 }, end), '传承中') })
test('修炼已安排好的悟空在周期结束前是修炼中，不能提前传承', () => { const full = { ...c, completed: 5 }; assert.equal(phase(full, now), '修炼中'); assert.equal(phase(full, endsAt(c)), '传承中'); assert.equal(transition({ ...state, contracts: [full] }, { type: 'claim', id: c.id }, now).state.balance, state.balance) })
test('天命大圣盈利900、手续费27、结算5873', () => assert.deepEqual(settlement({ ...c, stage: 'destiny_sage', principal: 500000 }), { profit: 90000, fee: 2700, received: 587300 }))
test('石灵每日修炼0.1蟠桃', () => { const stone = { ...c, id: 'stone', stage: 'stone_spirit', principal: 1000, started: now }; const s0 = { ...state, contracts: [stone] }; assert.equal(quote([stone], now, false).total, 10); const trained = transition(s0, { type: 'train', ids: ['stone'], accelerate: false, expected: 10 }, now).state; assert.equal(trained.contracts[0].completed, 1); assert.equal(trained.balance, state.balance - 10) })
test('传承以USDT结算不动蟠桃余额，且只能确认一次', () => { const full = { ...c, completed: 5, finishedAt: endsAt(c) }; const initial = { ...state, contracts: [full] }; const next = transition(initial, { type: 'claim', id: c.id }, endsAt(c)).state; assert.equal(next.balance, state.balance); assert.equal(settlement(full).received, 106790); assert.equal(next.history.length, 1); assert.equal(transition(next, { type: 'claim', id: c.id }, endsAt(c)).state, next) })
test('存档与演示样本有效', () => { const preview = createPreview(now); assert.equal(isPreview(preview), true); for (const sample of preview.contracts) { assert.ok(sample.principal >= RULES[sample.stage].rangeMin * 100); assert.ok(sample.principal <= RULES[sample.stage].rangeMax * 100) } })
console.log(`${passed} V2修炼检查通过`)
