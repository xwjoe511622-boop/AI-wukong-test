'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LEVELS, TRIAL_MODE, TRIAL_PEACH, TRIAL_USDT, TRIAL_CYCLE_DAYS } from '@/lib/game-data'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { ProfileButton } from './profile-ui'

const ACK_KEY = 'wukong-trial-ack-v1'
export const TRIAL_RIBBON_HEIGHT = 28

/** 体验版与正式版只有这三点不同，全站共用同一份表述 */
export const TRIAL_DIFFERENCES = [
  { item: '初始余额', official: '自己购买', trial: `赠送 ${TRIAL_PEACH} 蟠桃 + ${TRIAL_USDT} U` },
  { item: '可参与阶段', official: '按开放情况', trial: '七个阶段全部开放' },
  { item: '周期', official: LEVELS.map(l => l.cycleDays).join(' / ') + ' 天', trial: `全部 ${TRIAL_CYCLE_DAYS} 天` },
]
export const TRIAL_SAME = '成长比例、蟠桃消耗、召唤时间、同行与部族奖励比例，与正式版完全相同。'

/** 体验版每个页面顶部固定的标识条。正式版不渲染。 */
export function TrialRibbon() {
  if (!TRIAL_MODE) return null
  return <div role="note" className="fixed inset-x-0 top-0 z-50 mx-auto flex w-full max-w-[480px] items-center justify-center gap-2 border-b border-[var(--gold-500)]/50 bg-[#2a1c06]/95 px-3 text-[11px] text-[var(--gold-100)] backdrop-blur-sm" style={{ height: TRIAL_RIBBON_HEIGHT }}>
    <strong className="font-display tracking-widest text-[var(--gold-200)]">体验版</strong>
    <span className="truncate">周期已缩短为 {TRIAL_CYCLE_DAYS} 天，与正式版不同</span>
    <Link href="/me/trial" className="shrink-0 underline underline-offset-4">查看区别</Link>
  </div>
}

/** 第一次进入体验版时说明一次，用户确认后不再弹出。 */
export function TrialWelcome() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!TRIAL_MODE) return
    try { if (localStorage.getItem(ACK_KEY) !== '1') setOpen(true) } catch { setOpen(true) }
  }, [])
  if (!TRIAL_MODE) return null
  const acknowledge = () => { try { localStorage.setItem(ACK_KEY, '1') } catch {} setOpen(false) }
  return <Dialog open={open} onOpenChange={next => { if (!next) acknowledge() }}>
    <DialogContent className="profile-modal" showCloseButton={false}>
      <DialogHeader><DialogTitle>你正在使用体验版</DialogTitle><DialogDescription>体验版用来熟悉玩法，和正式版只有下面三点不同。</DialogDescription></DialogHeader>
      <TrialDifferenceTable />
      <p className="text-xs leading-6 text-[var(--gold-200)]">{TRIAL_SAME}</p>
      <p className="text-xs leading-6 text-[#f0c98a]">正式版的周期更长（最长 {Math.max(...LEVELS.map(l => l.cycleDays))} 天），请不要把体验版的 {TRIAL_CYCLE_DAYS} 天当作正式规则。体验版余额为体验数据，不可提现。</p>
      <ProfileButton size="large" onClick={acknowledge}>我知道了</ProfileButton>
    </DialogContent>
  </Dialog>
}

export function TrialDifferenceTable() {
  return <div role="table" aria-label="体验版与正式版的区别" className="text-xs">
    <div role="row" className="grid grid-cols-[1fr_1.25fr_1.4fr] gap-2 border-b border-[var(--gold-600)]/40 pb-2 text-[11px] text-[var(--gold-200)]"><span role="columnheader">项目</span><span role="columnheader">正式版</span><span role="columnheader">体验版</span></div>
    {TRIAL_DIFFERENCES.map(row => <div role="row" key={row.item} className="grid grid-cols-[1fr_1.25fr_1.4fr] gap-2 border-b border-[var(--gold-600)]/20 py-2.5 leading-5 last:border-0"><span role="cell" className="text-[var(--gold-200)]">{row.item}</span><span role="cell" className="text-stone-200">{row.official}</span><span role="cell" className="text-[var(--gold-100)]">{row.trial}</span></div>)}
  </div>
}
