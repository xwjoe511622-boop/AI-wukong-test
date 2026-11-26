'use client'

import Image from 'next/image'
import { createContext, Fragment, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { TRIAL_MODE } from '@/lib/game-data'
import { shortAddress } from '@/lib/wallet'
import { demoSession, getProvider, loadSession, requestAddress, saveSession, signLogin, WalletError, type WalletSession } from '@/lib/wallet-client'

type Step = 'idle' | 'connecting' | 'signing'
const Context = createContext<{ session: WalletSession | null; disconnect: () => void } | null>(null)
export function useWallet() {
  const value = useContext(Context)
  if (!value) throw new Error('WalletGate is required')
  return value
}

/**
 * 登录门：先连接钱包并签名，才进入 App。钱包地址就是用户身份，每个地址各有各的存档。
 * 在钱包里切换账户会退出登录，需要用新地址重新签名。
 */
export function WalletGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WalletSession | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [step, setStep] = useState<Step>('idle')
  const [pending, setPending] = useState('')
  const [error, setError] = useState('')
  const [noWallet, setNoWallet] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { setSession(loadSession()); setLoaded(true) }, [])
  const disconnect = useCallback(() => { saveSession(null); setSession(null); setStep('idle'); setPending(''); setError('') }, [])
  // 钱包里换了账户或断开：当前登录作废
  useEffect(() => {
    const provider = getProvider()
    if (!provider?.on || !session || session.demo) return
    const changed = (accounts: unknown) => { const next = (accounts as string[])?.[0]; if (!next || next.toLowerCase() !== session.address.toLowerCase()) disconnect() }
    provider.on('accountsChanged', changed)
    return () => provider.removeListener?.('accountsChanged', changed)
  }, [session, disconnect])

  async function connect() {
    setError(''); setNoWallet(false)
    try {
      let address = pending
      if (!address) { setStep('connecting'); address = await requestAddress(); setPending(address) }
      setStep('signing')
      const next = await signLogin(address)
      saveSession(next); setSession(next); setPending('')
    } catch (e) {
      if (e instanceof WalletError && e.code === 'no-wallet') setNoWallet(true)
      else setError(e instanceof Error ? e.message : '连接失败，请重试。')
    } finally { setStep('idle') }
  }
  function enterDemo() { const next = demoSession(); saveSession(next); setSession(next) }
  async function copyLink() { try { await navigator.clipboard.writeText(location.href); setCopied(true) } catch { setCopied(false) } }

  if (!loaded) return <div className="wallet-gate" aria-busy="true" />
  if (session) return <Context.Provider value={{ session, disconnect }}><Fragment key={session.address.toLowerCase()}>{children}</Fragment></Context.Provider>

  const busy = step !== 'idle'
  return <main className="wallet-gate">
    <div className="wallet-card">
      <Image src="/assets/player-seal.png" alt="" width={104} height={104} priority className="wallet-seal" />
      <h1 className="font-display text-2xl font-bold tracking-widest text-gold">AI 悟空</h1>
      <p className="mt-2 text-sm text-[var(--gold-200)]">连接钱包，进入悟空世界</p>

      <ol className="wallet-steps" aria-label="登录步骤">
        <li className={pending ? 'is-done' : step === 'connecting' ? 'is-now' : ''}><span>1</span>连接钱包</li>
        <li className={step === 'signing' ? 'is-now' : ''}><span>2</span>签名登录</li>
      </ol>
      {pending && <p className="mb-3 text-xs text-[var(--gold-200)]">已连接 <code className="font-mono text-[var(--gold-100)]">{shortAddress(pending)}</code></p>}

      <button type="button" className="btn-gold w-full text-sm" disabled={busy} onClick={connect}>{step === 'connecting' ? '请在钱包中确认连接…' : step === 'signing' ? '请在钱包中签名…' : pending ? '签名登录' : '连接钱包'}</button>
      <p className="mt-3 text-[11.5px] leading-5 text-[var(--gold-200)]/80">签名只用于验证这是你的钱包，不会发起任何交易，也不消耗矿工费。</p>
      {error && <p role="alert" className="mt-3 text-sm text-[#f0a58a]">{error}</p>}
      {noWallet && <div role="alert" className="wallet-tip">
        <p className="text-sm text-[#f3d6a8]">没有检测到钱包</p>
        <p className="mt-1.5 text-xs leading-5 text-[var(--gold-200)]/90">请在 MetaMask、TokenPocket、OKX、imToken 等钱包 App 的内置浏览器里打开本页面，或在电脑浏览器安装钱包插件后刷新。</p>
        <button type="button" onClick={copyLink} className="mt-2 min-h-9 text-xs text-[var(--gold-100)] underline underline-offset-4">{copied ? '链接已复制，去钱包里粘贴打开' : '复制本页链接'}</button>
      </div>}
      {TRIAL_MODE && <button type="button" onClick={enterDemo} disabled={busy} className="mt-4 min-h-11 w-full text-xs text-[var(--gold-200)] underline underline-offset-4">暂不连接，用演示地址进入</button>}
    </div>
    <p className="mt-5 px-6 text-center text-[11px] leading-5 text-stone-500">钱包地址就是你在悟空世界的身份。<br />资产与支付结算都在平台内完成，不会从你的钱包直接扣款。</p>
  </main>
}
