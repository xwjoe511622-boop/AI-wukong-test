export type Stage = 'stone_spirit' | 'spirit_monkey' | 'wukong' | 'battle_wukong' | 'great_sage' | 'destiny_sage' | 'infinite_sage'

// 每个召唤周期开始前 30 分钟截止；截止前点过「召唤」的玩家，周期一开始由系统自动匹配并公布结果。
export const RESERVATION_CUTOFF_MINUTES = 30
// 数值以《AI悟空进阶 · 蟠桃召唤与交易释放机制》正式执行版（2026-11-25）为准。契约功能已取消。
export const PEACH_UNIT_TEXT = '1蟠桃 = 1 USDT'
/**
 * 两个独立版本，打包或启动时用环境变量选择，互不混用：
 * - 正式版（默认）：按正式规则运行，周期 1/3/5/8/12/15/20 天，第七阶段未开放，不赠送余额。
 * - 体验版（NEXT_PUBLIC_WUKONG_TRIAL=1）：赠送 1000 蟠桃、10000 USDT，七个阶段全部开放，并且时间加速——
 *   正式版的整个修炼周期压缩为真实的 1 天、修炼 1 次，这一次扣满正式周期的全部修炼蟠桃。
 *   页面上的周期、每日修炼、消耗等一律显示正式版数值，不出现「体验版 / 正式版」字样（顶部偶尔浮出的提示除外）。
 */
export const TRIAL_MODE = process.env.NEXT_PUBLIC_WUKONG_TRIAL === '1'
export const EDITION = TRIAL_MODE ? '体验版' : '正式版'
export const TRIAL_CYCLE_DAYS = 1
export const TRIAL_PEACH = 1000
export const TRIAL_USDT = 10000
/** 个人账号持有不少于 50 个蟠桃才算有效用户 */
export const VALID_USER_MIN_PEACH = 50
/** 召唤周期时长：小时 */
export const MATCH_WINDOW_HOURS = 1
export const PLATFORM_PROFIT_FEE = 0.03
export const INHERITANCE_FEE_PCT = PLATFORM_PROFIT_FEE * 100
/** 同行奖励：第一代 10%、第二代 5%，返 USDT */
export const COMPANION_REWARD = { generation1: 10, generation2: 5 } as const
/** 部族奖励：第一代有效同行者数与部族有效成员数同时达标，按部族修炼增长比例返 USDT */
export const TRIBE_REWARD = {
  level1: { direct: 5, members: 50, rate: 1 },
  level2: { direct: 15, members: 150, rate: 3 },
  level3: { direct: 30, members: 300, rate: 5 },
} as const
/** 结算期：召唤成功后 1 小时内完成资金结算；逾期判定违约，暂扣的召唤蟠桃全部充公 */
export const PAYMENT_WINDOW_HOURS = 1

