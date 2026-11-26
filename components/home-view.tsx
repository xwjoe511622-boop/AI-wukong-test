'use client'

import Link from 'next/link'
import { ArrowDownLeft, ArrowUpRight, Check, ChevronRight, Flame, Sparkles, Wallet, type LucideIcon } from 'lucide-react'
import { contractDay, money } from '@/lib/cultivation-preview'
import { durationText } from '@/lib/summon-preview'
import { dailyTodos, type DailyKind, type DailyTodo } from '@/lib/home'
import { HomeHero } from './home-hero'
import { useProduct } from './product-provider'
import { useWallet } from './wallet-gate'

const GUEST_ROWS: Record<DailyKind, [string, string]> = { summon: ['召唤悟空', '截止前点一次，到点系统自动匹配'], pay: ['支付结算', '召唤成功后 1 小时内完成'], train: ['每日修炼', '每天点一次，才有当天的修炼加成'], receive: ['传承收款', '悟空传承时确认收款'] }

const ICONS: Record<DailyKind, LucideIcon> = { summon: Sparkles, pay: ArrowUpRight, train: Flame, receive: ArrowDownLeft }
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const weekday = (now: number) => WEEKDAYS[new Date(now + 8 * 3600000).getUTCDay()]

/**
 * 首页只做一件事：今日待办。
 * 固定四行（召唤、支付结算、修炼、收款），有没有事都显示，正好一屏；不放资产，不重复别的页面。
 */
export function HomeView() {
  const { state, ready, now, guest } = useProduct()
  const wallet = useWallet()
  // 没连接钱包：四行照常显示但都是灰的，最上面提示连接
  const todos = (ready && state ? dailyTodos(state, now) : []).map(t => guest ? { ...t, status: 'none' as const, live: false, cta: undefined, until: undefined, amountCents: undefined, warn: false, title: GUEST_ROWS[t.kind][0], sub: GUEST_ROWS[t.kind][1] } : t)
  const open = todos.filter(t => t.status === 'todo').length
  return <div className="home-page">
    <h1 className="sr-only">AI 悟空 · 今日待办</h1>
    <HomeHero />
    <section className="home-panel" aria-labelledby="home-title">
      <header className="home-head">
        <div><p className="home-date">{ready ? `${contractDay(now)}日 · ${weekday(now)}` : ' '}</p><h2 id="home-title" className="home-title">今日待办</h2></div>
        {ready && <p className="home-count">{guest ? '未连接钱包' : open ? <><strong>{open}</strong> 项待处理</> : '今日暂无待处理'}</p>}
      </header>
      {!ready || !state ? <p role="status" className="py-10 text-center text-sm text-stone-400">正在读取…</p>
        : <ol className={`home-list ${guest ? 'is-guest' : ''}`}>{guest && <li className="home-connect"><button type="button" className="home-row" onClick={wallet.connect}><span className="home-node" aria-hidden><Wallet className="size-4" /></span><span className="min-w-0 flex-1"><span className="home-row-title">连接钱包后查看你的待办</span><span className="home-sub">召唤、支付结算、修炼、收款都在这里提醒你</span></span><span className="home-cta">连接钱包<ChevronRight className="size-3.5" /></span></button></li>}{todos.map(todo => <li key={todo.kind} className={`is-${todo.status} ${todo.live ? 'is-live' : ''}`}><Row todo={todo} now={now} /></li>)}</ol>}
    </section>
  </div>
}

function Row({ todo, now }: { todo: DailyTodo; now: number }) {
  const Icon = ICONS[todo.kind]
  const left = todo.until === undefined ? null : Math.max(0, todo.until - now)
  const body = <>
    <span className="home-node" aria-hidden>{todo.status === 'done' ? <Check className="size-4" /> : <Icon className="size-4" />}</span>
    <span className="min-w-0 flex-1">
      <span className="home-label">{todo.label}</span>
      <span className="home-row-title">{todo.title}</span>
      <span className={`home-sub ${todo.warn ? '!text-[#f0a58a]' : ''}`}>{todo.sub}</span>
    </span>
    <span className="flex shrink-0 flex-col items-end gap-1">
      {todo.amountCents !== undefined && <span className="home-amount">{money(todo.amountCents)}<span className="unit">USDT</span></span>}
      {left !== null && <span className={`home-timer ${todo.status === 'todo' && todo.kind === 'pay' && left < 10 * 60_000 ? '!text-[#f08a6a]' : ''}`}>{durationText(left)}</span>}
      {todo.cta ? <span className="home-cta">{todo.cta}<ChevronRight className="size-3.5" /></span> : todo.amountCents === undefined && left === null && <ChevronRight className="size-4 text-stone-500" />}
    </span>
  </>
  const label = `${todo.label}：${todo.title}`
  return <Link href={todo.href} className="home-row" aria-label={label}>{body}</Link>
}
