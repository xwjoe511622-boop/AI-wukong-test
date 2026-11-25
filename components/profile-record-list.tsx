'use client'
import { useState } from 'react'
import { PeachText } from './peach-value'
import { useProfileList } from '@/lib/use-profile'
import { LEDGER_LABELS, profileTime } from '@/lib/profile-rules'
import { ProfileAmount, ProfileButton, ProfileEmpty, ProfilePageHeader, ProfilePager } from './profile-ui'

const ledgerFilters = [['all','全部'],['lock','召唤暂扣'],['return','召唤退还'],['cultivation','修炼消耗'],['inherit','传承所得'],['pay','修炼值打款'],['companion','同行奖励'],['tribe','部族奖励'],['transfer','转出与接收'],['recharge','购买蟠桃']]
export function ProfileRecordList({ title, kind }: { title: string; kind: string }) {
  const [filter, setFilter] = useState(kind)
  const [page, setPage] = useState(0)
  const { data, error, mutate } = useProfileList('records', filter, page)
  return <div className="flex flex-col gap-5"><ProfilePageHeader title={title} subtitle="蟠桃与 USDT 的每一笔往来。记录按北京时间展示。" />
    {kind === 'all' && <div><label htmlFor="ledger-filter" className="mb-2 block text-xs text-[var(--profile-muted)]">明细类型</label><select id="ledger-filter" value={filter} onChange={e => { setFilter(e.target.value); setPage(0) }} className="w-full rounded-lg border border-[var(--profile-border)] bg-[var(--profile-surface)] px-3 py-3 text-sm text-[var(--gold-100)]">{ledgerFilters.map(([id,label]) => <option value={id} key={id}>{label}</option>)}</select></div>}
    {kind === 'summon' && <p className="text-xs leading-6 text-[var(--profile-muted)]">记录召唤暂扣、召唤成功扣除与失败退还。成功即入猴舍；修炼消耗单独记账。</p>}
    {error ? <div role="alert" className="profile-surface"><p className="text-sm">{error.message}</p><ProfileButton onClick={() => mutate()}>重试</ProfileButton></div> : !data ? <p role="status" className="text-sm">正在读取记录…</p> : !data.records.length ? <ProfileEmpty title="尚无此类记录">已完成并保存到存档的记录会显示在这里。</ProfileEmpty> : <ul className="profile-list flex flex-col">{data.records.map(r => <li key={r.id} className="border-b border-[var(--profile-border)] py-4"><div className="flex items-center justify-between gap-2"><h2 className="font-display text-sm text-[var(--gold-100)]">{LEDGER_LABELS[r.kind] ?? '资产变动'}</h2><ProfileAmount cents={r.amountCents} signed size="md" currency={r.currency} /></div><p className="mt-2 text-xs text-[var(--profile-muted)]"><PeachText>{r.description}</PeachText></p><time dateTime={r.createdAt} className="mt-2 block text-[10px] text-[var(--profile-muted)]">{profileTime(r.createdAt)}</time></li>)}</ul>}
    <ProfilePager page={page} hasMore={data?.hasMore ?? false} onPage={setPage} />
  </div>
}
