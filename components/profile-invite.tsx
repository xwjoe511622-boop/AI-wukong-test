'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProfileButton } from './profile-ui'
import { BRAND_LOGO_SRC } from './brand-logo'

export function ProfileInvite({ code }: { code?: string }) {
  const [mode, setMode] = useState<'share' | 'link' | null>(null)
  const [url, setUrl] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  function open(next: 'share' | 'link') {
    if (!code) return
    setUrl(new URL(`/me/join?code=${encodeURIComponent(code)}`, window.location.origin).href)
    setMode(next)
    setNotice('')
  }
  async function copy(text: string, label: string) {
    try { await navigator.clipboard.writeText(text); setNotice(`${label}已复制`) }
    catch { setMode('link'); setNotice('浏览器限制自动复制，请长按下方文字手动复制。') }
  }
  async function share() {
    try {
      if (navigator.share) { await navigator.share({ title: 'AI WUKONG · 邀请同行者', text: '与君同行，共赴悟空世界', url }); setNotice('已打开系统分享') }
      else await copy(url, '邀请链接')
    } catch (error) { if ((error as Error).name !== 'AbortError') setNotice('无法打开系统分享，请复制邀请链接。') }
  }
  async function poster() {
    setBusy(true)
    try {
      const image = new window.Image()
      image.crossOrigin = 'anonymous'
      image.src = '/assets/invite-journey.png'
      const logo = new window.Image()
      logo.crossOrigin = 'anonymous'
      logo.src = BRAND_LOGO_SRC
      await Promise.all([image.decode(), logo.decode()])
      await document.fonts.ready
      const canvas = document.createElement('canvas')
      canvas.width = 900; canvas.height = 1300
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas unavailable')
      ctx.fillStyle = '#13130f'; ctx.fillRect(0, 0, 900, 1300)
      ctx.drawImage(image, 0, 0, 900, 580)
      const gradient = ctx.createLinearGradient(0, 380, 0, 650)
      gradient.addColorStop(0, '#13130f00'); gradient.addColorStop(1, '#13130fff')
      ctx.fillStyle = gradient; ctx.fillRect(0, 380, 900, 280)
      const logoWidth = 360
      const logoHeight = logoWidth * logo.naturalHeight / logo.naturalWidth
      ctx.drawImage(logo, (canvas.width - logoWidth) / 2, 540, logoWidth, logoHeight)
      ctx.textAlign = 'center'; ctx.fillStyle = '#d8b775'
      ctx.font = 'bold 60px serif'; ctx.fillText('邀请同行者', 450, 778)
      ctx.fillStyle = '#e4dccc'; ctx.font = '30px serif'; ctx.fillText('与君同行，共赴悟空世界', 450, 845)
      ctx.font = '24px sans-serif'; ctx.fillStyle = '#ac9b7d'; ctx.fillText('专属邀请码', 450, 960)
      ctx.font = '32px monospace'; ctx.fillStyle = '#e7cf99'; ctx.fillText(code ?? '', 450, 1010)
      ctx.font = '22px sans-serif'; ctx.fillStyle = '#b7af9e'; ctx.fillText('打开 AI WUKONG · 我的 · 接受邀请', 450, 1100)
      ctx.fillText('输入邀请码，开启同行之旅', 450, 1140)
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('无法生成海报')), 'image/png'))
      const file = new File([blob], 'AI-WUKONG-邀请海报.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: '邀请同行者' })
      else {
        const objectUrl = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = objectUrl; a.download = file.name; a.click()
        setTimeout(() => URL.revokeObjectURL(objectUrl), 10000)
      }
      setNotice('邀请海报已生成')
    } catch (error) { if ((error as Error).name !== 'AbortError') setNotice('海报生成失败，请使用邀请链接。') }
    finally { setBusy(false) }
  }
  return <>
    <section className="profile-invite" aria-labelledby="invite-title">
      <Image src="/assets/invite-journey.png" alt="" fill sizes="(max-width: 480px) 100vw, 448px" />
      <div className="w-full p-4"><h2 id="invite-title" className="font-display text-xl font-bold tracking-wider text-[var(--gold-100)]">邀请同行者</h2><p className="mt-1 text-xs text-[var(--gold-200)]">与君同行，共赴悟空世界</p><div className="mt-3 flex flex-wrap gap-2"><ProfileButton disabled={!code} onClick={() => open('share')}>邀请同行者</ProfileButton><ProfileButton secondary disabled={!code} onClick={() => open('link')}>邀请链接</ProfileButton></div></div>
    </section>
    <Dialog open={mode !== null} onOpenChange={open => { if (!open) setMode(null) }}>
      <DialogContent className="profile-modal" showCloseButton={false}>
        <DialogHeader><DialogTitle>{mode === 'link' ? '邀请链接' : '邀请同行者'}</DialogTitle><DialogDescription>与君同行，共赴悟空世界。接受邀请仅记录演示同行关系，不连接真实账户。</DialogDescription></DialogHeader>
        {mode === 'share' ? <div className="flex flex-col gap-2"><ProfileButton size="large" onClick={poster} disabled={busy}>{busy ? '正在生成海报…' : '生成邀请海报'}</ProfileButton><ProfileButton size="large" onClick={share}>分享邀请</ProfileButton><div className="flex flex-wrap gap-2"><ProfileButton secondary onClick={() => copy(url, '邀请链接')}>复制邀请链接</ProfileButton><ProfileButton secondary onClick={() => copy(code ?? '', '邀请码')}>复制邀请码</ProfileButton></div></div> : <div className="flex flex-col gap-4"><div><p className="select-text break-all rounded-lg border border-[var(--gold-700)] p-3 text-xs leading-6">{url}</p><ProfileButton size="small" className="mt-2" onClick={() => copy(url, '邀请链接')}>复制链接</ProfileButton></div><div><h3 className="mb-2 text-sm text-[var(--gold-200)]">邀请码</h3><p className="select-text break-all font-mono text-base tracking-wider">{code}</p><ProfileButton size="small" className="mt-2" onClick={() => copy(code ?? '', '邀请码')}>复制邀请码</ProfileButton></div><ProfileButton onClick={share}>分享邀请</ProfileButton></div>}
        <p role="status" className="text-xs text-[var(--gold-200)]">{notice}</p>
        <ProfileButton secondary size="small" onClick={() => setMode(null)}>关闭</ProfileButton>
      </DialogContent>
    </Dialog>
  </>
}
