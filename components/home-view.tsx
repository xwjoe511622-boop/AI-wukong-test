'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'
import { contractDay, money } from '@/lib/cultivation-preview'
import { durationText } from '@/lib/summon-preview'
import { todayTodos, type Todo } from '@/lib/home'
import { HomeHero } from './home-hero'
import { useProduct } from './product-provider'

const MAX_ROWS = 5
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const weekday = (now: number) => WEEKDAYS[new Date(now + 8 * 3600000).getUTCDay()]

/** 首页只做一件事：今日待办。一屏看完，不放资产，也不重复别的页面的内容 */
export function HomeView() {
  const { state, ready, now, act } = useProduct()
  const todos = ready && state ? todayTodos(state, now) : []
  const open = todos.filter(t => t.tone === 'urgent' || t.tone === 'action')
  const [first, ...rest] = todos
  const featured = first && (first.tone === 'urgent' || first.tone === 'action') ? first : null
  const rows = (featured ? rest : todos).slice(0, featured ? MAX_ROWS - 1 : MAX_ROWS)
  const hidden = todos.length - rows.length - (featured ? 1 : 0)
  const run = (todo: Todo) => { if (todo.castKey) act({ type: 'summon-cast', key: todo.castKey }) }
  return <div className="home-page">
    <h1 className="sr-only">AI 悟空 · 今日待办</h1>
    <HomeHero />
    <div className="home-body">
      <header className="home-head">
        <div><p className="home-date">{ready ? `${contractDay(now)}日 · ${weekday(now)}` : ' '}</p><h2 className="home-title">今日待办</h2></div>
        {ready && <p className="home-count">{open.length ? <><strong>{open.length}</strong> 项待处理</> : todos.length ? '暂无需要处理的' : ''}</p>}
      </header>

      {!ready || !state ? <p role="status" className="py-10 text-center text-sm text-stone-400">正在读取…</p>
        : !todos.length ? <div className="home-empty"><Image src="/assets/player-seal.png" alt="" width={56} height={56} className="opacity-70" /><p className="font-display text-base text-[var(--gold-100)]">今日无待办</p><p className="text-xs text-stone-400">修炼有时，传承有序。</p></div>
        : <>
          {featured && <section className={`home-feature is-${featured.tone}`} aria-label="最要紧的一件事">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="home-tag">{featured.tone === 'urgent' ? '限时' : '现在可做'}</p>
                <h3 className="home-feature-title">{featured.title}</h3>
                <p className="home-sub">{featured.sub}</p>
              </div>
              {featured.amountCents !== undefined && <p className="shrink-0 text-right"><span className="home-amount">{money(featured.amountCents)}</span><span className="block text-[10px] text-stone-400">USDT</span></p>}
            </div>
            <div className="mt-3.5 flex items-center gap-4">
              {featured.castKey ? <button type="button" className="btn-gold flex-1 text-sm" onClick={() => run(featured)}>{featured.cta}</button> : <Link href={featured.href ?? '/'} className="btn-gold inline-flex flex-1 items-center justify-center text-sm">{featured.cta}</Link>}
              {featured.until !== undefined && <p className="shrink-0 text-right"><span className="block text-[10px] text-stone-400">剩余</span><Timer until={featured.until} now={now} urgent={featured.tone === 'urgent'} /></p>}
            </div>
          </section>}

          {rows.length > 0 && <ol className="home-list" aria-label="今日事项">{rows.map(todo => <li key={todo.id} className={`is-${todo.tone}`}>
            <span className="home-node" aria-hidden>{todo.tone === 'done' && <Check className="size-3" />}</span>
            <Row todo={todo} now={now} onCast={() => run(todo)} />
          </li>)}</ol>}
          {hidden > 0 && <p className="text-center text-[11px] text-stone-500">另有 {hidden} 项等待中或已完成</p>}
        </>}
    </div>
  </div>
}

function Row({ todo, now, onCast }: { todo: Todo; now: number; onCast: () => void }) {
  const body = <>
    <span className="min-w-0 flex-1"><span className="home-row-title">{todo.title}</span><span className="home-sub">{todo.sub}</span></span>
    <span className="flex shrink-0 flex-col items-end gap-0.5">
      {todo.until !== undefined && todo.tone !== 'done' && <Timer until={todo.until} now={now} small />}
      {todo.cta ? <span className="home-cta">{todo.cta}<ChevronRight className="size-3.5" /></span> : todo.href && <ChevronRight className="size-4 text-stone-500" />}
    </span>
  </>
  if (todo.castKey) return <button type="button" className="home-row" onClick={onCast}>{body}</button>
  return todo.href ? <Link href={todo.href} className="home-row">{body}</Link> : <div className="home-row">{body}</div>
}

function Timer({ until, now, urgent, small }: { until: number; now: number; urgent?: boolean; small?: boolean }) {
  const left = Math.max(0, until - now)
  return <span className={`font-latin tabular-nums ${small ? 'text-xs' : 'text-lg font-bold'} ${urgent && left < 10 * 60_000 ? 'text-[#f08a6a]' : small ? 'text-stone-300' : 'text-[var(--gold-100)]'}`}>{durationText(left)}</span>
}
