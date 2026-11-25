'use client'

import { useEffect, useState } from 'react'
import { TRIAL_MODE } from '@/lib/game-data'

const ACK_KEY = 'wukong-trial-ack-v1'
/** 体验版提示每隔多久出现一次、每次停留多久 */
const RIBBON_EVERY_MS = 30_000
const RIBBON_SHOW_MS = 5_000

/**
 * 体验版提示：不常驻。进入时出现一次，之后每 30 秒从顶部滑出几秒再收回；
 * 浮在页面上方，不占版面。正式版不渲染。
 * 这是全站唯一提到「体验版」的地方，其余页面文字一律按正式版显示。
 */
export function TrialRibbon() {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (!TRIAL_MODE) return
    let hide: ReturnType<typeof setTimeout>
    const show = () => { setShown(true); clearTimeout(hide); hide = setTimeout(() => setShown(false), RIBBON_SHOW_MS) }
    const first = setTimeout(show, 800)
    const timer = setInterval(show, RIBBON_EVERY_MS)
    return () => { clearTimeout(first); clearTimeout(hide); clearInterval(timer) }
  }, [])
  if (!TRIAL_MODE) return null
  return <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-[480px] pt-[env(safe-area-inset-top)]">
    <div role="note" aria-hidden={!shown} className={`ml-3 mr-16 mt-3 flex min-h-9 items-center gap-2 rounded-full border border-[var(--gold-500)]/60 bg-[#2a1c06]/95 px-3.5 text-[11px] text-[var(--gold-100)] shadow-[0_8px_24px_rgba(0,0,0,.6)] backdrop-blur-sm transition-[transform,opacity] duration-500 motion-reduce:transition-none ${shown ? 'translate-y-0 opacity-100' : '-translate-y-[160%] opacity-0'}`}>
      <strong className="shrink-0 font-display tracking-widest text-[var(--gold-200)]">体验版</strong>
      <span className="min-w-0 flex-1 truncate">所有阶段均已时间加速，修炼周期统一为 1 天</span>
    </div>
  </div>
}
