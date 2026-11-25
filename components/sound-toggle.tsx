'use client'

import { useState } from 'react'
import { useSound } from '@/lib/sound'

export function SoundToggle() {
  const { muted, toggleMuted, volume, setVolume } = useSound()
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`pointer-events-auto fixed right-3 z-50 flex items-center gap-2 pt-[env(safe-area-inset-top)] top-3`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {open && !muted && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="音量"
          className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-[var(--gold-600)]/40 accent-[var(--gold-400)]"
        />
      )}
      <button
        type="button"
        onClick={toggleMuted}
        aria-label={muted ? '开启音效' : '关闭音效'}
        aria-pressed={!muted}
        className="grid h-9 w-9 place-items-center rounded-full border border-[var(--gold-600)]/50 bg-black/55 text-[var(--gold-200)] backdrop-blur-sm transition-colors hover:border-[var(--gold-400)] hover:text-[var(--gold-100)] focus-visible:outline-2 focus-visible:outline-[var(--gold-300)]"
      >
        {muted ? <SpeakerOff /> : <SpeakerOn />}
      </button>
    </div>
  )
}

function SpeakerOn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}

function SpeakerOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  )
}
