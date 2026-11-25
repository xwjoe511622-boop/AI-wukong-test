'use client'

import { useState } from 'react'
import { PEACH_UNIT_TEXT } from '@/lib/game-data'
import { LEDGER_LABELS, profileTime } from '@/lib/profile-rules'
import { AssetCard } from './asset-card'
import { useProduct } from './product-provider'
import { ProfileAmount, ProfileButton, ProfileButtonLink, ProfileEmpty, ProfilePageHeader } from './profile-ui'

const toCents = (value: string) => /^\d+(\.\d{1,2})?$/.test(value.trim()) ? Math.round(Number(value) * 100) : NaN

/** 我的资产：蟠桃与 USDT 余额，用 USDT 购买蟠桃。平台内记账，没有链上地址和转出 */
export function ProfileWallet({ initialMode }: { initialMode?: string }) {
  const { state, ready, act, notice } = useProduct()
  const [amount, setAmount] = useState('')
  const cents = toCents(amount)
  const available = state?.usdt ?? 0
  const invalid = !ready || !Number.isFinite(cents) || cents <= 0 || cents > available
  const records = (state?.records ?? []).filter(r => ['recharge', 'buy_pay'].includes(r.kind)).slice(0, 10)
  return <div className="flex flex-col gap-5">
    <ProfilePageHeader title="我的资产" subtitle="蟠桃用于召唤和修炼；USDT 用于修炼值打款，传承所得和奖励也进到这里。" />
    <AssetCard />
    <section className="profile-surface" aria-labelledby="buy-title">
      <h2 id="buy-title" className="profile-heading">购买蟠桃</h2>
      <p className="mt-2 text-xs leading-6 text-[var(--profile-muted)]">用 USDT 余额购买，{PEACH_UNIT_TEXT}，立即到账。</p>
      <label htmlFor="wallet-amount" className="mb-2 mt-3 block text-xs text-[var(--profile-muted)]">购买数量 · 蟠桃</label>
      <input id="wallet-amount" autoFocus={initialMode === 'buy'} value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" placeholder="0.00" className="w-full rounded-lg border border-[var(--profile-border)] bg-black/40 px-3 py-3 text-base tabular-nums text-[var(--gold-100)]" />
      <p className="mt-2 flex items-center gap-2 text-[11px] text-[var(--profile-muted)]">可用 <ProfileAmount cents={available} size="sm" currency="usdt" /><button type="button" className="underline underline-offset-4" onClick={() => setAmount((available / 100).toFixed(2))}>全部</button></p>
      {Number.isFinite(cents) && cents > 0 && <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--gold-200)]">支付 <ProfileAmount cents={cents} size="sm" currency="usdt" /> → 到账 <ProfileAmount cents={cents} size="sm" /></p>}
      {Number.isFinite(cents) && cents > available && <p role="alert" className="mt-2 text-xs text-[#f0a58a]">USDT 余额不足。</p>}
      <div className="mt-4"><ProfileButton size="large" disabled={invalid} onClick={() => { if (act({ type: 'buy-peach', amountCents: cents })) setAmount('') }}>确认购买</ProfileButton></div>
      <p role="status" className="mt-2 min-h-4 text-xs leading-6 text-[var(--gold-200)]">{notice}</p>
    </section>
    <section aria-labelledby="buy-records"><h2 id="buy-records" className="profile-heading mb-3">购买记录</h2>
      {records.length ? <ul className="profile-list flex flex-col">{records.map(r => <li key={r.id} className="border-b border-[var(--profile-border)] py-4"><div className="flex items-center justify-between gap-2"><h3 className="font-display text-sm text-[var(--gold-100)]">{LEDGER_LABELS[r.kind] ?? '资产变动'}</h3><ProfileAmount cents={r.amountCents} signed size="md" currency={r.currency} /></div><time dateTime={r.createdAt} className="mt-2 block text-[11px] text-[var(--profile-muted)]">{profileTime(r.createdAt)}</time></li>)}</ul>
        : <ProfileEmpty title="暂无记录">购买蟠桃的记录会显示在这里。</ProfileEmpty>}
    </section>
    <ProfileButtonLink href="/me/ledger" size="large" secondary>查看全部资产明细</ProfileButtonLink>
  </div>
}
