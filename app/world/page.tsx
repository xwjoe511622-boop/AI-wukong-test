import { ALL_OPEN } from '@/lib/game-data'
import Link from 'next/link'
import { RealmList } from '@/components/realm-list'
import { SummonPreview } from '@/components/summon-preview'
import { GoldDivider, TitlePlaque } from '@/components/ornate'
import { isStage } from '@/lib/summon-preview'

export default async function WorldPage({ searchParams }: { searchParams: Promise<{ stage?: string | string[] }> }) {
  const { stage } = await searchParams
  if (stage !== undefined) {
    if (!isStage(stage)) return <section className="panel rounded-xl p-5 text-sm"><h1>未找到该仙境</h1><Link href="/world" className="btn-gold mt-4 inline-flex text-xs">返回七大仙境</Link></section>
    return <SummonPreview key={stage} stage={stage} />
  }
  return <div className="flex flex-col gap-5">
    <div className="hud-panel rounded-xl px-3 py-3"><TitlePlaque zh="七大仙境" en="SEVEN IMMORTAL REALMS" /><p className="mt-2 text-center text-xs text-[var(--gold-200)]">选择仙境 · 发起召唤 · 每日修炼</p><GoldDivider className="mx-auto mt-3 w-40" /></div>
    <RealmList />
    <p className="hud-panel rounded-lg px-3 py-3 text-center text-[11px] leading-relaxed text-[var(--gold-200)]">每日北京时间 11:00—17:00，{ALL_OPEN ? '七' : '前六'}阶段依次召唤<br />周期前 30 分钟截止 · 点一次召唤，到点自动匹配 · 成功后 1 小时内支付结算{ALL_OPEN ? '' : ' · 无极大圣未开放'}</p>
  </div>
}
