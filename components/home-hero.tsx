'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import styles from './home-hero.module.css'
import { BrandLogo } from './brand-logo'
import { useProduct } from './product-provider'
import { Countdown } from './trade-ui'
import { LEVEL_BY_ID } from '@/lib/game-data'
import { money } from '@/lib/cultivation-preview'
import { pendingTrades } from '@/lib/trade'

export function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [failed, setFailed] = useState(false)
  const { state, now } = useProduct()
  // 有待办（待打款 / 待确认收款）时：不播文字动画，视频压暗，底部显示待办卡片
  const todo = pendingTrades(state?.trades ?? [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setStarted(true)
    }
    void video.play().catch(() => setStarted(true))
  }, [])

  return (
    <section
      className={styles.scene}
      aria-label="AI 悟空 · 数字生命序章"
      data-started={started}
      data-static={failed}
      data-todo={todo.length > 0}
    >
      <video
        ref={videoRef}
        className={styles.video}
        src="/videos/wukong-background.mp4"
        poster="/videos/wukong-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        controls={false}
        onPlaying={() => setStarted(true)}
        onError={() => setFailed(true)}
      />
      <div className={styles.shade} aria-hidden="true" />

      <div className="sr-only">
        <h1>AI 悟空</h1>
        <p>神话，不再只是故事。它，正以数字生命的姿态醒来。</p>
        <p>东方神话 · AI 原生数字生命</p>
        <p>每一次召唤，都是一场独一无二的相遇。</p>
        <p>召唤 · 修炼 · 圆满 · 传承</p>
      </div>

      <div className={styles.story} aria-hidden="true">
        <p className={`${styles.intro} ${styles.first}`}>神话，不再只是故事。</p>
        <p className={`${styles.intro} ${styles.second}`}>
          它，正以数字生命的姿态<br />醒来。
        </p>
        <div className={styles.identity}>
          <BrandLogo className={styles.title} preload />
          <p className={styles.edition}>东方神话 · <span>AI 原生</span>数字生命</p>
        </div>
        <p className={styles.encounter}>
          每一次召唤，<br />都是一场独一无二的相遇。
        </p>
        <p className={styles.journey}>召唤 · 修炼 · 圆满 · 传承</p>
      </div>

      {todo.length > 0 && <TodoCard trades={todo} now={now} />}
      {failed && !todo.length && <p className={styles.notice} role="status">视频暂时无法加载，请刷新重试</p>}
    </section>
  )
}

function TodoCard({ trades, now }: { trades: ReturnType<typeof pendingTrades>; now: number }) {
  const first = trades[0]
  const payer = first.role === 'payer'
  const more = trades.length > 1
  return <section className={styles.todo} aria-labelledby="home-todo-title" role="region">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={styles.todoTag}>{payer ? '待打款' : '待确认收款'}{more ? ` · 共 ${trades.length} 笔待办` : ''}</p>
        <h2 id="home-todo-title" className={styles.todoTitle}>{LEVEL_BY_ID[first.stage].name} · {payer ? '向乙方打款' : '甲方已打款'}</h2>
        <p className={styles.todoMeta}>{payer ? <>剩余 <Countdown ms={first.deadline - now} /> · 逾期召唤蟠桃充公</> : '请核实到账后确认收款'}</p>
      </div>
      <div className="shrink-0 text-right"><p className={styles.todoAmount}>{money(first.amountCents)}</p><p className={styles.todoUnit}>USDT</p></div>
    </div>
    <div className={styles.todoActions}>
      <Link href={`/me/trades/${encodeURIComponent(first.id)}`} className="btn-gold inline-flex flex-1 items-center justify-center text-sm">{payer ? '去打款' : '去确认收款'}</Link>
      {more && <Link href="/me/trades" className={styles.todoAll}>全部待办<ChevronRight className="size-3.5" /></Link>}
    </div>
  </section>
}
