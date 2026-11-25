'use client'

import Image from 'next/image'
import { VALID_USER_MIN_PEACH } from '@/lib/game-data'
import { useProduct } from './product-provider'

const fmt = (cents: number) => (cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 金色钱币图标，和蟠桃图标配对 */
export function UsdtCoin() {
  return <svg viewBox="0 0 32 32" aria-hidden>
    <defs><linearGradient id="usdt-coin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff0b8" /><stop offset=".45" stopColor="#f3c969" /><stop offset="1" stopColor="#9a6a17" /></linearGradient></defs>
    <circle cx="16" cy="16" r="15" fill="url(#usdt-coin)" /><circle cx="16" cy="16" r="11.6" fill="none" stroke="#6b4a14" strokeOpacity=".55" strokeWidth="1" />
    <path d="M11.2 10.4v6.9a4.8 4.8 0 0 0 9.6 0v-6.9" fill="none" stroke="#4a3208" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
}

/** 资产卡：蟠桃和 USDT 两块，图标和数字都放大，一眼看清有多少 */
export function AssetCard() {
  const { state } = useProduct()
  const balance = state?.balance ?? 0
  const usdt = state?.usdt ?? 0
  // 预约后暂扣、还没出结果或还没进猴舍的蟠桃
  const locked = (state?.entries ?? []).filter(e => e.status === 'waiting' || (e.status === 'success' && state?.trades.some(t => t.entryKey === e.key && (t.status === 'awaiting_payment' || t.status === 'awaiting_confirm')))).reduce((sum, e) => sum + e.paid, 0)
  const valid = balance >= VALID_USER_MIN_PEACH * 100
  return <div className="asset-card">
    <div className="asset-tile">
      <p className="asset-head"><span className="asset-icon"><Image src="/assets/peach.png" alt="" width={34} height={34} /></span><span className="asset-name">蟠桃</span></p>
      <p className="asset-number">{state ? fmt(balance) : '—'}</p>
      <p className="asset-note">{locked > 0 ? `另有暂扣 ${fmt(locked)}` : valid ? '有效用户' : `满 ${VALID_USER_MIN_PEACH} 为有效用户`}</p>
    </div>
    <div className="asset-tile">
      <p className="asset-head"><span className="asset-icon"><UsdtCoin /></span><span className="asset-name">USDT</span></p>
      <p className="asset-number">{state ? fmt(usdt) : '—'}</p>
      <p className="asset-note">可用余额</p>
    </div>
  </div>
}
