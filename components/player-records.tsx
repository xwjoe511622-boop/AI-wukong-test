'use client'

import { useGame } from '@/lib/game-context'
import { LEVEL_BY_ID, INHERITANCE_FEE_PCT } from '@/lib/game-data'
import { PeachAmount } from './peach'

const labels = { welcome: '新手赠送', summon: '召唤成功', cycle: '修炼结算', inherit: '传承回收' }
const dateFormat = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
})

export function PlayerRecords({ section }: { section: 'ledger' | 'inherit' | 'rules' | null }) {
  const { ledger } = useGame()
  if (!section) return null
  const entries = section === 'inherit' ? ledger.filter((entry) => entry.kind === 'inherit') : ledger
  return (
    <section id="player-records" aria-labelledby="records-heading" className="panel rounded-2xl p-4">
      <h2 id="records-heading" className="mb-4 font-display text-lg font-bold text-gold">
        {section === 'rules' ? '召唤与规则' : section === 'inherit' ? '传承记录' : '蟠桃明细'}
      </h2>
      {section === 'rules' ? (
        <ul className="list-disc space-y-3 pl-4 text-xs leading-relaxed text-[var(--gold-200)]">
          <li>蟠桃是召唤与修炼的消耗单位，1蟠桃 = 1 USDT；可在个人地址页用 USDT 购买。</li>
          <li>召唤仪式于北京时间每日11:00起依次开启，每阶段一个1小时召唤周期，周期开始前30分钟预约截止，周期内点「召唤」，系统当场匹配并公布结果；召唤成功后承接人须在1小时内完成打款，逾期召唤蟠桃充公。</li>
          <li>契约功能已取消。修炼值以 USDT 计，蟠桃只是召唤与修炼的消耗单位。召唤成功自动扣除召唤蟠桃，失败全额退还并可继续参与后续召唤；成功即入猴舍按日修炼。漏修会累计，不罚款、不重置。</li>
          <li>原周期结束且全部修炼完成后方可传承。平台手续费仅以修炼增长的{INHERITANCE_FEE_PCT}%计算，不以修炼值计算。</li>
          <li>已完成的操作同步更新余额与流水，可前往「我的」查看完整明细。</li>
          <li>旅程保存在当前浏览器，刷新或关闭后再打开都可继续；数据不跨设备同步。</li>
        </ul>
      ) : (
        <>
          <p className="mb-3 text-xs text-[var(--gold-500)]">最近 100 笔流水{section === 'inherit' ? '中的传承记录' : ''} · 北京时间</p>
          {entries.length === 0 ? <p className="py-4 text-center text-sm">暂无记录</p> : (
            <ul className="max-h-96 space-y-3 overflow-y-auto">
              {entries.map((entry) => (
                <li key={entry.id} className="border-b border-[rgba(212,148,26,0.2)] pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">{labels[entry.kind]}{entry.result ? ` · ${LEVEL_BY_ID[entry.result.stage].name}` : ''}</span>
                    <span className="flex items-center gap-1 text-sm"><span>{entry.amount < 0 ? '−' : '+'}</span><PeachAmount value={Math.abs(entry.amount)} size="sm" /></span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--gold-500)]">{dateFormat.format(new Date(entry.createdAt))} · 结余 {entry.balance.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
