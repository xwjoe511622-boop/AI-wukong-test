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
    <LoreChapter id="summon" number="06" title="召唤｜唤醒一个智能体" subtitle="截止前点一次召唤，到点系统自动匹配，成功后限时支付结算。">
      <ol className="flex flex-col">{['截止前点召唤 · 暂扣召唤蟠桃','到点系统自动匹配','公布结果并通知','召唤成功 · 匹配到传承人','承接人 1 小时内完成支付结算','传承人确认实际到账','悟空进入猴舍 · 蟠桃正式扣除'].map((text, i) => <li key={text} className="flex min-h-12 items-center gap-4 border-l border-[var(--gold-600)]/40 pl-4"><span className="font-latin text-xs text-[var(--gold-400)]">0{i + 1}</span><span className="text-[var(--gold-100)]">{text}</span></li>)}</ol>
      <p>玩家通过蟠桃参与召唤。点召唤时暂扣召唤蟠桃；召唤失败不产生交易，暂扣的蟠桃全额退还，可继续参与后续召唤。每个召唤周期每人参与一次。修炼值以 USDT 计，蟠桃只用于召唤与修炼。</p>
      <div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">召唤时间表 · 北京时间</h3><div role="table" aria-label="召唤时间表" className="mt-3 text-xs"><div role="row" className="grid grid-cols-[1.3fr_1.5fr_1fr_1fr] gap-2 border-b border-[var(--gold-600)]/30 pb-2 text-[12px] text-[var(--gold-200)]"><span role="columnheader">阶段</span><span role="columnheader">召唤周期</span><span role="columnheader" className="text-right">开放召唤</span><span role="columnheader" className="text-right">停止召唤</span></div>{LEVELS.map(l => <div role="row" key={l.id} className="grid grid-cols-[1.3fr_1.5fr_1fr_1fr] items-center gap-2 border-b border-[var(--gold-600)]/15 py-2 last:border-0"><span role="cell" className="whitespace-nowrap text-[var(--gold-100)]">{l.name}{l.isOpen ? '' : '（未开放）'}</span><span role="cell" className="whitespace-nowrap font-latin tabular-nums">{l.summonWindow}</span><span role="cell" className="text-right font-latin tabular-nums">{l.summonStartTime}</span><span role="cell" className="text-right font-latin tabular-nums">{l.summonStopTime}</span></div>)}</div><p className="mt-3 text-[12px] leading-6 text-stone-400">停止召唤即截止时间，须在此之前点「召唤」；到开放召唤的时刻，系统自动为参与的玩家匹配并公布结果，不需要再操作。</p></div>
      <div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">承接人与传承人交易</h3><p className="mt-2">承接人为支付方：收到交易通知后，系统自动启动 {PAYMENT_WINDOW_HOURS} 小时支付倒计时，须在规定时间内向指定传承人完成支付结算，支付结算从 USDT 余额扣除。传承人为收款方：核实实际到账金额后确认收款，不得无故拖延或拒绝。交易有争议时请联系客服，以系统记录为准。</p></div>
      <div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">逾期未支付与违约</h3><p className="mt-2">召唤成功后超过 {PAYMENT_WINDOW_HOURS} 小时仍未完成支付结算，系统判定为逾期违约：暂扣的召唤蟠桃全部充公，不予退还，并保留违约记录。</p></div>
      <p className="text-[12px] leading-6 text-stone-400">召唤成功后，可在首页待办或「我的 → 我的交易」中查看匹配的传承人并完成支付结算；传承人确认到账后悟空进入猴舍。支付结算从你的 USDT 余额扣除。</p>
    </LoreChapter>
    <LoreChapter id="cultivation" number="07" title="修炼｜你在训练它" subtitle="每天为它修炼一次；没有人来的那一天，它就停在原地。">
      <div className="flex flex-wrap gap-2">{Object.values(LEVEL_BY_ID).map(l => <span key={l.id} className="rounded-full border border-[var(--gold-600)]/40 px-3 py-1 text-xs text-[var(--gold-200)]">{l.name} · {l.cycleDays}天</span>)}</div>
      <p>七阶段修炼天数各不相同：{LEVELS.map(l => `${l.name} ${l.cycleDays} 天`).join('、')}。</p>
      <p>悟空进猴舍后，需要每天进修炼室点一次「修炼」：点了扣当天的修炼蟠桃、算当天的修炼加成。当天没点，就没有当天的加成，过后不能补；一天都没点，按原修炼值传承。</p><div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">{LEVEL_BY_ID.wukong.name} · 修炼蟠桃</h3><p className="mt-2 flex flex-wrap items-center gap-1 text-xs leading-6">每日 <PeachValue cents={LEVEL_BY_ID.wukong.cultivationCost * 100} size="xs" /> × {LEVEL_BY_ID.wukong.cycleDays} 天，共 <PeachValue cents={LEVEL_BY_ID.wukong.cultivationCost * LEVEL_BY_ID.wukong.cycleDays * 100} size="xs" />，每天点修炼时扣当天的。</p></div>
    </LoreChapter>
    <LoreChapter id="completion" number="08" title="周期｜时间自有答案" subtitle="修炼天数走完，进入传承。">
      <p>从召唤成功那一刻起算，修炼天数走完即进入传承，不能提前，也没有付费加速；修炼增长只按实际点过修炼的天数计算。例如{LEVEL_BY_ID.battle_wukong.name}修炼 {LEVEL_BY_ID.battle_wukong.cycleDays} 天，第 {LEVEL_BY_ID.battle_wukong.cycleDays} 天结束后进入传承。</p><div className="hud-panel rounded-xl p-4 text-center font-display text-base text-gold">每日修炼 → 周期结束 → 传承</div>
    </LoreChapter>
    <LoreChapter id="inheritance" number="09" title="传承｜记忆不会消失" subtitle="修炼周期结束后，悟空交到下一位手里。">
      <div className="hud-panel rounded-xl p-4 text-center text-[var(--gold-100)]">周期结束 · 进入传承</div><p>修炼天数走完，进入传承中：等下一轮同阶段召唤匹配到承接人，由承接人向你支付；你核实到账并确认收款后，传承完成，传承所得进入 USDT 余额。</p>
      <div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">齐天大圣 · 传承所得示例</h3><dl className="cultivation-facts mt-4"><div><dt>修炼值</dt><dd><UsdtValue cents={example.principal} size="sm" /></dd></div><div><dt>修炼加成</dt><dd>+{level.growthRate}%</dd></div><div><dt>修炼增长</dt><dd><UsdtValue cents={amounts.profit} sign="+" size="sm" /></dd></div><div><dt>平台手续费 · 修炼增长的 {INHERITANCE_FEE_PCT}%</dt><dd><UsdtValue cents={amounts.fee} sign="-" size="sm" /></dd></div><div className="border-t border-[var(--gold-600)]/30 pt-3"><dt>本次传承所得</dt><dd><UsdtValue cents={amounts.received} size="lg" /></dd></div></dl></div><p>平台仅收实际修炼增长的{INHERITANCE_FEE_PCT}%，不对修炼值收费。传承所得 = 修炼值 + 修炼增长 − 平台手续费，以 USDT 计。</p>
    </LoreChapter>
    <LoreChapter id="companions" number="10" title="同行者｜有人同行" subtitle="与君同行，共赴悟空世界。">
      <p>你直接邀请的人，就是你的同行者。同行奖励只算这一代；同行者再邀请的人没有同行奖励，但计入你的部族。</p><div className="hud-panel rounded-xl px-2 py-4 text-center"><p className="text-xs text-stone-300">同行奖励</p><p className="mt-2 font-latin text-2xl text-gold">{COMPANION_REWARD.generation1}%</p><p className="mt-1 text-[12px] text-stone-400">同行者的修炼增长 · 返 USDT</p></div><p>奖励基数仅为成员完成传承后实际产生的修炼增长，不是充值、修炼值、召唤消耗或修炼消耗。平台额外发放，不扣成员的修炼增长，奖励返 USDT。</p>
      <div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">有效用户</h3><p className="mt-2">个人账号持有不少于 {VALID_USER_MIN_PEACH} 个蟠桃，才算有效用户。部族晋升只统计有效用户；未达标的成员完成传承不产生奖励，自己未达标时不能获得同行与部族奖励。</p></div>
    </LoreChapter>
    <LoreChapter id="tribe" number="11" title="部族｜同行者形成一个世界" subtitle="部族，是完整同行网络，不包含自己。">
      <p>有效同行者人数与部族有效成员人数必须同时达标。</p><ol className="flex flex-col gap-3">{TRIBE_TIERS.map(t => <li key={t.level} className="hud-panel flex items-center justify-between gap-3 rounded-xl p-4"><div><h3 className="font-display text-base text-[var(--gold-100)]">{t.name}</h3><p className="mt-1 text-xs leading-6">有效同行者 ≥ {t.companions}人<br />且部族有效成员 ≥ {t.members}人</p></div><div className="text-right"><p className="font-latin text-2xl text-gold">{t.rate}%</p><p className="text-[12px] text-stone-400">部族修炼增长 · 返 USDT</p></div></li>)}</ol><p>部族成员实际完成传承产生的修炼增长，按当前部族奖励比例计算并返 USDT；包含同行者以下所有层级的成员，不按充值或消耗计算。</p>
    </LoreChapter>
    <LoreChapter id="rewards" number="12" title="奖励机制｜每份同行，分别记录" subtitle="同行奖励与部族奖励可以叠加，不能混成一条。">
      <p className="flex flex-wrap items-center gap-1">例如部族Ⅱ阶，一位同行者修炼增长 <UsdtValue cents={10000} size="xs" />：</p><div className="hud-panel rounded-xl p-4"><dl className="cultivation-facts">{stacked.map(part => <div key={part.type}><dt>{part.type === 'companion' ? '同行奖励' : '部族奖励'} · {part.rate}%</dt><dd><UsdtValue cents={part.amountCents} sign="+" size="sm" /></dd></div>)}</dl></div><p>同一成员、同一次传承，同行和部族分别记录来源、部族等级、实际修炼增长、比例、金额和时间。奖励返到 USDT 余额，可在「我的资产」查看，不从成员的修炼增长扣除。</p>
    </LoreChapter>
  </>
}
