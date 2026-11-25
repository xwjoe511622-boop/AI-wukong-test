import Image from 'next/image'
import { money } from '@/lib/cultivation-preview'
import { cn } from '@/lib/utils'

const SIZES = { xs: [11, 12], sm: [13, 14], md: [16, 16], lg: [22, 20], xl: [30, 26] } as const

/** 全站统一：数值在左、蟠桃图标在右，图标略小于数字。`cents` 为最小单位整数。 */
export function PeachValue({ cents, size = 'md', sign, className, muted }: { cents: number; size?: keyof typeof SIZES; sign?: '+' | '-'; className?: string; muted?: boolean }) {
  const [font, icon] = SIZES[size]
  const tone = muted ? 'text-stone-200' : 'text-gold'
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap font-latin font-bold tabular-nums', tone, className)} style={{ fontSize: font }}>
      {sign}{money(cents)}
      <Image src="/assets/peach.png" alt="蟠桃" width={icon} height={icon} style={{ width: icon, height: icon }} className="inline-block shrink-0 drop-shadow-[0_1px_4px_rgba(255,120,60,0.45)]" />
    </span>
  )
}

/** 修炼值、修炼增长与传承所得以 USDT 计；蟠桃仅用于召唤与修炼消耗。`cents` 为最小单位整数。 */
export function UsdtValue({ cents, size = 'md', sign, className, muted }: { cents: number; size?: keyof typeof SIZES; sign?: '+' | '-'; className?: string; muted?: boolean }) {
  const [font] = SIZES[size]
  return (
    <span className={cn('inline-flex items-baseline gap-1 whitespace-nowrap font-latin font-bold tabular-nums', muted ? 'text-stone-200' : 'text-gold', className)} style={{ fontSize: font }}>
      {sign}{money(cents)}<span className="font-normal opacity-80" style={{ fontSize: Math.max(10, Math.round(font * 0.55)) }}>USDT</span>
    </span>
  )
}

export function PeachText({ children }: { children: string }) {
  const parts = children.split(/(-?\d[\d,]*(?:\.\d+)?)\s*蟠桃/g)
  return <>{parts.map((part, index) => index % 2 ? <PeachValue key={index} cents={Math.round(Number(part.replaceAll(',', '')) * 100)} size="xs" muted /> : part)}</>
}
