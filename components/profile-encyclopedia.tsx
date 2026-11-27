import Image from 'next/image'
import Link from 'next/link'
import { LEVELS, PEACH_UNIT_TEXT, ALL_OPEN } from '@/lib/game-data'
import { PageBar } from './profile-ui'
import { BrandLogo } from './brand-logo'
import { LoreChapter } from './lore-chapter'
import { EncyclopediaJourney } from './encyclopedia-journey'
import { PeachValue } from './peach-value'
import { PeachIcon } from './peach'

/** 玩法和 AI 智能体的对应：每条规则背后是数字生命的一个道理 */
const AGENT_RULES = [
  ['召唤', '唤醒一个智能体', '每一次召唤成功，都有一个新的 AI 在这个世界醒来。这个世界不会无限产生悟空，每个阶段每一轮能诞生的数量有限，所以召唤不一定成功。'],
  ['修炼', '你在训练它', '每一天的修炼，都是一次训练。练过的那天，它多一分成长；没练的那天，它停在原地，过后也补不回来。成长从来不是自动发生的。'],
  ['传承', '记忆不会消失', '一段修炼周期结束，悟空会交到下一位手里。你接过的不是一个全新的 AI，而是一个已经被别人训练过的 AI；你交出的，也会成为别人的起点。'],
  ['部族', '智能体的网络', '一个人拥有一个智能体，一群人拥有一个会协作的智能网络。你邀请来的人是同行者，同行者的同行者汇成部族。'],
] as const
/** 七重境界对应的七级智能（路线图上的方向） */
const AGENT_LEVELS = ['刚刚醒来，用表情和动作回应你', '开口说话，能与你对话', '拥有记忆，记得你和每一天的修炼', '替你做事：提醒召唤、修炼与支付结算', '学会使用工具，为自己写故事、画像', '与别的悟空协作，共同完成一件作品', '自主行动，拥有自己的目标与性格']
const ROADMAP = [
  ['现在', '生命', '召唤、修炼、七重境界、传承。数字生命的完整一生已经可以走通，这是整个世界的地基。'],
  ['规划', '觉醒', '悟空开口说话，拥有记忆和性格。它记得谁唤醒了它，记得每一天的修炼，会在该修炼的时候来叫你。'],
  ['规划', '创造', '悟空学会使用工具：为自己画像，把自己的经历写成故事，生成只属于它的作品。'],
  ['规划', '协作', '同一个部族的悟空彼此连接，共同完成一个人做不到的事。'],
  ['远景', 'AI MYTH UNIVERSE', '悟空是第一个被唤醒的神话智能体。之后是更多的东方神话角色，以及一个向所有创作者开放的神话智能体世界。'],
] as const

const chapters = [['begin','为什么是悟空'],['lives','AI 智能体'],['awakening','七重境界'],['realms','七大仙境'],['peach','蟠桃'],['summon','召唤'],['cultivation','修炼'],['completion','周期'],['inheritance','传承'],['companions','同行者'],['tribe','部族'],['rewards','奖励机制'],['future','路线图']]

