// 列出源码里还没有英文的中文文案。用法：node scripts/i18n-check.cjs [文件或目录…]（默认 components app lib）
require('./register-typescript.cjs')
const ts = require('typescript'), fs = require('fs'), path = require('path')
const { untranslated } = require('../lib/i18n/index.ts')
const HAN = /[一-鿿]/
const roots = process.argv.slice(2).filter(a => !a.startsWith('--'))
const files = []
const walk = p => { const st = fs.statSync(p); if (st.isDirectory()) { if (/node_modules|\.next|i18n|\.preview/.test(p)) return; for (const f of fs.readdirSync(p)) walk(path.join(p, f)) } else if (/\.tsx?$/.test(p) && !/\.d\.ts$/.test(p)) files.push(p) }
for (const r of roots.length ? roots : ['components', 'app', 'lib']) walk(r)
// 这些文件不产生用户能看到的文字，或已不再使用
const SKIP = /components\/(player-records|summon-view|monkey-card|inherit-complete)\.|lib\/(db|schema|game-service|profile-service|sound-engine|server|auth|rate|use-now|utils)|app\/api\/|scripts\//
const out = new Map()
// 模板里的变量用 § 表示；换成几种常见的值试一下，有一种能翻译就算有英文
const miss = t => !t.includes('§') ? untranslated(t) : ['1', '悟空', '', '11:00'].every(v => untranslated(t.split('§').join(v).trim()))
const add = (text, file) => { const t = text.replace(/\s+/g, ' ').trim(); if (t && HAN.test(t) && miss(t) && !out.has(t)) out.set(t, file) }
for (const file of files) {
  if (SKIP.test(file)) continue
  const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const visit = node => {
    const p = node.parent
    if ((ts.isJsxElement(node) || ts.isJsxFragment(node)) && node.children.length > 1 && node.children.every(c => ts.isJsxText(c) || ts.isJsxExpression(c)) && ts.isJsxElement(node)) {
      // 一句话被变量拆成几段：页面上会合成整句翻译
      add(node.children.map(c => ts.isJsxText(c) ? (c.containsOnlyTriviaWhiteSpaces ? '' : c.text.replace(/\s*\n\s*/g, '')) : c.expression ? '§' : '').join(''), file)
      node.children.forEach(c => { if (ts.isJsxExpression(c)) visit(c) })
      return
    }
    if (ts.isJsxText(node)) add(node.text, file)
    else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const skip = !p || ts.isImportDeclaration(p) || ts.isLiteralTypeNode(p) || (ts.isBinaryExpression(p) && /===|!==|==|!=/.test(p.operatorToken.getText())) || ts.isCaseClause(p) || (ts.isPropertyAssignment(p) && p.name === node) || ts.isElementAccessExpression(p) || (ts.isJsxAttribute(p) && /^(className|href|src|id|key|type|role)$/.test(p.name.getText())) || (ts.isCallExpression(p) && /^(throw|Error|includes|startsWith|console)/.test(p.expression.getText().split('.').pop()))|| ts.isNewExpression(p)
      if (!skip) add(node.text, file)
    } else if (ts.isTemplateExpression(node)) {
      if (!(p && ts.isNewExpression(p)) && !(p && ts.isJsxAttribute(p) && /^(className)$/.test(p.name.getText()))) add(node.head.text + node.templateSpans.map(s => '§' + s.literal.text).join(''), file)
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
}
const list = [...out.entries()]
if (process.argv.includes('--count')) { const by = {}; for (const [, f] of list) by[f] = (by[f] || 0) + 1; console.log(Object.entries(by).sort((a, b) => b[1] - a[1]).map(([f, n]) => `${n}\t${f}`).join('\n')); console.log('total', list.length); process.exit(0) }
for (const [t, f] of list) console.log(process.argv.includes('--files') ? `${f}\t${t}` : t)
if (list.length) console.error(`\n还有 ${list.length} 句没有英文`)
