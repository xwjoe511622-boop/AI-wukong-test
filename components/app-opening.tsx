'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import styles from './app-opening.module.css'

export function AppOpening({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [phase, setPhase] = useState<'playing' | 'leaving' | 'done'>('playing')
  const [muted, setMuted] = useState(true)
  const [needsPlay, setNeedsPlay] = useState(false)
  const [ready, setReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const finishing = useRef(false)
  const invitationEntry = useRef(pathname === '/me/join')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 切换语言会刷新页面：这一次不重播开场动画
  useEffect(() => { try { if (sessionStorage.getItem('wukong-skip-opening')) { sessionStorage.removeItem('wukong-skip-opening'); setPhase('done') } } catch {} }, [])

  const clearWatchdog = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  const finish = useCallback(() => {
    if (finishing.current) return
    finishing.current = true
    clearWatchdog()
    videoRef.current?.pause()
    if (!invitationEntry.current) router.replace('/', { scroll: false })
    setPhase('leaving')
  }, [clearWatchdog, router])

  const armWatchdog = useCallback(() => {
    clearWatchdog()
    timeoutRef.current = setTimeout(finish, 10000)
  }, [clearWatchdog, finish])

  useEffect(() => {
    router.prefetch('/')
    skipRef.current?.focus({ preventScroll: true })
    armWatchdog()
    void videoRef.current?.play().then(() => {
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        setReady(true)
        clearWatchdog()
      }
    }).catch(() => setNeedsPlay(true))
    return clearWatchdog
  }, [armWatchdog, clearWatchdog, router])

  useEffect(() => {
    if (phase === 'done') return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [phase])

  useEffect(() => {
    if (phase !== 'leaving' || (pathname !== '/' && !invitationEntry.current)) return
    const timer = setTimeout(() => setPhase('done'), 450)
    return () => clearTimeout(timer)
  }, [phase, pathname])

  useEffect(() => {
    if (phase !== 'done') return
    const main = contentRef.current?.querySelector('main')
    if (main) {
      main.setAttribute('tabindex', '-1')
      main.focus({ preventScroll: true })
      main.removeAttribute('tabindex')
    }
  }, [phase])

  const leaving = phase === 'leaving' && (pathname === '/' || invitationEntry.current)

  return (
    <>
      {(phase === 'done' || leaving) && (
        <div ref={contentRef} inert={phase !== 'done'}>{children}</div>
      )}
      {phase !== 'done' && (
        <section
          className={styles.opening}
          data-leaving={leaving}
          aria-label="AI 悟空开场动画"
          onKeyDown={(event) => { if (event.key === 'Escape') finish() }}
        >
          <video
            ref={videoRef}
            className={styles.video}
            src="/videos/app-opening.mp4"
            autoPlay
            muted={muted}
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-label="AI 悟空开场视频"
            onEnded={finish}
            onError={finish}
            onWaiting={armWatchdog}
            onStalled={armWatchdog}
            onTimeUpdate={() => {
              if (videoRef.current && !videoRef.current.paused) clearWatchdog()
            }}
            onPlaying={() => {
              clearWatchdog()
              setReady(true)
              setNeedsPlay(false)
            }}
          />
          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.control}
              aria-label={muted ? '开启声音' : '关闭声音'}
              aria-pressed={!muted}
              onClick={() => {
                const video = videoRef.current
                if (!video) return
                video.muted = !muted
                setMuted(!muted)
                void video.play().catch(() => setNeedsPlay(true))
              }}
            >{muted ? '开启声音' : '关闭声音'}</button>
            <button ref={skipRef} type="button" className={styles.control} onClick={finish}>跳过</button>
          </div>
          {needsPlay ? (
            <button type="button" className={styles.play} onClick={() => {
              armWatchdog()
              void videoRef.current?.play().catch(finish)
            }}>播放开场</button>
          ) : !ready && <p className={styles.loading} role="status">序章加载中…</p>}
        </section>
      )}
    </>
  )
}
