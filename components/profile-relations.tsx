'use client'

import { useState } from 'react'
import { ChevronDown, Flag, Search, Users, X } from 'lucide-react'
import { Avatar } from './avatar'
import { useProfile, useProfileList } from '@/lib/use-profile'
import { TRIBE_TIERS, generationName } from '@/lib/profile-rules'
import { COMPANION_REWARD, VALID_USER_MIN_PEACH } from '@/lib/game-data'
import { useProduct } from './product-provider'
import { RewardDemoControls } from './reward-demo-controls'
import { ProfileAmount, ProfileButton, ProfileButtonLink, ProfileEmpty, ProfilePageHeader, ProfilePager } from './profile-ui'

const GENERATIONS = [['all', '全部'], ['1', '第一代'], ['2', '第二代'], ['3', '更深层']] as const
type Section = 'companions' | 'tribe'
const VALIDITY = [['all', '全部'], ['valid', '有效用户'], ['invalid', '未达标']] as const

/** 同行与部族：上面是总览（同行者、部族两块），下面是详情（同行者明细 / 部族明细，各自可搜索和分类） */
export function ProfileRelations() {
  const { data, error, mutate } = useProfile()
  const { state } = useProduct()
  const [tab, setTab] = useState<Section>('companions')
  const level = data?.level ?? 0
  const next = TRIBE_TIERS.find(t => t.level > level)
  const all = state?.members ?? []
  const count = (gen: number) => all.filter(m => gen === 3 ? m.generation >= 3 : m.generation === gen).length
  return <div className="flex flex-col gap-5">
    <ProfilePageHeader title="同行与部族" subtitle={`直接邀请的是第一代，他们邀请的是第二代；所有层级合起来是你的部族。持有不少于 ${VALID_USER_MIN_PEACH} 个蟠桃才算有效用户。`} />
    {error ? <div role="alert" className="profile-surface"><p className="text-sm">{error.message}</p><ProfileButton onClick={() => mutate()}>重试</ProfileButton></div> : !data ? <p role="status" className="text-sm">正在读取同行关系…</p> : <>
      <h2 className="profile-heading -mb-2">总览</h2>
      {/* ① 同行者 */}
      <section className="profile-surface" aria-labelledby="companions-title">
        <div className="flex items-center justify-between"><h2 id="companions-title" className="profile-heading">我的同行者</h2><Users className="size-5 text-[var(--gold-400)]" /></div>
        <div className="mt-3 grid grid-cols-2 gap-2">{([1, 2] as const).map(gen => <div key={gen} className="relation-stat">
          <span className="block text-[11px] text-[var(--profile-muted)]">{generationName(gen)}</span>
          <strong className="my-1 block text-2xl tabular-nums text-[var(--gold-100)]">{count(gen)}<small className="ml-1 text-xs font-normal text-[var(--profile-muted)]">人</small></strong>
          <span className="text-[11px] text-[var(--gold-200)]">同行奖励 {gen === 1 ? COMPANION_REWARD.generation1 : COMPANION_REWARD.generation2}%</span>
        </div>)}</div>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-[var(--profile-border)] pt-3"><div><p className="mb-1.5 text-[11px] text-[var(--profile-muted)]">累计同行奖励 · 返 USDT</p><ProfileAmount cents={data.companionCents} currency="usdt" /></div><ProfileButtonLink href="/me/rewards?filter=companion" size="small" secondary>同行奖励明细</ProfileButtonLink></div>
      </section>

      {/* ② 部族 */}
      <section className="profile-surface" aria-labelledby="tribe-title">
        <div className="flex items-center justify-between"><h2 id="tribe-title" className="profile-heading">我的部族</h2><Flag className="size-5 text-[var(--gold-400)]" /></div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="relation-stat"><span className="block text-[11px] text-[var(--profile-muted)]">部族有效成员</span><strong className="my-1 block text-2xl tabular-nums text-[var(--gold-100)]">{data.members}<small className="ml-1 text-xs font-normal text-[var(--profile-muted)]">人</small></strong><span className="text-[11px] text-[var(--profile-muted)]">共 {all.length} 人 · 未达标 {all.length - data.members}</span></div>
          <div className="relation-stat"><span className="block text-[11px] text-[var(--profile-muted)]">当前等级</span><strong className="my-1 block font-display text-xl leading-8 text-[var(--gold-100)]">{level ? TRIBE_TIERS[level - 1].name : '初立部族'}</strong><span className="text-[11px] text-[var(--gold-200)]">部族总盈利 {TRIBE_TIERS.find(t => t.level === level)?.rate ?? 0}%</span></div>
        </div>
        {next ? <div className="mt-4 flex flex-col gap-3 border-t border-[var(--profile-border)] pt-3">
          <p className="flex justify-between text-xs text-[var(--gold-200)]"><span>下一阶 · {next.name}</span><span>部族总盈利 {next.rate}%</span></p>
          <Progress label="第一代有效同行者" value={data.companions} target={next.companions} />
          <Progress label="部族有效成员" value={data.members} target={next.members} />
          <p className="text-[11px] text-[var(--profile-muted)]">两个条件同时满足后自动晋升。</p>
        </div> : <p className="mt-4 border-t border-[var(--profile-border)] pt-3 text-xs leading-6 text-[var(--gold-200)]">已达最高阶。部族奖励为部族总盈利的 {TRIBE_TIERS[2].rate}%，返 USDT。</p>}
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-[var(--profile-border)] pt-3"><div><p className="mb-1.5 text-[11px] text-[var(--profile-muted)]">累计部族奖励 · 返 USDT</p><ProfileAmount cents={data.tribeCents} currency="usdt" /></div><ProfileButtonLink href="/me/rewards?filter=tribe" size="small" secondary>部族奖励明细</ProfileButtonLink></div>
      </section>
    </>}

    <RewardDemoControls />

    {/* ③ 详情：同行者明细 / 部族明细，各自可搜索、可分类 */}
    <section aria-labelledby="detail-title">
      <h2 id="detail-title" className="profile-heading mb-3">详情</h2>
      <div role="tablist" aria-label="明细类型" className="relation-tabs">
        <button type="button" role="tab" aria-selected={tab === 'companions'} onClick={() => setTab('companions')}>同行者明细<small>{count(1) + count(2)}</small></button>
        <button type="button" role="tab" aria-selected={tab === 'tribe'} onClick={() => setTab('tribe')}>部族明细<small>{all.length}</small></button>
      </div>
      <MemberDetail key={tab} section={tab} empty={!all.length} count={count} />
    </section>

    <details className="profile-surface profile-article">
      <summary className="flex cursor-pointer list-none items-center justify-between font-display text-sm text-[var(--gold-200)]">奖励规则<ChevronDown className="size-4" aria-hidden /></summary>
      <p className="mt-3">同行奖励：第一代 {COMPANION_REWARD.generation1}% · 第二代 {COMPANION_REWARD.generation2}%，返 USDT。第三代及更深的关系不产生同行奖励，但仍计入部族。</p>
      <p>部族奖励：第一代有效同行者人数与部族有效成员人数同时达标后，按部族总盈利的 {TRIBE_TIERS.map(t => `${t.rate}%`).join('、')} 产生奖励，返 USDT。</p>
      <ol className="my-2 flex flex-col gap-2">{TRIBE_TIERS.map(t => <li key={t.level} className="flex items-center justify-between gap-2 text-[11px]"><span>{t.name}{level >= t.level && <span className="ml-1.5 text-[var(--gold-200)]">已达成</span>}：第一代有效同行者 ≥ {t.companions} 人且部族有效成员 ≥ {t.members} 人</span><span className="shrink-0 text-[var(--gold-200)]">{t.rate}%</span></li>)}</ol>
      <p>持有不少于 {VALID_USER_MIN_PEACH} 个蟠桃才算有效用户。未达标的成员完成传承不产生奖励；自己未达标时不能获得奖励。两种奖励可叠加、分别记账，计算基础为成员完成传承后实际产生的修炼盈利。</p>
      <ProfileButtonLink href="/me/encyclopedia#rewards" size="small" secondary>查看完整规则</ProfileButtonLink>
    </details>
  </div>
}
/** 一份明细：搜索 UID + 按代数、是否有效分类 */
function MemberDetail({ section, empty, count }: { section: Section; empty: boolean; count: (gen: number) => number }) {
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [generation, setGeneration] = useState<(typeof GENERATIONS)[number][0]>('all')
  const [validity, setValidity] = useState<(typeof VALIDITY)[number][0]>('all')
  const members = useProfileList(section, generation, page, validity, keyword)
  const generations = section === 'tribe' ? GENERATIONS : GENERATIONS.slice(0, 3)
  const name = section === 'tribe' ? '部族成员' : '同行者'
  return <div role="tabpanel" className="mt-3">
    <label className="relation-search"><Search className="size-4 shrink-0 text-[var(--gold-400)]" aria-hidden /><input type="search" inputMode="search" value={keyword} onChange={event => { setKeyword(event.target.value); setPage(0) }} placeholder={`搜索${name} UID`} aria-label={`搜索${name} UID`} />{keyword && <button type="button" onClick={() => { setKeyword(''); setPage(0) }} aria-label="清空搜索"><X className="size-4" /></button>}</label>
    <div className="my-3 flex flex-col gap-2">
      <div role="group" aria-label="按代数筛选" className="relation-filter">{generations.map(([key, label]) => <button type="button" key={key} aria-pressed={generation === key} onClick={() => { setGeneration(key); setPage(0) }}>{label}{key !== 'all' && <small>{count(Number(key))}</small>}</button>)}</div>
      <div role="group" aria-label="按是否有效筛选" className="relation-filter">{VALIDITY.map(([key, label]) => <button type="button" key={key} aria-pressed={validity === key} onClick={() => { setValidity(key); setPage(0) }}>{label}</button>)}</div>
    </div>
    <p className="mb-2 text-right text-[11px] text-[var(--profile-muted)]">符合条件 {members.data?.total ?? 0} 人</p>
    {!members.data ? <p role="status" className="text-xs">正在读取成员…</p>
      : empty ? <ProfileEmpty title="同行之路，从一份邀请开始">目前还没有{name}。<div className="mt-3"><ProfileButtonLink href="/me" size="small">邀请同行者</ProfileButtonLink></div></ProfileEmpty>
      : !members.data.members.length ? <ProfileEmpty title={`没有符合条件的${name}`}>{keyword ? '检查一下 UID，或换一个分类。' : '换一个分类看看。'}</ProfileEmpty>
      : <ul className="profile-list flex flex-col">{members.data.members.map(m => <li key={`${m.uid}-${m.joinedAt}`} className="flex items-center gap-3 border-b border-[var(--profile-border)] py-3.5">
        <Avatar src={m.avatar} size={40} />
        <div className="min-w-0 flex-1"><p className="truncate font-mono text-[13px] text-[var(--gold-100)]">{m.uid}</p><p className="mt-1 text-[11px] text-[var(--profile-muted)]">{(m.generation ?? 3) <= 2 ? `${generationName(m.generation ?? 0)}同行者` : '部族成员'}</p></div>
        <span className={`shrink-0 text-xs ${m.valid === false ? 'text-[var(--profile-muted)]' : 'text-[var(--gold-200)]'}`}>{m.valid === false ? `未达 ${VALID_USER_MIN_PEACH} 蟠桃` : '有效用户'}</span>
      </li>)}</ul>}
    <div className="mt-3"><ProfilePager page={page} hasMore={members.data?.hasMore ?? false} onPage={setPage} /></div>
  </div>
}
function Progress({ label, value, target }: { label: string; value: number; target: number }) {
  return <div><div className="mb-1.5 flex justify-between text-xs"><span>{label}</span><span className="tabular-nums text-[var(--gold-200)]">{value} / {target}<span className="ml-2 text-[var(--profile-muted)]">{value >= target ? '已达标' : `还需 ${target - value} 人`}</span></span></div><progress className="profile-progress" max={target} value={Math.min(value, target)} aria-label={`${label} ${value} 人，目标 ${target} 人`} /></div>
}
