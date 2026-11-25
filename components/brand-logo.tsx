import Image from 'next/image'
import { cn } from '@/lib/utils'

export const BRAND_LOGO_SRC = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Codex%20Image%202026%E5%B9%B49%E6%9C%8819%E6%97%A5%2005_08_21-dIAxMV2XOZcJjTd5ta6o7lNd1QgqS2.png'

export function BrandLogo({ className, preload = false }: { className?: string; preload?: boolean }) {
  return <Image src={BRAND_LOGO_SRC} alt="AI悟空" width={1875} height={839} unoptimized preload={preload} className={cn('block h-auto max-w-full object-contain', className)} />
}
