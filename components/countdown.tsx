'use client'

import { splitDuration } from '@/lib/schedule'
import { cn } from '@/lib/utils'

function DigitBox({ value, big }: { value: string; big?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-[rgba(212,148,26,0.5)] bg-[linear-gradient(180deg,#17141c,#0a080d)] font-latin font-bold tabular-nums text-gold',
        big ? 'h-11 min-w-9 px-1.5 text-2xl' : 'h-7 min-w-6 px-1 text-base',
      )}
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,227,154,0.14), inset 0 0 10px rgba(0,0,0,0.6)' }}
    >
      {value}
    </span>
  )
}

export function Countdown({ ms, big }: { ms: number; big?: boolean }) {
  const { days, h, m, s } = splitDuration(ms)
  const hours = days > 0 ? String(Number(h) + days * 24).padStart(2, '0') : h
  const sep = <span className={cn('font-latin text-[var(--gold-500)]', big ? 'text-2xl' : 'text-base')}>:</span>
  return (
    <div className="flex items-center gap-1">
      <DigitBox value={hours} big={big} />
      {sep}
      <DigitBox value={m} big={big} />
      {sep}
      <DigitBox value={s} big={big} />
    </div>
  )
}
