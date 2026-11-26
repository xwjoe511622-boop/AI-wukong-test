'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { lockedItems, lockedTotal } from '@/lib/locked'
import { VALID_USER_MIN_PEACH } from '@/lib/game-data'
import { useProduct } from './product-provider'

const fmt = (cents: number) => (cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * 资产卡：蟠桃、USDT 上下两行，数字放大；
 * 有暂扣时在蟠桃这一行直接显示暂扣多少，点进去看每一笔。
 */
export function AssetCard() {
  const { state } = useProduct()
  const balance = state?.balance ?? 0
  const usdt = state?.usdt ?? 0
  const locked = lockedTotal(lockedItems(state))
  const valid = balance >= VALID_USER_MIN_PEACH * 100
  return <div className="asset-card">
    <div className="asset-cols">
      <Link href="/me/wallet" className="asset-main" aria-label="我的资产：蟠桃">
        <p className="asset-name"><Image src="/assets/peach.png" alt="" width={26} height={26} />蟠桃</p>
        <p className="asset-number">{state ? fmt(balance) : '—'}</p>
        <p className={`asset-note ${valid ? 'is-on' : ''}`}>{valid ? '有效用户' : `满 ${VALID_USER_MIN_PEACH} 为有效用户`}</p>
      </Link>
      <Link href="/me/wallet" className="asset-main" aria-label="我的资产：USDT">
        <p className="asset-name is-usdt">USDT</p>
        <p className="asset-number">{state ? fmt(usdt) : '—'}</p>
        <p className="asset-note">可用余额</p>
      </Link>
    </div>
    <Link href="/me/locked" className="asset-locked"><span>暂扣中</span><strong>{fmt(locked)}</strong><Image src="/assets/peach.png" alt="蟠桃" width={20} height={20} /><em>查看<ChevronRight className="size-3.5" aria-hidden /></em></Link>
  </div>
}
