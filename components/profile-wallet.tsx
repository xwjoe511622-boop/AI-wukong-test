'use client'

import { useState } from 'react'
import { useProduct } from './product-provider'
import { walletAddress, CURRENCY_LABEL, type Currency } from '@/lib/product-state'
import { LEDGER_LABELS, profileTime } from '@/lib/profile-rules'
import { VALID_USER_MIN_PEACH, PEACH_UNIT_TEXT, TRIAL_MODE } from '@/lib/game-data'
import { useDemoControls } from '@/lib/use-demo-controls'
import { ProfileAmount, ProfileButton, ProfileButtonLink, ProfileEmpty, ProfilePageHeader } from './profile-ui'

const toCents = (text: string) => /^\d{1,9}(\.\d{1,2})?$/.test(text.trim()) ? Math.round(Number(text) * 100) : NaN

/** 个人地址：蟠桃与 USDT 的余额、购买、转出与接收。尚未接入真实链上转账。 */
export function ProfileWallet({ initialMode }: { initialMode?: string }) {
  const { state, ready, act, notice } = useProduct()
  // 模拟到账只是调试手段，普通用户看不到
  const demo = useDemoControls()
  const [currency, setCurrency] = useState<Currency>('peach')
  const [mode, setMode] = useState<'buy' | 'out' | 'in'>(initialMode === 'buy' ? 'buy' : 'out')
  const [confirming, setConfirming] = useState(false)
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const [copied, setCopied] = useState('')
  const own = state ? walletAddress(state.playerId) : ''
  const cents = toCents(amount)
  const active: Currency = mode === 'buy' ? 'peach' : currency
  const available = mode === 'buy' || currency === 'usdt' ? state?.usdt ?? 0 : state?.balance ?? 0
  const belowValid = mode === 'out' && currency === 'peach' && Number.isFinite(cents) && (state?.balance ?? 0) >= VALID_USER_MIN_PEACH * 100 && (state?.balance ?? 0) - cents < VALID_USER_MIN_PEACH * 100
  const invalid = !ready || !Number.isFinite(cents) || cents <= 0 || (mode !== 'in' && cents > available) || (mode === 'out' && !address.trim())
  const transfers = (state?.records ?? []).filter(r => ['transfer_out', 'transfer_in', 'recharge', 'buy_pay'].includes(r.kind)).slice(0, 20)
  async function copy() {
    try { await navigator.clipboard.writeText(own); setCopied('地址已复制') }
    catch { setCopied('浏览器限制自动复制，请长按地址手动复制。') }
  }
  function submit() {
    if (invalid) return
    // 转出不可撤回，先让用户核对地址与数量
    if (mode === 'out' && !confirming) { setConfirming(true); return }
    const ok = mode === 'buy' ? act({ type: 'buy-peach', amountCents: cents }) : mode === 'out' ? act({ type: 'transfer', currency, amountCents: cents, address }) : act({ type: 'demo-receive', currency, amountCents: cents })
    setConfirming(false)
    if (ok) { setAmount(''); setAddress('') }
  }
  const pick = (next: 'buy' | 'out' | 'in') => { setMode(next); setConfirming(false) }
  return <div className="flex flex-col gap-5">
    <ProfilePageHeader title="个人地址" subtitle="蟠桃和 USDT 都在这里查看、转出和接收。购买的蟠桃到账后也显示在本页。" />
    <section className="profile-surface" aria-label="我的地址">
      <p className="text-xs text-[var(--profile-muted)]">我的地址 · 用于接收蟠桃和 USDT</p>
      <p className="mt-2 select-text break-all font-mono text-xs leading-6 text-[var(--gold-100)]">{ready ? own : '读取中…'}</p>
      <div className="mt-3 flex items-center gap-3"><ProfileButton size="small" disabled={!ready} onClick={copy}>复制地址</ProfileButton><span role="status" className="text-[11px] text-[var(--gold-200)]">{copied}</span></div>
    </section>
    <section className="grid grid-cols-2 gap-3" aria-label="资产余额">
      <div className="profile-surface"><p className="mb-2 text-[11px] text-[var(--profile-muted)]">蟠桃</p><ProfileAmount cents={state?.balance ?? 0} /><p className="mt-2 text-[10px] leading-5 text-[var(--profile-muted)]">召唤与修炼的消耗单位 · {PEACH_UNIT_TEXT}<br />持有 ≥ {VALID_USER_MIN_PEACH} 蟠桃为有效用户{state ? (state.balance >= VALID_USER_MIN_PEACH * 100 ? ' · 已达标' : ' · 未达标，不能拿奖励') : ''}</p></div>
      <div className="profile-surface"><p className="mb-2 text-[11px] text-[var(--profile-muted)]">USDT</p><ProfileAmount cents={state?.usdt ?? 0} currency="usdt" /><p className="mt-2 text-[10px] leading-5 text-[var(--profile-muted)]">配套金额打款、传承结算<br />与同行、部族奖励</p></div>
    </section>
    <section className="profile-surface" aria-label="购买、转出与接收">
      <div role="group" aria-label="操作" className="profile-tabs">{([['buy', '购买蟠桃'], ['out', '转出'], ['in', '接收']] as const).map(([id, label]) => <ProfileButton key={id} size="small" secondary={mode !== id} aria-pressed={mode === id} onClick={() => pick(id)}>{label}</ProfileButton>)}</div>
      {mode !== 'buy' && <div role="group" aria-label="资产" className="profile-tabs mt-3">{(['peach', 'usdt'] as const).map(id => <ProfileButton key={id} size="small" secondary={currency !== id} aria-pressed={currency === id} onClick={() => { setCurrency(id); setConfirming(false) }}>{CURRENCY_LABEL[id]}</ProfileButton>)}</div>}
      {mode === 'buy' ? <p className="mt-4 text-xs leading-6 text-[var(--profile-muted)]">用 USDT 余额购买蟠桃，{PEACH_UNIT_TEXT}。购买的蟠桃立即到账并显示在本页。</p> : mode === 'out' ? <>
        <label htmlFor="wallet-address" className="mb-2 mt-4 block text-xs text-[var(--profile-muted)]">接收地址</label>
        <input id="wallet-address" value={address} onChange={e => { setAddress(e.target.value); setConfirming(false) }} placeholder="0x 开头的 42 位地址" autoComplete="off" spellCheck={false} className="w-full rounded-lg border border-[var(--profile-border)] bg-[var(--profile-surface)] px-3 py-3 font-mono text-xs text-[var(--gold-100)]" />
      </> : <p className="mt-4 text-xs leading-6 text-[var(--profile-muted)]">把上方地址发给对方即可接收，到账后余额和记录会显示在本页。{demo ? '演示控制已开启，可用下方按钮模拟一笔到账。' : ''}</p>}
      {(mode !== 'in' || demo) && <>
      <label htmlFor="wallet-amount" className="mb-2 mt-4 block text-xs text-[var(--profile-muted)]">{mode === 'buy' ? '购买' : mode === 'out' ? '转出' : '模拟到账'}数量 · {CURRENCY_LABEL[active]}</label>
      <input id="wallet-amount" value={amount} onChange={e => { setAmount(e.target.value); setConfirming(false) }} inputMode="decimal" placeholder="0.00" className="w-full rounded-lg border border-[var(--profile-border)] bg-[var(--profile-surface)] px-3 py-3 font-latin text-sm text-[var(--gold-100)]" />
      {mode !== 'in' && <p className="mt-2 flex items-center gap-2 text-[11px] text-[var(--profile-muted)]">{mode === 'buy' ? '可用 USDT' : '可用'} <ProfileAmount cents={available} size="sm" currency={mode === 'buy' ? 'usdt' : currency} /><button type="button" className="underline underline-offset-4" onClick={() => { setAmount((available / 100).toFixed(2)); setConfirming(false) }}>全部</button></p>}
      {mode === 'buy' && Number.isFinite(cents) && cents > 0 && <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--gold-200)]">支付 <ProfileAmount cents={cents} size="sm" currency="usdt" /> → 到账 <ProfileAmount cents={cents} size="sm" /></p>}
      {confirming && <div role="alert" className="mt-4 rounded-lg border border-[var(--gold-500)]/50 bg-black/40 p-3 text-xs leading-6 text-[var(--gold-100)]"><p className="font-display text-sm text-[var(--gold-200)]">请核对后再确认，转出后无法撤回</p><p className="mt-2 flex flex-wrap items-center gap-2">转出 <ProfileAmount cents={cents} size="sm" currency={currency} /></p><p className="mt-1 break-all font-mono text-[11px]">至 {address.trim()}</p>{belowValid && <p className="mt-2 text-[#f0c98a]">转出后蟠桃将少于 {VALID_USER_MIN_PEACH} 个，你将不再是有效用户，无法获得同行与部族奖励。</p>}</div>}
      <div className="mt-4 flex flex-col gap-2"><ProfileButton size="large" disabled={invalid} onClick={submit}>{mode === 'buy' ? '确认购买蟠桃' : mode === 'out' ? (confirming ? '确认无误，转出' : `转出${CURRENCY_LABEL[currency]}`) : `模拟接收${CURRENCY_LABEL[currency]}`}</ProfileButton>{confirming && <ProfileButton size="large" secondary onClick={() => setConfirming(false)}>返回修改</ProfileButton>}</div>
      </>}
      <p role="status" className="mt-3 min-h-4 text-xs leading-6 text-[var(--gold-200)]">{notice}</p>
      <p className="text-[11px] leading-6 text-[var(--profile-muted)]">{TRIAL_MODE ? '体验版：购买与转出只改变本页的体验余额，不产生真实扣款或链上转账，请勿向任何地址真实付款。' : '当前版本尚未接入真实支付与链上转账，请勿向任何地址真实付款。'}</p>
    </section>
    <section aria-label="转出与接收记录"><h2 className="profile-heading mb-3">购买、转出与接收记录</h2>
      {transfers.length ? <ul className="profile-list flex flex-col">{transfers.map(r => <li key={r.id} className="border-b border-[var(--profile-border)] py-4"><div className="flex items-center justify-between gap-2"><h3 className="font-display text-sm text-[var(--gold-100)]">{LEDGER_LABELS[r.kind] ?? '资产变动'}</h3><ProfileAmount cents={r.amountCents} signed size="md" currency={r.currency} /></div><p className="mt-2 text-xs text-[var(--profile-muted)]">{r.description}</p><time dateTime={r.createdAt} className="mt-2 block text-[10px] text-[var(--profile-muted)]">{profileTime(r.createdAt)}</time></li>)}</ul> : <ProfileEmpty title="暂无记录">购买、转出和接收的记录会显示在这里。</ProfileEmpty>}
    </section>
    <ProfileButtonLink href="/me/ledger" size="large" secondary>查看全部资产明细</ProfileButtonLink>
  </div>
}
