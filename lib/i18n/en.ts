import { CORE, CORE_PATTERNS } from './en-core'
import { STATE, STATE_PATTERNS } from './en-state'
import { PAGES, PAGES_PATTERNS } from './en-pages'
import { ME, ME_PATTERNS } from './en-me'
import { LORE, LORE_PATTERNS } from './en-lore'

/** 英文词典：键是页面上出现的中文原文（去掉首尾空格），值是英文。按英文玩家的习惯叫法，不逐字直译。 */
export const DICT: Record<string, string> = { ...CORE, ...STATE, ...PAGES, ...ME, ...LORE }
/** 带变量的句式：正则里的每个括号对应英文里的 $1、$2…；变量里的中文（如阶段名）会继续翻译。越具体的放越前面。 */
export const PATTERNS: [string, string | ((m: RegExpMatchArray) => string)][] = [...STATE_PATTERNS, ...PAGES_PATTERNS, ...ME_PATTERNS, ...LORE_PATTERNS, ...CORE_PATTERNS]
