'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { SoundEngine, type SoundName } from './sound-engine'

type SoundContextValue = {
  play: (name: SoundName) => void
  muted: boolean
  volume: number
  toggleMuted: () => void
  setVolume: (v: number) => void
}

const SoundContext = createContext<SoundContextValue | null>(null)
const STORE_KEY = 'wukong.sound.v1'

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef<SoundEngine | null>(null)
  if (engineRef.current === null) engineRef.current = new SoundEngine()
  const engine = engineRef.current

  const [muted, setMuted] = useState(false)
  const [volume, setVolumeState] = useState(0.7)

  // 读回本地偏好
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      if (raw) {
        const p = JSON.parse(raw) as { muted?: boolean; volume?: number }
        // 声音默认开启，页面上不再提供静音按钮，所以不读回以前存下的静音状态
        if (typeof p.volume === 'number') { setVolumeState(p.volume); engine.setVolume(p.volume) }
      }
    } catch {}
  }, [engine])

  // 首次用户手势解锁音频上下文
  useEffect(() => {
    const unlock = () => engine.unlock()
    const opts = { passive: true } as const
    window.addEventListener('pointerdown', unlock, opts)
    window.addEventListener('keydown', unlock, opts)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [engine])

  const persist = useCallback((next: { muted: boolean; volume: number }) => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)) } catch {}
  }, [])

  const value = useMemo<SoundContextValue>(() => ({
    play: (name) => engine.play(name),
    muted,
    volume,
    toggleMuted: () => {
      setMuted((m) => {
        const next = !m
        engine.setMuted(next)
        engine.unlock()
        if (!next) engine.play('tap')
        persist({ muted: next, volume })
        return next
      })
    },
    setVolume: (v) => {
      setVolumeState(v)
      engine.setVolume(v)
      engine.unlock()
      persist({ muted, volume: v })
    },
  }), [engine, muted, volume, persist])

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) {
    // 容错：在 Provider 之外调用时返回空实现，避免崩溃
    return { play: () => {}, muted: true, volume: 0, toggleMuted: () => {}, setVolume: () => {} } as SoundContextValue
  }
  return ctx
}