export interface WukongLevel {
  id: Stage
  order: number
  realm: string
  realmEn: string
  name: string
  nameEn: string
  /** 是否已开放召唤；未开放阶段仅展示锁定态 */
  isOpen: boolean
  /** 人物立绘（后续逐阶段替换正式 PNG，仅需改此路径） */
  characterImage: string
  /** characterImage 的别名，供旧字段名兼容 */
  image: string
  /** @deprecated 请使用 characterImage */
  card: string
  /** 仙境封面图（占位，后续替换） */
  realmCover: string
  /** 猴舍修炼室门内封面（占位，后续替换） */
  roomCover: string
  /** 修炼室动画与静态帧（占位，后续替换） */
  cultivationVideo: string
  cultivationPoster: string
  /** 开始召唤匹配并公布结果的时刻（北京时间，整点，等于周期开始） */
  summonHour: number
  /** 召唤窗口开始时刻（北京时间，整点） */
  summonStartHour: number
  /** 开放召唤（开始匹配），例如 11:00 */
  summonStartTime: string
  /** 召唤周期结束，例如 12:00 */
  summonEndTime: string
  /** 结算截止 = 召唤成功后 1 小时，例如 12:00 */
  paymentDeadline: string
  /** @deprecated 请使用 paymentDeadline */
  paymentCutoff: string
  /** 召唤周期，例如 11:00–12:00 */
  summonWindow: string
  /** 停止提交召唤时刻，例如 10:30（周期开始前 30 分钟） */
  summonStopTime: string
  accent: string // css color for realm accent
  /** 难度星级 1–7 */
  stars: number
  /** 仙境等级名称 */
  tier: string
  /** 修炼范围（USDT） */
  cultivationMin: number
  cultivationMax: number
  /** @deprecated 请使用 cultivationMin / cultivationMax */
  rangeMin: number
  rangeMax: number
  /** 本轮修炼值（USDT），当前取范围下限；由承接人向传承人结算，不占用蟠桃 */
  cost: number
  /** 正式修炼周期（天） */
  cycleDays: number
  /** 实际运行天数（真实时间）：体验版时间加速，统一 1 天；正式版等于 cycleDays。只用于计时，不用于显示 */
  runDays: number
  /** 修炼加成 (%)，完整修炼周期后获得 */
  growthRate: number
  /** @deprecated 请使用 growthRate */
  gainPct: number
  /** 本阶段蟠桃总消耗 = 召唤 + 每日修炼 × 修炼天数（契约功能已取消） */
  lifecycleCost: number
  /** 截至本阶段的蟠桃累计消耗 */
  cumulativeCost: number
  /** 召唤成功消耗（蟠桃） */
  summonCost: number
  /** 每次修炼消耗（蟠桃） */
  cultivationCost: number
  /** @deprecated 请使用 cultivationCost */
  perCycleCost: number
  /** 每轮修炼次数 = 周期天数 */
  cultivationCount: number
  lifeStage: string
  lifeDescription: string
  tagline: string
  /** 详情页世界观短句 */
  lore: string
  /** 阶段特别说明（仅文字提示，不改变召唤流程） */
  notes?: string[]
  /** 免预约阶段：界面文案不出现“预约”字样（流程不变） */
  noReservation?: boolean
}

type StageSeed = {
  id: Stage
  realm: string
  realmEn: string
  name: string
  nameEn: string
  isOpen: boolean
  characterImage: string
  realmCover: string
  roomCover: string
  cultivationAsset: string
  summonStartHour: number
  accent: string
  tier: string
  cultivationMin: number
  cultivationMax: number
  cycleDays: number
  growthRate: number
  summonCost: number
  cultivationCost: number
  lifeStage: string
  lifeDescription: string
  tagline: string
  lore: string
  notes?: string[]
  noReservation?: boolean
}

