'use client'

import Link from 'next/link'
import { Bell, BookOpen, ChevronRight, Headphones, Info, Megaphone, ScrollText, Settings, Wallet, Award, History } from 'lucide-react'
import { useGame } from '@/lib/game-context'
import { useProduct } from './product-provider'
import { useProfile } from '@/lib/use-profile'
import { PlayerIdentity } from './player-identity'
import { tribeTier } from '@/lib/profile-rules'
import { ProfileInvite } from './profile-invite'
import { AssetCard } from './asset-card'
import { ProfileMenu } from './profile-ui'
import { needsMyAction } from '@/lib/trade'

/**
 * 「我的」只放账户相关的四块：资产、进行中的交易（有才显示）、团队、记录与服务。
 * 悟空在猴舍看，召唤在悟空世界看，这里不重复。
 */
export function MeView() {
  const { playerId } = useGame()
  const { state } = useProduct()
  const { data } = useProfile()
  const active = (state?.trades ?? []).filter(t => t.status === 'awaiting_payment' || t.status === 'awaiting_confirm')
  const todo = active.filter(needsMyAction)
  // 部族等级：按第一代有效同行者数和部族有效成员数算，和奖励发放用的是同一套规则
  const members = state?.members ?? []
  const tier = tribeTier(members.filter(m => m.generation === 1 && m.valid !== false).length, members.filter(m => m.valid !== false).length)
  return <div className="flex flex-col gap-5">
    <PlayerIdentity playerId={playerId} settingsHref="/me/security" avatar={state?.avatar} tier={state ? tier?.name.replace('部族', '部族 ').replace('阶', ' 阶') ?? null : undefined} />

    {/* 资产 */}
    <section aria-labelledby="me-assets">
      <div className="mb-2 flex items-center justify-between"><h2 id="me-assets" className="profile-heading">我的资产</h2><Link href="/me/ledger" className="profile-inline-link">资产明细<ChevronRight className="size-3" /></Link></div>
      <AssetCard />
      <div className="quick-actions mt-3">
        <Link href="/me/wallet?mode=deposit" className="btn-gold ornate-short">充值</Link>
        <Link href="/me/wallet?mode=transfer" className="btn-gold ornate-short">转账</Link>
        <Link href="/me/wallet?mode=buy" className="btn-gold ornate-short">购买蟠桃</Link>
      </div>
    </section>

    {/* 进行中的交易：有才显示 */}
    {active.length > 0 && <Link href={todo.length === 1 ? `/me/trades/${encodeURIComponent(todo[0].id)}` : '/me/trades'} className={`profile-surface flex items-center justify-between gap-3 ${todo.length ? '!border-[#e0a05a99]' : ''}`}>
      <div><h2 className="font-display text-sm text-[var(--gold-100)]">进行中的交易</h2><p className="mt-1.5 text-xs text-[var(--profile-muted)]">{todo.length ? <span className="trade-chip is-todo">{todo.length} 笔待我处理</span> : `${active.length} 笔 · 等待对方`}</p></div>
      <ChevronRight className="size-4 shrink-0 text-[var(--gold-400)]" />
    </Link>}

    {/* 团队：同行与部族、奖励、邀请放在一起 */}
    <section aria-labelledby="me-team" className="flex flex-col gap-3">
      <h2 id="me-team" className="profile-heading">我的团队</h2>
      <div className="profile-surface !p-0">
        <div className="grid grid-cols-2">
          <Link href="/me/companions" className="p-4" aria-label="我的同行者"><p className="flex items-center justify-between text-[12px] text-[var(--profile-muted)]">我的同行者<ChevronRight className="size-3.5" /></p><p className="relation-count num">{data?.companions ?? '—'}<small>人</small></p></Link>
          <Link href="/me/tribe" className="border-l border-[var(--profile-border)] p-4" aria-label="我的部族"><p className="flex items-center justify-between text-[12px] text-[var(--profile-muted)]">我的部族<ChevronRight className="size-3.5" /></p><p className="relation-count num">{data?.members ?? '—'}<small>人</small></p></Link>
        </div>
      </div>
      <ProfileInvite code={data?.inviteCode} />
    </section>

    <ProfileMenu title="我的记录" items={[
      { label: '资产明细', href: '/me/ledger', icon: Wallet }, { label: '交易记录', href: '/me/trades', icon: ScrollText }, { label: '奖励明细', href: '/me/rewards', icon: Award }, { label: '传承历史', href: '/house/history', icon: History },
    ]} />
    <ProfileMenu title="服务" items={[
      { label: '通知', href: '/me/notifications', icon: Bell }, { label: '悟空百科', href: '/me/encyclopedia', icon: BookOpen }, { label: '公告中心', href: '/me/announcements', icon: Megaphone }, { label: '客服中心', href: '/me/support', icon: Headphones }, { label: '设置', href: '/me/security', icon: Settings }, { label: '关于 AI WUKONG', href: '/me/about', icon: Info },
    ]} />
    <p className="pb-2 text-center text-[12px] tracking-wide text-[var(--profile-muted)]">AI WUKONG · 与君同行</p>
  </div>
}
