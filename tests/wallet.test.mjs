import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
require('../scripts/register-typescript.cjs')
const { isAddress, shortAddress, demoAddress } = require('../lib/wallet.ts')
const { createProduct, productTransition: transition, parseProduct } = require('../lib/product-state.ts')
const now = Date.parse('2026-09-19T10:00:00+08:00')
const me = '0x3f9a11112222333344445555666677778888c21b'

test('钱包地址：只认 0x 开头的 40 位十六进制', () => {
  assert.equal(isAddress(me), true)
  assert.equal(isAddress('0x123'), false)
  assert.equal(isAddress('WK9C37096F9B3707DC'), false)
  assert.equal(isAddress(me.slice(2)), false)
})
test('页面上显示缩写：前 6 位…后 4 位', () => {
  assert.equal(shortAddress(me), '0x3f9a…c21b')
  assert.equal(shortAddress(''), '')
  assert.equal(shortAddress('demo'), 'demo')
})
test('演示地址由文字确定性生成，格式合法且互不相同', () => {
  assert.equal(demoAddress('a'), demoAddress('a'))
  assert.notEqual(demoAddress('a'), demoAddress('b'))
  assert.equal(isAddress(demoAddress('uid:pay-1')), true)
})
test('以钱包地址作为身份建档：邀请码合法，存档可读回，对方与成员都是地址', () => {
  const s = createProduct(now, me, { balance: 100_000, usdt: 1_000_000 })
  assert.equal(s.playerId, me)
  assert.match(s.inviteCode, /^WK[A-F0-9]{16}$/)
  assert.deepEqual(parseProduct(JSON.stringify(s)).playerId, me)
  const net = transition(s, { type: 'demo-network' }, now).state
  assert.ok(net.members.every(m => isAddress(m.uid)))
  assert.equal(new Set(net.members.map(m => m.uid)).size, net.members.length)
})
test('转账按钱包地址：不是地址不转，不能转给自己（不分大小写）', () => {
  const s = createProduct(now, me, { balance: 100_000, usdt: 1_000_000 })
  const to = uid => transition(s, { type: 'transfer-to', currency: 'usdt', amountCents: 5000, uid }, now).state
  assert.equal(to('some-uid-12345678'), s)
  assert.equal(to(me.toUpperCase().replace('0X', '0x')), s)
  assert.equal(to(demoAddress('friend')).usdt, s.usdt - 5000)
})
