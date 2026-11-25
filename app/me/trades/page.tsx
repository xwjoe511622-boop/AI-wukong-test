import type { Metadata } from 'next'
import { TradeList } from '@/components/trade-list'

export const metadata: Metadata = { title: '我的交易 · AI WUKONG' }

export default function TradesPage() {
  return <TradeList />
}
