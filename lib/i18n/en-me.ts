/** 我的、同行与部族、奖励、明细、邀请、设置、客服、关于 */
const N = '([\\d.,]+)'
export const ME: Record<string, string> = {
  '阶': '', '人': '', '资产明细': 'Activity', '进行中的交易': 'Open trades', '我的团队': 'My Team', '我的同行者': 'My Allies', '我的部族': 'My Clan', '我的记录': 'Records', '交易记录': 'Trades', '奖励明细': 'Rewards', '服务': 'More', '设置': 'Settings',
  '关于 AI WUKONG': 'About AI WUKONG', 'AI WUKONG · 与君同行': 'AI WUKONG · Journey Together', '完整钱包地址已复制': 'Address copied', '复制受限，请在设置中长按地址复制': 'Copy blocked — long-press the address in Settings',
  '设置头像': 'Set avatar', '悟空召唤者': 'Wukong Summoner', '未入阶': 'No tier', '读取中': 'Loading', '读取中…': 'Loading…', '复制完整钱包地址': 'Copy address', '复制': 'Copy', '匿名存档设置': 'Guest settings',
  '当前使用匿名身份，不需要登录。清除 Cookie 或更换设备后无法自动恢复原存档。': "You're a guest. Clearing cookies or switching devices loses your data.", '收起设置': 'Hide',
  '召唤记录': 'Summons', '修炼记录': 'Training', '传承记录': 'Pass-ons', '悟空世界的身份、蟠桃与 USDT 资产、同行者、部族成长与奖励中心。': 'Your identity, assets, allies, clan and rewards.',
  '复制邀请码': 'Copy invite code', '复制邀请链接': 'Copy invite link', '同行者明细': 'Allies', '部族成员明细': 'Clan members',
  '：第一代有效同行者 ≥': ': active Gen 1 allies ≥', '人且部族有效成员 ≥': ', active clan members ≥',
  // 同行与部族
  '同行与部族': 'Allies & Clan', '直接邀请的是第一代，他们邀请的是第二代；所有层级合起来是你的部族。': 'People you invite are Gen 1. People they invite are Gen 2. Everyone below you is your Clan.',
  '同行者或部族': 'Allies or Clan', '同行者': 'Allies', '重试': 'Retry', '正在读取同行关系…': 'Loading…', '累计同行奖励 · 返 USDT': 'Ally rewards earned · USDT', '同行奖励明细': 'Details',
  '部族有效成员': 'Active clan members', '当前等级': 'Current tier', '初立部族': 'New Clan', '第一代有效同行者': 'Active Gen 1 allies', '两个条件同时满足后自动晋升。': 'Meet both to move up automatically.',
  '累计部族奖励 · 返 USDT': 'Clan rewards earned · USDT', '部族奖励明细': 'Details', '奖励规则': 'Reward rules', '已达成': 'Reached', '查看完整规则': 'Full Rules',
  '今天加入': 'Joined today', '清空搜索': 'Clear', '排序方式': 'Sort', '按代数筛选': 'Filter by generation', '正在读取成员…': 'Loading members…', '同行之路，从一份邀请开始': 'Every journey starts with an invite', '目前还没有': 'None yet', '邀请同行者': 'Invite Allies',
  '检查一下地址，或换一个分类。': 'Check the address or try another filter.', '换一个分类看看。': 'Try another filter.', '已达标': 'Active',
  // 奖励
  '每一份奖励，都有同行的来处。奖励全部返 USDT。': 'Every reward comes from your team. All paid in USDT.', '累计奖励': 'Total rewards', '累计奖励暂不可用': 'Total unavailable',
  '同行奖励与部族奖励分别记账，可来自同一次传承，均返 USDT。时间均为北京时间。': 'Ally and clan rewards are tracked separately and paid in USDT. Times are Beijing time (UTC+8).',
  '奖励类型': 'Type', '重试读取': 'Retry', '正在读取奖励明细…': 'Loading rewards…', '奖励': 'Reward', '了解奖励计算规则': 'How rewards work', '来自': 'From', '来源成员': 'From member', '奖励比例': 'Rate', '部族奖励比例': 'Clan rate', '对应本次修炼增长': 'On growth of',
  // 明细
  '蟠桃与 USDT 的每一笔进出，时间为北京时间。': 'Every Peach and USDT movement. Beijing time (UTC+8).', '明细类型': 'Type', '正在读取记录…': 'Loading…', '尚无此类记录': 'Nothing here yet', '有了记录会显示在这里。': 'Records will show up here.',
  // 邀请
  '邀请链接': 'Invite link', '邀请码': 'Invite code', '没能自动复制，请长按上方文字手动复制。': "Couldn't copy. Long-press the text above.", '与君同行，共赴悟空世界': 'Journey together into the world of Wukong', '已复制邀请链接': 'Invite link copied',
  // 头像与设置
  '头像已更新': 'Avatar updated', '这张图片无法使用，请换一张 JPG 或 PNG。': "Can't use this image. Try a JPG or PNG.", '头像': 'Avatar', '已设置自定义头像。': 'Custom avatar set.', '未设置头像，当前显示默认图标。': 'No avatar yet — showing the default.',
  '更换头像': 'Change', '已恢复默认头像': 'Avatar reset', '恢复默认': 'Reset', '选择头像图片': 'Choose image', '语言设置': 'Language', '接受邀请': 'Accept Invite', '复制受限，请长按地址手动复制。': 'Copy blocked — long-press the address.',
  '语言 / Language': 'Language', '悟空世界身份': 'Your identity', '（演示地址，未连接钱包）': ' (demo address, not connected)', '退出并连接钱包': 'Exit & Connect Wallet', '账户安全': 'Account safety',
  '钱包地址就是你在悟空世界的身份，客服核实问题时会用到。断开钱包不会清除这个地址下的记录，重新连接同一个地址即可继续。': 'Your wallet address is your identity here, and support will ask for it. Disconnecting keeps your data — reconnect the same address to continue.',
  '请勿向任何人透露账户信息；所有支付结算都在平台内完成，不要私下向个人转账，也不要向别人的钱包地址直接转账。': 'Never share your account details. All payments happen in the app — never pay anyone privately or send funds straight to a wallet address.',
  '接受同行邀请': 'Accept an Invite', '当前语言': 'Current language', '简体中文 · 已启用': 'English · On', '目前仅支持简体中文，后续语言开放后可在此切换。': 'Switch between 中文 and English any time.',
  '输入同行者分享的邀请码，建立同行关系。只能接受一次，不能接受自己的邀请。': "Enter an ally's invite code. You can accept only once, and not your own.", '同行之缘，已然缔结': "You're now allies", '返回我的': 'Back to Me', '请输入 WK 开头的 18 位邀请码。': 'Enter the 18-character code starting with WK.', '正在建立同行关系…': 'Linking…', '确认接受邀请': 'Accept',
  // 公告、客服
  '暂无新公告': 'No news yet', '世界动态与功能开放信息将在这里公布。': 'Updates and new features will be posted here.', '玩法提示': 'How to play',
  '截止前点一次召唤，到点系统自动匹配；召唤成功后向传承人完成支付结算，传承人确认到账即进入猴舍，之后每天点一次修炼；传承时由承接人向你支付，确认收款后传承完成。待办会显示在首页。': 'Tap Summon once before cutoff and matching runs on the hour. If matched, pay the keeper; once they confirm, your Wukong moves into the Den. Train once a day. At the end, your successor pays you and you confirm. Your to-dos are on Home.',
  '查看悟空百科': 'Open the Guide', '常见疑问': 'FAQ', '为什么看不到奖励？': "Why don't I see rewards?",
  '需先建立同行关系，相关成员实际完成传承并产生修炼增长。同行奖励为第一代 10%、第二代 5%，部族奖励需第一代有效同行者数与部族有效成员数同时达标；持有不少于 50 个蟠桃才算有效用户：未达标的成员不产生奖励，自己未达标也不能拿奖励。奖励全部返 USDT。暂无符合条件的奖励时，明细为空。': 'Rewards come when your allies pass on a Wukong with real growth: 10% from Gen 1, 5% from Gen 2. Clan rewards need both tier targets met. Only active users (50+ Peaches) count — and you must be active to earn. All rewards are paid in USDT.',
  '同行者与部族成员有什么区别？': 'Allies vs. Clan — what is the difference?',
  '直接邀请的是第一代同行者，他们邀请的是第二代；同行奖励仅计算这两代（第一代 10%、第二代 5%）。部族涵盖完整关系网络，不包含自己；部族晋升只统计持有不少于 50 个蟠桃的有效用户。': 'People you invite are Gen 1 allies; people they invite are Gen 2. Ally rewards cover just these two (10% and 5%). Your Clan is everyone below you. Only active users (50+ Peaches) count toward clan tiers.',
  '蟠桃怎么获得？': 'How do I get Peaches?', '在「我的 → 我的资产」里用 USDT 购买，1蟠桃 = 1 USDT，立即到账。请勿向任何个人转账。': 'Buy them with USDT under Me → My Assets. 1 Peach = 1 USDT, instant. Never pay an individual.',
  '交易有问题怎么申诉？': 'Something wrong with a trade?', '支付结算或收款有疑问时，请保留交易页面截图和发生时间，联系客服处理。交易记录以平台系统为准。': 'Keep a screenshot of the trade page and the time, then contact support. Platform records are final.',
  '联系客服': 'Contact Support', '遇到问题请准备好问题描述、发生时间和页面截图，并附上你的钱包地址，方便客服核实。请勿向任何人透露你的账户信息、私钥或助记词，也不要私下向个人转账。': 'Have a description, the time, a screenshot and your wallet address ready. Never share your private key or seed phrase, and never pay anyone privately.',
  '复制我的 UID': 'Copy my address',
  // 关于
  '四百年后，悟空第一次活了过来。': 'Four hundred years on, Wukong comes alive.', '每一只悟空，都是一个 AI 智能体：会成长，有记忆，能做事。通过召唤、修炼与传承，由参与的人共同把神话写下去。': 'Every Wukong is an AI agent: it grows, remembers and acts. Summon, train and pass it on — the legend is written by everyone who joins.',
  '东方神话 · AI 智能体世界': 'Eastern Legend · A World of AI Agents', '探索悟空百科': 'Explore the Guide',
  '将从 USDT 余额向传承人': 'Pay keeper', '支付': '', '。支付后无法撤回，系统会通知传承人核实到账。': 'from your USDT balance. This cannot be undone.',
}
export const ME_PATTERNS: [string, string | ((m: RegExpMatchArray) => string)][] = [
  ['(\\d+) 笔待我处理', '$1 need you'], ['(\\d+) 笔 · 等待对方', '$1 · Waiting on them'], ['(\\d+) ?人', '$1'],
  [`同行奖励 ${N}%`, 'Ally reward $1%'], ['共 (\\d+) 人 · 未达标 (\\d+)', '$1 total · $2 inactive'], [`部族修炼增长 ${N}%`, '$1% of clan growth'], ['下一阶 · (.+)', 'Next · $1'],
  [`已达最高阶。部族奖励为部族修炼增长的 ${N}%，返 USDT。`, 'Top tier reached. You earn $1% of clan growth, in USDT.'],
  [`同行奖励：第一代 ${N}% · 第二代 ${N}%，返 USDT。.+`, 'Ally rewards: Gen 1 $1% · Gen 2 $2%, paid in USDT. Deeper levels earn no ally reward but still count toward your Clan.'],
  ['部族奖励：第一代有效同行者人数与部族有效成员人数同时达标后，按部族修炼增长的 (.+?) 产生奖励，返 USDT。', "Clan rewards: hit both targets and earn $1 of your clan's growth, in USDT."],
  ['(.+?)：第一代有效同行者 ≥ (\\d+) 人且部族有效成员 ≥ (\\d+) 人', '$1: $2+ active Gen 1 allies and $3+ active clan members'],
  ['持有不少于 (\\d+) 个蟠桃才算有效用户。.+', 'Active means holding $1+ Peaches. Inactive members generate no rewards, and you must be active to earn. Both rewards stack and are based on real growth at pass-on.'],
  ['(\\d+) 天前加入', 'Joined $1d ago'], ['(.+?) 加入', 'Joined $1'], ['搜索.*钱包地址', 'Search by address'], ['只看未达标（(\\d+) 人）', 'Inactive only ($1)'], ['符合条件 (\\d+) 人', '$1 found'],
  ['没有符合条件的(.+)', 'No matches'], [`未达 ${N} 蟠桃`, 'Under $1 Peaches'], ['还需 (\\d+) 人', '$1 to go'], ['(.+?) (\\d+) 人，目标 (\\d+) 人', '$1: $2 of $3'],
  ['暂无.*记录。成员完成传承并产生实际修炼增长后，符合条件的奖励将自动入账。', 'No rewards yet. They arrive automatically when your members pass on with real growth.'],
  ['(第一代|第二代)同行关系', '$1 ally'], ['(Ⅰ|Ⅱ|Ⅲ)阶部族', 'Clan Tier $1'], ['(.+?)已复制，发给朋友即可', '$1 copied — send it to a friend'], ['(.*)同行者和部族成员会看到你的头像。', 'Your allies and clan see this.'], ['钱包地址(.*)', 'Wallet address$1'],
  ['共 (\\d+) 天，已修炼 (\\d+) 天.*', '$2 of $1 days trained'],
]
