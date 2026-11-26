'use client'

import { detectLang, translate } from './i18n'
import { isAddress } from './wallet'

/**
 * 钱包登录（浏览器端）：连接 EVM 钱包拿到地址，再让用户对一段登录消息签名。
 * 签名是真实的 personal_sign，不发起交易、不消耗矿工费。
 * 注意：签名必须由后端验签才算数。这里把消息和签名一起存下来，接入后端后提交给登录接口验证；
 * 后端接入之前，前端无法证明地址确实属于当前用户。
 */
export type WalletSession = { address: string; message?: string; signature?: string; signedAt: number; /** 没有连接真实钱包，用演示地址进入 */ demo?: boolean }
const SESSION_KEY = 'wukong-wallet-v1'

type Provider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void; removeListener?: (event: string, handler: (...args: unknown[]) => void) => void; providers?: Provider[] }
export function getProvider(): Provider | null {
  if (typeof window === 'undefined') return null
  const eth = (window as unknown as { ethereum?: Provider }).ethereum
  if (!eth) return null
  return eth.providers?.[0] ?? eth
}

export function loadSession(): WalletSession | null {
  try {
    const data = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
    return data && typeof data.address === 'string' && isAddress(data.address) && Number.isFinite(data.signedAt) ? data : null
  } catch { return null }
}
export function saveSession(session: WalletSession | null) {
  try { if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session)); else localStorage.removeItem(SESSION_KEY) } catch {}
}

const toHex = (text: string) => '0x' + Array.from(new TextEncoder().encode(text), b => b.toString(16).padStart(2, '0')).join('')
const randomHex = (bytes: number) => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), b => b.toString(16).padStart(2, '0')).join('')

/** 登录消息：写明域名、地址、随机数和时间，防止签名被拿到别处重放 */
export function loginMessage(address: string, nonce: string, issuedAt: string) {
  return ['AI WUKONG 登录签名', '', `钱包地址：${address}`, `域名：${location.host}`, `随机数：${nonce}`, `时间：${issuedAt}`, '', '本次签名只用于登录验证，不会发起任何交易，也不消耗矿工费。'].map(line => detectLang() === 'en' ? translate(line) : line).join('\n')
}

export class WalletError extends Error { constructor(public code: 'no-wallet' | 'rejected' | 'failed', message: string) { super(message) } }
const rejected = (error: unknown) => (error as { code?: number })?.code === 4001

/** 第一步：请求连接，拿到地址 */
export async function requestAddress(): Promise<string> {
  const provider = getProvider()
  if (!provider) throw new WalletError('no-wallet', '没有检测到钱包')
  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[]
    const address = accounts?.[0]
    if (!address || !isAddress(address)) throw new WalletError('failed', '没有拿到钱包地址，请重试。')
    return address
  } catch (error) {
    if (error instanceof WalletError) throw error
    throw rejected(error) ? new WalletError('rejected', '你取消了连接。') : new WalletError('failed', '连接钱包失败，请重试。')
  }
}
/** 第二步：对登录消息签名 */
export async function signLogin(address: string): Promise<WalletSession> {
  const provider = getProvider()
  if (!provider) throw new WalletError('no-wallet', '没有检测到钱包')
  const message = loginMessage(address, randomHex(16), new Date().toISOString())
  try {
    const signature = await provider.request({ method: 'personal_sign', params: [toHex(message), address] }) as string
    if (typeof signature !== 'string' || !/^0x[0-9a-fA-F]+$/.test(signature)) throw new WalletError('failed', '签名无效，请重试。')
    return { address, message, signature, signedAt: Date.now() }
  } catch (error) {
    if (error instanceof WalletError) throw error
    throw rejected(error) ? new WalletError('rejected', '你取消了签名，未登录。') : new WalletError('failed', '签名失败，请重试。')
  }
}
/** 演示地址：没有钱包时用来浏览页面，不是真实钱包 */
export function demoSession(): WalletSession {
  return { address: '0x' + randomHex(20), signedAt: Date.now(), demo: true }
}
