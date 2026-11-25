'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function ProfileAmount({ cents, size = 'md', signed = false, currency = 'peach' }: { cents: number; size?: 'sm' | 'md' | 'lg'; signed?: boolean; currency?: 'peach' | 'usdt' }) {
  const text = (Math.abs(cents) / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const iconSize = size === 'lg' ? 26 : size === 'md' ? 17 : 13
  return <span className={cn('profile-amount', `profile-amount-${size}`)}><span>{cents < 0 ? '−' : signed ? '+' : ''}{text}</span>{currency === 'usdt' ? <span className="text-[max(10px,0.55em)] font-normal opacity-80">USDT</span> : <Image src="/assets/peach.png" alt="蟠桃" width={iconSize} height={iconSize} style={{ width: iconSize, height: iconSize }} />}</span>
}
export function ProfileButton({ size = 'medium', secondary = false, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { size?: 'small' | 'medium' | 'large'; secondary?: boolean }) {
  return <button type="button" {...props} className={cn(secondary ? 'btn-ghost-gold' : 'btn-gold', 'profile-button', size === 'large' && 'w-full', size === 'small' && 'ornate-short btn-compact justify-self-start self-start', className)} />
}
export function ProfileButtonLink({ href, children, size = 'medium', secondary = false }: { href: string; children: ReactNode; size?: 'small' | 'medium' | 'large'; secondary?: boolean }) {
  return <Link href={href} className={cn(secondary ? 'btn-ghost-gold' : 'btn-gold', 'profile-button inline-flex items-center justify-center', size === 'large' && 'w-full', size === 'small' && 'ornate-short btn-compact justify-self-start self-start')}>{children}</Link>
}
export function ProfileHeading({ title, href, action }: { title: string; href?: string; action?: string }) {
  return <div className="flex items-center justify-between gap-2"><h2 className="profile-heading">{title}</h2>{href && <Link href={href} className="profile-inline-link">{action ?? '查看'}<ChevronRight className="size-3" /></Link>}</div>
}
export function ProfilePageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <header className="flex flex-col gap-3"><div><ProfileButtonLink href="/me" size="small" secondary>返回我的</ProfileButtonLink></div><div><h1 className="font-display text-2xl font-bold text-[var(--gold-100)]">{title}</h1>{subtitle && <p className="mt-2 text-xs leading-relaxed text-[var(--profile-muted)]">{subtitle}</p>}</div></header>
}
export function ProfileMenu({ title, items }: { title: string; items: { label: string; href: string; icon: LucideIcon }[] }) {
  return <section className="profile-surface"><h2 className="profile-heading mb-2">{title}</h2><ul className="profile-menu">{items.map(({ label, href, icon: Icon }) => <li key={label}><Link href={href}><Icon className="size-4" /><span className="flex-1">{label}</span><ChevronRight className="size-3.5 opacity-50" /></Link></li>)}</ul></section>
}
export function ProfileEmpty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="profile-empty"><Image src="/assets/player-seal.png" alt="" width={44} height={44} className="opacity-50" /><h2 className="font-display text-base text-[var(--gold-100)]">{title}</h2><div className="text-xs leading-6 text-[var(--profile-muted)]">{children}</div></div>
}
export function ProfilePager({ page, hasMore, onPage }: { page: number; hasMore: boolean; onPage: (page: number) => void }) {
  if (!page && !hasMore) return null
  return <nav aria-label="记录分页" className="flex items-center justify-between gap-3"><ProfileButton size="small" secondary disabled={!page} onClick={() => onPage(page - 1)}>上一页</ProfileButton><span className="text-xs text-[var(--profile-muted)]">第 {page + 1} 页</span><ProfileButton size="small" secondary disabled={!hasMore} onClick={() => onPage(page + 1)}>下一页</ProfileButton></nav>
}
