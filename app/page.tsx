import type { Metadata } from 'next'
import { HomeView } from '@/components/home-view'

export const metadata: Metadata = {
  title: 'AI 悟空 · 神话正在醒来',
  description: '神话，不再只是故事。它，正以数字生命的姿态醒来。AI 悟空数字生命，开启召唤、修炼、成长与传承之旅。',
}

export default function HomePage() {
  return <HomeView />
}
