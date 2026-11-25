'use client'

import Link from 'next/link'
import { ArrowDownLeft, ArrowUpRight, CalendarClock, Check, ChevronRight, Sparkles, type LucideIcon } from 'lucide-react'
import { contractDay, money } from '@/lib/cultivation-preview'
import { durationText } from '@/lib/summon-preview'
import { dailyTodos, type DailyKind, type DailyTodo } from '@/lib/home'
import { HomeHero } from './home-hero'
import { useProduct } from './product-provider'

const ICONS: Record<DailyKind, LucideIcon> = { reserve: CalendarClock, cast: Sparkles, pay: ArrowUpRight, receive: ArrowDownLeft }
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const weekday = (now: number) => WEEKDAYS[new Date(now + 8 * 3600000).getUTCDay()]

/**
 * 首页只做一件事：今日待办。
 * 固定四行（预约、召唤、打款、收款），有没有事都显示，正好一屏；不放资产，不重复别的页面。
 * 修炼在进猴舍时一次扣除蟠桃、自动进行，所以不在待办里。
 */
export function HomeView() {
  const { state, ready, now, act } = useProduct()
  const todos = ready && state ? dailyTodos(state, now) : []
  const open = todos.filter(t => t.status === 'todo').length
  return <div className="home-page">
    <h1 className="sr-only">AI 悟空 · 今日待办</h1>
    <HomeHero />
    <section className="home-panel" aria-labelledby="home-title">
      <header className="home-head">
        <div><p className="home-date">{ready ? `${contractDay(now)}日 · ${weekday(now)}` : ' '}</p><h2 id="home-title" className="home-title">今日待办</h2></div>
        {ready && <p className="home-count">{open ? <><strong>{open}</strong> 项待处理</> : '今日暂无待处理'}</p>}
      </header>
      {!ready || !state ? <p role="status" className="py-10 text-center text-sm text-stone-400">正在读取…</p>
        : <ol className="home-list">{todos.map(todo => <li key={todo.kind} className={`is-${todo.status}`}><Row todo={todo} now={now} onCast={() => todo.castKey && act({ type: 'summon-cast', key: todo.castKey })} /></li>)}</ol>}
    </section>
  </div>
}

function Row({ todo, now, onCast }: { todo: DailyTodo; now: number; onCast: () => void }) {
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
      {todo.cta ? <span className="home-cta">{todo.cta}<ChevronRight className="size-3.5" /></span> : todo.amountCents === undefined && left === null && <ChevronRight className="size-4 text-stone-600" />}
    </span>
  </>
  const label = `${todo.label}：${todo.title}`
  if (todo.castKey) return <button type="button" className="home-row" aria-label={label} onClick={onCast}>{body}</button>
  return <Link href={todo.href} className="home-row" aria-label={label}>{body}</Link>
}
