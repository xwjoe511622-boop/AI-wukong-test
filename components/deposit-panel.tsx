'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, RefreshCw, Wallet } from 'lucide-react'
import { DEPOSIT_CHAIN, DEPOSIT_LIVE, sendDeposit, walletUsdtCents, type DepositStep } from '@/lib/deposit'
import { money } from '@/lib/cultivation-preview'
import { shortAddress } from '@/lib/wallet'
import { useProduct } from './product-provider'
import { ProfileButton } from './profile-ui'
import { useWallet } from './wallet-gate'

const toCents = (value: string) => /^\d+(\.\d{1,2})?$/.test(value.trim()) ? Math.round(Number(value) * 100) : NaN
type Phase = { kind: 'idle' } | { kind: 'working'; step: DepositStep; cents: number } | { kind: 'done'; cents: number } | { kind: 'error'; text: string }
const STEPS: [DepositStep | 'done', string][] = [['wallet', '钱包确认'], ['chain', '链上确认'], ['done', '到账']]

/** 充值：把当前钱包里的 USDT（BSC）转入平台余额。收款通道接入前是演示流程，不发起真实转账 */
export function DepositPanel() {
  const { session } = useWallet()
  const { act } = useProduct()
  const [amount, setAmount] = useState('')
  const [wallet, setWallet] = useState<number | null>(null)
  const [reading, setReading] = useState(false)
  const [spent, setSpent] = useState(0)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const address = session?.address ?? ''
  // 没连接真实钱包（演示地址）或收款通道未接入：走演示流程
  const demo = !DEPOSIT_LIVE || !!session?.demo
  const read = useCallback(async () => {
    if (!address) return
    setReading(true)
    try { setWallet(await walletUsdtCents(address)) } catch (error) { setWallet(null); setPhase({ kind: 'error', text: error instanceof Error ? error.message : '没能读取钱包余额，请重试。' }) }
    setReading(false)
  }, [address])
  useEffect(() => { read() }, [read])
  // 演示模式下，充过的数量从演示钱包余额里减掉，看起来和真实的一样
  const balance = wallet === null ? null : demo ? Math.max(0, wallet - spent) : wallet
  const cents = toCents(amount)
  const working = phase.kind === 'working'
  const bad = !Number.isFinite(cents) || cents <= 0 || balance === null || cents > balance

  async function deposit() {
    if (bad || working) return
    try {
      const hash = await sendDeposit(address, cents, step => setPhase({ kind: 'working', step, cents }))
      act({ type: 'deposit', amountCents: cents, txHash: hash })
      setPhase({ kind: 'done', cents }); setAmount('')
      if (demo) setSpent(v => v + cents); else read()
    } catch (error) { setPhase({ kind: 'error', text: error instanceof Error ? error.message : '充值失败，请重试。' }) }
  }
  const at = phase.kind === 'working' ? (phase.step === 'wallet' ? 0 : 1) : phase.kind === 'done' ? 3 : -1
  return <div role="tabpanel">
    <h2 className="font-display text-base text-[var(--gold-100)]">充值 USDT</h2>
    <div className="deposit-wallet">
      <span className="deposit-wallet-icon"><Wallet className="size-[18px]" aria-hidden /></span>
      <div className="min-w-0 flex-1"><p className="text-[12px] text-[var(--profile-muted)]">钱包 USDT 余额 · {DEPOSIT_CHAIN.short}</p><p className="mt-0.5 font-latin text-lg font-bold tabular-nums text-[var(--gold-100)]">{balance === null ? '--' : money(balance)}<span className="unit">USDT</span></p><p className="mt-0.5 truncate font-mono text-[12px] text-[var(--profile-muted)]" data-no-i18n>{shortAddress(address)}</p></div>
      <button type="button" onClick={read} disabled={reading || working} aria-label="刷新钱包余额" className="deposit-refresh"><RefreshCw className={`size-4 ${reading ? 'animate-spin' : ''}`} aria-hidden /></button>
    </div>
    <label htmlFor="deposit-amount" className="asset-label">充值数量</label>
    <div className="asset-field"><input id="deposit-amount" value={amount} onChange={e => { setAmount(e.target.value); if (phase.kind !== 'working') setPhase({ kind: 'idle' }) }} inputMode="decimal" placeholder="0.00" className="num" disabled={working} /><span className="unit">USDT</span><button type="button" disabled={working || !balance} onClick={() => setAmount(((balance ?? 0) / 100).toFixed(2))}>全部</button></div>
    {Number.isFinite(cents) && balance !== null && cents > balance && <p role="alert" className="mt-2 text-xs leading-5 text-[#f0a58a]">钱包里的 USDT 不够这个数量。</p>}
    <p className="mt-3 text-[12px] leading-5 text-[var(--profile-muted)]">USDT 从你的钱包直接转入平台，链上确认后到账。需要钱包里有少量 BNB 作为矿工费。</p>

    {at >= 0 && <ol className="deposit-steps" aria-label="充值进度">{STEPS.map(([key, label], i) => <li key={key} data-state={i < at ? 'done' : i === at ? 'now' : 'todo'}><span>{i < at ? <Check className="size-3.5" aria-hidden /> : i === at ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : i + 1}</span>{label}</li>)}</ol>}
    {phase.kind === 'working' && <p role="status" className="mt-2 text-center text-xs text-[var(--gold-200)]">{phase.step === 'wallet' ? '请在钱包里确认这笔转账…' : '已发出，等待链上确认…'}</p>}
    {phase.kind === 'done' && <p role="status" className="mt-2 text-center text-sm text-[var(--gold-100)]">充值到账 {money(phase.cents)} USDT</p>}
    {phase.kind === 'error' && <p role="alert" className="trade-confirm mt-3 text-xs leading-6 text-[#f0b49a]">{phase.text}</p>}

    <div className="mt-5"><ProfileButton size="large" disabled={bad || working} onClick={deposit}>{working ? '充值中…' : '充值'}</ProfileButton></div>
    {demo && <p className="mt-3 text-center text-[12px] leading-5 text-[var(--profile-muted)]">演示流程：充值通道接入前，不会动用你钱包里的资产，余额为演示数字。</p>}
  </div>
}
