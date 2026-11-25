// 测试默认按正式参数运行；体验版测试在引入本文件前自行设为 '1'
process.env.NEXT_PUBLIC_WUKONG_TRIAL ??= '0'
const fs = require('node:fs')
const ts = require('typescript')
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8')
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename)
}
