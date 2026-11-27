'use client'

import { getProvider, WalletError } from './wallet-client'

/**
 * 充值：把用户钱包里的 USDT（BSC 链）转到平台收款地址，平台余额相应增加。
 *
 * 现在的状态：收款地址和后端入账还没接入，所以默认是「演示模式」——流程和界面是完整的，
 * 但不会向钱包发起任何转账。配置 NEXT_PUBLIC_DEPOSIT_ADDRESS（平台在 BSC 上的收款地址）后，
 * 才会走真实的链上转账。
 *
 * 注意：真实模式下，前端只负责发起转账和等待上链；余额入账必须由后端监听链上到账后完成，
 * 前端「看到转账成功就加余额」只存在用户自己的浏览器里，不能当真账。
 */
export const DEPOSIT_CHAIN = { id: 56, hex: '0x38', name: 'BNB Smart Chain', short: 'BSC', rpc: 'https://bsc-dataseed.binance.org', explorer: 'https://bscscan.com' }
/** BSC 上的 USDT（Binance-Peg BSC-USD），18 位小数 */
export const DEPOSIT_TOKEN = { address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 }
export const DEPOSIT_RECEIVER = (process.env.NEXT_PUBLIC_DEPOSIT_ADDRESS ?? '').trim()
/** 是否走真实链上转账：配置了合法的收款地址才开启 */
export const DEPOSIT_LIVE = /^0x[0-9a-fA-F]{40}$/.test(DEPOSIT_RECEIVER)
/** 演示模式下显示的钱包余额（分） */
export const DEMO_WALLET_CENTS = 500_000

const rejected = (error: unknown) => (error as { code?: number })?.code === 4001
const pad = (hex: string) => hex.replace(/^0x/, '').toLowerCase().padStart(64, '0')
/** 分 → 链上最小单位（18 位小数） */
/** 1 分 = 10^(小数位 - 2) 个最小单位 */
const UNIT = BigInt('1' + '0'.repeat(DEPOSIT_TOKEN.decimals - 2))
const CAP = BigInt('1000000000000')
const toUnits = (cents: number) => BigInt(cents) * UNIT
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** 确保钱包在 BSC 上；不在就请求切换，没添加过就请求添加 */
async function ensureChain() {
  const provider = getProvider()
  if (!provider) throw new WalletError('no-wallet', '没有检测到钱包')
  const current = String(await provider.request({ method: 'eth_chainId' })).toLowerCase()
  if (current === DEPOSIT_CHAIN.hex) return provider
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: DEPOSIT_CHAIN.hex }] })
  } catch (error) {
    if (rejected(error)) throw new WalletError('rejected', '你取消了切换网络。')
    if ((error as { code?: number })?.code !== 4902) throw new WalletError('failed', '请先在钱包里切换到 BSC 网络。')
    try {
      await provider.request({ method: 'wallet_addEthereumChain', params: [{ chainId: DEPOSIT_CHAIN.hex, chainName: DEPOSIT_CHAIN.name, nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }, rpcUrls: [DEPOSIT_CHAIN.rpc], blockExplorerUrls: [DEPOSIT_CHAIN.explorer] }] })
    } catch { throw new WalletError('failed', '请先在钱包里添加并切换到 BSC 网络。') }
  }
  return provider
}

/** 钱包里的 USDT 余额（分，向下取整）。演示模式返回固定的演示余额 */
export async function walletUsdtCents(address: string): Promise<number> {
  if (!DEPOSIT_LIVE) return DEMO_WALLET_CENTS
  const provider = await ensureChain()
  try {
    const raw = await provider.request({ method: 'eth_call', params: [{ to: DEPOSIT_TOKEN.address, data: '0x70a08231' + pad(address) }, 'latest'] }) as string
    const cents = BigInt(raw && raw !== '0x' ? raw : '0x0') / UNIT
    return cents > CAP ? Number(CAP) : Number(cents)
  } catch { throw new WalletError('failed', '没能读取钱包余额，请重试。') }
}

export type DepositStep = 'wallet' | 'chain'
/**
 * 发起充值：先让用户在钱包里确认转账（onStep('wallet')），再等链上确认（onStep('chain')）。
 * 返回交易哈希；演示模式返回 demo- 开头的编号，不发起任何转账。
 */
export async function sendDeposit(address: string, cents: number, onStep: (step: DepositStep) => void): Promise<string> {
  if (!DEPOSIT_LIVE) {
    onStep('wallet'); await sleep(1400)
    onStep('chain'); await sleep(2600)
    return `demo-${Date.now().toString(36)}`
  }
  const provider = await ensureChain()
  onStep('wallet')
  let hash: string
  try {
    // ERC-20 transfer(收款地址, 数量)
    hash = await provider.request({ method: 'eth_sendTransaction', params: [{ from: address, to: DEPOSIT_TOKEN.address, data: '0xa9059cbb' + pad(DEPOSIT_RECEIVER) + toUnits(cents).toString(16).padStart(64, '0') }] }) as string
  } catch (error) {
    throw rejected(error) ? new WalletError('rejected', '你在钱包里取消了这笔充值。') : new WalletError('failed', '充值没有发出：请确认钱包里有足够的 USDT 和少量 BNB 作为矿工费。')
  }
  onStep('chain')
  for (let i = 0; i < 90; i++) {
    await sleep(2000)
    try {
      const receipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [hash] }) as { status?: string } | null
      if (receipt) { if (receipt.status === '0x1') return hash; throw new WalletError('failed', '这笔充值在链上失败了，USDT 没有转出。') }
    } catch (error) { if (error instanceof WalletError) throw error }
  }
  throw new WalletError('failed', '链上确认超时。转账可能仍在处理，到账后余额会更新；如长时间未到账请联系客服。')
}
