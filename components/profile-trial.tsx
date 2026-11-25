import { LEVELS, TRIAL_CYCLE_DAYS } from '@/lib/game-data'
import { ProfilePageHeader } from './profile-ui'
import { TRIAL_SAME, TrialDifferenceTable } from './trial-notice'

/** 体验版专属页面：把体验版与正式版的区别一次讲清楚。 */
export function ProfileTrial() {
  return <div className="flex flex-col gap-5">
    <ProfilePageHeader title="体验版与正式版的区别" subtitle="体验版用来熟悉玩法。除了下面三点，其余规则与正式版完全相同。" />
    <section className="profile-surface"><TrialDifferenceTable /></section>
    <section className="profile-surface profile-article"><h2>相同的部分</h2><p>{TRIAL_SAME}</p></section>
    <section className="profile-surface" aria-label="各阶段周期对照">
      <h2 className="profile-heading mb-3">各阶段周期对照</h2>
      <div role="table" className="text-xs">
        <div role="row" className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 border-b border-[var(--gold-600)]/40 pb-2 text-[11px] text-[var(--gold-200)]"><span role="columnheader">阶段</span><span role="columnheader" className="text-right">正式版</span><span role="columnheader" className="text-right">体验版</span></div>
        {LEVELS.map(level => <div role="row" key={level.id} className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 border-b border-[var(--gold-600)]/20 py-2.5 last:border-0"><span role="cell" className="text-[var(--gold-100)]">{level.name}</span><span role="cell" className="text-right tabular-nums text-stone-200">{level.cycleDays} 天</span><span role="cell" className="text-right tabular-nums text-[var(--gold-100)]">{TRIAL_CYCLE_DAYS} 天</span></div>)}
      </div>
    </section>
    <section className="profile-surface profile-article"><h2>请注意</h2><p>正式版的周期更长，需要每天修炼一次、连续修炼到周期结束才能传承。体验版把周期统一缩短为 {TRIAL_CYCLE_DAYS} 天，只是为了让你更快看完一轮流程，不代表正式规则。</p><p>体验版的蟠桃和 USDT 都是体验数据，不可提现，也不会带到正式版。</p></section>
  </div>
}
