'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronRight } from 'lucide-react'
import { profileTime } from '@/lib/profile-rules'
import { useProduct } from './product-provider'
import { ProfileEmpty, ProfilePageHeader } from './profile-ui'

/** 右上角的通知铃铛：有未读时带数字 */
export function NoticeBell() {
  const { state } = useProduct()
  const unread = state?.notifications.filter(n => !n.read).length ?? 0
  return <Link href="/me/notifications" aria-label={unread ? `通知，${unread} 条未读` : '通知'} className="notice-bell">
    <Bell className="size-[18px]" aria-hidden />
    {unread > 0 && <span aria-hidden>{unread > 9 ? '9+' : unread}</span>}
  </Link>
}

/** 新通知到达时从顶部浮出几秒，点了直接去处理 */
export function NoticeToast() {
  const { state, now } = useProduct()
  const latest = state?.notifications[0]
  const seen = useRef<string | null>(null)
  const [shown, setShown] = useState<string | null>(null)
  useEffect(() => {
    if (!latest) return
    // 第一次载入时已有的通知不弹；之后新增的才弹
    if (seen.current === null) { seen.current = latest.id; return }
    if (latest.id === seen.current) return
    seen.current = latest.id
    if (latest.read) return
    setShown(latest.id)
    const timer = setTimeout(() => setShown(null), 7000)
    return () => clearTimeout(timer)
    // 只在最新一条变化时触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest?.id])
  useEffect(() => { if (state && seen.current === null) seen.current = state.notifications[0]?.id ?? '' }, [state, now])
  const visible = !!latest && shown === latest.id
  return <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] mx-auto w-full max-w-[480px] pt-[env(safe-area-inset-top)]">
    {latest && <Link href={latest.href} tabIndex={visible ? 0 : -1} aria-hidden={!visible} onClick={() => setShown(null)} className={`notice-toast ${visible ? 'is-shown' : ''}`} role="status">
      <Bell className="size-4 shrink-0 text-[var(--gold-300)]" aria-hidden />
      <span className="min-w-0 flex-1"><strong>{latest.title}</strong><span>{latest.body}</span></span>
      <ChevronRight className="size-4 shrink-0 text-[var(--gold-400)]" aria-hidden />
    </Link>}
  </div>
}

/** 通知列表：打开即全部标为已读 */
export function NotificationList() {
  const { state, ready, act } = useProduct()
  // 进来时先记下哪些是未读，标已读之后这一屏仍然高亮它们
  const [fresh, setFresh] = useState<Set<string> | null>(null)
  useEffect(() => {
    if (!ready || !state || fresh) return
    setFresh(new Set(state.notifications.filter(n => !n.read).map(n => n.id)))
    act({ type: 'read-notifications' })
  }, [ready, state, fresh, act])
  const list = state?.notifications ?? []
  return <div className="flex flex-col gap-5">
    <ProfilePageHeader title="通知" subtitle="召唤结果、资金结算与收款提醒都在这里。时间均为北京时间。" />
    {!ready ? <p role="status" className="text-sm text-[var(--profile-muted)]">正在读取…</p>
      : !list.length ? <ProfileEmpty title="暂无通知">召唤出结果、需要资金结算或确认收款时，会在这里通知你。</ProfileEmpty>
      : <ul className="flex flex-col gap-2">{list.map(n => <li key={n.id}><Link href={n.href} className={`trade-row ${fresh?.has(n.id) ? 'is-todo' : ''}`}>
        <div className="min-w-0 flex-1"><p className="font-display text-sm text-[var(--gold-100)]">{n.title}</p><p className="mt-1 text-xs leading-5 text-[var(--profile-muted)]">{n.body}</p><time className="mt-1.5 block text-[10px] text-[var(--profile-muted)]/80">{profileTime(new Date(n.at).toISOString())}</time></div>
        <ChevronRight className="size-4 shrink-0 text-[var(--gold-400)]" />
      </Link></li>)}</ul>}
  </div>
}
