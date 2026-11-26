'use client'

import { isAddress } from '@/lib/wallet'
import { useState } from 'react'
import { PEACH_UNIT_TEXT, VALID_USER_MIN_PEACH } from '@/lib/game-data'
import { LEDGER_LABELS, profileTime } from '@/lib/profile-rules'
import { CURRENCY_LABEL, type Currency } from '@/lib/product-state'
import { money } from '@/lib/cultivation-preview'
import { AssetCard } from './asset-card'
import { useProduct } from './product-provider'
import { ProfileAmount, ProfileButton, ProfileButtonLink, ProfileEmpty, ProfilePageHeader } from './profile-ui'

type Mode = 'deposit' | 'transfer' | 'buy'
const MODES: [Mode, string][] = [['deposit', '充值'], ['transfer', '转账'], ['buy', '购买蟠桃']]
const toCents = (value: string) => /^\d+(\.\d{1,2})?$/.test(value.trim()) ? Math.round(Number(value) * 100) : NaN

/** 我的资产：余额、充值、转账、购买蟠桃。全部是平台内记账 */
export function ProfileWallet({ initialMode }: { initialMode?: string }) {
  const { state, ready, act, notice } = useProduct()
  const [mode, setMode] = useState<Mode>(MODES.some(([id]) => id === initialMode) ? initialMode as Mode : 'buy')
  const [currency, setCurrency] = useState<Currency>('usdt')
  const [amount, setAmount] = useState('')
  const [uid, setUid] = useState('')
  const [confirming, setConfirming] = useState(false)
  const cents = toCents(amount)
  const usdt = state?.usdt ?? 0, peach = state?.balance ?? 0
  const available = mode === 'buy' || currency === 'usdt' ? usdt : peach
  const badAmount = !Number.isFinite(cents) || cents <= 0 || cents > available
  const belowValid = mode === 'transfer' && currency === 'peach' && Number.isFinite(cents) && peach >= VALID_USER_MIN_PEACH * 100 && peach - cents < VALID_USER_MIN_PEACH * 100
  const records = (state?.records ?? []).filter(r => r.amountCents !== 0 && ['recharge', 'buy_pay', 'transfer_out', 'transfer_in'].includes(r.kind)).slice(0, 10)
  const pick = (next: Mode) => { setMode(next); setConfirming(false); setAmount('') }
  function transfer() {
    if (!confirming) { setConfirming(true); return }
    if (act({ type: 'transfer-to', currency, amountCents: cents, uid })) { setAmount(''); setUid('') }
    setConfirming(false)
  }
  return <div className="flex flex-col gap-4">
    <ProfilePageHeader title="我的资产" />
    <AssetCard />
    <div role="tablist" aria-label="操作" className="quick-actions">{MODES.map(([id, label]) => <button type="button" role="tab" key={id} aria-selected={mode === id} onClick={() => pick(id)} className={`${mode === id ? 'btn-gold' : 'btn-ghost-gold'} ornate-short`}>{label}</button>)}</div>
    <section className="profile-surface" aria-label={MODES.find(([id]) => id === mode)?.[1]}>
      {mode === 'deposit' && <div role="tabpanel" className="py-6 text-center">
        <p className="font-display text-base text-[var(--gold-100)]">充值 USDT</p>
        <p className="mt-2 text-xs leading-6 text-[var(--profile-muted)]">充值通道即将开放，开放后会在通知里告诉你。</p>
      </div>}

      {mode === 'transfer' && <div role="tabpanel">
        <h2 className="font-display text-base text-[var(--gold-100)]">转账</h2>
        <span className="asset-label !mt-3">转哪种资产</span>
        <div role="group" aria-label="转账资产" className="asset-pick">{(['usdt', 'peach'] as const).map(id => <button type="button" key={id} aria-pressed={currency === id} onClick={() => { setCurrency(id); setConfirming(false) }}>{CURRENCY_LABEL[id]}<strong>{money(id === 'usdt' ? usdt : peach)}</strong></button>)}</div>
        <label htmlFor="transfer-uid" className="asset-label">对方钱包地址</label>
        <div className="asset-field"><input id="transfer-uid" value={uid} onChange={e => { setUid(e.target.value); setConfirming(false) }} placeholder="0x 开头的钱包地址" autoComplete="off" spellCheck={false} className="font-mono !text-sm" /></div>
        <label htmlFor="transfer-amount" className="asset-label">转账数量</label>
        <div className="asset-field"><input id="transfer-amount" value={amount} onChange={e => { setAmount(e.target.value); setConfirming(false) }} inputMode="decimal" placeholder="0.00" className="num" /><span className="unit">{CURRENCY_LABEL[currency]}</span><button type="button" onClick={() => { setAmount((available / 100).toFixed(2)); setConfirming(false) }}>全部</button></div>
        {belowValid && <p role="alert" className="mt-2 text-xs leading-5 text-[#f0a58a]">转出后蟠桃将少于 {VALID_USER_MIN_PEACH} 个，你将不再是有效用户，无法获得同行与部族奖励。</p>}
        {confirming && <div role="alert" className="trade-confirm mt-4 text-xs leading-6">请核对：向 <code className="break-all text-[var(--gold-100)]">{uid.trim()}</code> 转出 <strong className="text-[var(--gold-100)]">{money(cents)} {CURRENCY_LABEL[currency]}</strong>。转出后无法撤回。</div>}
        <div className="mt-5 flex flex-col gap-2"><ProfileButton size="large" disabled={!ready || badAmount || !isAddress(uid.trim())} onClick={transfer}>{confirming ? '确认无误，转出' : '转账'}</ProfileButton>{confirming && <ProfileButton size="large" secondary onClick={() => setConfirming(false)}>返回修改</ProfileButton>}</div>
      </div>}

      {mode === 'buy' && <div role="tabpanel">
        <h2 className="font-display text-base text-[var(--gold-100)]">购买蟠桃</h2>
        <p className="mt-1 text-xs leading-6 text-[var(--profile-muted)]">用 USDT 余额购买，{PEACH_UNIT_TEXT}，立即到账。</p>
        <label htmlFor="wallet-amount" className="asset-label">购买数量</label>
        <div className="asset-field"><input id="wallet-amount" value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" placeholder="0.00" className="num" /><span className="text-xs text-[var(--gold-200)]">蟠桃</span><button type="button" onClick={() => setAmount((usdt / 100).toFixed(2))}>全部</button></div>
        {Number.isFinite(cents) && cents > 0 && <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--gold-200)]">支付 <ProfileAmount cents={cents} size="sm" currency="usdt" /> → 到账 <ProfileAmount cents={cents} size="sm" /></p>}
        {Number.isFinite(cents) && cents > usdt && <p role="alert" className="mt-2 text-xs text-[#f0a58a]">USDT 余额不足。</p>}
        <div className="mt-5"><ProfileButton size="large" disabled={!ready || badAmount} onClick={() => { if (act({ type: 'buy-peach', amountCents: cents })) setAmount('') }}>确认购买</ProfileButton></div>
      </div>}
      {mode !== 'deposit' && notice && <p role="status" className="mt-2 text-center text-xs leading-6 text-[var(--gold-200)]">{notice}</p>}
    </section>

    <section aria-labelledby="asset-records"><h2 id="asset-records" className="profile-heading mb-3">最近记录</h2>
      {records.length ? <ul className="profile-list flex flex-col">{records.map(r => <li key={r.id} className="border-b border-[var(--profile-border)] py-3.5"><div className="flex items-center justify-between gap-2"><h3 className="text-sm text-[var(--gold-100)]">{LEDGER_LABELS[r.kind] ?? '资产变动'}</h3><ProfileAmount cents={r.amountCents} signed size="md" currency={r.currency} /></div><p className="mt-1 text-[12px] text-[var(--profile-muted)]">{r.kind === 'transfer_out' ? `${r.description.replace(/：.*$/, '')} · ` : ''}{profileTime(r.createdAt)}</p></li>)}</ul>
        : <ProfileEmpty title="暂无记录">充值、转账和购买蟠桃的记录会显示在这里。</ProfileEmpty>}
    </section>
    <ProfileButtonLink href="/me/ledger" size="large" secondary>全部资产明细</ProfileButtonLink>
  </div>
}
