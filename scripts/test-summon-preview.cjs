require('./register-typescript.cjs')
const assert = require('node:assert/strict')
const { initialPreview, roundFor, transition, parsePreview, matchAt, matchDelay } = require(process.argv[2] || '../lib/summon-preview.ts')
const { LEVELS } = require('../lib/game-data.ts')
const round = roundFor('stone_spirit', Date.parse('2026-09-19T10:00:00+08:00'))
const before = round.cutoff - 1
// 截止前点过召唤的，周期一开始系统自动匹配并公布结果
const pub = matchAt({ key: round.key, deadline: round.deadline })
let checks = 0
const check = (name, fn) => { fn(); checks++; console.log(`PASS ${name}`) }
const apply = (state, action) => transition(state, action).state
const seed = initialPreview()
const join = { type: 'join', stage: 'stone_spirit', now: before }
const joined = apply(seed, join)
check('七阶段名称、时间、范围、周期、成长比例、召唤与修炼消耗', () => assert.deepEqual(LEVELS.map(l => [l.id, l.name, l.summonStartTime, l.summonStopTime, l.summonEndTime, l.paymentDeadline, l.cultivationMin, l.cultivationMax, l.cycleDays, l.growthRate, l.summonCost, l.cultivationCost, l.isOpen]), [
  ['stone_spirit', '石灵', '11:00', '10:30', '12:00', '12:00', 10, 50, 1, 5, 0.1, 0.1, true],
  ['spirit_monkey', '灵猴', '12:00', '11:30', '13:00', '13:00', 50, 200, 3, 6, 0.5, 0.5, true],
  ['wukong', '悟空', '13:00', '12:30', '14:00', '14:00', 200, 500, 5, 7, 2.5, 1, true],
  ['battle_wukong', '斗战悟空', '14:00', '13:30', '15:00', '15:00', 500, 1200, 8, 11, 5, 2, true],
  ['great_sage', '齐天大圣', '15:00', '14:30', '16:00', '16:00', 1200, 2500, 12, 15, 25, 5, true],
  ['destiny_sage', '天命大圣', '16:00', '15:30', '17:00', '17:00', 2500, 5000, 15, 18, 50, 10, true],
  ['infinite_sage', '无极大圣', '17:00', '16:30', '18:00', '18:00', 5000, 10000, 20, 25, 100, 15, false],
]))
check('契约功能已取消：阶段配置不再有契约消耗', () => assert.ok(LEVELS.every(l => !('contractCost' in l))))
check('七境周期开始前30分钟停止提交，整点公布', () => { for (const level of LEVELS) { const r = roundFor(level.id, before); assert.equal(r.deadline - r.cutoff, 30 * 60000); assert.equal(roundFor(level.id, r.cutoff - 1).open, true); assert.equal(roundFor(level.id, r.cutoff).open, false) } })
check('无极大圣未开放，不能发起召唤', () => assert.equal(apply(seed, { ...join, stage: 'infinite_sage', now: roundFor('infinite_sage', before).cutoff - 1 }), seed))
check('停止召唤瞬间不扣费不受理', () => assert.equal(apply(seed, { ...join, now: round.cutoff }), seed))
check('点召唤时只暂扣召唤蟠桃，修炼蟠桃不暂扣；修炼值以USDT记录不占用蟠桃', () => { assert.equal(seed.balance - joined.balance, 10); assert.equal(joined.entries[0].paid, 10); assert.equal(joined.entries[0].summonFee, 10); assert.equal(joined.entries[0].amount, LEVELS[0].cost * 100); const { lockCents } = require('../lib/summon-preview.ts'); assert.deepEqual(LEVELS.map(l => lockCents(l.id) / 100), [0.1, 0.5, 2.5, 5, 25, 50, 100]) })
check('同境同日仅一次', () => assert.equal(apply(joined, join), joined))
check('七境独立', () => assert.equal(apply(joined, { ...join, stage: 'spirit_monkey' }).entries.length, 2))
check('余额不足不受理', () => assert.equal(apply({ ...seed, balance: 0 }, join).entries.length, 0))
const settle = { type: 'settle', key: round.key, result: 'refunded', now: pub }
check('公布前不能结算', () => assert.equal(apply(joined, { ...settle, now: pub - 1 }), joined))
const refunded = apply(joined, settle)
check('失败全额退还，零召唤消耗', () => assert.equal(refunded.balance, seed.balance))
check('重复失败不重复返还', () => assert.equal(apply(refunded, settle), refunded))
const success = apply(joined, { ...settle, result: 'success' })
check('成功后暂扣蟠桃转为扣除，不再变动余额', () => assert.equal(success.balance, joined.balance))
check('成功不能重复扣费或改为失败', () => { assert.equal(apply(success, settle), success); assert.equal(apply(success, { ...settle, result: 'success' }), success) })
check('石灵召唤 0.1，成功后暂扣的蟠桃不再退回', () => { assert.equal(LEVELS[0].summonCost, 0.1); assert.equal(success.balance, seed.balance - 10) })
check('召唤周期一开始就自动匹配出结果，不需要再点', () => { assert.equal(pub, round.deadline); assert.equal(matchDelay(round.key) % 60000, 0); assert.equal(apply(joined, { ...settle, now: round.deadline - 1 }), joined); assert.equal(LEVELS[0].summonWindow, '11:00–12:00'); const r = roundFor('stone_spirit', round.deadline); assert.equal(r.matching, true); assert.equal(r.ended, false); assert.equal(roundFor('stone_spirit', round.deadline + 3600000).ended, true) })
check('同一周期失败后不重复提交，但可继续参与后续召唤', () => { assert.equal(apply(refunded, join), refunded); assert.equal(apply(refunded, { ...join, stage: 'spirit_monkey' }).entries.length, 2); assert.equal(apply(refunded, { ...join, now: before + 86400000 }).entries.length, 2) })
check('北京次日生成独立场次', () => { const next = apply(success, { ...join, now: before + 86400000 }); assert.equal(next.entries.length, 2); assert.notEqual(next.entries[0].key, next.entries[1].key) })
check('刷新保留结算且不重放', () => assert.deepEqual(parsePreview(JSON.stringify(success)), success))
check('无效记录拒绝', () => assert.throws(() => parsePreview(JSON.stringify({ ...joined, entries: [...joined.entries, ...joined.entries] })) ))
check('每晚19:00起开放次日的召唤；当天这一轮结束后到19:00之间不能召唤', () => { const at = t => Date.parse(`2026-09-19T${t}:00+08:00`); const noon = roundFor('stone_spirit', at('13:00')); assert.equal(noon.ended, true); assert.equal(noon.open, false); assert.equal(noon.nextOpen, at('19:00')); assert.equal(noon.tomorrow, false); const eve = roundFor('stone_spirit', at('19:00')); assert.equal(eve.open, true); assert.equal(eve.tomorrow, true); assert.equal(eve.date, '2026-09-20'); assert.equal(eve.deadline, Date.parse('2026-09-20T11:00:00+08:00')); const j = apply(seed, { type: 'join', stage: 'stone_spirit', now: at('19:05') }); assert.equal(j.entries.length, 1); assert.deepEqual(parsePreview(JSON.stringify(j)), j); assert.equal(roundFor('stone_spirit', Date.parse('2026-09-20T09:00:00+08:00')).key, eve.key) })
console.log(`${checks} V2召唤检查通过`)
