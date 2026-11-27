'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { Globe } from 'lucide-react'
import { HAS_ZH, LANG_KEY, detectLang, translate, type Lang } from '@/lib/i18n'

const Context = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({ lang: 'zh', setLang: () => {} })
export const useLang = () => useContext(Context)

const ATTRS = ['placeholder', 'aria-label', 'title', 'alt']
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'TEXTAREA', 'NOSCRIPT'])

/**
 * 英文模式：页面上出现的中文文字（含之后动态出现的）统一换成英文。
 * 中文是原文，所以切回中文时直接刷新页面即可恢复。
 * 不想被翻译的内容（钱包地址、书法装饰等）包在带 data-no-i18n 的元素里。
 */
function startTranslating() {
  // source：每个文字节点的中文原文；written：我们写进去的英文。节点内容和 written 不一致，说明页面更新了原文
  const source = new WeakMap<Node, string>(), written = new WeakMap<Node, string>()
  const skip = (node: Node | null) => { for (let el = node instanceof Element ? node : node?.parentElement ?? null; el; el = el.parentElement) if (SKIP_TAGS.has(el.tagName) || el.hasAttribute('data-no-i18n')) return true; return false }
  const read = (node: Text) => { if (written.get(node) !== node.data) source.set(node, node.data); return source.get(node) ?? node.data }
  const write = (node: Text, out: string) => { written.set(node, out); if (node.data !== out) node.data = out }
  const text = (node: Text) => {
    const parent = node.parentNode
    if (!parent || written.get(node) === node.data) return
    // 「文字 + 数字 + 文字」这样被拆成几段的一句话：合起来整句翻译，英文写进第一段，其余留空
    const group: Text[] = []
    let whole = parent.childNodes.length > 1
    if (whole) for (const child of parent.childNodes) { if (child.nodeType === Node.TEXT_NODE) group.push(child as Text); else if (child.nodeType !== Node.COMMENT_NODE) { whole = false; break } }
    if (whole && group.length > 1) {
      const joined = group.map(read).join('')
      if (!HAS_ZH.test(joined) || skip(node)) return
      const out = translate(joined)
      if (out === joined) return
      group.forEach((item, i) => write(item, i ? '' : out))
      return
    }
    const now = read(node)
    if (!HAS_ZH.test(now) || skip(node)) return
    const out = translate(now)
    if (out !== now) write(node, out)
  }
  const attrs = (el: Element) => { for (const name of ATTRS) { const v = el.getAttribute(name); if (v && HAS_ZH.test(v) && !skip(el)) { const out = translate(v); if (out !== v) el.setAttribute(name, out) } } }
  const walk = (root: Node) => {
    if (root.nodeType === Node.TEXT_NODE) return text(root as Text)
    if (!(root instanceof Element)) return
    attrs(root)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) n.nodeType === Node.TEXT_NODE ? text(n as Text) : attrs(n as Element)
  }
  walk(document.body)
  if (HAS_ZH.test(document.title)) document.title = translate(document.title)
  const observer = new MutationObserver(list => {
    for (const m of list) {
      if (m.type === 'characterData') text(m.target as Text)
      else if (m.type === 'attributes') attrs(m.target as Element)
      else m.addedNodes.forEach(walk)
    }
  })
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS })
  return () => observer.disconnect()
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>('zh')
  useEffect(() => {
    const current = detectLang()
    set(current)
    document.documentElement.lang = current === 'en' ? 'en' : 'zh-CN'
    if (current === 'en') return startTranslating()
  }, [])
  const setLang = useCallback((next: Lang) => {
    try { localStorage.setItem(LANG_KEY, next); sessionStorage.setItem('wukong-skip-opening', '1') } catch {}
    // 中文是原文：切换语言时刷新一次，最干净
    location.reload()
  }, [])
  return <Context.Provider value={{ lang, setLang }}>{children}</Context.Provider>
}

/** 语言切换：和钱包、铃铛同款的圆形图标按钮，点一下在中文和英文之间切换 */
export function LangSwitch({ label = false }: { label?: boolean }) {
  const { lang, setLang } = useLang()
  const button = <button type="button" data-no-i18n onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'} className="notice-bell lang-icon"><Globe className="size-[18px]" aria-hidden /></button>
  return label ? <span data-no-i18n className="flex items-center gap-2.5 text-sm text-[var(--gold-100)]">{lang === 'zh' ? '中文' : 'English'}{button}</span> : button
}
