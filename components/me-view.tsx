'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Bell, ChevronRight, Flag, ArrowLeftRight, Globe, Headphones, Info, ScrollText, ShieldCheck, Sparkles, Sprout, Swords, Users, Wallet, Award } from 'lucide-react'
import { useGame } from '@/lib/game-context'
import { useProduct } from './product-provider'
import { useProfile } from '@/lib/use-profile'
import { TRIBE_TIERS } from '@/lib/profile-rules'
import { PlayerIdentity } from './player-identity'
import { TRIAL_MODE } from '@/lib/game-data'
import { ProfileInvite } from './profile-invite'
import { ProfileAmount, ProfileButton, ProfileButtonLink, ProfileHeading, ProfileMenu } from './profile-ui'
import { pendingTrades } from '@/lib/trade'

export function MeView() {
  const { balance, playerId } = useGame()
  const { state } = useProduct()
  const lockedPeaches = (state?.entries.filter(e => e.status === 'waiting').reduce((sum, e) => sum + e.paid, 0) ?? 0)
  const { data, error, mutate } = useProfile()
  const todo = pendingTrades(state?.trades ?? [])
  const active = state?.trades.filter(t => t.status === 'awaiting_payment' || t.status === 'awaiting_confirm').length ?? 0
  return <div className="flex flex-col gap-5">
    <PlayerIdentity playerId={playerId} settingsHref="/me/security" />
    <section className="profile-surface" aria-label="我的资产">
      <ProfileHeading title="我的资产" href="/me/wallet" action="个人地址" />
      <div className="mt-3 grid grid-cols-2 gap-3"><div><p className="mb-2 text-[11px] text-[var(--profile-muted)]">可用蟠桃</p><ProfileAmount cents={Math.round(balance * 100)} size="md" /></div><div className="border-l border-[var(--profile-border)] pl-4"><p className="mb-2 text-[11px] text-[var(--profile-muted)]">可用 USDT</p><ProfileAmount cents={state?.usdt ?? 0} size="md" currency="usdt" /></div></div>
      <p className="mt-3 flex items-center gap-2 border-t border-[var(--profile-border)] pt-3 text-[11px] text-[var(--profile-muted)]">暂扣蟠桃 <ProfileAmount cents={lockedPeaches} size="sm" />{TRIAL_MODE && <span>· 体验版余额</span>}</p>
      <div className="mt-3 flex items-center justify-between gap-3"><div className="flex flex-wrap gap-2"><ProfileButtonLink href="/me/wallet" size="small">转出 / 接收</ProfileButtonLink><ProfileButtonLink href="/me/wallet?mode=buy" size="small" secondary>购买蟠桃</ProfileButtonLink></div></div>
    </section>
    <Link href={todo.length === 1 ? `/me/trades/${encodeURIComponent(todo[0].id)}` : '/me/trades'} className={`profile-surface flex items-center justify-between gap-3 ${todo.length ? '!border-[#e0a05a99]' : ''}`}><div><h2 className="font-display text-sm text-[var(--gold-100)]">我的交易</h2><p className="mt-2 text-xs text-[var(--profile-muted)]">{todo.length ? <span className="trade-chip is-todo">{todo.length} 笔待处理 · {todo.some(t => t.role === 'payer') ? '有打款即将到期' : '待确认收款'}</span> : active ? `进行中 ${active} 笔 · 等待对方` : '召唤打款与传承收款'}</p></div><ChevronRight className="size-4 shrink-0 text-[var(--gold-400)]" /></Link>
    <Link href="/house" className="profile-surface flex items-center justify-between gap-3"><div><h2 className="font-display text-sm text-[var(--gold-100)]">我的数字生命</h2><p className="mt-2 text-xs text-[var(--profile-muted)]">当前悟空 {state?.contracts.length ?? 0}只</p></div><ChevronRight className="size-4 shrink-0 text-[var(--gold-400)]" /></Link>
    <ProfileInvite code={data?.inviteCode} />
    {error && <div role="alert" className="profile-surface text-xs"><p>{error.message}</p><ProfileButton size="small" onClick={() => mutate()}>重试连接</ProfileButton></div>}
    <section className="grid grid-cols-2 gap-3" aria-label="我的同行关系">
      <Link href="/me/companions" className="profile-relation"><div className="flex items-center justify-between"><strong>我的同行者</strong><Users className="size-5 text-[var(--gold-400)]" /></div><p className="relation-count">{data?.companions ?? '—'}<small>人</small></p><div className="flex items-center justify-between text-[11px] text-[var(--profile-muted)]"><span>第一代有效同行者</span><ChevronRight className="size-3.5" /></div></Link>
      <Link href="/me/tribe" className="profile-relation"><div className="flex items-center justify-between"><strong>我的部族</strong><Flag className="size-5 text-[var(--gold-400)]" /></div><p className="relation-count">{data?.members ?? '—'}<small>人</small></p><div className="flex items-center justify-between text-[11px] text-[var(--profile-muted)]"><span>部族有效成员</span><ChevronRight className="size-3.5" /></div>{data && data.level > 0 && <span className="text-[10px] text-[var(--gold-300)]">{['','Ⅰ','Ⅱ','Ⅲ'][data.level]}阶部族 · 返 USDT {TRIBE_TIERS.find(t => t.level === data.level)?.rate ?? 0}%</span>}</Link>
    </section>
    <section className="profile-surface" aria-label="我的奖励">
      <ProfileHeading title="我的奖励" href="/me/rewards" action="奖励明细" />
      {data ? <><div className="mt-3 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-[11px] text-[var(--profile-muted)]">累计奖励</p><ProfileAmount cents={data.totalCents} size="lg" currency="usdt" /></div><div className="pb-1 text-right"><p className="mb-2 text-[11px] text-[var(--profile-muted)]">今日奖励</p><ProfileAmount cents={data.todayCents} size="sm" signed currency="usdt" /></div></div><div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--profile-border)] pt-3"><Link href="/me/rewards?filter=companion"><p className="mb-2 text-[11px] text-[var(--profile-muted)]">同行奖励</p><ProfileAmount cents={data.companionCents} currency="usdt" /></Link><Link href="/me/rewards?filter=tribe" className="border-l border-[var(--profile-border)] pl-4"><p className="mb-2 text-[11px] text-[var(--profile-muted)]">部族奖励</p><ProfileAmount cents={data.tribeCents} currency="usdt" /></Link></div></> : <p role="status" className="py-6 text-xs text-[var(--profile-muted)]">{error ? '奖励数据暂不可用' : '正在读取奖励…'}</p>}
    </section>
    <Link href="/me/encyclopedia" className="relative isolate overflow-hidden rounded-xl border border-[var(--profile-border)]">
      <Image src="/assets/contract-scroll.png" alt="" fill sizes="(max-width: 480px) 100vw, 448px" className="-z-20 object-cover" /><div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/55 to-black/15" />
      <div className="flex min-h-32 items-center gap-3 px-4 py-4"><Image src="/assets/player-seal.png" alt="" width={40} height={40} className="shrink-0" /><div><h2 className="font-display text-lg font-bold text-[var(--gold-100)]">悟空百科</h2><p className="mt-1 text-[11px] text-[var(--gold-200)]">从东方神话，走向数字生命</p><span className="profile-inline-link mt-1">进入百科<ChevronRight className="size-3" /></span></div></div>
    </Link>
    <ProfileMenu title="我的记录" items={[
      { label: '我的交易', href: '/me/trades', icon: ScrollText }, { label: '召唤记录', href: '/me/summons', icon: Sparkles }, { label: '修炼记录', href: '/me/cultivation', icon: Sprout }, { label: '传承记录', href: '/me/inheritance', icon: Swords }, { label: '奖励明细', href: '/me/rewards', icon: Award }, { label: '个人地址', href: '/me/wallet', icon: ArrowLeftRight }, { label: '资产明细', href: '/me/ledger', icon: Wallet },
    ]} />
    <ProfileMenu title="服务" items={[
      ...(TRIAL_MODE ? [{ label: '体验版与正式版的区别', href: '/me/trial', icon: Info }] : []), { label: '公告中心', href: '/me/announcements', icon: Bell }, { label: '客服中心', href: '/me/support', icon: Headphones }, { label: '账户与安全', href: '/me/security', icon: ShieldCheck }, { label: '语言设置', href: '/me/language', icon: Globe }, { label: '关于 AI WUKONG', href: '/me/about', icon: Info },
    ]} />
    <p className="pb-2 text-center text-[10px] tracking-[.2em] text-[var(--profile-muted)]">AI WUKONG · 与君同行</p>
  </div>
}
