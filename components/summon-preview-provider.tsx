'use client'

import type { ReactNode } from 'react'
import { initialPreview, type PreviewAction } from '@/lib/summon-preview'
import { useProduct } from './product-provider'

export function SummonPreviewProvider({ children }: { children: ReactNode }) { return children }
export function useSummonPreview() {
  const product = useProduct()
  return {
    state: { ...initialPreview(), balance: product.state?.balance ?? 0, entries: product.state?.entries ?? [] },
    now: product.now, ready: product.ready, notice: product.notice, warning: product.warning,
    currentTime: () => Date.now() + (product.state?.offset ?? 0), act: (action: PreviewAction) => { product.act({ type: 'summon', action }) },
  }
}
