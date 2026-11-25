'use client'

import type { Action } from '@/lib/cultivation-preview'
import { useProduct } from './product-provider'

export function CultivationPreviewProvider({ children }: { children: React.ReactNode }) {
  const { ready, state } = useProduct()
  if (!ready || !state) return <div role="status" className="py-12 text-center text-sm text-stone-300">正在开启修炼之境…</div>
  return children
}
export function useCultivationPreview() {
  const product = useProduct()
  return {
    state: { version: 2 as const, balance: product.state?.balance ?? 0, contracts: product.state?.contracts ?? [], history: product.state?.history ?? [] },
    now: product.now, message: product.warning || product.notice, busy: !product.ready,
    act: (action: Action) => { product.act({ type: 'cultivate', action }) },
  }
}
