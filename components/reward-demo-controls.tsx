'use client'

import { useProduct } from './product-provider'
import { RULES, settlement } from '@/lib/cultivation-preview'
import { UsdtValue } from './peach-value'
import { useDemoControls } from '@/lib/use-demo-controls'

export function RewardDemoControls() {
  const { state, act, notice } = useProduct()
  const demo = useDemoControls()
  const profit = settlement({ id: 'demo-source', stage: 'great_sage', principal: RULES.great_sage.rangeMin * 100, started: 0, completed: RULES.great_sage.days }).profit
  if (!demo) return null
  return <details className="profile-surface text-xs text-[var(--profile-muted)]"><summary className="min-h-10 cursor-pointer py-2">同行与部族 · 演示</summary><p className="my-3 leading-6">载入示例部族后，可模拟成员完成传承，奖励返 USDT。每位示例成员只结算一次，不连接真实用户。</p><button type="button" className="cultivation-secondary w-full" disabled={!!state?.members.length} onClick={() => act({ type: 'demo-network' })}>{state?.members.length ? '演示部族已载入' : '载入演示部族（有效 15 / 150 人）'}</button><p className="my-3 flex flex-wrap items-center gap-1">每次模拟大圣传承，修炼盈利 <UsdtValue cents={profit} size="xs" /></p><div className="grid grid-cols-2 gap-2">{[1, 2, 3].map(generation => <button key={generation} type="button" disabled={!state?.members.length} className="cultivation-secondary ornate-short btn-compact !min-w-0 whitespace-nowrap" onClick={() => act({ type: 'demo-reward', generation })}>{['第一代', '第二代', '更深层'][generation - 1]}传承</button>)}<button type="button" disabled={!state?.members.length} className="cultivation-secondary ornate-short btn-compact !min-w-0 whitespace-nowrap" onClick={() => act({ type: 'demo-reward', generation: 1, invalid: true })}>未达标成员</button></div><p className="mt-2 text-[11px] leading-5">「未达标成员」持有蟠桃不足 50 个，其传承不产生奖励。</p><p role="status" className="mt-3 leading-6">{notice}</p></details>
}
