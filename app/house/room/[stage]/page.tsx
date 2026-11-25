import type { Metadata } from 'next'
import Link from 'next/link'
import { RoomView } from '@/components/room-view'
import { ROOMS, RULES } from '@/lib/cultivation-preview'
import { LEVELS } from '@/lib/game-data'
import { isStage } from '@/lib/summon-preview'

type Params = Promise<{ stage: string }>

export function generateStaticParams() {
  return LEVELS.map(level => ({ stage: level.id }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { stage } = await params
  if (!isStage(stage)) return { title: '修炼室 | AI WUKONG' }
  return { title: `${RULES[stage].realm} · ${ROOMS[stage].room} | AI WUKONG` }
}

export default async function RoomPage({ params }: { params: Params }) {
  const { stage } = await params
  if (!isStage(stage)) {
    return <div className="py-16 text-center"><h1 className="font-display text-base text-amber-100">未找到该修炼室</h1><Link href="/house" className="cultivation-secondary mt-5">返回猴舍</Link></div>
  }
  return <RoomView stage={stage} />
}
