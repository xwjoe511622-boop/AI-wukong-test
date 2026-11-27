'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { lockedItems, lockedTotal } from '@/lib/locked'
import { durationText } from '@/lib/summon-preview'
import { PeachValue } from './peach-value'
import { useProduct } from './product-provider'
import { ProfileButtonLink, ProfileEmpty, ProfilePageHeader } from './profile-ui'

/** 暂扣中的蟠桃：一共暂扣多少、每一笔是哪个仙境、什么时候退还或扣除 */
export function ProfileLocked() {
  const { state, ready, now } = useProduct()
  const items = lockedItems(state)
  const total = lockedTotal(items)
  return <div className="flex flex-col gap-4">
    <ProfilePageHeader title="暂扣中的蟠桃" back="/me/wallet" />
    <section className="locked-hero" aria-label="暂扣合计">
      <p className="locked-hero-label">一共暂扣</p>
      <PeachValue cents={total} size="xl" className="locked-hero-value" />
      <p className="locked-hero-note">{items.length ? `共 ${items.length} 笔 · 可用蟠桃 ${((state?.balance ?? 0) / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}` : '现在没有暂扣的蟠桃'}</p>
    </section>
    {!ready ? <p role="status" className="text-sm text-[var(--profile-muted)]">正在读取…</p>
      : !items.length ? <ProfileEmpty title="没有暂扣">点召唤时会暂扣召唤蟠桃，在这里可以看到每一笔。</ProfileEmpty>
      : <ul className="flex flex-col gap-3">{items.map(item => <li key={item.key}><Link href={item.href} className={`locked-row ${item.phase === 'paying' ? 'is-todo' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><h2 className="font-display text-base text-[var(--gold-100)]">{item.name}<span className="ml-2 text-[12px] font-normal text-[var(--profile-muted)]">{item.realm}</span></h2><p className={`mt-1.5 text-xs ${item.phase === 'paying' ? 'text-[#f3b27a]' : 'text-[var(--gold-200)]'}`}>{item.status}{item.until && item.until > now ? ` · 剩 ${durationText(item.until - now)}` : ''}</p></div>
          <span className="flex shrink-0 items-center gap-1"><PeachValue cents={item.cents} size="lg" /><ChevronRight className="size-4 text-[var(--gold-400)]" aria-hidden /></span>
        </div>
        <p className="mt-3 text-[12px] leading-5 text-[var(--profile-muted)]">{item.next}</p>
      </Link></li>)}</ul>}
    <section className="profile-surface text-xs leading-6 text-[var(--profile-muted)]" aria-label="暂扣规则">
      <h2 className="mb-1 font-display text-sm text-[var(--gold-100)]">暂扣的蟠桃会怎样</h2>
      <p>召唤失败：全额退还。</p><p>悟空进猴舍：正式扣除。</p><p>召唤成功却逾期未支付：全部转给传承人，不退还。</p>
    </section>
    <ProfileButtonLink href="/me/ledger" size="large" secondary>全部资产明细</ProfileButtonLink>
  </div>
}
