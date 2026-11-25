import Image from 'next/image'
import { cn } from '@/lib/utils'

/** 用户头像：设置过就显示自己的图片，没设置显示默认的悟空印图标 */
export function Avatar({ src, size = 40, className }: { src?: string | null; size?: number; className?: string }) {
  if (src) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} style={{ width: size, height: size }} className={cn('shrink-0 rounded-full border border-[#b0904b80] object-cover', className)} />
  )
  return <Image src="/assets/player-emblem.png" alt="" width={size} height={size} style={{ width: size, height: size }} className={cn('shrink-0 object-contain', className)} />
}
