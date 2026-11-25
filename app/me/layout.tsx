import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '我的 · AI WUKONG',
  description: '悟空世界的身份、蟠桃与 USDT 资产、同行者、部族成长与奖励中心。',
}
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <div className="profile-page">{children}</div>
}
