'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { LockKeyhole } from 'lucide-react'
import { RULES } from '@/lib/cultivation-preview'
import type { Stage } from '@/lib/game-data'

/**
 * 修炼之境的画面。active = 今天已经修炼：画面循环播放、灵气上升；
 * 还没修炼时画面静止、压暗，像在等你运功。刚修炼的那一刻金光一闪。
 */
export function CultivationVideo({ stage, locked, empty, active = true, idleText }: { stage: Stage; locked: boolean; empty: boolean; active?: boolean; idleText?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [flash, setFlash] = useState(0)
  const wasActive = useRef(active)
  useEffect(() => {
    if (active && !wasActive.current) setFlash(n => n + 1)
    wasActive.current = active
  }, [active])
  const rule = RULES[stage]
  const poster = rule.cultivationPoster
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let disposed = false
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const resume = () => {
      if (!active) { video.pause(); try { video.currentTime = 0 } catch {} return }
      if (document.hidden || preference.matches) { video.pause(); return }
      video.muted = true
      void video.play().catch(() => { if (!disposed) setLoaded(false) })
    }
    document.addEventListener('visibilitychange', resume)
    document.addEventListener('pointerdown', resume)
    document.addEventListener('keydown', resume)
    video.addEventListener('canplay', resume)
    preference.addEventListener('change', resume)
    resume()
    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', resume)
      document.removeEventListener('pointerdown', resume)
      document.removeEventListener('keydown', resume)
      video.removeEventListener('canplay', resume)
      preference.removeEventListener('change', resume)
      video.pause()
    }
  }, [stage, locked, active])
  return <div className={`cultivation-stage ${locked ? '' : active ? 'is-active' : 'is-idle'}`}>
    <Image src={poster} alt={`${rule.name}的${rule.realm}修炼之境`} fill priority sizes="(max-width:480px) 100vw, 448px" className={`object-cover ${locked ? 'brightness-[.3] grayscale' : ''}`} />
    {!locked && <video ref={videoRef} src={rule.cultivationVideo} poster={poster} autoPlay={active} muted loop playsInline controls={false} disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" preload="auto" aria-hidden tabIndex={-1} onPlaying={() => { setFailed(false); setLoaded(true) }} onLoadedData={() => { if (!active) setLoaded(true) }} onError={() => setFailed(true)} className={`pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${loaded && !failed ? 'opacity-100' : 'opacity-0'}`} />}
    {locked ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
      <LockKeyhole className="mb-1 size-6 text-stone-300" />
      <h3 className="font-display text-base font-bold text-amber-100">{empty ? '猴舍尚无悟空' : `暂无${rule.name}`}</h3>
      <p className="max-w-64 text-xs leading-relaxed text-stone-300">召唤成功后，即可开启{empty ? '对应悟空' : rule.realm}修炼之境。</p>
      <Link className="cultivation-secondary mt-1 !min-h-9 !px-4" href={empty ? '/world' : `/world?stage=${stage}`}>{empty ? '前往悟空世界' : `前往${rule.realm}`}</Link>
    </div> : <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
      {active && <div className="stage-aura" aria-hidden>{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ left: `${6 + (i * 37) % 88}%`, animationDelay: `${(i * 0.53) % 4.2}s`, animationDuration: `${3.6 + (i % 4) * 0.7}s` }} />)}</div>}
      {flash > 0 && <div key={flash} className="stage-flash" aria-hidden />}
      {!active && <p className="stage-idle">{idleText ?? '今日尚未修炼 · 静候运功'}</p>}
      <span className="absolute bottom-3 left-3 font-display text-xs tracking-wide text-amber-100/90">{rule.realm} · 修炼之境</span>

    </>}
  </div>
}
