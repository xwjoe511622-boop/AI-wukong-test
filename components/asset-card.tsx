'use client'

import Image from 'next/image'
import { CircleDollarSign } from 'lucide-react'
import { VALID_USER_MIN_PEACH } from '@/lib/game-data'
import { useProduct } from './product-provider'

const fmt = (cents: number) => (cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 资产卡：蟠桃和 USDT 两块，图标和数字都放大，一眼看清有多少 */
export function AssetCard() {
  const { state } = useProduct()
  const balance = state?.balance ?? 0
  const usdt = state?.usdt ?? 0
  // 预约后暂扣、还没出结果或还没进猴舍的蟠桃
  const locked = (state?.entries ?? []).filter(e => e.status === 'waiting' || (e.status === 'success' && state?.trades.some(t => t.entryKey === e.key && (t.status === 'awaiting_payment' || t.status === 'awaiting_confirm')))).reduce((sum, e) => sum + e.paid, 0)
  const valid = balance >= VALID_USER_MIN_PEACH * 100
  return <div className="asset-card">
    <div className="asset-tile is-peach">
      <span className="asset-icon"><Image src="/assets/peach.png" alt="" width={44} height={44} /></span>
      <p className="asset-name">蟠桃</p>
      <p className="asset-number">{state ? fmt(balance) : '—'}</p>
      <p className="asset-note">{locked > 0 ? `另有暂扣 ${fmt(locked)}` : valid ? '有效用户' : `满 ${VALID_USER_MIN_PEACH} 为有效用户`}</p>
    </div>
    <div className="asset-tile is-usdt">
      <span className="asset-icon"><CircleDollarSign className="size-9" strokeWidth={1.4} aria-hidden /></span>
      <p className="asset-name">USDT</p>
      <p className="asset-number">{state ? fmt(usdt) : '—'}</p>
      <p className="asset-note">修炼值打款 · 传承所得 · 奖励</p>
    </div>
  </div>
}
