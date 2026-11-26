'use client'

import { TRIAL_MODE } from '@/lib/game-data'
import { useState, type FormEvent } from 'react'
import { BrandLogo } from './brand-logo'
import { AvatarSetting } from './avatar-setting'
import { useProduct } from './product-provider'
import { useGame } from '@/lib/game-context'
import { ProfileButton, ProfileButtonLink, ProfileEmpty, ProfilePageHeader } from './profile-ui'

export function ProfileServicePage({ section, initialCode = '' }: { section: string; initialCode?: string }) {
  const { playerId } = useGame()
  const { act } = useProduct()
  const [notice, setNotice] = useState('')
  const [code, setCode] = useState(initialCode)
  const [pending, setPending] = useState(false)
  const [joined, setJoined] = useState(false)
  const titles: Record<string,string> = { announcements: '公告中心', support: '客服中心', security: '设置', language: '语言设置', about: '关于 AI WUKONG', join: '接受邀请' }
  async function copyUid() {
    try { await navigator.clipboard.writeText(playerId ?? ''); setNotice('完整 UID 已复制') }
    catch { setNotice('复制受限，请长按完整 UID 手动复制。') }
  }
  async function accept(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending || joined) return
    setPending(true); setNotice('')
    try {
      const accepted = act({ type: 'invite', code })
      if (!accepted) throw new Error('无法接受此邀请，请检查邀请码，且不能邀请自己或重复建立关系。')
      setJoined(true); setNotice('已接受邀请，同行关系已建立。')
    } catch (error) { setNotice((error as Error).message) }
    finally { setPending(false) }
  }
  return <div className="flex flex-col gap-5"><ProfilePageHeader title={titles[section]} />
    {section === 'announcements' && <><ProfileEmpty title="暂无新公告">世界动态与功能开放信息将在这里公布。</ProfileEmpty><div className="profile-article profile-surface"><h2>玩法提示</h2><p>截止前点一次召唤，到点系统自动匹配；召唤成功后向传承人完成支付结算，传承人确认到账即进入猴舍，之后每天点一次修炼；传承时由承接人向你支付，确认收款后传承完成。待办会显示在首页。</p><ProfileButtonLink href="/me/encyclopedia" size="small">查看悟空百科</ProfileButtonLink></div></>}
    {section === 'support' && <><section className="profile-surface profile-article"><h2>常见疑问</h2><details><summary>为什么看不到奖励？</summary><div>需先建立同行关系，相关成员实际完成传承并产生修炼增长。同行奖励为第一代 10%、第二代 5%，部族奖励需第一代有效同行者数与部族有效成员数同时达标；持有不少于 50 个蟠桃才算有效用户：未达标的成员不产生奖励，自己未达标也不能拿奖励。奖励全部返 USDT。暂无符合条件的奖励时，明细为空。</div></details><details><summary>同行者与部族成员有什么区别？</summary><div>直接邀请的是第一代同行者，他们邀请的是第二代；同行奖励仅计算这两代（第一代 10%、第二代 5%）。部族涵盖完整关系网络，不包含自己；部族晋升只统计持有不少于 50 个蟠桃的有效用户。</div></details><details><summary>蟠桃怎么获得？</summary><div>在「我的 → 我的资产」里用 USDT 购买，1蟠桃 = 1 USDT，立即到账。请勿向任何个人转账。</div></details><details><summary>交易有问题怎么申诉？</summary><div>支付结算或收款有疑问时，请保留交易页面截图和发生时间，联系客服处理。交易记录以平台系统为准。</div></details></section><section className="profile-surface profile-article"><h2>联系客服</h2><p>遇到问题请准备好问题描述、发生时间和页面截图，并附上你的 UID，方便客服核实。请勿向任何人透露你的账户信息，也不要私下向个人转账。</p><ProfileButton size="small" onClick={copyUid}>复制我的 UID</ProfileButton></section></>}
    {section === 'security' && <><AvatarSetting /><section className="profile-surface profile-article"><h2>悟空世界身份</h2><p>悟空召唤者</p><p className="select-text break-all font-mono text-xs">UID: {playerId}</p><ProfileButton size="small" onClick={copyUid}>复制 UID</ProfileButton></section><section className="profile-surface profile-article"><h2>账户安全</h2><p>UID 是你在悟空世界的身份标识，客服核实问题时会用到。</p><p>请勿向任何人透露账户信息；所有支付结算都在平台内完成，不要私下向个人转账。</p></section><ProfileButtonLink href="/me/join" size="large" secondary>接受同行邀请</ProfileButtonLink></>}
    {section === 'language' && <section className="profile-surface profile-article"><h2>当前语言</h2><p>简体中文 · 已启用</p><p>目前仅支持简体中文，后续语言开放后可在此切换。</p></section>}
    {section === 'about' && <section className="profile-surface profile-article text-center"><BrandLogo className="mx-auto mb-5 w-60" /><h2>AI WUKONG</h2><p>神话，不再只是故事。<br />它正在成为数字生命。</p><p>AI悟空数字生命，通过召唤、修炼与传承，构建面向AgentFi时代的东方神话AI原生角色世界。</p><p>AI原生角色资产经济 · 诞生、学习、成长、秩序、觉醒。</p><div className="mt-5"><ProfileButtonLink href="/me/encyclopedia" size="small">探索悟空百科</ProfileButtonLink></div></section>}
    {section === 'join' && <><section className="profile-surface profile-article"><h2>与君同行，共赴悟空世界</h2><p>输入同行者分享的邀请码，建立同行关系。只能接受一次，不能接受自己的邀请。</p></section>{joined ? <ProfileEmpty title="同行之缘，已然缔结"><ProfileButtonLink href="/me" size="small">返回我的</ProfileButtonLink></ProfileEmpty> : <form onSubmit={accept} className="profile-surface flex flex-col gap-4"><div><label htmlFor="invite-code" className="mb-2 block text-sm text-[var(--gold-200)]">邀请码</label><input id="invite-code" autoComplete="off" spellCheck={false} autoCapitalize="characters" required maxLength={18} pattern="[Ww][Kk][A-Fa-f0-9]{16}" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault() }} className="w-full rounded-lg border border-[var(--profile-border)] bg-[var(--profile-surface)] px-3 py-3 font-mono text-sm text-[var(--gold-100)]" /><p className="mt-2 text-[11px] text-[var(--profile-muted)]">请输入 WK 开头的 18 位邀请码。</p></div><ProfileButton type="submit" size="large" disabled={pending || !playerId}>{pending ? '正在建立同行关系…' : '确认接受邀请'}</ProfileButton></form>}</>}
    <p role="status" className="text-xs leading-6 text-[var(--gold-200)]">{notice}</p>
  </div>
}
