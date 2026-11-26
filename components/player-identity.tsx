'use client'

import { Avatar } from './avatar'
import Link from 'next/link'
import { useState } from 'react'
import { Copy, Settings2 } from 'lucide-react'

/** tier：部族等级名（如「部族 Ⅱ 阶」）；null 表示还没入阶；不传则不显示。只是标识，不能点 */
export function PlayerIdentity({ playerId, settingsHref, avatar, tier }: { playerId?: string | null; settingsHref?: string; avatar?: string; tier?: string | null }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  async function copyUid() {
    if (!playerId) return
    try {
      await navigator.clipboard.writeText(playerId)
      setCopyStatus('完整 UID 已复制')
    } catch {
      setCopyStatus('复制受限，请在设置中长按 UID 复制')
    }
  }

  return (
    <div className="pt-[env(safe-area-inset-top)]">
      <header className="flex min-h-16 items-center gap-2.5 pr-11">
        {settingsHref ? <Link href={settingsHref} aria-label="设置头像" className="shrink-0"><Avatar src={avatar} size={52} /></Link> : <Avatar src={avatar} size={60} />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="whitespace-nowrap font-display text-lg font-bold tracking-wide text-gold">悟空召唤者</h2>
            {tier !== undefined && <span className={`tier-badge ${tier ? '' : 'is-none'}`}>{tier ?? '未入阶'}</span>}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--gold-200)]">
            <span className="truncate" title={playerId ?? undefined}>UID：{playerId ? `${playerId.slice(0, 8)}…` : '读取中'}</span>
            <button type="button" onClick={copyUid} disabled={!playerId} aria-label="复制完整 UID" className={settingsHref ? 'shrink-0 px-1 text-xs text-[var(--gold-300)] underline underline-offset-4 disabled:opacity-40' : 'flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-amber-300 disabled:opacity-40'}>{settingsHref ? '复制' : <Copy className="size-3.5" />}</button>
          </div>
        </div>
        {settingsHref ? <Link href={settingsHref} className="btn-ghost-gold ornate-short btn-compact shrink-0" aria-label="设置">设置</Link> : <button type="button" onClick={() => setSettingsOpen(!settingsOpen)} aria-label="设置" aria-expanded={settingsOpen} aria-controls={settingsOpen ? 'player-settings' : undefined} className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[rgba(212,148,26,0.3)] text-[var(--gold-200)] hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-amber-300"><Settings2 className="size-5" /></button>}
      </header>
      <p role="status" className={copyStatus ? 'mt-1 text-xs text-[var(--gold-200)]' : 'sr-only'}>{copyStatus}</p>
      {settingsOpen && (
        <section id="player-settings" className="panel gold-hairline mt-3 rounded-xl p-4 text-xs leading-relaxed text-[var(--gold-200)]">
          <h3 className="mb-2 font-display text-sm font-bold">匿名存档设置</h3>
          <p>当前使用匿名身份，不需要登录。清除 Cookie 或更换设备后无法自动恢复原存档。</p>
          <p className="mt-2 select-text break-all">完整 UID：{playerId}</p>
          <p className="mt-2">UID 仅用于标识，不是登录凭证或恢复密钥。</p>
          <button type="button" onClick={() => setSettingsOpen(false)} className="btn-ghost-gold mt-3 rounded-md px-4 py-2">收起设置</button>
        </section>
      )}
    </div>
  )
}
