import { redirect } from 'next/navigation'
import { HouseView } from '@/components/house-view'
import { isStage } from '@/lib/summon-preview'

export default async function HousePage({ searchParams }: { searchParams: Promise<{ stage?: string | string[] }> }) {
  const { stage } = await searchParams
  // 旧链接 /house?stage=xxx 直接进入对应修炼室
  if (isStage(stage)) redirect(`/house/room/${stage}`)
  return <HouseView />
}
