'use client'

import { cn } from '@/lib/utils'

/** Small gold diamond used as a decorative corner/center jewel. */
export function Jewel({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block rotate-45 rounded-[2px] bg-[linear-gradient(135deg,#ffe39a,#c07d14)]', className)}
      style={{ boxShadow: '0 0 8px rgba(242,180,49,0.7), inset 0 0 3px rgba(255,255,255,0.6)' }}
      aria-hidden
    />
  )
}

/** A gold divider line with a center jewel — echoes the card frames. */
export function GoldDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)} aria-hidden>
      <div className="h-px flex-1 gold-line" />
      <Jewel className="h-1.5 w-1.5" />
      <div className="h-px flex-1 gold-line" />
    </div>
  )
}

/** The black-marble + gold plaque used for section titles (mirrors the banner assets). */
export function TitlePlaque({
  zh,
  en,
  className,
}: {
  zh: string
  en?: string
  className?: string
}) {
  return (
    <div className={cn('relative mx-auto w-fit px-8 py-2', className)}>
      <div className="pointer-events-none absolute inset-0 gold-hairline rounded-[10px]" />
      <div className="absolute -left-1 top-1/2 -translate-y-1/2">
        <Jewel className="h-2.5 w-2.5" />
      </div>
      <div className="absolute -right-1 top-1/2 -translate-y-1/2">
        <Jewel className="h-2.5 w-2.5" />
      </div>
      <div className="relative text-center">
        <h2 className="font-display text-xl font-black tracking-[0.18em] text-gold">{zh}</h2>
        {en && <p className="font-latin text-[9px] text-[var(--gold-500)]">{en}</p>}
      </div>
    </div>
  )
}

/** Ornate panel wrapper with gold hairline border. */
export function Panel({
  children,
  className,
  glow,
}: {
  children: React.ReactNode
  className?: string
  glow?: boolean
}) {
  return <div className={cn('panel rounded-2xl', glow && 'panel-glow', className)}>{children}</div>
}
