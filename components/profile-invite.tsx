'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { ProfileButton } from './profile-ui'

/** 邀请同行者：一个按钮直接复制邀请链接；邀请链接和邀请码直接显示在卡片上，点一下也能复制。没有弹框。 */
export function ProfileInvite({ code }: { code?: string }) {
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)
  const [notice, setNotice] = useState('')
  useEffect(() => { if (code) setUrl(new URL(`/me/join?code=${encodeURIComponent(code)}`, window.location.origin).href) }, [code])
  async function copy(what: 'link' | 'code') {
    const text = what === 'link' ? url : code ?? ''
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what); setNotice(`${what === 'link' ? '邀请链接' : '邀请码'}已复制，发给朋友即可`)
      setTimeout(() => setCopied(current => current === what ? null : current), 2000)
    } catch { setNotice('没能自动复制，请长按上方文字手动复制。') }
  }
  return <section className="profile-invite !flex-col !items-stretch" aria-labelledby="invite-title">
    <Image src="/assets/invite-journey.png" alt="" fill sizes="(max-width: 480px) 100vw, 448px" />
    <div className="mt-auto w-full p-4 pt-16">
      <h2 id="invite-title" className="font-display text-xl font-bold tracking-wider text-[var(--gold-100)]">邀请同行者</h2>
      <p className="mt-1 text-xs text-[var(--gold-200)]">与君同行，共赴悟空世界</p>
      <dl className="mt-3 flex flex-col gap-2">
        <InviteRow label="邀请码" value={code} mono done={copied === 'code'} onCopy={() => copy('code')} />
        <InviteRow label="邀请链接" value={url} done={copied === 'link'} onCopy={() => copy('link')} />
      </dl>
      <ProfileButton size="large" className="mt-3" disabled={!url} onClick={() => copy('link')}>{copied === 'link' ? '已复制邀请链接' : '邀请同行者'}</ProfileButton>
      <p role="status" aria-live="polite" className="mt-2 min-h-4 text-center text-[11px] text-[var(--gold-200)]">{notice}</p>
    </div>
  </section>
}

function InviteRow({ label, value, mono, done, onCopy }: { label: string; value?: string; mono?: boolean; done: boolean; onCopy: () => void }) {
  return <div className="flex items-center gap-3 rounded-lg border border-[#b0904b55] bg-black/55 px-3 py-2">
    <dt className="w-14 shrink-0 text-[11px] text-[var(--profile-muted)]">{label}</dt>
    <dd className={`min-w-0 flex-1 select-text truncate text-xs text-[var(--gold-100)] ${mono ? 'font-mono tracking-wider' : ''}`}>{value || '读取中…'}</dd>
    <button type="button" disabled={!value} onClick={onCopy} aria-label={`复制${label}`} className="trade-copy">{done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{done ? '已复制' : '复制'}</button>
  </div>
}
