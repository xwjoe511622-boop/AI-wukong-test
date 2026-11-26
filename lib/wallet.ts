/**
 * 钱包地址：每个人的身份就是自己的 EVM 钱包地址，页面上不再显示 UID。
 * 钱包只用于登录和显示身份；USDT 与蟠桃仍是平台内余额，支付结算在平台内完成，不走链上转账。
 */
export const isAddress = (value: string) => /^0x[0-9a-fA-F]{40}$/.test(value)
/** 页面上显示的缩写：0x3f9A…c21B；不是地址的原样返回 */
export const shortAddress = (value: string | null | undefined) => !value ? '' : isAddress(value) ? `${value.slice(0, 6)}…${value.slice(-4)}` : value

function hashOf(seed: string) {
  let hash = 2166136261
  for (const ch of seed) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619) >>> 0
  return hash
}
/** 演示用地址：由一段文字确定性生成，不是真实钱包。没有后端时，用它代表对方和示例成员 */
export function demoAddress(seed: string) {
  let out = ''
  for (let i = 0; out.length < 40; i++) out += hashOf(`${seed}:${i}`).toString(16).padStart(8, '0')
  return `0x${out.slice(0, 40)}`
}
