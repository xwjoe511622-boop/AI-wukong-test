import { notFound } from 'next/navigation'
import { ProfileRelations } from '@/components/profile-relations'
import { ProfileRewardList } from '@/components/profile-reward-list'
import { ProfileRecordList } from '@/components/profile-record-list'
import { ProfileEncyclopedia } from '@/components/profile-encyclopedia'
import { ProfileServicePage } from '@/components/profile-service-pages'
import { ProfileWallet } from '@/components/profile-wallet'
import { ProfileTrial } from '@/components/profile-trial'
import { TRIAL_MODE } from '@/lib/game-data'

export default async function ProfileSectionPage({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<{ filter?: string; code?: string; mode?: string }> }) {
  const { section } = await params
  const search = await searchParams
  if (section === 'companions' || section === 'tribe') return <ProfileRelations key={section} tribe={section === 'tribe'} />
  if (section === 'rewards') return <ProfileRewardList key={search.filter ?? 'all'} initialFilter={search.filter} />
  if (section === 'encyclopedia') return <ProfileEncyclopedia />
  if (section === 'trial' && TRIAL_MODE) return <ProfileTrial />
  if (section === 'wallet') return <ProfileWallet key={search.mode ?? 'default'} initialMode={search.mode} />
  const records: Record<string, { title: string; kind: string }> = {
    ledger: { title: '资产明细', kind: 'all' }, summons: { title: '召唤记录', kind: 'summon' },
    cultivation: { title: '修炼记录', kind: 'cultivation' }, inheritance: { title: '传承记录', kind: 'inherit' },
  }
  if (records[section]) return <ProfileRecordList key={section} {...records[section]} />
  if (['announcements', 'support', 'security', 'language', 'about', 'join'].includes(section)) return <ProfileServicePage key={section} section={section} initialCode={typeof search.code === 'string' ? search.code.slice(0, 18) : ''} />
  notFound()
}
