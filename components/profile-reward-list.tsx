'use client'

import { shortAddress } from '@/lib/wallet'
import { useState } from 'react'
import { useProfile, useProfileList } from '@/lib/use-profile'
import { generationName, profileTime, type RewardRecord } from '@/lib/profile-rules'
import { ProfileAmount, ProfileButton, ProfileButtonLink, ProfileEmpty, ProfilePageHeader, ProfilePager } from './profile-ui'

export function ProfileRewardList({ initialFilter = 'all' }: { initialFilter?: string }) {
  const [filter, setFilter] = useState(['companion','tribe'].includes(initialFilter) ? initialFilter : 'all')
  const [page, setPage] = useState(0)
  const { data: summary, error: summaryError, mutate } = useProfile()
  const { data, error, isLoading, mutate: retry } = useProfileList('rewards', filter, page)
  return <div className="flex flex-col gap-5">
    <ProfilePageHeader title="奖励明细" subtitle="每一份奖励，都有同行的来处。奖励全部返 USDT。" />
    <section className="profile-surface"><p className="mb-3 text-xs text-[var(--profile-muted)]">累计奖励</p>{summary ? <ProfileAmount cents={summary.totalCents} size="lg" currency="usdt" /> : <p role="status" className="text-xs">{summaryError ? '累计奖励暂不可用' : '正在读取…'}</p>}{summaryError && <ProfileButton size="small" onClick={() => mutate()}>重试</ProfileButton>}<p className="mt-3 text-[11px] leading-6 text-[var(--profile-muted)]">同行奖励与部族奖励分别记账，可来自同一次传承，均返 USDT。时间均为北京时间。</p></section>
    <div role="group" aria-label="奖励类型" className="profile-tabs">{[['all','全部'],['companion','同行奖励'],['tribe','部族奖励']].map(([id,label]) => <ProfileButton key={id} size="small" aria-pressed={filter === id} onClick={() => { setFilter(id); setPage(0) }}>{label}</ProfileButton>)}</div>
    {error ? <div role="alert" className="profile-surface"><p className="text-sm">{error.message}</p><ProfileButton onClick={() => retry()}>重试读取</ProfileButton></div> : isLoading || !data ? <p role="status" className="py-6 text-center text-sm">正在读取奖励明细…</p> : data.rewards.length ? <ul className="flex flex-col gap-4">{data.rewards.map(r => <RewardItem key={r.id} record={r} />)}</ul> : <ProfileEmpty title="每一次同行，都值得期待">暂无{filter === 'companion' ? '同行奖励' : filter === 'tribe' ? '部族奖励' : '奖励'}记录。成员完成传承并产生实际修炼增长后，符合条件的奖励将自动入账。</ProfileEmpty>}
    <ProfilePager page={page} hasMore={data?.hasMore ?? false} onPage={setPage} />
    <ProfileButtonLink href="/me/encyclopedia#rewards" size="large" secondary>了解奖励计算规则</ProfileButtonLink>
  </div>
}
function RewardItem({ record: r }: { record: RewardRecord }) {
  const companion = r.rewardType === 'companion'
  return <li className="profile-surface"><div className="flex items-start justify-between gap-2"><div><h2 className="font-display text-base text-[var(--gold-100)]">{companion ? '同行奖励' : '部族奖励'}</h2><p className="mt-1 text-xs text-[var(--profile-muted)]">{companion ? `${generationName(r.relationshipGeneration ?? 0)}同行关系` : `${['','Ⅰ','Ⅱ','Ⅲ'][r.tribeLevel ?? 0]}阶部族`}</p></div><ProfileAmount cents={r.amountCents} signed currency="usdt" /></div><dl className="mt-4 flex flex-col gap-3 border-t border-[var(--profile-border)] pt-4 text-xs"><div className="flex justify-between gap-2"><dt className="text-[var(--profile-muted)]">{companion ? '来自' : '来源成员'}</dt><dd className="font-mono" title={r.sourceUserId}>{shortAddress(r.sourceUserId)}</dd></div><div className="flex justify-between gap-2"><dt className="text-[var(--profile-muted)]">{companion ? '奖励比例' : '部族奖励比例'}</dt><dd>{r.rewardRate}%</dd></div><div className="flex items-center justify-between gap-2"><dt className="text-[var(--profile-muted)]">对应本次修炼增长</dt><dd><ProfileAmount cents={r.sourceProfitCents} size="sm" currency="usdt" /></dd></div></dl><time dateTime={r.createdAt} className="mt-4 block text-[10px] text-[var(--profile-muted)]">{profileTime(r.createdAt)}</time></li>
}
