import type { Metadata } from 'next'
import { TradeView } from '@/components/trade-view'

export const metadata: Metadata = { title: '交易详情 · AI WUKONG' }

export default async function TradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TradeView key={id} id={decodeURIComponent(id)} />
}
