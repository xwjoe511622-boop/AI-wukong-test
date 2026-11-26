'use client'

import Image from 'next/image'
import Link from 'next/link'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { BookOpen, ChevronRight, Copy, Headset, Megaphone, Wallet, X } from 'lucide-react'
import { TRIAL_MODE } from '@/lib/game-data'
import { shortAddress } from '@/lib/wallet'
import { demoSession, getProvider, loadSession, requestAddress, saveSession, signLogin, WalletError, type WalletSession } from '@/lib/wallet-client'

type Step = 'idle' | 'connecting' | 'signing'
type WalletValue = { session: WalletSession | null; /** 还没读完本地登录状态 */ loading: boolean; /** 打开连接钱包的窗口 */ connect: () => void; disconnect: () => void }
const Context = createContext<WalletValue | null>(null)
export function useWallet() {
  const value = useContext(Context)
  if (!value) throw new Error('WalletGate is required')
  return value
}

/**
 * 钱包登录：不连接也能进来逛，用到账户时（召唤、猴舍、我的、支付结算、转账）再连接。
 * 连接分两步：连接钱包拿地址 → 对登录消息签名。钱包地址就是用户身份，每个地址各有各的存档。
 * 在钱包里切换账户会退出登录，需要用新地址重新签名。
 */
export function WalletGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WalletSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  useEffect(() => { setSession(loadSession()); setLoading(false) }, [])
  const disconnect = useCallback(() => { saveSession(null); setSession(null) }, [])
  const connect = useCallback(() => setOpen(true), [])
  // 钱包里换了账户或断开：当前登录作废
  useEffect(() => {
    const provider = getProvider()
    if (!provider?.on || !session || session.demo) return
    const changed = (accounts: unknown) => { const next = (accounts as string[])?.[0]; if (!next || next.toLowerCase() !== session.address.toLowerCase()) disconnect() }
    provider.on('accountsChanged', changed)
    return () => provider.removeListener?.('accountsChanged', changed)
  }, [session, disconnect])
  return <Context.Provider value={{ session, loading, connect, disconnect }}>
    {children}
    {open && !session && <ConnectDialog onClose={() => setOpen(false)} onDone={next => { saveSession(next); setSession(next); setOpen(false) }} />}
  </Context.Provider>
}

