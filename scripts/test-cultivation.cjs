require('./register-typescript.cjs')
const assert = require('node:assert/strict')
const { DAY, RULES, createPreview, due, phase, quote, settlement, transition, isPreview, endsAt } = require(process.argv[2] || '../lib/cultivation-preview.ts')
const now = Date.UTC(2026, 8, 19, 12)
const c = { id: 'pending', stage: 'wukong', principal: 100000, started: now - 2 * DAY, completed: 0 }
const state = { version: 2, balance: 100000, contracts: [c], history: [] }
let passed = 0
function test(name, fn) { fn(); passed++; console.log(`PASS ${name}`) }
test('七阶段周期、成长比例、每日修炼', () => assert.deepEqual(Object.values(RULES).map(r => [r.days, r.gain, r.daily]), [[1,5,10],[3,6,50],[5,7,100],[8,12,200],[11,15,500],[15,18,1000],[20,25,1500]]))
test('每天只能修炼当天那一次，漏掉的不累计', () => { assert.equal(due(c, now), 1); assert.equal(quote([c], now, false).total, 100); assert.equal(due({ ...c, started: now + DAY }, now), 0); assert.equal(due(c, endsAt(c)), 0) })
test('点一次只扣当天的蟠桃、只记当天；漏掉的两天不能补', () => { const result = transition(state, { type: 'train', ids: [c.id], accelerate: false, expected: 100 }, now).state; assert.equal(result.balance, state.balance - 100); assert.equal(result.contracts[0].completed, 1); assert.deepEqual(result.contracts[0].trainedDays, [2]); assert.equal(due(result.contracts[0], now), 0); assert.equal(due(result.contracts[0], now + DAY), 1); assert.equal(isPreview(result), true) })
test('不能提前或批量修炼', () => { assert.equal(quote([c], now, true).total, 100); assert.equal(transition(state, { type: 'train', ids: [c.id], accelerate: true, expected: 100 }, now).state, state) })
test('重复修炼不扣费', () => { const action = { type: 'train', ids: [c.id], accelerate: false, expected: 100 }; const updated = transition(state, action, now).state; assert.equal(transition(updated, action, now).state, updated) })
test('余额不足及过期报价无部分更新', () => { for (const s of [{ ...state, balance: 0 }, state]) { const result = transition(s, { type: 'train', ids: [c.id], accelerate: false, expected: s.balance ? 999 : 100 }, now); assert.equal(result.state, s) } })
test('周期结束后不管修炼了几次都进入传承中', () => { const end = endsAt(c); assert.equal(phase(c, end), '传承中'); assert.equal(phase({ ...c, completed: 5 }, end), '传承中') })
test('周期结束前是修炼中，不能提前传承', () => { const full = { ...c, completed: 5 }; assert.equal(phase(full, now), '修炼中'); assert.equal(phase(full, endsAt(c)), '传承中'); assert.equal(transition({ ...state, contracts: [full] }, { type: 'claim', id: c.id }, now).state.balance, state.balance) })
test('天命大圣每天都修炼：增长900、手续费27、所得5873', () => assert.deepEqual(settlement({ ...c, stage: 'destiny_sage', principal: 500000, completed: 15 }), { profit: 90000, fee: 2700, received: 587300 }))
test('修炼增长只算点过的天数：一天没点按原修炼值传承，点了3/5天得3/5的增长', () => { assert.deepEqual(settlement(c), { profit: 0, fee: 0, received: 100000 }); assert.deepEqual(settlement({ ...c, completed: 3 }), { profit: 4200, fee: 126, received: 104074 }) })
test('石灵每日修炼0.1蟠桃', () => { const stone = { ...c, id: 'stone', stage: 'stone_spirit', principal: 1000, started: now }; const s0 = { ...state, contracts: [stone] }; assert.equal(quote([stone], now, false).total, 10); const trained = transition(s0, { type: 'train', ids: ['stone'], accelerate: false, expected: 10 }, now).state; assert.equal(trained.contracts[0].completed, 1); assert.equal(trained.balance, state.balance - 10) })
test('传承以USDT结算不动蟠桃余额，且只能确认一次', () => { const full = { ...c, completed: 5, finishedAt: endsAt(c) }; const initial = { ...state, contracts: [full] }; const next = transition(initial, { type: 'claim', id: c.id }, endsAt(c)).state; assert.equal(next.balance, state.balance); assert.equal(settlement(full).received, 106790); assert.equal(next.history.length, 1); assert.equal(transition(next, { type: 'claim', id: c.id }, endsAt(c)).state, next) })
test('存档与演示样本有效', () => { const preview = createPreview(now); assert.equal(isPreview(preview), true); for (const sample of preview.contracts) { assert.ok(sample.principal >= RULES[sample.stage].rangeMin * 100); assert.ok(sample.principal <= RULES[sample.stage].rangeMax * 100) } })
console.log(`${passed} V2修炼检查通过`)
