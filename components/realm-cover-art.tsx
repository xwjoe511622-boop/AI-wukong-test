'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { WukongLevel } from '@/lib/game-data'

export function RealmCoverArt({ level, index }: { level: WukongLevel; index: number }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setVisible(true)
      observer.disconnect()
    }, { threshold: 0.45 })
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  return <div
    ref={frameRef}
    className="realm-cover-art"
    data-illuminated={visible && loaded}
    style={{ '--gleam-delay': `${index * 120}ms`, '--gleam-strength': 0.24 + index * 0.035 } as CSSProperties}
  >
    <Image
      src={level.realmCover}
      alt={`${level.realm}仙境封面`}
      width={1672}
      height={941}
      sizes="(max-width: 480px) calc(100vw - 32px), 448px"
      loading={index === 0 ? 'eager' : 'lazy'}
      className="-mx-px block h-auto w-[calc(100%+2px)] max-w-none"
      onLoad={() => setLoaded(true)}
    />
  </div>
}
