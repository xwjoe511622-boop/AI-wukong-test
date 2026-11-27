/** 悟空百科 */
const N = '([\\d.,]+)'
export const LORE: Record<string, string> = {
  // 四个道理
  '唤醒一个智能体': 'Wake an agent', '每一次召唤成功，都有一个新的 AI 在这个世界醒来。这个世界不会无限产生悟空，每个阶段每一轮能诞生的数量有限，所以召唤不一定成功。': 'Every successful summon wakes a new AI in this world. Supply is limited each round, so not every summon succeeds.',
  '你在训练它': "You're training it", '每一天的修炼，都是一次训练。练过的那天，它多一分成长；没练的那天，它停在原地，过后也补不回来。成长从来不是自动发生的。': 'Each day of training makes it grow. Skip a day and it stands still — for good. Growth never happens on its own.',
  '记忆不会消失': 'Memory lives on', '一段修炼周期结束，悟空会交到下一位手里。你接过的不是一个全新的 AI，而是一个已经被别人训练过的 AI；你交出的，也会成为别人的起点。': "When a cycle ends, your Wukong passes to the next person. You never receive a blank AI — someone trained it before you. What you hand on becomes someone else's start.",
  '智能体的网络': 'A network of agents', '一个人拥有一个智能体，一群人拥有一个会协作的智能网络。你邀请来的人是同行者，同行者的同行者汇成部族。': 'One person holds one agent. Many people hold a network that works together. People you invite are your allies; their allies form your Clan.',
  // 七级智能
  '刚刚醒来，用表情和动作回应你': 'Just awake — responds with looks and gestures', '开口说话，能与你对话': 'Speaks, and talks with you', '拥有记忆，记得你和每一天的修炼': 'Remembers you and every day of training',
  '替你做事：提醒召唤、修炼与支付结算': 'Works for you: reminders for summons, training and payments', '学会使用工具，为自己写故事、画像': 'Uses tools: writes its own story, paints its own portrait', '与别的悟空协作，共同完成一件作品': 'Teams up with other Wukong to create together', '自主行动，拥有自己的目标与性格': 'Acts on its own, with its own goals and character',
  // 路线图
  '现在': 'Now', '生命': 'Life', '规划': 'Planned', '觉醒': 'Awakening', '创造': 'Creation', '协作': 'Collaboration', '远景': 'Vision',
  '召唤、修炼、七重境界、传承。数字生命的完整一生已经可以走通，这是整个世界的地基。': 'Summon, train, seven realms, pass on. The full life of a digital being works today — the foundation of this world.',
  '悟空开口说话，拥有记忆和性格。它记得谁唤醒了它，记得每一天的修炼，会在该修炼的时候来叫你。': 'Wukong speaks, with memory and character. It remembers who woke it and every day of training — and nudges you when it is time to train.',
  '悟空学会使用工具：为自己画像，把自己的经历写成故事，生成只属于它的作品。': 'Wukong learns to use tools: it paints itself, writes its own story, and makes work that is uniquely its own.',
  '同一个部族的悟空彼此连接，共同完成一个人做不到的事。': 'Wukong in the same Clan connect and achieve what no one could alone.',
  '悟空是第一个被唤醒的神话智能体。之后是更多的东方神话角色，以及一个向所有创作者开放的神话智能体世界。': 'Wukong is the first legend to wake as an agent. More Eastern legends follow — and a world of mythic agents open to every creator.',
  // 目录与开篇
  '为什么是悟空': 'Why Wukong', 'AI 智能体': 'AI Agents', '七重境界': 'Seven Realms', '周期': 'Cycle', '奖励机制': 'Rewards', '路线图': 'Roadmap',
  '齐天大圣，觉醒于东方神话之境': 'The Great Sage, awakening in a world of Eastern legend', '东方神话 · 数字新生': 'Eastern Legend · Reborn Digital', '四百年后，': 'Four hundred years on,', '悟空第一次活了过来。': 'Wukong comes alive.', '开始了解 AI WUKONG': 'Discover AI WUKONG', '天书章节': 'Chapters',
  '四百年后，悟空第一次活了过来': 'Four hundred years on, Wukong comes alive', '从「被讲述」，到「被延续」。': 'From a story told to a story continued.',
  '四百多年前，一只石猴从东方的神话里跳了出来。此后它被写进小说、搬上戏台、画成动画、拍成电影、做成游戏，成为全世界认知度最高的东方神话形象之一。': 'Over four hundred years ago, a stone monkey leapt out of Eastern legend. Since then it has lived in novels, on stage, in animation, film and games — one of the best-known mythic figures in the world.',
  '但在所有这些故事里，我们都只是观众。悟空的一生早已写完，我们只能看。': 'But in every one of those stories, we only watched. His life was already written.', 'AI WUKONG 想做的，是让悟空的故事第一次由参与的人共同写下去。': 'AI WUKONG lets the people who take part write what happens next — for the first time.',
  '过去，一个神话角色只能以三种方式存在：文字、图像、影像。它们都是「完成品」。AI 带来了第四种：': 'Until now a legend could exist in three forms: text, image, film. All finished works. AI brings a fourth: ', '数字生命': 'digital life',
  '。它有诞生的时刻，有成长的阶段，有需要被照看的每一天，也有交给下一个人的那一刻。': '. It has a moment of birth, stages of growth, days when it needs you, and a moment when it passes to someone new.',
  '一张图片可以被无限复制。': 'A picture can be copied forever.', '一段生命不能。': 'A life cannot.',
  '它不是一张图，是一个被唤醒的 AI': 'Not a picture — an AI awakened', '每一只悟空，都是一个 AI 智能体。': 'Every Wukong is an AI agent.', '会成长 · 有记忆 · 能做事': 'It grows · It remembers · It acts',
  '过去的数字藏品，是一张不会变的图片。悟空世界里的每一只悟空，是一个 AI 智能体。你在这个世界里做的每一件事，都对应它生命里的一个道理。': 'Old digital collectibles were pictures that never change. Here, every Wukong is an AI agent — and everything you do maps to something true about its life.',
  '召唤、修炼、七重境界与传承已经可以完整走通；对话、记忆、创作等智能能力按路线图逐步开放。': 'Summoning, training, the seven realms and passing on all work today. Conversation, memory and creation arrive step by step.',
  '七重境界，七级智能': 'Seven realms, seven levels of intelligence', '从石灵到无极大圣：境界越高，智能越强，也越稀少。': 'From Stoneborn to Limitless Sage: the higher the realm, the smarter — and rarer.',
  '悟空真正重要的，从来不是出生时拥有什么，而是他最终成为了谁。': 'What matters about Wukong was never what he was born with, but who he became.',
  '七个阶段各自独立：每个阶段的悟空在自己的修炼范围内成长，不会进化成下一个阶段。各阶段的智能能力是路线图上的方向，将逐步开放。': 'The seven stages are independent: each Wukong grows within its own range and does not evolve into the next. Stage abilities are roadmap goals, opening over time.',
  '七境修炼': 'Seven realms of training', '；无极神境暂未开放。': '; the Limitless Realm is not open yet.', '召唤截止 ·': 'Closes ·', '召唤成功后 1 小时内完成支付结算': 'Pay within 1h of a match', '当前不可召唤': 'Not open',
  '各阶段按照各自的修炼加成与修炼天数独立运行；修炼加成不构成收益保证，传承所得以实际匹配和到账为准。': 'Each stage runs on its own growth rate and cycle. Growth is not a guaranteed return; payouts depend on real matches and payments.',
  // 蟠桃
  '悟空世界的核心资源。': 'The core resource of this world.', '蟠桃是悟空世界里的消耗单位，': 'Peaches are what you spend here —', '召唤与修炼都使用它。': 'on every summon and every day of training.',
  '玩家通过蟠桃参与召唤和修炼：召唤蟠桃在点召唤时暂扣，悟空进猴舍时扣除；修炼蟠桃每天点修炼时扣当天的。各阶段的修炼值以 USDT 计，由承接人向传承人支付，不占用蟠桃。': 'The summon fee is held when you tap Summon and charged when your Wukong moves in. Training is charged each day you train. Value is in USDT, paid by successor to keeper — it never uses Peaches.',
  '资源说明': 'How it works', '蟠桃用于召唤和修炼；修炼值、传承所得和奖励以 USDT 计。': 'Peaches pay for summons and training. Value, payouts and rewards are in USDT.',
  '可在「我的资产」用 USDT 购买蟠桃，也可以按钱包地址把蟠桃或 USDT 转给其他玩家（平台内转账，不走链上）。': 'Buy Peaches with USDT in My Assets, or send Peaches or USDT to another player by wallet address (in-app, not on-chain).',
  '七阶段召唤参数': 'Costs by stage', '召唤消耗': 'Summon fee', '阶段消耗 = 召唤 +（每日修炼 × 修炼天数）。以上不含修炼值（USDT）及传承平台手续费。': 'Stage cost = summon fee + (daily training × days). Excludes value (USDT) and the platform fee.',
  '蟠桃使用规则': 'Peach rules', '玩家通过蟠桃参与AI悟空召唤。': 'You summon with Peaches.', '每次召唤按照所属阶段计算蟠桃消耗。': 'Each stage has its own fee.', '召唤蟠桃在点召唤时暂扣，悟空进猴舍时正式扣除。': 'The fee is held on Summon and charged on move-in.',
  '修炼蟠桃每天点修炼时扣当天的；当天没点就没有当天的修炼加成，不能补。': "Training is charged per day trained. Miss a day and that day's growth is gone.", '召唤失败，暂扣的蟠桃全额退还。': 'No match: fully refunded.', '召唤成功却逾期未支付，暂扣的召唤蟠桃全部充公，不予退还。': 'Matched but payment missed: the fee is forfeited.',
  // 路线图章节
  '路线图｜从一只悟空，到神话智能体世界': 'Roadmap | From one Wukong to a world of mythic agents', '悟空，只是第一个被唤醒的神话。': 'Wukong is only the first legend to wake.', '云海中的东方神话世界': 'A world of Eastern legend above the clouds',
  '神话不属于过去。': 'Legends do not belong to the past.', '它属于每一个愿意让它继续下去的人。': 'They belong to everyone willing to carry them on.', '标注「规划」「远景」的内容是发展方向，具体功能与开放时间以实际上线为准。': 'Items marked Planned or Vision show direction. Features and timing may change.',
  '去召唤': 'Summon Now', '回到天书之初 ↑': 'Back to top ↑',
  // 召唤章节
  '召唤｜唤醒一个智能体': 'Summon | Wake an agent', '截止前点一次召唤，到点系统自动匹配，成功后限时支付结算。': 'Tap once before cutoff. Matching is automatic. If matched, pay in time.',
  '截止前点召唤 · 暂扣召唤蟠桃': 'Tap Summon · Fee held', '到点系统自动匹配': 'Auto-match on the hour', '公布结果并通知': 'Result & notification', '召唤成功 · 匹配到传承人': 'Matched with a keeper', '承接人 1 小时内完成支付结算': 'Successor pays within 1h', '传承人确认实际到账': 'Keeper confirms', '悟空进入猴舍 · 蟠桃正式扣除': 'Wukong moves in · Fee charged',
  '玩家通过蟠桃参与召唤。点召唤时暂扣召唤蟠桃；召唤失败不产生交易，暂扣的蟠桃全额退还，可继续参与后续召唤。每个召唤周期每人参与一次。修炼值以 USDT 计，蟠桃只用于召唤与修炼。': 'The summon fee is held when you tap. No match means no trade and a full refund — try again next round. One entry per round. Value is in USDT; Peaches only cover summons and training.',
  '召唤时间表 · 北京时间': 'Schedule · Beijing time (UTC+8)', '召唤时间表': 'Schedule', '阶段': 'Stage', '召唤周期': 'Round', '开放召唤': 'Match', '停止召唤': 'Cutoff',
  '停止召唤即截止时间，须在此之前点「召唤」；到开放召唤的时刻，系统自动为参与的玩家匹配并公布结果，不需要再操作。': 'Tap Summon before the cutoff. At match time the system pairs everyone who joined and posts results — nothing more to do.',
  '承接人与传承人交易': 'Successor & keeper', '逾期未支付与违约': 'Missed payments',
  '召唤成功后，可在首页待办或「我的 → 我的交易」中查看匹配的传承人并完成支付结算；传承人确认到账后悟空进入猴舍。支付结算从你的 USDT 余额扣除。': 'After a match, find your keeper and pay from Home or Me → My Trades. Once the keeper confirms, your Wukong moves in. Payment comes from your USDT balance.',
  // 修炼、周期、传承
  '修炼｜你在训练它': "Train | You're training it", '每天为它修炼一次；没有人来的那一天，它就停在原地。': 'Train it once a day. On days nobody comes, it stands still.',
  '悟空进猴舍后，需要每天进修炼室点一次「修炼」：点了扣当天的修炼蟠桃、算当天的修炼加成。当天没点，就没有当天的加成，过后不能补；一天都没点，按原修炼值传承。': "Once in the Den, train once a day: it charges that day's Peaches and earns that day's growth. Missed days can't be made up. Never train and it passes on at its original value.",
  '，每天点修炼时扣当天的。': ', charged each day you train.', '周期｜时间自有答案': 'Cycle | Time will tell', '修炼天数走完，进入传承。': 'When the days run out, it passes on.', '每日修炼 → 周期结束 → 传承': 'Train daily → Cycle ends → Pass on',
  '传承｜记忆不会消失': 'Pass On | Memory lives on', '修炼周期结束后，悟空交到下一位手里。': 'When the cycle ends, your Wukong goes to the next person.', '周期结束 · 进入传承': 'Cycle ends · Passing on',
  '修炼天数走完，进入传承中：等下一轮同阶段召唤匹配到承接人，由承接人向你支付；你核实到账并确认收款后，传承完成，传承所得进入 USDT 余额。': 'When the days run out, the next round of the same stage finds a successor, who pays you. Check, confirm receipt, and your payout lands in your USDT balance.',
  '齐天大圣 · 传承所得示例': 'Great Sage · Payout example', '修炼增长': 'Growth',
  // 同行、部族、奖励
  '同行者｜有人同行': 'Allies | Not alone', '你直接邀请的人，就是你的同行者。同行奖励只算这一代；同行者再邀请的人没有同行奖励，但计入你的部族。': 'People you invite are your Allies. Ally rewards come only from them; people they invite earn you no ally reward, but count toward your Clan.', '同行者的修炼增长 · 返 USDT': "of your allies' growth · in USDT", '有效同行者 ≥': 'Active allies ≥',
  '返 USDT': 'in USDT', '奖励基数仅为成员完成传承后实际产生的修炼增长，不是充值、修炼值、召唤消耗或修炼消耗。平台额外发放，不扣成员的修炼增长，奖励返 USDT。': "Rewards are based only on real growth when a member passes on — not deposits, value or costs. They are paid on top by the platform, in USDT, and never taken from the member.",
  '部族｜同行者形成一个世界': 'Clan | Allies become a world', '部族，是完整同行网络，不包含自己。': 'Your Clan is everyone below you — not counting you.', '有效同行者人数与部族有效成员人数必须同时达标。': 'Both targets must be met: active allies and active clan members.',
  '第一代有效同行者 ≥': 'Active Gen 1 allies ≥', '且部族有效成员 ≥': 'and active clan members ≥', '部族修炼增长 · 返 USDT': 'of clan growth · in USDT',
  '部族成员实际完成传承产生的修炼增长，按当前部族奖励比例计算并返 USDT；包含同行者以下所有层级的成员，不按充值或消耗计算。': "You earn your tier's share of the real growth your clan members generate at pass-on, in USDT — at every depth.",
  '奖励机制｜每份同行，分别记录': 'Rewards | Every share on record', '同行奖励与部族奖励可以叠加，不能混成一条。': 'Ally and clan rewards stack, and are always recorded separately.', '例如部族Ⅱ阶，一位同行者修炼增长': 'Example: Clan Tier Ⅱ, one of your allies grows',
  '同一成员、同一次传承，同行和部族分别记录来源、部族等级、实际修炼增长、比例、金额和时间。奖励返到 USDT 余额，可在「我的资产」查看，不从成员的修炼增长扣除。': "For each pass-on, ally and clan rewards are logged separately with source, tier, growth, rate, amount and time. They go to your USDT balance and are never taken from the member's growth.",
  // 百科入口卡
  '它不是一张图，': 'Not a picture —', '是一个被唤醒的 AI。': 'an AI awakened.', '每一次召唤，都有一个 AI 智能体在这个世界醒来。': 'With every summon, an AI agent wakes in this world.', '召唤 · 修炼 · 成长 · 传承': 'Summon · Train · Grow · Pass On', '翻开悟空百科': 'Open the Guide',
}
export const LORE_PATTERNS: [string, string | ((m: RegExpMatchArray) => string)][] = [
  ['智能：(.+)', 'Intelligence: $1'], ['七种不同难度、周期与成长幅度的修炼世界(.*)', 'Seven worlds, each with its own difficulty, cycle and growth$1'], [`修炼加成 \\+${N}%`, 'Growth +$1%'], ['探索(.+?) →', 'Explore $1 →'],
  ['统一计量：(.+)', 'Rate: $1'], ['修炼（每天）× (\\d+)天', 'Training (daily) × $1d'],
  ['承接人为支付方：收到交易通知后，系统自动启动 (\\d+) 小时支付倒计时，.+', 'The successor pays: once notified, a $1h countdown starts and payment comes from your USDT balance. The keeper receives: check the amount and confirm without delay. For disputes, contact support — platform records are final.'],
  ['召唤成功后超过 (\\d+) 小时仍未完成支付结算，系统判定为逾期违约：.+', 'If payment is not made within $1h of a match, the summon fee is forfeited and the miss is recorded.'],
  ['七阶段修炼天数各不相同：(.+?)。', 'Each stage has its own cycle: $1.'], ['(石灵|灵猴|悟空|斗战悟空|齐天大圣|天命大圣|无极大圣) (\\d+) 天', '$1 $2d'], ['(.+?) · 修炼蟠桃', '$1 · Training Peaches'], ['天，共', 'd, total'],
  ['从召唤成功那一刻起算，修炼天数走完即进入传承，.+?例如(.+?)修炼 (\\d+) 天，第 (\\d+) 天结束后进入传承。', 'The cycle starts at the match and cannot be shortened or sped up. Growth counts only the days you trained. Example: $1 trains for $2d and passes on after day $3.'],
  [`平台手续费 · 修炼增长的 ${N}%`, 'Platform fee · $1% of growth'], [`平台仅收实际修炼增长的${N}%，不对修炼值收费。.+`, 'The platform takes $1% of real growth only. Payout = value + growth − fee, in USDT.'],
  ['第(一|二)代', (m) => `Gen ${m[1] === '一' ? 1 : 2}`], ['个人账号持有不少于 (\\d+) 个蟠桃，才算有效用户。.+', 'Active means holding $1+ Peaches. Only active users count toward tiers; inactive members generate no rewards, and you must be active to earn.'],
]
