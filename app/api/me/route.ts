import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function demoOnly() {
  return NextResponse.json({ error: '真实同行关系、部族与奖励接口尚未开放。' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
}

export const GET = demoOnly
export const POST = demoOnly
