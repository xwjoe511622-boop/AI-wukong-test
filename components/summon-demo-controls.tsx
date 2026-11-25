'use client'

import type { Stage } from '@/lib/game-data'
import { roundFor, MATCH_MAX_MS } from '@/lib/summon-preview'
import { dateTime, DAY } from '@/lib/cultivation-preview'
import { useProduct } from './product-provider'
import { PeachText } from './peach-value'
import { useDemoControls } from '@/lib/use-demo-controls'

export function SummonDemoControls({ stage }: { stage?: Stage }) {
  const { state, now, ready, warning, notice, act } = useProduct()
  const demo = useDemoControls()
  const jump = (target: number) => act({ type: 'demo-clock', offset: target - Date.now() })
  if (!demo && !warning && !notice) return null
  return <section aria-label="演示控制" className="hud-panel flex flex-col gap-2 rounded-xl p-3 text-[11px] leading-5 text-[var(--gold-200)]">
    {demo && <p>演示控制已开启（调试用）。不连接真实账户、全网席位或奖励发放。</p>}
    {demo && <details><summary className="min-h-10 cursor-pointer py-2">演示控制</summary><p>演示时间：{ready ? dateTime(now) : '读取中'}</p><div className="mt-2 flex flex-wrap gap-2">
      {stage && <><button type="button" className="cultivation-secondary px-3" onClick={() => { const round = roundFor(stage, now); const used = state?.entries.some(e => e.key === round.key); jump(round.cutoff - 60000 + (used || now >= round.cutoff ? DAY : 0)) }}>截止前1分钟</button><button type="button" className="cultivation-secondary px-3" onClick={() => jump(roundFor(stage, now).cutoff)}>预约截止</button><button type="button" className="cultivation-secondary px-3" onClick={() => jump(roundFor(stage, now).deadline)}>开始匹配</button><button type="button" className="cultivation-secondary px-3" onClick={() => jump(roundFor(stage, now).deadline + MATCH_MAX_MS)}>匹配完成</button></>}
      <button type="button" className="cultivation-secondary px-3" onClick={() => jump(now + DAY)}>推进1天</button><button type="button" className="cultivation-secondary px-3" onClick={() => jump(now + 61000)}>推进61秒</button>
      {stage && <><button type="button" aria-pressed={state?.demoOutcome === 'success'} className="cultivation-secondary px-3" onClick={() => act({ type: 'demo-outcome', result: 'success' })}>结果设为成功</button><button type="button" aria-pressed={state?.demoOutcome === 'refunded'} className="cultivation-secondary px-3" onClick={() => act({ type: 'demo-outcome', result: 'refunded' })}>结果设为失败</button></>}
    </div><p className="mt-2">匹配完成前选择演示结果；匹配完成时自动演示{state?.demoOutcome === 'refunded' ? '失败' : '成功'}，不是实际抢购概率。时钟与记录仅保存在当前浏览器。</p></details>}
    {warning && <p role="alert">{warning}</p>}<p role="status" className={notice ? '' : 'sr-only'}><PeachText>{notice}</PeachText></p>
  </section>
}
