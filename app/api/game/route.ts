import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// V2仅为隔离演示，禁止旧接口以新配置写入真实账户。
function demoOnly() {
  return NextResponse.json({ error: '真实账户、召唤与结算接口尚未开放。' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
}

export const GET = demoOnly
export const POST = demoOnly