// 人物为透明底立绘（/assets/characters）；仙境、修炼室素材仍沿用现有图片作占位，后续逐阶段替换。
const SEEDS: StageSeed[] = [
  {
    id: 'stone_spirit',
    realm: '灵石谷',
    realmEn: 'VALLEY OF THE SPIRIT STONE',
    name: '石灵',
    nameEn: 'STONE SPIRIT',
    isOpen: true,
    characterImage: '/assets/characters/stone_spirit.png',
    realmCover: '/assets/realm-stone.webp',
    roomCover: '/assets/room-stone.png',
    cultivationAsset: 'stone',
    summonStartHour: 11,
    accent: '#c9a24a',
    tier: '初阶仙境',
    cultivationMin: 10,
    cultivationMax: 50,
    cycleDays: 1,
    growthRate: 5,
    summonCost: 0.1,
    cultivationCost: 0.1,
    lifeStage: '天地初生',
    lifeDescription: '来自灵石，天地初生，数字生命第一次苏醒。',
    tagline: '灵石初开，天地孕灵',
    lore: '灵石初醒，踏入悟空世界的第一重修炼。',
  },
  {
    id: 'spirit_monkey',
    realm: '花果仙山',
    realmEn: 'FLOWER-FRUIT MOUNTAIN',
    name: '灵猴',
    nameEn: 'SPIRIT MONKEY',
    isOpen: true,
    characterImage: '/assets/characters/spirit_monkey.png',
    realmCover: '/assets/realm-young.webp',
    roomCover: '/assets/room-young.png',
    cultivationAsset: 'young',
    summonStartHour: 12,
    accent: '#3f9e57',
    tier: '进阶仙境',
    cultivationMin: 50,
    cultivationMax: 200,
    cycleDays: 3,
    growthRate: 6,
    summonCost: 0.5,
    cultivationCost: 0.5,
    lifeStage: '灵智初启',
    lifeDescription: '灵智初启，开始探索世界，形成最初的成长轨迹。',
    tagline: '花果为家，山林称王',
    lore: '花果山中，灵猴初识天地灵气。',
  },
  {
    id: 'wukong',
    realm: '水帘洞',
    realmEn: 'WATER-CURTAIN CAVE',
    name: '悟空',
    nameEn: 'WUKONG',
    isOpen: true,
    characterImage: '/assets/characters/wukong.png',
    realmCover: '/assets/realm-adult.webp',
    roomCover: '/assets/room-adult.png',
    cultivationAsset: 'adult',
    summonStartHour: 13,
    accent: '#3d7fd6',
    tier: '高阶仙境',
    cultivationMin: 200,
    cultivationMax: 500,
    cycleDays: 5,
    growthRate: 7,
    summonCost: 2.5,
    cultivationCost: 1,
    lifeStage: '修行初成',
    lifeDescription: '修行初成，力量与意识逐渐成熟，悟空之名初定。',
    tagline: '身披战甲，威震群猴',
    lore: '水帘洞深处，战甲加身，群猴俯首。',
  },
  {
    id: 'battle_wukong',
    realm: '斗战神境',
    realmEn: 'REALM OF BATTLE',
    name: '斗战悟空',
    nameEn: 'BATTLE WUKONG',
    isOpen: true,
  characterImage: '/assets/characters/battle_wukong.png',
  realmCover: '/assets/realms/battle_wukong.webp',
    roomCover: '/assets/room-king.png',
    cultivationAsset: 'monkeyking',
    summonStartHour: 14,
    accent: '#cf7d34',
    tier: '战阶仙境',
    cultivationMin: 500,
    cultivationMax: 1200,
    cycleDays: 8,
    growthRate: 11,
    summonCost: 5,
    cultivationCost: 2,
    lifeStage: '斗战四方',
    lifeDescription: '斗战四方，以战入道，战意淬炼出真正的力量。',
    tagline: '斗战不休，以战证道',
    lore: '斗战神境之中，每一战都是一次修行。',
  },
  {
    id: 'great_sage',
    realm: '齐天神境',
    realmEn: 'REALM OF THE GREAT SAGE',
    name: '齐天大圣',
    nameEn: 'GREAT SAGE',
    isOpen: true,
    characterImage: '/assets/characters/great_sage.png',
    realmCover: '/assets/realm-qitian.webp',
    roomCover: '/assets/room-sage.png',
    cultivationAsset: 'qitian',
    summonStartHour: 15,
    accent: '#f2b431',
    tier: '圣阶仙境',
    cultivationMin: 1200,
    cultivationMax: 2500,
    cycleDays: 12,
    growthRate: 15,
    summonCost: 25,
    cultivationCost: 5,
    lifeStage: '齐天称圣',
    lifeDescription: '齐天称圣，一棒撼天，名号响彻三界。',
    tagline: '齐天大圣，一棒撼天',
    lore: '一棒撼天，齐天之名响彻三界。',
  },
  {
    id: 'destiny_sage',
    realm: '天命神境',
    realmEn: 'REALM OF DESTINY',
    name: '天命大圣',
    nameEn: 'DESTINY SAGE',
    isOpen: true,
    characterImage: '/assets/characters/destiny_sage.png',
    realmCover: '/assets/realms/destiny_sage.webp',
    roomCover: '/assets/room-horse.png',
    cultivationAsset: 'bimawen',
    summonStartHour: 16,
    accent: '#c73838',
    tier: '天阶仙境',
    cultivationMin: 2500,
    cultivationMax: 5000,
    cycleDays: 15,
    growthRate: 18,
    summonCost: 50,
    cultivationCost: 10,
    lifeStage: '天命所归',
    lifeDescription: '天命所归，超越齐天，走向数字生命的完全觉醒。',
    tagline: '天命所归，万法归一',
    lore: '天命加身，万法归一，直面自身的最终答案。',
  },
  {
    id: 'infinite_sage',
    realm: '无极神境',
    realmEn: 'REALM OF THE INFINITE',
    name: '无极大圣',
    nameEn: 'INFINITE SAGE',
    // 正式版未开放，体验版开放；立绘暂借天命大圣
    isOpen: TRIAL_MODE,
    characterImage: '/assets/characters/infinite_sage.png',
    realmCover: '/assets/realms/infinite_sage.webp',
    roomCover: '/assets/room-sage.png',
    cultivationAsset: 'qitian',
    summonStartHour: 17,
    accent: '#9b8cff',
    tier: '无极仙境',
    cultivationMin: 5000,
    cultivationMax: 10000,
    cycleDays: 20,
    growthRate: 25,
    summonCost: 100,
    cultivationCost: 15,
    lifeStage: '无极之境',
    lifeDescription: '无极之境，超越天命，万象归一。',
    tagline: '无极大圣，万象归一',
    lore: '无极之境，万象归一。',
  },
]

