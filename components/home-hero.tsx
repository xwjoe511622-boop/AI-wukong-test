'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './home-hero.module.css'
import { BrandLogo } from './brand-logo'

export function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [failed, setFailed] = useState(false)

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

      {failed && <p className={styles.notice} role="status">视频暂时无法加载，请刷新重试</p>}
    </section>
  )
}
