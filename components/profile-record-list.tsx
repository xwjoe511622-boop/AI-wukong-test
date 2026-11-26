'use client'
import { useState } from 'react'
import { ArrowLeftRight, ArrowUpRight, Award, Coins, Flame, Lock, ScrollText, ShoppingBag, Sparkles, Undo2, Users, type LucideIcon } from 'lucide-react'
import { PeachText } from './peach-value'
import { useProfileList } from '@/lib/use-profile'
import { LEDGER_LABELS, profileTime } from '@/lib/profile-rules'
import { ProfileAmount, ProfileButton, ProfileEmpty, ProfilePageHeader, ProfilePager } from './profile-ui'

const LEDGER_ICONS: Record<string, LucideIcon> = { summon: Sparkles, summon_lock: Lock, summon_return: Undo2, summon_forfeit: Lock, summon_pay: ArrowUpRight, cycle: Flame, inherit: ScrollText, companion: Users, tribe: Award, recharge: ShoppingBag, buy_pay: ShoppingBag, transfer_out: ArrowLeftRight, transfer_in: ArrowLeftRight }
const ledgerFilters = [['all','全部'],['lock','召唤暂扣'],['return','召唤退还'],['pay','修炼值支付'],['inherit','传承所得'],['companion','同行奖励'],['tribe','部族奖励'],['transfer','转账'],['recharge','购买蟠桃']]
export function ProfileRecordList({ title, kind }: { title: string; kind: string }) {
  const [filter, setFilter] = useState(kind)
  const [page, setPage] = useState(0)
  const { data, error, mutate } = useProfileList('records', filter, page)
  return <div className="flex flex-col gap-5"><ProfilePageHeader title={title} subtitle="蟠桃与 USDT 的每一笔进出，时间为北京时间。" />
    {kind === 'all' && <div role="group" aria-label="明细类型" className="relation-filter">{ledgerFilters.map(([id, label]) => <button type="button" key={id} aria-pressed={filter === id} onClick={() => { setFilter(id); setPage(0) }}>{label}</button>)}</div>}
    {error ? <div role="alert" className="profile-surface"><p className="text-sm">{error.message}</p><ProfileButton onClick={() => mutate()}>重试</ProfileButton></div> : !data ? <p role="status" className="text-sm">正在读取记录…</p> : !data.records.length ? <ProfileEmpty title="尚无此类记录">有了记录会显示在这里。</ProfileEmpty> : <ul className="ornate-list">{data.records.map(r => { const Icon = LEDGER_ICONS[r.kind] ?? Coins; return <li key={r.id} className="ornate-row">
      <span className={`ornate-node ${r.amountCents > 0 ? 'is-in' : ''}`} aria-hidden><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1"><div className="flex items-baseline justify-between gap-2"><h2 className="font-display text-sm text-[var(--gold-100)]">{LEDGER_LABELS[r.kind] ?? '资产变动'}</h2><ProfileAmount cents={r.amountCents} signed size="sm" currency={r.currency} /></div><p className="mt-1.5 text-[13px] leading-5 text-[var(--profile-muted)]"><PeachText>{r.description}</PeachText></p><time dateTime={r.createdAt} className="mt-1.5 block text-[12px] text-[var(--profile-muted)]/80">{profileTime(r.createdAt)}</time></div>
    </li> })}</ul>}
    <ProfilePager page={page} hasMore={data?.hasMore ?? false} onPage={setPage} />
  </div>
}
