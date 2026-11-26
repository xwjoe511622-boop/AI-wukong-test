'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import useSWR from 'swr'
import { PRODUCT_KEY, createProduct, parseProduct, productTransition, type ProductState, type ProductAction } from '@/lib/product-state'
import { useWallet } from './wallet-gate'

const Context = createContext<{ state: ProductState | null; ready: boolean; now: number; notice: string; warning: string; act: (action: ProductAction) => boolean; /** 还没连接钱包：只能逛，不能操作 */ guest: boolean } | null>(null)
export function ProductProvider({ children }: { children: ReactNode }) {
  // 每个钱包地址各有各的存档；地址就是玩家身份
  const wallet = useWallet()
  const account = wallet.session?.address.toLowerCase() ?? null
  const guest = !account
  // 没连接钱包时用一份空的临时存档，只用来显示页面，不保存
  const storageKey = `${PRODUCT_KEY}:${account ?? 'guest'}`
  const { data, mutate } = useSWR<ProductState>(storageKey, null, { revalidateOnFocus: false, revalidateOnReconnect: false })
  const current = useRef<ProductState | null>(null)
  const [ready, setReady] = useState(false)
  const [now, setNow] = useState(0)
  const [notice, setNotice] = useState('')
  const [warning, setWarning] = useState('')
  const save = useCallback((state: ProductState) => {
    current.current = state
    void mutate(state, false)
    // 存到 localStorage：关闭标签页或浏览器后，余额与猴舍仍然保留
    if (guest) return
    try { localStorage.setItem(storageKey, JSON.stringify(state)) }
    catch { setWarning('本次记录暂时没能保存，请先不要关闭页面。') }
  }, [mutate, storageKey, guest])
  // 当前这份存档属于哪个地址：连接或切换钱包后要换一份，页面不用整个重载
  const loadedKey = useRef<string | null>(null)
  useEffect(() => {
    if (loadedKey.current !== storageKey) { current.current = null; loadedKey.current = storageKey; setNotice(''); setWarning('') }
    let state = current.current
    if (!state) {
      try { const raw = guest ? null : localStorage.getItem(storageKey); if (raw) state = parseProduct(raw) }
      catch { setWarning('没能读取到之前的记录，已为你开启新的旅程。') }
      state ??= account ? createProduct(Date.now(), account) : createProduct(Date.now(), 'guest', { balance: 0, usdt: 0 })
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
  }, [save, storageKey, account, guest])
  const act = useCallback((action: ProductAction) => {
    if (!current.current) return false
    // 没连接钱包：任何操作都先请用户连接
    if (guest) { wallet.connect(); return false }
    const timestamp = Date.now() + (current.current?.offset ?? 0)
    const updated = productTransition(current.current, { type: 'tick' }, timestamp)
    const result = productTransition(updated.state, action, timestamp)
    const changed = result.state !== updated.state
    if (result.state !== current.current) save(result.state)
    setNow(Date.now() + result.state.offset); setNotice(result.message)
    return changed
  }, [save, guest, wallet])
  return <Context.Provider value={{ state: data ?? null, ready, now, notice, warning, act, guest }}>{children}</Context.Provider>
}
export function useProduct() {
  const value = useContext(Context)
  if (!value) throw new Error('ProductProvider is required')
  return value
}