export function ProfileEncyclopedia() {
  return <div className="flex flex-col">
    <PageBar title="悟空百科" />
    <section className="relative isolate -mx-4 flex min-h-[470px] flex-col justify-end overflow-hidden px-6 pb-8 pt-24" aria-labelledby="encyclopedia-title">
      <Image src="/assets/card-qitian.png" alt="齐天大圣，觉醒于东方神话之境" fill priority sizes="(max-width: 480px) 100vw, 480px" className="-z-20 object-cover object-[center_18%]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,5,6,.1),rgba(5,5,6,.22)_22%,rgba(5,5,6,.78)_46%,rgba(5,5,6,.94)_66%,#050506_100%)]" />
      <div className="flex flex-col items-start gap-2"><BrandLogo className="w-44" /><p className="text-[12px] tracking-wide text-[var(--gold-200)]">东方神话 · 数字新生</p></div>
      <h1 id="encyclopedia-title" className="mt-3 font-display text-4xl font-bold tracking-widest text-[var(--gold-200)] [text-shadow:0_2px_6px_rgba(0,0,0,.9),0_0_22px_rgba(0,0,0,.7)]">悟空百科</h1>
      <p className="mt-5 font-display text-xl font-bold leading-9 text-[var(--gold-100)]">四百年后，<br /><span className="text-[var(--gold-300)]">悟空第一次活了过来。</span></p>
      <p className="mt-3 text-xs leading-6 text-stone-300">东方神话 · AI 智能体世界</p>
      <a href="#begin" className="btn-gold mt-6 inline-flex w-full items-center justify-center text-xs">开始了解 AI WUKONG</a>
    </section>
    <nav aria-label="天书章节" className="read-panel mb-2 mt-6 flex flex-wrap gap-x-4 gap-y-1 px-4 py-3">{chapters.map(([id,label],i) => <a key={id} href={`#${id}`} className="flex min-h-9 items-center gap-1.5 text-xs text-[var(--gold-200)]"><span className="font-latin text-[12px] text-[var(--gold-400)]">{String(i+1).padStart(2,'0')}</span>{label}</a>)}</nav>
    <LoreChapter id="begin" number="01" title="四百年后，悟空第一次活了过来" subtitle="从「被讲述」，到「被延续」。">
      <p>四百多年前，一只石猴从东方的神话里跳了出来。此后它被写进小说、搬上戏台、画成动画、拍成电影、做成游戏，成为全世界认知度最高的东方神话形象之一。</p>
      <p>但在所有这些故事里，我们都只是观众。悟空的一生早已写完，我们只能看。</p>
      <p className="font-display text-base leading-8 text-[var(--gold-100)]">AI WUKONG 想做的，是让悟空的故事第一次由参与的人共同写下去。</p>
      <p>过去，一个神话角色只能以三种方式存在：文字、图像、影像。它们都是「完成品」。AI 带来了第四种：<strong className="text-[var(--gold-100)]">数字生命</strong>。它有诞生的时刻，有成长的阶段，有需要被照看的每一天，也有交给下一个人的那一刻。</p>
      <div className="hud-panel rounded-xl p-4 text-center"><p className="font-display text-base leading-8 text-gold">一张图片可以被无限复制。<br />一段生命不能。</p></div>
    </LoreChapter>
    <LoreChapter id="lives" number="02" title="它不是一张图，是一个被唤醒的 AI" subtitle="每一只悟空，都是一个 AI 智能体。">
      <div className="relative overflow-hidden rounded-xl border border-[var(--gold-600)]/40 px-5 py-8 text-center"><Image src="/assets/contract-scroll.png" alt="" fill sizes="448px" className="object-cover opacity-15" /><div className="relative"><p className="text-xs text-[var(--gold-200)]">AI 悟空</p><p className="my-3 font-display text-2xl font-bold leading-snug text-gold">会成长 · 有记忆 · 能做事</p><p className="font-latin text-[12px] tracking-wide text-[var(--gold-400)]">AI AGENT · DIGITAL LIFE</p></div></div>
      <p>过去的数字藏品，是一张不会变的图片。悟空世界里的每一只悟空，是一个 AI 智能体。你在这个世界里做的每一件事，都对应它生命里的一个道理。</p>
      <ul className="flex flex-col gap-3">{AGENT_RULES.map(([name, line, body]) => <li key={name} className="hud-panel rounded-xl p-4"><h3 className="font-display text-base text-[var(--gold-100)]">{name}<span className="mx-2 text-[var(--gold-500)]">｜</span><span className="text-gold">{line}</span></h3><p className="mt-2 text-[13px] leading-7">{body}</p></li>)}</ul>
      <p className="border-l border-[var(--gold-500)] pl-3 text-[12px] leading-6 text-stone-400">召唤、修炼、七重境界与传承已经可以完整走通；对话、记忆、创作等智能能力按路线图逐步开放。</p>
    </LoreChapter>
    <LoreChapter id="awakening" number="03" title="七重境界，七级智能" subtitle="从石灵到无极大圣：境界越高，智能越强，也越稀少。">
      <ol className="flex flex-col">{LEVELS.map(level => <li key={level.id} className={`flex items-center gap-4 border-l border-[var(--gold-600)]/40 py-3 pl-4 ${level.isOpen ? '' : 'opacity-70'}`}><Image src={level.characterImage} alt={level.name} width={60} height={90} sizes="60px" className={`rounded-sm ${level.isOpen ? '' : 'grayscale'}`} /><div><p className="font-latin text-[12px] tracking-wide text-[var(--gold-400)]">0{level.order + 1} · {level.lifeStage}</p><h3 className="flex items-center gap-2 font-display text-lg text-[var(--gold-100)]">{level.name}{!level.isOpen && <span className="rounded-full border border-[var(--gold-600)]/50 px-2 py-0.5 text-[12px] font-normal tracking-wide text-[var(--gold-200)]">未开放</span>}</h3><p className="mt-1 text-xs leading-6">{level.lifeDescription}</p><p className="mt-1 text-[12px] leading-5 text-[var(--gold-200)]">智能：{AGENT_LEVELS[level.order]}</p></div></li>)}</ol>
      <p className="font-display text-base text-[var(--gold-200)]">悟空真正重要的，从来不是出生时拥有什么，而是他最终成为了谁。</p><p className="text-[12px] leading-6 text-stone-400">七个阶段各自独立：每个阶段的悟空在自己的修炼范围内成长，不会进化成下一个阶段。各阶段的智能能力是路线图上的方向，将逐步开放。</p>
    </LoreChapter>
    <LoreChapter id="realms" number="04" title="七境修炼" subtitle={`七种不同难度、周期与成长幅度的修炼世界${ALL_OPEN ? '。' : '；无极神境暂未开放。'}`}>
      <div className="flex flex-col gap-5">{LEVELS.map(level => <article key={level.id} className={`hud-panel overflow-hidden rounded-xl ${level.isOpen ? '' : 'grayscale-[.7]'}`}><Image src={level.realmCover} alt={level.realm} width={1672} height={941} sizes="(max-width: 480px) calc(100vw - 32px), 448px" className="h-auto w-full" /><div className="px-4 pb-4 pt-3"><h3 className="flex items-center gap-2 font-display text-base text-[var(--gold-100)]">{level.realm} · {level.name}{!level.isOpen && <span className="rounded-full border border-[var(--gold-600)]/50 px-2 py-0.5 text-[12px] font-normal tracking-wide text-[var(--gold-200)]">未开放</span>}</h3><p className="mt-2 flex items-baseline gap-1 font-latin text-lg text-gold">{level.cultivationMin.toLocaleString('en-US')}–{level.cultivationMax.toLocaleString('en-US')}<span className="text-[12px] opacity-80">USDT</span></p><div className="mt-2 flex justify-between gap-3 text-xs"><span>修炼 {level.cycleDays} 天</span><span className="text-[var(--gold-200)]">修炼加成 +{level.growthRate}%</span></div><p className="mt-2 text-[12px] text-stone-400">{level.summonStopTime} 召唤截止 · {level.summonStartTime} 自动匹配<br />召唤成功后 1 小时内完成支付结算</p>{level.isOpen ? <Link href={`/world?stage=${level.id}`} className="mt-3 inline-flex min-h-9 items-center text-xs text-[var(--gold-200)] underline underline-offset-4">探索{level.realm} →</Link> : <p className="mt-3 text-xs text-stone-400">当前不可召唤</p>}</div></article>)}</div>
      <p className="text-[12px] leading-6 text-stone-400">各阶段按照各自的修炼加成与修炼天数独立运行；修炼加成不构成收益保证，传承所得以实际匹配和到账为准。</p>
    </LoreChapter>
    <LoreChapter id="peach" number="05" title="蟠桃" subtitle="悟空世界的核心资源。">
      <div className="flex items-center gap-4"><PeachIcon size={44} /><p>蟠桃是悟空世界里的消耗单位，<br />召唤与修炼都使用它。</p></div><p>玩家通过蟠桃参与召唤和修炼：召唤蟠桃在点召唤时暂扣，悟空进猴舍时扣除；修炼蟠桃每天点修炼时扣当天的。各阶段的修炼值以 USDT 计，由承接人向传承人支付，不占用蟠桃。</p>
      <p className="font-display text-base text-[var(--gold-100)]">统一计量：{PEACH_UNIT_TEXT}</p>
      <div className="hud-panel rounded-xl p-4"><h3 className="text-sm text-[var(--gold-100)]">资源说明</h3><p className="mt-2 text-[var(--gold-200)]">蟠桃用于召唤和修炼；修炼值、传承所得和奖励以 USDT 计。</p><p className="mt-2 text-[12px] leading-6 text-stone-400">可在「我的资产」用 USDT 购买蟠桃，也可以按钱包地址把蟠桃或 USDT 转给其他玩家（平台内转账，不走链上）。</p></div>
      <h3 className="font-display text-base text-[var(--gold-100)]">七阶段召唤参数</h3>
      <div className="flex flex-col gap-4">{LEVELS.map(l => <div key={l.id} className="border-t border-[var(--gold-600)]/25 pt-3"><div className="flex items-center justify-between gap-2"><h4 className="text-sm text-[var(--gold-100)]">{l.name} · {l.realm}</h4><PeachValue cents={Math.round(l.lifecycleCost * 100)} size="sm" /></div><dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]"><div><dt>召唤消耗</dt><dd><PeachValue cents={Math.round(l.summonCost*100)} size="xs" /></dd></div><div><dt>修炼（每天）× {l.cycleDays}天</dt><dd><PeachValue cents={Math.round(l.perCycleCost*100)} size="xs" /></dd></div></dl></div>)}</div>
      <p className="text-[12px] text-stone-400">阶段消耗 = 召唤 +（每日修炼 × 修炼天数）。以上不含修炼值（USDT）及传承平台手续费。</p>
      <h3 className="font-display text-base text-[var(--gold-100)]">蟠桃使用规则</h3>
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-xs leading-6">{['玩家通过蟠桃参与AI悟空召唤。', '每次召唤按照所属阶段计算蟠桃消耗。', '召唤蟠桃在点召唤时暂扣，悟空进猴舍时正式扣除。', '修炼蟠桃每天点修炼时扣当天的；当天没点就没有当天的修炼加成，不能补。', '召唤失败，暂扣的蟠桃全额退还。', `${PEACH_UNIT_TEXT}。`, '召唤成功却逾期未支付，暂扣的召唤蟠桃全部充公，不予退还。'].map(rule => <li key={rule}>{rule}</li>)}</ol>
    </LoreChapter>
    <EncyclopediaJourney />
    <LoreChapter id="future" number="13" title="路线图｜从一只悟空，到神话智能体世界" subtitle="悟空，只是第一个被唤醒的神话。">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl"><Image src="/assets/wukong-world-daylight.png" alt="云海中的东方神话世界" fill sizes="448px" className="object-cover" /></div>
      <ol className="flex flex-col">{ROADMAP.map(([tag, name, body], i) => <li key={name} className="relative border-l border-[var(--gold-600)]/50 pb-5 pl-5 last:pb-0"><span className={`absolute -left-[7px] top-1 size-3.5 rounded-full border ${i === 0 ? 'border-[#ffcf5c] bg-[#ffcf5c] shadow-[0_0_10px_#ffcf5c]' : 'border-[var(--gold-500)] bg-[#14110d]'}`} aria-hidden /><p className="flex items-center gap-2"><span className="font-latin text-[12px] text-[var(--gold-400)]">0{i + 1}</span><span className={`rounded px-1.5 py-0.5 text-[12px] ${i === 0 ? 'bg-[#ffcf5c26] text-[#ffe39a]' : 'border border-[var(--gold-600)]/50 text-[var(--gold-200)]'}`}>{tag}</span></p><h3 className="mt-1.5 font-display text-lg text-[var(--gold-100)]">{name}</h3><p className="mt-1.5 text-[13px] leading-7">{body}</p></li>)}</ol>
      <p className="py-4 text-center font-display text-xl font-bold leading-9 text-gold">神话不属于过去。<br />它属于每一个愿意让它继续下去的人。</p>
      <p className="text-[12px] leading-6 text-stone-400">标注「规划」「远景」的内容是发展方向，具体功能与开放时间以实际上线为准。</p>
      <Link href="/world" className="btn-gold inline-flex w-full items-center justify-center text-sm">去召唤</Link><a href="#encyclopedia-title" className="mt-2 text-center text-xs text-[var(--gold-200)]">回到天书之初 ↑</a>
    </LoreChapter>
  </div>
}