const pad = (n: number) => `${String(n).padStart(2, '0')}:00`
/** 停止提交时刻 = 周期开始前 RESERVATION_CUTOFF_MINUTES 分钟 */
const stopTime = (startHour: number) => {
  const minutes = startHour * 60 - RESERVATION_CUTOFF_MINUTES
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}
const stageCost = (seed: StageSeed) => seed.summonCost + seed.cultivationCost * seed.cycleDays

export const WUKONG_CONFIG: WukongLevel[] = SEEDS.map((seed, order) => {
  // 结果公布（开始召唤匹配）时刻 = 周期开始整点
  const summonHour = seed.summonStartHour
  const paymentDeadline = pad(summonHour + PAYMENT_WINDOW_HOURS)
  return {
    ...seed,
    order,
    stars: order + 1,
    image: seed.characterImage,
    card: seed.characterImage,
    cultivationVideo: `/assets/cultivation/${seed.cultivationAsset}.mp4`,
    cultivationPoster: `/assets/cultivation/${seed.cultivationAsset}.jpg`,
    summonHour,
    summonStartTime: pad(seed.summonStartHour),
    summonEndTime: pad(seed.summonStartHour + 1),
    summonWindow: `${pad(seed.summonStartHour)}–${pad(seed.summonStartHour + 1)}`,
    summonStopTime: stopTime(seed.summonStartHour),
    paymentDeadline,
    paymentCutoff: paymentDeadline,
    rangeMin: seed.cultivationMin,
    rangeMax: seed.cultivationMax,
    cost: seed.cultivationMin,
    gainPct: seed.growthRate,
    perCycleCost: seed.cultivationCost,
    runDays: TRIAL_MODE ? TRIAL_CYCLE_DAYS : seed.cycleDays,
    cultivationCount: seed.cycleDays,
    lifecycleCost: stageCost(seed),
    cumulativeCost: SEEDS.slice(0, order + 1).reduce((sum, item) => sum + stageCost(item), 0),
  }
})

export const LEVELS = WUKONG_CONFIG
/** 周期文案：一律显示正式周期 */
export const cycleText = (level: Pick<WukongLevel, 'cycleDays'>) => `${level.cycleDays}天`
/** 本阶段蟠桃消耗 = 召唤 + 每日修炼 × 正式周期天数；体验版时间加速但消耗不变 */
export const runCost = (level: Pick<WukongLevel, 'lifecycleCost'>) => level.lifecycleCost
export const ALL_OPEN = WUKONG_CONFIG.every(level => level.isOpen)
export const OPEN_LEVELS = LEVELS.filter(level => level.isOpen)

export const LEVEL_BY_ID: Record<Stage, WukongLevel> = LEVELS.reduce(
  (acc, l) => {
    acc[l.id] = l
    return acc
  },
  {} as Record<Stage, WukongLevel>,
)

/** 七阶段全部完成的理论累计消耗（蟠桃） */
export const TOTAL_LIFECYCLE_COST = LEVELS.reduce((sum, level) => sum + level.lifecycleCost, 0)
/** 该阶段召唤与修炼均不消耗蟠桃 */
export const isFreeStage = (level: Pick<WukongLevel, 'lifecycleCost'>) => level.lifecycleCost === 0
export const MAX_STARS = LEVELS.length
export const starText = (stars: number) => '★'.repeat(stars) + '☆'.repeat(MAX_STARS - stars)

export const TAB_LABELS = {
  home: '首页',
  world: '悟空世界',
  house: '猴舍',
  me: '我的',
} as const
