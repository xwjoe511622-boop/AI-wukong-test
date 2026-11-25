'use client'

import { useEffect, useRef } from 'react'
import styles from './home-hero.module.css'

/** 首页顶部英雄区：只露出背景视频最上面的悟空，约占四分之一屏；不叠任何文字 */
export function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => { void videoRef.current?.play().catch(() => {}) }, [])
  return (
    <div className={styles.hero} aria-hidden="true">
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
        controls={false}
      />
      <div className={styles.fade} />
    </div>
  )
}
