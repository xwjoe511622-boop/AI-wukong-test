// 从图片四边泛洪填充，把"画进图里"的灰白棋盘格背景抠成透明。
// 只吞掉低饱和、亮度落在棋盘两档（白 / 浅灰）的像素，遇到人物的有色边缘即停止。
const sharp = require('sharp')
const path = require('path')

const dir = path.join(__dirname, '..', 'public', 'assets', 'characters')
const targets = process.argv.slice(2)

const isChecker = (r, g, b) => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  return max - min <= 14 && min >= 175
}

async function strip(name) {
  const input = path.join(dir, `${name}.raw.png`)
  const output = path.join(dir, `${name}.png`)
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  // 连通域：所有棋盘色像素分组；同时含白格与灰格且面积够大的区域才判定为背景，
  // 这样人物身上小面积的中性白高光不会被误删，而被手臂/飘带围出的封闭背景口袋也能一并抠掉。
  const visited = new Uint8Array(w * h)
  let removed = 0
  const stack = []
  for (let start = 0; start < w * h; start++) {
    if (visited[start]) continue
    const si = start * 4
    if (!isChecker(data[si], data[si + 1], data[si + 2])) { visited[start] = 1; continue }
    const region = []
    let light = 0, dark = 0, touchesEdge = false
    visited[start] = 1; stack.push(start)
    while (stack.length) {
      const p = stack.pop()
      const i = p * 4, x = p % w, y = (p - x) / w
      if (!isChecker(data[i], data[i + 1], data[i + 2])) continue
      region.push(p)
      if (Math.min(data[i], data[i + 1], data[i + 2]) >= 238) light++; else dark++
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) touchesEdge = true
      for (const q of [p + 1, p - 1, p + w, p - w]) {
        if (q < 0 || q >= w * h) continue
        if ((q === p + 1 && x === w - 1) || (q === p - 1 && x === 0)) continue
        if (!visited[q]) { visited[q] = 1; stack.push(q) }
      }
    }
    const twoTone = light > 20 && dark > 20
    if (touchesEdge || (twoTone && region.length >= 300)) { for (const p of region) data[p * 4 + 3] = 0; removed += region.length }
  }
  // 轻微收边：与透明区相邻的像素做半透明过渡，避免锯齿白边
  const out = Buffer.from(data)
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = (y * w + x) * 4
    if (data[i + 3] === 0) continue
    let t = 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (data[((y + dy) * w + x + dx) * 4 + 3] === 0) t++
    if (t) out[i + 3] = Math.round(255 * (1 - t / 6))
  }
  await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(output)
  console.log(`${name}: ${w}x${h}, removed ${(removed / (w * h) * 100).toFixed(1)}% pixels`)
}

Promise.all(targets.map(strip)).catch(e => { console.error(e); process.exit(1) })
