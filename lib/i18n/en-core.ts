/** 数据层产生的文字：阶段、仙境、首页待办、交易状态、通知、资产明细等 */
export const CORE: Record<string, string> = {
  // 通用
  '1蟠桃 = 1 USDT': '1 Peach = 1 USDT', '体验版': 'Trial', '正式版': 'Live', '明日': 'Tomorrow', '第一轮': 'Round 1',
  '蟠桃': 'Peach', '悟空': 'Wukong', '首页': 'Home', '悟空世界': 'World of Wukong', '猴舍': 'Den', '我的': 'Me',
  '召唤': 'Summon', '修炼': 'Train', '收款': 'Receive', '支付结算': 'Payment', '转账': 'Transfer',
  // 七阶段
  '石灵': 'Stoneborn', '灵猴': 'Spirit Monkey', '斗战悟空': 'Warrior Wukong', '齐天大圣': 'Great Sage', '天命大圣': 'Destined Sage', '无极大圣': 'Limitless Sage',
  // 七仙境
  '灵石谷': 'Spirit Stone Valley', '花果仙山': 'Flower-Fruit Mountain', '水帘洞': 'Water Curtain Cave', '斗战神境': "Warrior's Realm", '齐天神境': "Sage's Realm", '天命神境': 'Realm of Destiny', '无极神境': 'Limitless Realm',
  '初阶仙境': 'Novice Realm', '进阶仙境': 'Adept Realm', '高阶仙境': 'Elite Realm', '战阶仙境': 'Warrior Realm', '圣阶仙境': 'Sage Realm', '天阶仙境': 'Celestial Realm', '无极仙境': 'Limitless Realm',
  '天地初生': 'First Light', '灵智初启': 'Awakening Mind', '修行初成': 'First Mastery', '斗战四方': 'Trial by Battle', '齐天称圣': 'Equal to Heaven', '天命所归': 'Chosen by Fate', '无极之境': 'Beyond All Limits',
  '来自灵石，天地初生，数字生命第一次苏醒。': 'Born from a spirit stone — a digital life opens its eyes for the first time.',
  '灵石初开，天地孕灵': 'The stone cracks. A spirit stirs.',
  '灵石初醒，踏入悟空世界的第一重修炼。': 'Newly awakened, taking its first steps into training.',
  '灵智初启，开始探索世界，形成最初的成长轨迹。': 'Its mind awakens. It begins to explore and to grow.',
  '花果为家，山林称王': 'At home on the mountain, king of the wild.',
  '花果山中，灵猴初识天地灵气。': 'On Flower-Fruit Mountain, the Spirit Monkey first senses the world.',
  '修行初成，力量与意识逐渐成熟，悟空之名初定。': 'Strength and mind mature. It earns the name Wukong.',
  '身披战甲，威震群猴': 'Clad in armor, leader of the troop.',
  '水帘洞深处，战甲加身，群猴俯首。': 'Deep in the Water Curtain Cave, armored and obeyed.',
  '斗战四方，以战入道，战意淬炼出真正的力量。': 'Forged in battle. Every fight sharpens true power.',
  '斗战不休，以战证道': 'Never resting, proving itself in battle.',
  '斗战神境之中，每一战都是一次修行。': "In the Warrior's Realm, every battle is training.",
  '齐天称圣，一棒撼天，名号响彻三界。': 'It claims the title of Great Sage. One strike shakes the heavens.',
  '齐天大圣，一棒撼天': 'Great Sage — one strike shakes the heavens.',
  '一棒撼天，齐天之名响彻三界。': 'One strike shakes the heavens. The name echoes across all realms.',
  '天命所归，超越齐天，走向数字生命的完全觉醒。': 'Chosen by fate, beyond the Great Sage — a digital life fully awake.',
  '天命所归，万法归一': 'Chosen by fate, all paths become one.',
  '天命加身，万法归一，直面自身的最终答案。': 'Carrying its destiny, it faces its final answer.',
  '无极之境，超越天命，万象归一。': 'Beyond destiny, beyond limits — all things become one.',
  '无极大圣，万象归一': 'Limitless Sage — all things become one.',
  '无极之境，万象归一。': 'Beyond all limits, all things become one.',
  // 仙境状态
  '匹配中': 'Matching', '已召唤 · 等待匹配': 'Joined · Awaiting match', '可召唤': 'Open', '召唤已截止': 'Closed', '今日已结束 · 19:00 开放明日': 'Ended · Reopens 19:00',
  // 首页待办
  '结果马上揭晓，请稍候': 'Result coming any second', '不需要操作，结果会立即通知你': "Nothing to do — you'll be notified",
  '系统正在匹配…': 'Matching now…', '即将开始匹配': 'Matching starts soon', '等待匹配': 'Queued',
  '去召唤': 'Summon', '今日召唤已完成': 'Summons done for today', '今日召唤已全部截止': 'All summons closed for today', '今晚 19:00 起可召唤明日的悟空': "Tomorrow's summons open at 19:00",
  'USDT 余额不足，请先充值': 'Not enough USDT — deposit first', '去支付': 'Pay', '无待支付': 'Nothing to pay', '召唤成功后，在这里完成支付结算': 'Pay here after a match',
  '蟠桃不足，请先购买蟠桃': 'Not enough Peaches — buy more first', '过时不能补': 'no make-ups', '去修炼': 'Train', '今日修炼已完成': 'Training done for today',
  '猴舍里没有修炼中的悟空': 'No Wukong in training', '悟空进猴舍后，每天在这里提醒你修炼': 'Daily reminders show here',
  '承接人已支付，核实到账后确认': 'Successor paid — confirm', '去确认': 'Confirm', '传承已匹配到承接人': 'Matched with a successor', '传承中': 'Passing on',
  '等待下一轮召唤匹配承接人': 'Finding a successor next round', '无待收款': 'Nothing to receive', '悟空传承时，在这里确认收款': 'Confirm payouts here',
  // 召唤
  '演示记录已重置，不影响真实存档。': 'Demo data reset.', '已模拟蟠桃不足，仅修改演示余额。': 'Demo balance set to zero.', '演示时钟已切换。': 'Demo clock changed.', '无效时间。': 'Invalid time.',
  '本轮召唤已截止，可继续参与后续召唤。': 'This round is closed. You can join a later one.', '已参与本轮召唤，无需重复提交。': "You've already joined this round.", '蟠桃不足，无法参与本次召唤。': 'Not enough Peaches to summon.',
  '已暂扣召唤蟠桃': 'summon fee is on hold', '本阶段不消耗蟠桃': 'this stage costs no Peaches', '失败全额退还。': 'fully refunded if it fails.',
  '没有召唤中的记录，或本轮已完成召唤。': 'No active summon for this round.', '尚未召唤，不能展示结果。': 'No result yet.',
  '本轮召唤未成功，暂扣的蟠桃已全额退还，可继续参与后续召唤。': 'No match this round. Your Peaches were refunded — try the next one.',
  // 交易
  '承接人 · 支付方': 'Successor · Pays', '传承人 · 收款方': 'Keeper · Receives', '承接人': 'Successor', '传承人': 'Keeper',
  '交易完成': 'Done', '逾期未支付': 'Overdue', '待我支付': 'Pay now', '等待传承人确认': 'Awaiting keeper', '等待承接人支付': 'Awaiting payment', '待确认收款': 'Confirm receipt',
  '召唤支付结算': 'Summon payment', '传承收款': 'Pass-on payout',
  // 暂扣
  '已参与召唤 · 等待匹配': 'Joined · Awaiting match', '召唤成功 · 待我支付': 'Matched · Pay now', '已支付 · 等传承人确认': 'Paid · Awaiting keeper',
  '召唤失败全额退还；召唤成功并完成支付结算、悟空进猴舍时扣除。': 'Fully refunded if the summon fails. Charged when your Wukong moves into the Den.',
  '按时完成支付结算、传承人确认后，悟空进猴舍并扣除；逾期未支付全部充公。': 'Pay on time and it is charged once your Wukong moves in. Miss the deadline and it is forfeited.',
  '传承人确认到账后，悟空进猴舍并扣除。': 'Charged once the keeper confirms and your Wukong moves in.',
  // 部族与明细类型
  '第一代': 'Gen 1', '第二代': 'Gen 2', '更深层': 'Deeper', '部族成员': 'Clan members',
  '新手赠送': 'Welcome gift', '召唤成功': 'Summon matched', '历史契约': 'Legacy record', '修炼消耗': 'Training cost', '传承所得': 'Payout', '召唤暂扣': 'Summon hold', '召唤退还': 'Summon refund',
  '同行奖励': 'Ally reward', '部族奖励': 'Clan reward', '购买蟠桃': 'Buy', '购买蟠桃支付': 'Peach purchase', '修炼值支付': 'Value payment', '逾期违约': 'Forfeit', '收到转账': 'Transfer in', '资产变动': 'Balance change',
  '最新加入': 'Newest', '最早加入': 'Oldest', '带来奖励最多': 'Top rewards',
}
const NAME = '(石灵|灵猴|悟空|斗战悟空|齐天大圣|天命大圣|无极大圣)'
export const CORE_PATTERNS: [string, string | ((m: RegExpMatchArray) => string)][] = [
  // 时间
  ['明日 (\\d\\d:\\d\\d)', '$1 tomorrow'], ['([\\d.,]+) 蟠桃', '$1 Peaches'], ['([\\d.,]+) ?个蟠桃', '$1 Peaches'], ['(\\d+)天', '$1d'], ['(\\d+) 天', '$1d'],
  ['部族(Ⅰ|Ⅱ|Ⅲ)阶', 'Clan Tier $1'], ['部族 (Ⅰ|Ⅱ|Ⅲ) 阶', 'Clan Tier $1'], ['(Ⅰ|Ⅱ|Ⅲ)阶部族', 'Clan Tier $1'],
  // 首页待办
  ['可召唤 · (.+)', 'Summon $1'], ['(.+?) 自动匹配', 'Matches at $1'], ['另有 (\\d+) 个仙境可召唤', '$1 more open'], ['共 (\\d+) 个在等', '$1 waiting'], ['还可召唤 (\\d+) 个', '$1 more open'], ['还可召唤 (\\d+) 个仙境', '$1 more realms open'],
  ['成功 (.+)', 'Matched: $1'], ['未成功 (\\d+) 个，蟠桃已退还', '$1 missed, refunded'],
  [`${NAME} · 待我支付`, '$1 · Pay'], ['(.+?)（共 (\\d+) 笔）', '$1 ($2 total)'], ['(.+?)（(\\d+) 笔）', '$1 ($2)'],
  ['逾期 (\\d+) 小时未支付，暂扣的蟠桃全部充公', 'Pay within $1h or forfeit'],
  ['已支付 · 等待传承人确认', 'Paid · Awaiting keeper'], ['确认到账后，(.+?)进入猴舍', 'Once confirmed, $1 moves into the Den'],
  ['(\\d+) 只悟空待修炼', '$1 Wukong to train'], ['需 (.+?) 蟠桃', '$1 Peaches'], ['(.+?) 修炼中', '$1 in training'],
  ['(.+?) · 确认收款', '$1 · Confirm'], ['(.+?) · 等待承接人支付', '$1 · Awaiting payment'],
  // 召唤
  ['(.+?)尚未开放，暂不可召唤。', '$1 is not open yet.'], ['已参与召唤，(.+?) 系统自动匹配；(.+?)，失败全额退还。', 'Joined. Matching at $1; $2, fully refunded if it fails.'],
  ['召唤成功，请在规定时间内完成支付结算，(.+?)随后进入猴舍。', 'Matched! Pay in time and $1 moves into the Den.'],
  [`${NAME}修炼室`, '$1 Hall'],
]
