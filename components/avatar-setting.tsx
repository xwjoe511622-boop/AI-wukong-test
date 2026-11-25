'use client'

import { useRef, useState } from 'react'
import { AVATAR_MAX_CHARS } from '@/lib/product-state'
import { Avatar } from './avatar'
import { useProduct } from './product-provider'
import { ProfileButton } from './profile-ui'

/** 把选中的图片居中裁成正方形并缩到 192px，存成小图 */
async function toAvatar(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 192
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法处理图片')
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 192, 192)
  for (const quality of [0.85, 0.7, 0.5]) {
    const url = canvas.toDataURL('image/jpeg', quality)
    if (url.length <= AVATAR_MAX_CHARS) return url
  }
  throw new Error('图片过大')
}

export function AvatarSetting() {
  const { state, act } = useProduct()
  const input = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  async function pick(file?: File) {
    if (!file) return
    setBusy(true); setNotice('')
    try { act({ type: 'set-avatar', dataUrl: await toAvatar(file) }); setNotice('头像已更新') }
    catch { setNotice('这张图片无法使用，请换一张 JPG 或 PNG。') }
    finally { setBusy(false); if (input.current) input.current.value = '' }
  }
  return <section className="profile-surface" aria-labelledby="avatar-title">
    <h2 id="avatar-title" className="profile-heading">头像</h2>
    <div className="mt-3 flex items-center gap-4">
      <Avatar src={state?.avatar} size={72} />
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-6 text-[var(--profile-muted)]">{state?.avatar ? '已设置自定义头像。' : '未设置头像，当前显示默认图标。'}同行者和部族成员会看到你的头像。</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <ProfileButton size="small" disabled={busy} onClick={() => input.current?.click()}>{busy ? '处理中…' : state?.avatar ? '更换头像' : '设置头像'}</ProfileButton>
          {state?.avatar && <ProfileButton size="small" secondary onClick={() => { act({ type: 'set-avatar', dataUrl: null }); setNotice('已恢复默认头像') }}>恢复默认</ProfileButton>}
        </div>
      </div>
    </div>
    <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="选择头像图片" onChange={event => pick(event.target.files?.[0])} />
    <p role="status" aria-live="polite" className="mt-2 min-h-4 text-[11px] text-[var(--gold-200)]">{notice}</p>
  </section>
}