function ConnectDialog({ onClose, onDone }: { onClose: () => void; onDone: (session: WalletSession) => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<Step>('idle')
  const [pending, setPending] = useState('')
  const [error, setError] = useState('')
  const [noWallet, setNoWallet] = useState(false)
  const [copied, setCopied] = useState(false)
  useEffect(() => { const node = ref.current; node?.showModal(); return () => node?.close() }, [])
  const busy = step !== 'idle'
  async function connect() {
    setError(''); setNoWallet(false)
    try {
      let address = pending
      if (!address) { setStep('connecting'); address = await requestAddress(); setPending(address) }
      setStep('signing')
      onDone(await signLogin(address))
    } catch (e) {
      if (e instanceof WalletError && e.code === 'no-wallet') setNoWallet(true)
      else setError(e instanceof Error ? e.message : '连接失败，请重试。')
      setStep('idle')
    }
  }
  async function copyLink() { try { await navigator.clipboard.writeText(location.href); setCopied(true) } catch { setCopied(false) } }
  return <dialog ref={ref} aria-labelledby="wallet-title" onCancel={e => { if (busy) e.preventDefault(); else onClose() }} className="cultivation-dialog wallet-dialog text-center">
    <button type="button" onClick={onClose} disabled={busy} aria-label="关闭" className="absolute right-2 top-2 flex size-11 items-center justify-center text-[var(--gold-200)]"><X className="size-5" /></button>
    <Image src="/assets/player-seal.png" alt="" width={84} height={84} className="wallet-seal" />
    <h2 id="wallet-title" className="font-display text-xl font-bold tracking-widest text-gold">连接钱包</h2>
    <p className="mt-1.5 text-sm text-[var(--gold-200)]">钱包地址就是你在悟空世界的身份</p>
    <ol className="wallet-steps" aria-label="登录步骤">
      <li className={pending ? 'is-done' : step === 'connecting' ? 'is-now' : ''}><span>1</span>连接钱包</li>
      <li className={step === 'signing' ? 'is-now' : ''}><span>2</span>签名登录</li>
    </ol>
    {pending && <p className="mb-3 text-xs text-[var(--gold-200)]">已连接 <code className="font-mono text-[var(--gold-100)]">{shortAddress(pending)}</code></p>}
    <button type="button" autoFocus className="btn-gold w-full text-sm" disabled={busy} onClick={connect}>{step === 'connecting' ? '请在钱包中确认连接…' : step === 'signing' ? '请在钱包中签名…' : pending ? '签名登录' : '连接钱包'}</button>
    <p className="mt-3 text-[12px] leading-5 text-[var(--gold-200)]/80">签名只用于验证这是你的钱包，不会发起任何交易，也不消耗矿工费。资产与支付结算都在平台内完成，不会从你的钱包直接扣款。</p>
    {error && <p role="alert" className="mt-3 text-sm text-[#f0a58a]">{error}</p>}
    {noWallet && <div role="alert" className="wallet-tip">
      <p className="text-sm text-[#f3d6a8]">没有检测到钱包</p>
      <p className="mt-1.5 text-xs leading-5 text-[var(--gold-200)]/90">请在 MetaMask、TokenPocket、OKX、imToken 等钱包 App 的内置浏览器里打开本页面，或在电脑浏览器安装钱包插件后刷新。</p>
      <button type="button" onClick={copyLink} className="mt-2 min-h-9 text-xs text-[var(--gold-100)] underline underline-offset-4">{copied ? '链接已复制，去钱包里粘贴打开' : '复制本页链接'}</button>
    </div>}
    {TRIAL_MODE && <button type="button" onClick={() => onDone(demoSession())} disabled={busy} className="mt-3 min-h-11 w-full text-xs text-[var(--gold-200)] underline underline-offset-4">暂不连接，用演示地址进入</button>}
  </dialog>
}

/**
 * 右上角的钱包入口：没连接时是「连接钱包」按钮；连接后缩成一个小钱包图标，
 * 点开看完整地址、复制、断开。
 */
export function WalletButton() {
  const { session, loading, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  useEffect(() => { if (!session) setOpen(false) }, [session])
  if (loading) return null
  if (!session) return <button type="button" onClick={connect} className="btn-gold ornate-short btn-compact wallet-connect">连接钱包</button>
  async function copy() { try { await navigator.clipboard.writeText(session!.address); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {} }
  return <>
    <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label={`钱包 ${shortAddress(session.address)}`} className="notice-bell wallet-icon"><Wallet className="size-[18px]" aria-hidden /></button>
    {open && <>
      <button type="button" aria-label="关闭钱包面板" className="fixed inset-0 z-[58] cursor-default" onClick={() => setOpen(false)} />
      <div role="dialog" aria-label="我的钱包" className="wallet-pop">
        <p className="text-[12px] text-[var(--profile-muted)]">{session.demo ? '演示地址 · 未连接钱包' : '已连接钱包'}</p>
        <p className="mt-1.5 select-text break-all font-mono text-[12.5px] leading-5 text-[var(--gold-100)]">{session.address}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={copy} className="wallet-pop-btn"><Copy className="size-3.5" aria-hidden />{copied ? '已复制' : '复制地址'}</button>
          <button type="button" onClick={() => { setOpen(false); disconnect() }} className="wallet-pop-btn is-out">{session.demo ? '退出演示' : '断开钱包'}</button>
        </div>
      </div>
    </>}
  </>
}

/** 需要账户的页面在没连接时显示的卡片 */
export function ConnectCard({ title = '连接钱包，开启你的悟空之旅', note = '连接后可以召唤悟空、进入猴舍、查看资产与交易。', links = false }: { title?: string; note?: string; links?: boolean }) {
  const { connect, loading } = useWallet()
  if (loading) return <div role="status" className="py-16 text-center text-sm text-stone-400">正在读取…</div>
  return <div className="flex flex-col gap-4 pt-6">
    <section className="wallet-card">
      <Image src="/assets/player-seal.png" alt="" width={96} height={96} className="wallet-seal" />
      <h1 className="font-display text-xl font-bold leading-8 text-gold">{title}</h1>
      <p className="mx-auto mt-2 max-w-[18rem] text-xs leading-6 text-[var(--gold-200)]">{note}</p>
      <button type="button" onClick={connect} className="btn-gold mt-5 w-full text-sm">连接钱包</button>
      <p className="mt-3 text-[12px] leading-5 text-[var(--gold-200)]/85">只需签名验证，不发起交易，不消耗矿工费。</p>
    </section>
    {links && <nav aria-label="不用连接也能看" className="profile-surface !p-0">{([['/me/encyclopedia', '悟空百科', BookOpen], ['/me/announcements', '公告中心', Megaphone], ['/me/support', '客服中心', Headset]] as const).map(([href, label, Icon]) => <Link key={href} href={href} className="flex min-h-12 items-center gap-3 border-b border-[var(--profile-border)] px-4 text-sm text-[var(--gold-100)] last:border-0"><Icon className="size-4 text-[var(--gold-300)]" aria-hidden /><span className="flex-1">{label}</span><ChevronRight className="size-4 text-[var(--gold-400)]" aria-hidden /></Link>)}</nav>}
  </div>
}
