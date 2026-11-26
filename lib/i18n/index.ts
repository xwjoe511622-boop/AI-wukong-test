/**
 * 双语：中文是唯一的原文，英文由这里统一翻译。
 * 页面和数据层照常只写中文；切到英文时，由 components/lang-provider 把页面上出现的中文文字
 * 按这里的词典和句式换成英文。这样通知、资产明细等已经存下来的中文记录也能跟着切换。
 *
 * 查找顺序：整句词典 → 句式（带变量的句子）→ 按标点拆成小句分别翻译。
 * 新增或修改了中文文案后，运行 `node scripts/i18n-check.cjs` 会列出还没有英文的句子。
 */
import { DICT, PATTERNS } from './en'

export type Lang = 'zh' | 'en'
export const LANG_KEY = 'wukong-lang'
/** 含有中文字或中文标点 */
export const HAS_ZH = /[　-〿一-鿿＀-￯·]/
const HAS_HAN = /[一-鿿]/

export function detectLang(): Lang {
  if (typeof window === 'undefined') return 'zh'
  try { const saved = localStorage.getItem(LANG_KEY); if (saved === 'zh' || saved === 'en') return saved } catch {}
  return (navigator.language || 'zh').toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const PUNCT: Record<string, string> = { '，': ', ', '。': '. ', '：': ': ', '；': '; ', '（': ' (', '）': ') ', '「': '"', '」': '"', '、': ', ', '！': '!', '？': '?', '～': '~', '—': '—', '《': '"', '》': '"', '　': ' ' }
const punct = (text: string) => text.replace(/[，。：；（）「」、！？～《》　]/g, ch => PUNCT[ch] ?? ch).replace(/ +([,.;:!?)])/g, '$1').replace(/\( /g, '(').replace(/ {2,}/g, ' ')

const compiled: [RegExp, string | ((m: RegExpMatchArray) => string)][] = PATTERNS.map(([source, out]) => [new RegExp(`^${source}$`), out])
const cache = new Map<string, string>()

function core(text: string, depth: number): string {
  if (!HAS_HAN.test(text)) return punct(text)
  const hit = DICT[text]
  if (hit !== undefined) return hit
  for (const [re, out] of compiled) {
    const m = text.match(re)
    if (!m) continue
    if (typeof out === 'function') return out(m)
    // $1、$2… 里如果还有中文（比如阶段名），继续翻译
    return out.replace(/\$(\d)/g, (_, i) => depth < 4 ? one(m[Number(i)] ?? '', depth + 1) : m[Number(i)] ?? '')
  }
  if (depth >= 4) return text
  // 拆成小句分别翻译：先按句号、分号，再按间隔号、逗号、顿号
  for (const sep of [/([。；\n])/, /( · |：|，)/, /(、|（|）| ｜ |｜| \/ )/]) {
    const parts = text.split(sep)
    if (parts.length < 2) continue
    return parts.map(part => part === '' ? '' : sep.test(part) && part.length <= 3 ? (part === ' · ' ? ' · ' : part === '\n' ? '\n' : punct(part)) : one(part, depth + 1)).join('')
  }
  return text
}
function one(text: string, depth = 0): string {
  const lead = text.match(/^\s*/)![0], tail = text.match(/\s*$/)![0]
  const body = text.slice(lead.length, text.length - tail.length)
  if (!body) return text
  return lead + core(body, depth) + tail
}
/** 把一段中文翻成英文；没有对应英文的部分原样保留 */
export function translate(text: string): string {
  if (!HAS_ZH.test(text)) return text
  let out = cache.get(text)
  if (out === undefined) { out = one(text).replace(/ {2,}/g, ' '); if (cache.size < 5000) cache.set(text, out) }
  return out
}
/** 翻译后是否还残留中文字（用于检查词典有没有漏） */
export const untranslated = (text: string) => HAS_HAN.test(translate(text))
