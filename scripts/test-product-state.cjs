require('./register-typescript.cjs')
const assert = require('node:assert/strict')
const { createProduct, productTransition: transition, parseProduct } = require(process.argv[2] || '../lib/product-state.ts')
const { quote, DAY, settlement } = require('../lib/cultivation-preview.ts')
const { roundFor, matchAt } = require('../lib/summon-preview.ts')
const { LEVELS, PREVIEW_INHERITANCE_DELAY_MS } = require('../lib/game-data.ts')
// 石灵召唤周期 11:00–12:00（北京时间）：10:30 停止提交，11:00 开始召唤并公布
const now = Date.parse('2026-09-19T10:00:00+08:00')
// 测试用带余额和预置悟空的存档；正式版新用户默认从零开始
const initial = createProduct(now, '01234567-89ab-cdef-0123-456789abcdef', { balance: 100_000, usdt: 1_000_000, starters: true })
const round = roundFor('stone_spirit', now)
const pub = matchAt({ key: round.key, deadline: round.deadline })
const join = { type: 'summon', action: { type: 'join', stage: 'stone_spirit', now } }
const joined = transition(initial, join, now).state
const success = transition(joined, { type: 'tick' }, pub).state
const summoned = state => state.contracts.find(c => c.id.startsWith('summon-'))
let passed = 0
function test(name, fn) { fn(); passed++; console.log(`PASS ${name}`) }
test('七阶段消耗 = 召唤 + 每日修炼 × 天数：0.2、2、7.5、21、85、200、400', () => { const r = n => Math.round(n * 100) / 100; assert.deepEqual(LEVELS.map(l => r(l.summonCost + l.cultivationCost * l.cultivationCount)), [0.2,2,7.5,21,85,200,400]); assert.deepEqual(LEVELS.map(l => r(l.lifecycleCost)), [0.2,2,7.5,21,85,200,400]) })
test('正式版新用户从零开始：无余额、无悟空、无成员', () => { const fresh = createProduct(now, '01234567-89ab-cdef-0123-456789abcdef'); assert.equal(fresh.balance, 0); assert.equal(fresh.usdt, 0); assert.equal(fresh.contracts.length, 0); assert.equal(fresh.members.length, 0); assert.equal(LEVELS[6].isOpen, false); assert.deepEqual(LEVELS.map(l => l.runDays), [1,3,5,8,12,15,20]) })
test('初始猴舍预置六只且无历史', () => { assert.equal(initial.contracts.length, 6); assert.equal(initial.history.length, 0); assert.equal(initial.records.length, 0); assert.equal(initial.rewards.length, 0); assert.equal(initial.members.length, 0); assert.equal(initial.balance, 100_000); assert.equal(initial.usdt, 1_000_000) })
test('七阶段修炼范围为唯一最终版本', () => assert.deepEqual(LEVELS.map(l => [l.cultivationMin, l.cultivationMax]), [[10,50],[50,200],[200,500],[500,1200],[1200,2500],[2500,5000],[5000,10000]]))
test('提交召唤仅暂扣0.1召唤蟠桃且公布前不结算', () => { assert.equal(joined.balance, initial.balance - 10); assert.equal(transition(joined, { type: 'tick' }, pub - 1).state, joined) })
test('石灵成功扣0.1召唤蟠桃并立即入舍', () => { assert.equal(success.balance, initial.balance - 10); assert.equal(success.contracts.length, 7); assert.equal(summoned(success).principal, 1000); assert.equal(success.usdt, initial.usdt - 1000); assert.equal(transition(success, { type: 'tick' }, pub).state, success) })
test('失败不扣费且退款一次', () => { const failed = transition({ ...joined, demoOutcome: 'refunded' }, { type: 'tick' }, pub).state; assert.equal(failed.balance, initial.balance); assert.equal(failed.usdt, initial.usdt); assert.equal(failed.contracts.length, 6); assert.equal(transition(failed, { type: 'tick' }, pub).state, failed) })
test('全生命周期账本守恒：蟠桃只扣召唤与修炼，配套金额与结算走U余额', () => { let s = success; const id = summoned(s).id; const q = quote([summoned(s)], pub, false); assert.equal(q.total, 10); const train = { type: 'cultivate', action: { type: 'train', ids: [id], accelerate: false, expected: q.total } }; s = transition(s, train, pub).state; assert.equal(summoned(s).completed, 1); assert.equal(s.balance, initial.balance - 20); const contract = { type: 'cultivate', action: { type: 'contract', id } }; assert.equal(transition(s, contract, pub).state, s); const end = pub + DAY; assert.equal(transition(s, { type: 'cultivate', action: { type: 'claim', id } }, end - 1).state, s); s = transition(parseProduct(JSON.stringify(s)), { type: 'tick' }, end + PREVIEW_INHERITANCE_DELAY_MS).state; const received = settlement(summoned(s)).received; s = transition(s, { type: 'cultivate', action: { type: 'claim', id } }, end + PREVIEW_INHERITANCE_DELAY_MS).state; assert.equal(received, 1048); assert.equal(s.balance, initial.balance - 20); assert.equal(s.usdt, initial.usdt - 1000 + 1048); assert.equal(s.records.filter(r => r.currency !== 'usdt').reduce((sum, r) => sum + r.amountCents, 0), s.balance - initial.balance); assert.equal(s.records.filter(r => r.currency === 'usdt').reduce((sum, r) => sum + r.amountCents, 0), s.usdt - initial.usdt); assert.equal(s.history.length, 1); assert.equal(s.rewards.length, 0) })
test('不足额、重复召唤均无额外账本', () => { const poor = { ...initial, balance: 0 }; assert.equal(transition(poor, join, now).state, poor); assert.equal(transition(joined, join, now).state, joined) })
test('奖励仅来源成员传承，第一代10%+部族Ⅱ阶3%返U，分别入账且幂等', () => { let s = transition(initial, { type: 'demo-network' }, now).state; assert.equal(s.members.filter(m => m.generation === 1 && m.valid).length, 15); assert.equal(s.members.filter(m => m.valid).length, 150); assert.equal(s.rewards.length, 0); const reward = { type: 'demo-reward', generation: 1 }; const next = transition(s, reward, now).state; assert.equal(next.rewards.length, 2); assert.deepEqual(next.rewards.map(r => r.amountCents).sort((a,b) => a-b), [540,1800]); assert.equal(next.usdt, s.usdt + 2340); assert.equal(next.balance, s.balance); assert.ok(next.rewards.every(r => r.sourceProfitCents === 18000)); assert.equal(transition(next, reward, now).state, next); assert.deepEqual(parseProduct(JSON.stringify(next)), JSON.parse(JSON.stringify(next))) })
test('第三代及更深只有部族奖励', () => { const s = transition(initial, { type: 'demo-network' }, now).state; const next = transition(s, { type: 'demo-reward', generation: 3 }, now).state; assert.equal(next.rewards.length, 1); assert.equal(next.rewards[0].rewardType, 'tribe') })
test('无成员不发奖，旧存档不套用V2', () => { assert.equal(transition(initial, { type: 'demo-reward', generation: 1 }, now).state, initial); assert.throws(() => parseProduct(JSON.stringify({ ...initial, version: 3 }))) })
console.log(`${passed} 闭环检查通过`)
