'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useSound } from '@/lib/sound'

/** 按住运功多久算完成（毫秒） */
export const HOLD_MS = 1400

/**
 * 按住才生效的按钮：按满 HOLD_MS 触发 onDone，中途松手不算。
 * 用在会直接扣蟠桃的修炼上，既有仪式感也防误触。键盘操作（回车、空格）直接触发。
 */
export function HoldButton({ onDone, disabled, children, holdingText = '运功中…', className = '', label }: { onDone: () => void; disabled?: boolean; children: ReactNode; holdingText?: string; className?: string; label?: string }) {
  const { play } = useSound()
  const [holding, setHolding] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const done = useRef(onDone)
  done.current = onDone
  const finish = () => { setHolding(false); done.current() }
  const press = () => { if (disabled || timer.current) return; play('tap'); setHolding(true); timer.current = setTimeout(() => { timer.current = null; finish() }, HOLD_MS) }
  const release = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null } setHolding(false) }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  return <button type="button" className={`cultivation-primary slip-hold flex w-full items-center justify-center gap-1.5 ${holding ? 'is-holding' : ''} ${className}`} style={{ '--hold': `${HOLD_MS}ms` } as CSSProperties} disabled={disabled} aria-label={label}
    onPointerDown={e => { if (e.button === 0) press() }} onPointerUp={release} onPointerLeave={release} onPointerCancel={release} onContextMenu={e => e.preventDefault()}
    onClick={e => { if (e.detail === 0 && !disabled) finish() }}>
    <span className="slip-hold-fill" aria-hidden />
    <span className="relative flex items-center gap-1.5">{holding ? holdingText : children}</span>
  </button>
}
