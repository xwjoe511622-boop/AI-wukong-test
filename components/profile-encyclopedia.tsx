import Image from 'next/image'
import Link from 'next/link'
import { LEVELS, PEACH_UNIT_TEXT, ALL_OPEN } from '@/lib/game-data'
import { BrandLogo } from './brand-logo'
import { LoreChapter } from './lore-chapter'
import { EncyclopediaJourney } from './encyclopedia-journey'
import { PeachValue } from './peach-value'
import { PeachIcon } from './peach'

const chapters = [['begin','什么是 AI WUKONG'],['lives','数字生命'],['awakening','七阶段成长'],['realms','七大仙境'],['peach','蟠桃'],['summon','召唤'],['cultivation','修炼'],['completion','圆满'],['inheritance','传承'],['companions','同行者'],['tribe','部族'],['rewards','奖励机制'],['future','AI MYTH UNIVERSE']]

export function ProfileEncyclopedia() {
  return <div className="flex flex-col">
    <header className="mb-4 flex items-center justify-between pr-12"><Link href="/me" className="flex min-h-11 items-center text-xs text-[var(--gold-200)]">← 返回我的</Link><span className="font-latin text-[10px] tracking-[.15em] text-[var(--gold-400)]">THE BOOK OF WUKONG</span></header>
    <section className="relative isolate -mx-4 flex min-h-[470px] flex-col justify-end overflow-hidden px-6 pb-8 pt-24" aria-labelledby="encyclopedia-title">
      <Image src="/assets/card-qitian.png" alt="齐天大圣，觉醒于东方神话之境" fill priority sizes="(max-width: 480px) 100vw, 480px" className="-z-20 object-cover object-[center_18%]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,5,6,.1),rgba(5,5,6,.22)_22%,rgba(5,5,6,.78)_46%,rgba(5,5,6,.94)_66%,#050506_100%)]" />
      <div className="flex flex-col items-start gap-2"><BrandLogo className="w-44" /><p className="text-[11px] tracking-[.2em] text-[var(--gold-200)]">东方神话 · 数字新生</p></div>
      <h1 id="encyclopedia-title" className="mt-3 font-display text-4xl font-bold tracking-widest text-[var(--gold-200)] [text-shadow:0_2px_6px_rgba(0,0,0,.9),0_0_22px_rgba(0,0,0,.7)]">悟空百科</h1>
      <p className="mt-5 font-display text-xl font-bold leading-9 text-[var(--gold-100)]">神话，不再只是故事。<br /><span className="text-[var(--gold-300)]">它正在成为数字生命。</span></p>
      <p className="mt-3 text-xs leading-6 text-stone-300">东方神话 · AI 原生数字生命</p>
      <a href="#begin" className="btn-gold mt-6 inline-flex w-full items-center justify-center text-xs">开始了解 AI WUKONG</a>
    </section>
    <nav aria-label="天书章节" className="read-panel mb-2 mt-6 flex flex-wrap gap-x-4 gap-y-1 px-4 py-3">{chapters.map(([id,label],i) => <a key={id} href={`#${id}`} className="flex min-h-9 items-center gap-1.5 text-xs text-[var(--gold-200)]"><span className="font-latin text-[9px] text-[var(--gold-400)]">{String(i+1).padStart(2,'0')}</span>{label}</a>)}</nav>
    <LoreChapter id="begin" number="01" title="AI WUKONG｜AI悟空" subtitle="从东方神话，走向AI数字生命。">
      <p>千百年来，悟空存在于神话、文字、影视与人们的想象之中。当 AI 开始进入角色、身份与数字世界，神话第一次拥有了走向数字生命的可能。</p>
      <p>以不断成长、突破与觉醒的悟空为原型，AI WUKONG 将 AI角色、数字身份、游戏化成长、数字所有权与角色生命周期融为一体。</p>
      <div className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-gold">东方神话 AI 数字生命世界</h3><p className="mt-2 text-xs leading-6 text-[var(--gold-200)]">召唤 → 修炼 → 圆满 → 传承</p></div>
      <p>悟空不再只是一张被收藏的图片。这是一段人与 AI悟空共同完成的数字生命旅程。</p>
      <p className="border-l border-[var(--gold-500)] pl-3 text-[11px] leading-6 text-stone-400">这是数字生命世界的叙事设定。当前尚未接入独立 Agent、自主记忆、人格或自主行动能力；不将未来能力描述为已实现功能。</p>
    </LoreChapter>
    <LoreChapter id="lives" number="02" title="每一位悟空，都是一段生命" subtitle="这个世界，不会无限产生悟空。">
      <div className="relative overflow-hidden rounded-xl border border-[var(--gold-600)]/40 px-5 py-8 text-center"><Image src="/assets/contract-scroll.png" alt="" fill sizes="448px" className="object-cover opacity-15" /><div className="relative"><p className="text-xs text-[var(--gold-200)]">AI悟空</p><p className="my-3 font-display text-3xl font-bold leading-snug text-gold">召唤而生 · 修炼而长 · 传承而续</p><p className="font-latin text-[9px] tracking-[.2em] text-[var(--gold-400)]">DIGITAL LIVES</p></div></div>
      <p>悟空不是无限生成的素材，而是通过召唤才会诞生的角色。每次成功召唤，都意味着与一位悟空建立新的生命周期关系，从修炼、圆满直到传承。</p><p className="font-display text-base text-[var(--gold-100)]">召唤，让每一次相遇拥有意义。<br />生命周期，让每一位悟空拥有故事。</p>
      <p className="text-[11px] leading-6 text-stone-400">当前展示体系设定，尚未接入全世界实时供给。传承完成不代表自动回池，后续可召唤状态由独立业务规则决定。</p>
    </LoreChapter>
    <LoreChapter id="awakening" number="03" title="从石灵，到无极大圣" subtitle={LEVELS.map(l => l.name).join(' → ')}>
      <ol className="flex flex-col">{LEVELS.map(level => <li key={level.id} className={`flex items-center gap-4 border-l border-[var(--gold-600)]/40 py-3 pl-4 ${level.isOpen ? '' : 'opacity-70'}`}><Image src={level.characterImage} alt={level.name} width={60} height={90} sizes="60px" className={`rounded-sm ${level.isOpen ? '' : 'grayscale'}`} /><div><p className="font-latin text-[10px] tracking-widest text-[var(--gold-400)]">0{level.order + 1} · {level.lifeStage}</p><h3 className="flex items-center gap-2 font-display text-lg text-[var(--gold-100)]">{level.name}{!level.isOpen && <span className="rounded-full border border-[var(--gold-600)]/50 px-2 py-0.5 text-[10px] font-normal tracking-widest text-[var(--gold-200)]">未开放</span>}</h3><p className="mt-1 text-xs leading-6">{level.lifeDescription}</p></div></li>)}</ol>
      <p className="font-display text-base text-[var(--gold-200)]">悟空真正重要的，从来不是出生时拥有什么，而是他最终成为了谁。</p><p className="text-[11px] text-stone-400">七阶段是角色成长叙事，不代表当前已开放自动升阶功能。</p>
    </LoreChapter>
    <LoreChapter id="realms" number="04" title="七境修炼" subtitle={`七种不同难度、周期与成长幅度的修炼世界${ALL_OPEN ? '。' : '；无极神境暂未开放。'}`}>
      <div className="flex flex-col gap-5">{LEVELS.map(level => <article key={level.id} className={`hud-panel overflow-hidden rounded-xl ${level.isOpen ? '' : 'grayscale-[.7]'}`}><Image src={level.realmCover} alt={level.realm} width={1672} height={941} sizes="(max-width: 480px) calc(100vw - 32px), 448px" className="h-auto w-full" /><div className="px-4 pb-4 pt-3"><h3 className="flex items-center gap-2 font-display text-base text-[var(--gold-100)]">{level.realm} · {level.name}{!level.isOpen && <span className="rounded-full border border-[var(--gold-600)]/50 px-2 py-0.5 text-[10px] font-normal tracking-widest text-[var(--gold-200)]">未开放</span>}</h3><p className="mt-2 flex items-baseline gap-1 font-latin text-lg text-gold">{level.cultivationMin.toLocaleString('en-US')}–{level.cultivationMax.toLocaleString('en-US')}<span className="text-[11px] opacity-80">USDT</span></p><div className="mt-2 flex justify-between gap-3 text-xs"><span>{level.cycleDays}天 · 修炼{level.cultivationCount}次</span><span className="text-[var(--gold-200)]">修炼加成 +{level.growthRate}%</span></div><p className="mt-2 text-[11px] text-stone-400">{level.summonStopTime} 预约截止 · {level.summonWindow} 召唤<br />召唤成功后 1 小时内完成打款</p>{level.isOpen ? <Link href={`/world?stage=${level.id}`} className="mt-3 inline-flex min-h-9 items-center text-xs text-[var(--gold-200)] underline underline-offset-4">探索{level.realm} →</Link> : <p className="mt-3 text-xs text-stone-400">当前不可召唤</p>}</div></article>)}</div>
      <p className="text-[11px] leading-6 text-stone-400">各阶段按照对应成长比例与周期独立运行；成长比例为机制参数，不构成收益保证。</p>
    </LoreChapter>
    <LoreChapter id="peach" number="05" title="蟠桃" subtitle="悟空世界的核心资源。">
      <div className="flex items-center gap-4"><PeachIcon size={44} /><p>蟠桃是系统内部的召唤消耗单位，<br />召唤与修炼都使用它。</p></div><p>契约功能已正式取消，统一采用蟠桃召唤机制。玩家通过蟠桃参与召唤，每次召唤按所属阶段计算蟠桃消耗；修炼按各阶段既定标准每日执行。各阶段的修炼值以 USDT 计，由承接人与传承人直接打款与释放，不占用蟠桃。</p>
      <p className="font-display text-base text-[var(--gold-100)]">统一计量：{PEACH_UNIT_TEXT}</p>
      <div className="hud-panel rounded-xl p-4"><h3 className="text-sm text-[var(--gold-100)]">资源说明</h3><p className="mt-2 text-[var(--gold-200)]">统一使用蟠桃记录召唤消耗、修炼消耗与奖励。</p><p className="mt-2 text-[11px] leading-6 text-stone-400">可在「个人地址」页用 USDT 购买蟠桃，蟠桃和 USDT 都可转出和接收，购买的蟠桃到账后显示在该页。</p></div>
      <h3 className="font-display text-base text-[var(--gold-100)]">七阶段召唤参数</h3>
      <div className="flex flex-col gap-4">{LEVELS.map(l => <div key={l.id} className="border-t border-[var(--gold-600)]/25 pt-3"><div className="flex items-center justify-between gap-2"><h4 className="text-sm text-[var(--gold-100)]">{l.name} · {l.realm}</h4><PeachValue cents={Math.round(l.lifecycleCost * 100)} size="sm" /></div><dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]"><div><dt>召唤消耗</dt><dd><PeachValue cents={Math.round(l.summonCost*100)} size="xs" /></dd></div><div><dt>修炼（每天）× {l.cycleDays}天</dt><dd><PeachValue cents={Math.round(l.perCycleCost*100)} size="xs" /></dd></div></dl></div>)}</div>
      <p className="text-[11px] text-stone-400">阶段消耗 = 召唤 +（每日修炼 × 修炼天数）。以上不含修炼值（USDT）及传承平台手续费。</p>
      <h3 className="font-display text-base text-[var(--gold-100)]">蟠桃使用规则</h3>
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-xs leading-6">{['玩家通过蟠桃参与AI悟空召唤。', '每次召唤按照所属阶段计算蟠桃消耗。', '召唤成功后，系统自动扣除对应蟠桃。', '召唤失败后，系统全额退还本次召唤所使用的蟠桃。', `蟠桃采用原定价值设定：${PEACH_UNIT_TEXT}。`, '契约功能正式取消，不再参与任何召唤流程。', '承接人逾期未打款，本次召唤所扣除的蟠桃直接充公，不予退还。'].map(rule => <li key={rule}>{rule}</li>)}</ol>
    </LoreChapter>
    <EncyclopediaJourney />
    <LoreChapter id="future" number="13" title="AI MYTH UNIVERSE" subtitle="悟空，只是第一个被唤醒的神话。">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl"><Image src="/assets/wukong-world-daylight.png" alt="云海中的东方神话世界" fill sizes="448px" className="object-cover" /></div><p>AI WUKONG 的终点，不是悟空本身。它代表一个更大的开始。</p><p>未来，当神话角色拥有数字身份、成长轨迹、AI能力、角色关系与可验证的数字所有权，东方神话就不再只存在于过去。</p><p>AI MYTH UNIVERSE 将探索更多东方神话的 AI原生角色与数字生命。这是未来方向，不是当前功能承诺。</p><p className="py-4 text-center font-display text-xl font-bold leading-9 text-gold">神话，不再只是故事。<br />它正在成为数字生命。</p><Link href="/world" className="btn-gold inline-flex w-full items-center justify-center text-sm">走进悟空世界</Link><a href="#encyclopedia-title" className="mt-2 text-center text-xs text-[var(--gold-200)]">回到天书之初 ↑</a>
    </LoreChapter>
  </div>
}
