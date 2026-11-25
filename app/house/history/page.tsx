import type { Metadata } from 'next'
import { CultivationHistory } from '@/components/cultivation-history'

export const metadata: Metadata = { title: '传承历史 | AI WUKONG' }
export default function HistoryPage() { return <CultivationHistory /> }
