import Image from 'next/image'
import { cn } from '@/lib/utils'

export function formatPeach(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** 正式蟠桃图标，放置于数值右侧。 */
export function PeachIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/assets/peach.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      style={{ height: 'auto' }}
      className={cn('inline-block shrink-0 drop-shadow-[0_1px_4px_rgba(255,120,60,0.45)]', className)}
    />
  )
}

const sizeMap = {
  sm: 12,
  md: 14,
  lg: 18,
  xl: 26,
}

export function PeachAmount({
  value,
  size = 'md',
  className,
  prefix,
  sign,
}: {
  value: number
  size?: keyof typeof sizeMap
  className?: string
  prefix?: string
  sign?: '+' | '-'
}) {
  const px = sizeMap[size]
  const textSize =
    size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-sm'
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap font-latin font-bold tabular-nums', className)}>
      <span className={cn(textSize, 'text-gold')}>
        {sign}{prefix}{formatPeach(value)}
      </span>
      <Image src="/assets/peach.png" alt="蟠桃" width={px} height={px} style={{ width: px, height: px }} className="shrink-0 object-contain" />
    </span>
  )
}
