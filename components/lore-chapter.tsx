import type { ReactNode } from 'react'
import { BrandLogo } from './brand-logo'
import Link from 'next/link'

export function LoreChapter({ id, number, title, subtitle, children }: { id: string; number: string; title: string; subtitle?: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-title`} className="read-panel mt-4 scroll-mt-6 px-4 py-6">
    <p className="mb-3 font-latin text-[10px] tracking-[.25em] text-[var(--gold-400)]">AI WUKONG · CHAPTER {number}</p>
    <h2 id={`${id}-title`} className="font-display text-2xl font-bold leading-snug text-[var(--gold-100)]">{title}</h2>
    {subtitle && <p className="mt-3 text-sm leading-7 text-[var(--gold-200)]">{subtitle}</p>}
    <div className="mt-5 flex flex-col gap-4 text-[13px] leading-7 text-stone-300">{children}</div>
  </section>
}

export function WukongStory() {
  return <section aria-labelledby="wukong-story-title" className="hud-panel relative overflow-hidden rounded-xl px-5 py-7 text-center">
    <BrandLogo className="mx-auto mb-4 w-52" />
    <p className="font-latin text-[10px] tracking-[.2em] text-[var(--gold-400)]">AI WUKONG · DIGITAL LIFE</p>
    <h2 id="wukong-story-title" className="mt-3 font-display text-xl font-bold leading-9 text-[var(--gold-100)]">神话，不再只是故事。<br /><span className="text-gold">它正在成为数字生命。</span></h2>
    <p className="mt-4 text-sm text-[var(--gold-200)]">东方神话 · AI 原生数字生命</p>
    <p className="mt-2 text-xs leading-6 text-stone-300">每一次召唤，都是与一位数字生命的相遇。</p>
    <p className="mt-3 text-[11px] tracking-widest text-[var(--gold-200)]">召唤 · 修炼 · 成长 · 传承</p>
    <Link href="/me/encyclopedia" className="btn-ghost-gold mt-5 inline-flex min-h-11 w-full items-center justify-center text-xs">翻开悟空百科</Link>
  </section>
}
