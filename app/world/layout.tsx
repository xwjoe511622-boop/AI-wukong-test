import type { Metadata } from 'next'
import { SummonPreviewProvider } from '@/components/summon-preview-provider'

export const metadata: Metadata = { title: '悟空世界 · 七大仙境', description: '选择仙境，发起召唤，召唤成功后进入猴舍修炼。七大仙境自每日 11:00 起依次召唤。' }
export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return <SummonPreviewProvider><div className="[&_a]:scroll-mb-40 [&_button]:scroll-mb-40 [&_summary]:scroll-mb-40">{children}</div></SummonPreviewProvider>
}
