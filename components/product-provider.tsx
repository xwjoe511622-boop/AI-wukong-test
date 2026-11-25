'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import useSWR from 'swr'
import { PRODUCT_KEY, createProduct, parseProduct, productTransition, type ProductState, type ProductAction } from '@/lib/product-state'

const Context = createContext<{ state: ProductState | null; ready: boolean; now: number; notice: string; warning: string; act: (action: ProductAction) => boolean } | null>(null)
export function ProductProvider({ children }: { children: ReactNode }) {
  const { data, mutate } = useSWR<ProductState>(PRODUCT_KEY, null, { revalidateOnFocus: false, revalidateOnReconnect: false })
  const current = useRef<ProductState | null>(null)
  const [ready, setReady] = useState(false)
  const [now, setNow] = useState(0)
  const [notice, setNotice] = useState('')
  const [warning, setWarning] = useState('')
  const save = useCallback((state: ProductState) => {
    current.current = state
    void mutate(state, false)
    // 存到 localStorage：关闭标签页或浏览器后，余额与猴舍仍然保留
    try { localStorage.setItem(PRODUCT_KEY, JSON.stringify(state)) }
    catch { setWarning('浏览器未能保存本次记录，请勿关闭页面。') }
  }, [mutate])
  useEffect(() => {
    let state = current.current
    if (!state) {
      try { const raw = localStorage.getItem(PRODUCT_KEY); if (raw) state = parseProduct(raw) }
      catch { setWarning('存档读取异常，已开启新的旅程。') }
      state ??= createProduct(Date.now(), crypto.randomUUID())
    }
    const result = productTransition(state, { type: 'tick' }, Date.now() + state.offset)
    save(result.state)
    if (result.message) setNotice(result.message)
    setNow(Date.now() + state.offset); setReady(true)
    const timer = setInterval(() => {
      const timestamp = Date.now() + (current.current?.offset ?? 0)
      setNow(timestamp)
      if (!current.current) return
      const update = productTransition(current.current, { type: 'tick' }, timestamp)
      if (update.state !== current.current) save(update.state)
      if (update.message) setNotice(update.message)
    }, 1000)
    return () => clearInterval(timer)
  }, [save])
  const act = useCallback((action: ProductAction) => {
    if (!current.current) return false
    const timestamp = Date.now() + (current.current?.offset ?? 0)
    const updated = productTransition(current.current, { type: 'tick' }, timestamp)
    const result = productTransition(updated.state, action, timestamp)
    const changed = result.state !== updated.state
    if (result.state !== current.current) save(result.state)
    setNow(Date.now() + result.state.offset); setNotice(result.message)
    return changed
  }, [save])
  return <Context.Provider value={{ state: data ?? null, ready, now, notice, warning, act }}>{children}</Context.Provider>
}
export function useProduct() {
  const value = useContext(Context)
  if (!value) throw new Error('ProductProvider is required')
  return value
}
