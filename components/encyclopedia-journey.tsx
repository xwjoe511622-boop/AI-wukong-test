import { TRIBE_TIERS, rewardParts } from '@/lib/profile-rules'
import { LEVELS, LEVEL_BY_ID, COMPANION_REWARD, INHERITANCE_FEE_PCT, PAYMENT_WINDOW_HOURS, VALID_USER_MIN_PEACH, TRIAL_MODE } from '@/lib/game-data'
import { settlement } from '@/lib/cultivation-preview'
import { LoreChapter } from './lore-chapter'
import { PeachValue, UsdtValue } from './peach-value'

export function EncyclopediaJourney() {
  const level = LEVEL_BY_ID.great_sage
  const example = { id: 'encyclopedia-example', stage: level.id, principal: level.rangeMin * 100, started: 0, completed: level.cultivationCount }
  const amounts = settlement(example)
  const stacked = rewardParts(10000, 1, 2)
  return <>
    <LoreChapter id="summon" number="06" title="召唤｜与悟空相遇" subtitle="统一蟠桃召唤，匹配完成即时公布，成功后限时打款。">
      <ol className="flex flex-col">{['召唤成功 · 系统即时通知','系统公布匹配结果','自动扣除召唤蟠桃','甲方获得乙方收款信息','甲方1小时内完成打款','乙方确认实际到账','乙方立即释放对应权益','系统确认交易完成 · 悟空进入猴舍'].map((text, i) => <li key={text} className="flex min-h-12 items-center gap-4 border-l border-[var(--gold-600)]/40 pl-4"><span className="font-latin text-xs text-[var(--gold-400)]">0{i + 1}</span><span className="text-[var(--gold-100)]">{text}</span></li>)}</ol>
      <p>全部玩家通过蟠桃参与召唤。召唤成功后系统自动扣除对应阶段的召唤蟠桃；召唤失败不产生交易，本次召唤使用的蟠桃全额退还，可继续参与后续召唤。每个召唤周期每人提交一次。配套金额以 USDT 计，蟠桃只是召唤与修炼的消耗单位。</p>
      <div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">召唤时间表 · 北京时间</h3><div role="table" aria-label="召唤时间表" className="mt-3 text-xs"><div role="row" className="grid grid-cols-[1.3fr_1.5fr_1fr_1fr] gap-2 border-b border-[var(--gold-600)]/30 pb-2 text-[11px] text-[var(--gold-200)]"><span role="columnheader">阶段</span><span role="columnheader">召唤周期</span><span role="columnheader" className="text-right">开放召唤</span><span role="columnheader" className="text-right">停止召唤</span></div>{LEVELS.map(l => <div role="row" key={l.id} className="grid grid-cols-[1.3fr_1.5fr_1fr_1fr] items-center gap-2 border-b border-[var(--gold-600)]/15 py-2 last:border-0"><span role="cell" className="whitespace-nowrap text-[var(--gold-100)]">{l.name}{l.isOpen ? '' : '（未开放）'}</span><span role="cell" className="whitespace-nowrap font-latin tabular-nums">{l.summonWindow}</span><span role="cell" className="text-right font-latin tabular-nums">{l.summonStartTime}</span><span role="cell" className="text-right font-latin tabular-nums">{l.summonStopTime}</span></div>)}</div><p className="mt-3 text-[11px] leading-6 text-stone-400">停止召唤即预约截止时间，须在此之前预约；开放召唤起进入本周期，系统在周期内自动匹配，匹配完成后立即公布结果，无需等待整点。例如 11:00 开始召唤、11:05 完成匹配，即在 11:05 公布结果。</p></div>
      <div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">甲乙双方交易</h3><p className="mt-2">甲方为打款方：收到交易通知后，系统自动启动 {PAYMENT_WINDOW_HOURS} 小时打款倒计时，须在规定时间内向指定乙方完成打款并提交付款凭证。乙方为释放方：核实实际到账金额，确认到账后立即释放对应权益，不得无故拖延或拒绝。交易争议依据系统记录及实际到账凭证处理。</p></div>
      <div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">逾期打款与违约</h3><p className="mt-2">召唤成功后超过 {PAYMENT_WINDOW_HOURS} 小时仍未完成打款，系统判定为逾期违约：本次召唤所扣除的蟠桃直接充公，不予退还，并保留违约记录。</p></div>
      <p className="text-[11px] leading-6 text-stone-400">{TRIAL_MODE ? '体验版' : '当前版本'}不模拟人工打款与释放：召唤成功后自动从 USDT 余额完成配套金额打款，悟空直接进入猴舍；USDT 余额不足时按逾期违约处理，召唤蟠桃充公。</p>
    </LoreChapter>
    <LoreChapter id="cultivation" number="07" title="修炼｜成长需要时间" subtitle="每一次修炼，都是与你的悟空共同成长。">
      <div className="flex flex-wrap gap-2">{Object.values(LEVEL_BY_ID).map(l => <span key={l.id} className="rounded-full border border-[var(--gold-600)]/40 px-3 py-1 text-xs text-[var(--gold-200)]">{l.name} · {l.cycleDays}天 · {l.cultivationCount}次</span>)}</div>
      <p>七阶段周期各不相同：{LEVELS.map(l => `${l.name} ${l.cycleDays} 天`).join('、')}；每天修炼一次，周期天数即修炼次数。</p>
      <p>每日进入猴舍，点击开始修炼并确认本次消耗。漏修不罚款、不清零、不重置、不增加额外费用；未完成次数持续累计，可一键补齐当前已经到期但未完成的修炼。</p><div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">{LEVEL_BY_ID.wukong.name} · 漏修3次</h3><p className="mt-2 flex flex-wrap items-center gap-1 text-xs leading-6">每次 <PeachValue cents={LEVEL_BY_ID.wukong.cultivationCost * 100} size="xs" />，待补3次，共需 <PeachValue cents={LEVEL_BY_ID.wukong.cultivationCost * 300} size="xs" />。</p></div>
    </LoreChapter>
    <LoreChapter id="completion" number="08" title="圆满｜时间自有答案" subtitle="修炼圆满，不等于可以提前传承。">
      <p>全部修炼完成，即为修炼圆满。即使提前圆满，仍须等待从召唤时刻起计算的原生命周期结束，不会提前传承。</p><p>例如{LEVEL_BY_ID.battle_wukong.name}的原周期为{LEVEL_BY_ID.battle_wukong.cycleDays}天。若第6天已圆满，仍要等到第{LEVEL_BY_ID.battle_wukong.cycleDays}天。操作入口仅补齐已到期修炼，不开放额外付费提前完成。</p><div className="hud-panel rounded-xl p-4 text-center font-display text-base text-gold">修炼圆满 → 等待传承</div>
    </LoreChapter>
    <LoreChapter id="inheritance" number="09" title="传承｜完成一段生命旅程" subtitle="原生命周期结束后，检查修炼是否全部完成。">
      <div className="hud-panel rounded-xl p-4 text-center text-[var(--gold-100)]">全部修炼完成 · 原周期结束</div><p>全部修炼完成且原周期结束，自动进入传承。修炼未补齐时显示待完成修炼，补齐后自动继续，悟空不会消失。</p>
      <div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">齐天大圣 · 传承结算示例</h3><dl className="cultivation-facts mt-4"><div><dt>配套金额</dt><dd><UsdtValue cents={example.principal} size="sm" /></dd></div><div><dt>圆满增幅</dt><dd>+{level.growthRate}%</dd></div><div><dt>修炼盈利</dt><dd><UsdtValue cents={amounts.profit} sign="+" size="sm" /></dd></div><div><dt>平台手续费 · 盈利{INHERITANCE_FEE_PCT}%</dt><dd><UsdtValue cents={amounts.fee} sign="-" size="sm" /></dd></div><div className="border-t border-[var(--gold-600)]/30 pt-3"><dt>本次传承结算</dt><dd><UsdtValue cents={amounts.received} size="lg" /></dd></div></dl></div><p>平台仅收实际修炼盈利的{INHERITANCE_FEE_PCT}%，不对配套金额收费。结算为配套金额加修炼盈利，再减平台手续费，以 USDT 计，不计入蟠桃余额。</p>
    </LoreChapter>
    <LoreChapter id="companions" number="10" title="同行者｜有人同行" subtitle="与君同行，共赴悟空世界。">
      <p>直接邀请的是第一代，他们邀请的是第二代。只计算两代同行奖励；第三代及以后没有同行奖励，但仍计入部族。</p><div className="grid grid-cols-2 gap-2">{Object.values(COMPANION_REWARD).map((rate, i) => <div key={i} className="hud-panel rounded-xl px-2 py-4 text-center"><p className="text-xs text-stone-300">第{['一', '二'][i]}代</p><p className="mt-2 font-latin text-2xl text-gold">{rate}%</p><p className="mt-1 text-[10px] text-stone-400">返 USDT</p></div>)}</div><p>奖励基数仅为成员完成传承后实际产生的修炼盈利，不是充值、配套金额、召唤消耗或修炼消耗。平台额外发放，不扣成员盈利，奖励返 USDT。</p>
      <div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">有效用户</h3><p className="mt-2">个人账号持有不少于 {VALID_USER_MIN_PEACH} 个蟠桃，才算有效用户。部族晋升只统计有效用户；未达标的成员完成传承不产生奖励，自己未达标时不能获得同行与部族奖励。</p></div>
    </LoreChapter>
    <LoreChapter id="tribe" number="11" title="部族｜同行者形成一个世界" subtitle="部族，是完整同行网络，不包含自己。">
      <p>第一代有效同行者人数与部族有效成员人数必须同时达标。</p><ol className="flex flex-col gap-3">{TRIBE_TIERS.map(t => <li key={t.level} className="hud-panel flex items-center justify-between gap-3 rounded-xl p-4"><div><h3 className="font-display text-base text-[var(--gold-100)]">{t.name}</h3><p className="mt-1 text-xs leading-6">第一代有效同行者 ≥ {t.companions}人<br />且部族有效成员 ≥ {t.members}人</p></div><div className="text-right"><p className="font-latin text-2xl text-gold">{t.rate}%</p><p className="text-[10px] text-stone-400">部族总盈利 · 返 USDT</p></div></li>)}</ol><p>部族成员实际完成传承产生的修炼盈利，按当前部族奖励比例计算并返 USDT；包含第三代及以后的成员，不按充值或消耗计算。</p>
    </LoreChapter>
    <LoreChapter id="rewards" number="12" title="奖励机制｜每份同行，分别记录" subtitle="同行奖励与部族奖励可以叠加，不能混成一条。">
      <p className="flex flex-wrap items-center gap-1">例如部族Ⅱ阶，第一代成员修炼盈利 <UsdtValue cents={10000} size="xs" />：</p><div className="hud-panel rounded-xl p-4"><dl className="cultivation-facts">{stacked.map(part => <div key={part.type}><dt>{part.type === 'companion' ? '同行奖励' : '部族奖励'} · {part.rate}%</dt><dd><UsdtValue cents={part.amountCents} sign="+" size="sm" /></dd></div>)}</dl></div><p>同一成员、同一次传承，同行和部族分别记录来源、代数或部族等级、实际修炼盈利、比例、金额和时间。奖励返到 USDT 余额，可在「个人地址」页转出，不从成员盈利扣除。</p><p className="text-[11px] text-stone-400">{TRIAL_MODE ? '体验版' : '当前版本'}仅展示机制与独立明细，未接通真实关系网络或奖励发放。</p>
    </LoreChapter>
  </>
}
