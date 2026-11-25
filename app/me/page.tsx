import { MeView } from '@/components/me-view'

export default function MePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="sr-only">我的</h1>
      <MeView />
    </div>
  )
}
