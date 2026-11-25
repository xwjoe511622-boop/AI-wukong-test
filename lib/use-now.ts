'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export const InitialTimeContext = createContext<number | null>(null)

/** Reuse the serialized server timestamp until hydration finishes. */
export function useNow(intervalMs = 1000): Date {
  const initialNow = useContext(InitialTimeContext)
  if (initialNow === null) throw new Error('useNow must be used within GameProvider')
  const [now, setNow] = useState<Date>(() => new Date(initialNow))

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
