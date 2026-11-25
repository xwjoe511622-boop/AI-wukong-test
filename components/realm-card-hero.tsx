'use client'

import Image from 'next/image'
import { useRef, useState, type CSSProperties } from 'react'
import { starText, type WukongLevel } from '@/lib/game-data'
import { useSound } from '@/lib/sound'
import type { SoundName } from '@/lib/sound-engine'

const MOTES = 16

// 每阶段一层专属"活"元素：石灵浮石、灵猴飞叶、悟空气环、斗战火星、大圣金芒、天命法印
const MOTE_KIND: Record<string, string> = {
  stone_spirit: 'shard',
  spirit_monkey: 'leaf',
  wukong: 'ring',
  battle_wukong: 'ember',
  great_sage: 'ray',
  destiny_sage: 'sigil',
  infinite_sage: 'mist',
}

// 用固定的伪随机序列铺粒子位置，保证服务端与客户端渲染一致
const spread = (i: number, seed: number) => ((i * 9301 + seed * 49297) % 233280) / 233280

export function RealmCardHero({ level }: { level: WukongLevel }) {
  const [revealed, setRevealed] = useState(false)
  const kind = MOTE_KIND[level.id] ?? 'ring'
  const { play } = useSound()
  const soundedRef = useRef(false)

  // 人物显形的同一刻播放该仙境入场音，只触发一次
  const reveal = () => {
    setRevealed(true)
    if (!soundedRef.current) {
      soundedRef.current = true
      play(`realm:${level.id}` as SoundName)
    }
  }

  return (
    <section
      className="realm-hero"
      data-revealed={revealed}
      data-realm={level.id}
      data-locked={!level.isOpen}
      style={{ '--realm-aura': level.accent } as CSSProperties}
      aria-labelledby={`realm-character-${level.id}`}
    >
      {/* 远景：仙境封面缓慢推近，构成视差底层 */}
      <div className="realm-hero-scenery" aria-hidden="true">
        <Image src={level.realmCover} alt="" fill preload sizes="(max-width: 480px) 100vw, 448px" className={`object-cover ${level.isOpen ? '' : 'grayscale'}`} />
      </div>

      <div className="realm-hero-stage">
        {/* 中景：逆向旋转的法环 + 背光 */}
        <div className="realm-hero-ring" aria-hidden="true" />
        <div className="realm-hero-halo" aria-hidden="true" />

        {/* 入场特效：劈光、白闪、两道冲击波（只播一次） */}
        <div className="realm-hero-beam" aria-hidden="true" />
        <div className="realm-hero-shock realm-hero-shock-a" aria-hidden="true" />
        <div className="realm-hero-shock realm-hero-shock-b" aria-hidden="true" />
        <div className="realm-hero-flash" aria-hidden="true" />

        {/* 前景粒子 */}
        <div className={`realm-motes realm-motes-${kind}`} aria-hidden="true">
          {Array.from({ length: MOTES }, (_, i) => (
            <span
              key={i}
              style={{
                '--x': `${spread(i, 1) * 100}%`,
                '--y': `${spread(i, 2) * 100}%`,
                '--d': `${(5 + spread(i, 3) * 6).toFixed(2)}s`,
                '--delay': `${(-spread(i, 4) * 12).toFixed(2)}s`,
                '--s': (0.5 + spread(i, 5)).toFixed(2),
                '--r': `${Math.round(spread(i, 6) * 360)}deg`,
              } as CSSProperties}
            />
          ))}
        </div>

        {/* 人物：贴底立于舞台，占满高度 */}
        <div className="realm-hero-reveal">
          <div className="realm-hero-breathe">
            <Image
              src={level.characterImage}
              alt={`${level.name}角色立绘`}
              width={1024}
              height={1536}
              preload
              sizes="(max-width: 480px) 100vw, 448px"
              className="realm-hero-art"
              onLoad={reveal}
            />
          </div>
        </div>
        <div className="realm-hero-ground" aria-hidden="true" />
        <div className="realm-hero-vignette" aria-hidden="true" />
      </div>

      {/* 人物名与介绍：独立于舞台，落在人物脚下的实底标题带上，不与立绘重叠 */}
      <div className="realm-hero-caption">
        <p className="flex items-center justify-center gap-3 text-[11px] tracking-widest text-[var(--gold-200)]">
          <span aria-label={`${level.stars}星`} className="text-[var(--gold-400)]">{starText(level.stars)}</span>
          <span>{level.tier}</span>
          {!level.isOpen && (
            <span className="rounded-full border border-[var(--gold-600)]/50 px-2 py-0.5 text-[10px] tracking-widest text-[var(--gold-200)]">未开放</span>
          )}
        </p>
        <h2 id={`realm-character-${level.id}`} className="realm-hero-title font-display text-[2.4rem] font-black leading-none tracking-[0.18em] text-gold">
          {level.name}
        </h2>
        <p className="realm-hero-lore px-4 pt-1 text-center text-xs leading-6 text-[var(--gold-100)]/85">{level.lore}</p>
      </div>
    </section>
  )
}
