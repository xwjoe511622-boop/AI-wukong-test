import type { Metadata } from 'next'
import { CultivationPreviewProvider } from '@/components/cultivation-preview-provider'
import './cultivation.css'

export const metadata: Metadata = { title: '猴舍 · 修炼之境 | AI WUKONG', description: '七境修炼、悟空养成与传承历史。' }
export default function HouseLayout({ children }: { children: React.ReactNode }) {
  return <CultivationPreviewProvider><div className="cultivation-preview">{children}</div></CultivationPreviewProvider>
}
