// 纯 WebAudio 程序化音效引擎——不加载任何音频文件，靠振荡器 + 噪声 + 混响合成东方游戏音。
// 每个音效都是一段 (v: Voice) => void 的配方，实时合成。
// 关键：所有声音都经过一条混响总线，并带较长的释放尾音，避免"又干又短"的廉价感。

type Voice = { ctx: AudioContext; out: GainNode; wet: GainNode; t: number }

function env(ctx: AudioContext, param: AudioParam, t: number, a: number, peak: number, d: number, sustain = 0, s = 0) {
  param.cancelScheduledValues(t)
  param.setValueAtTime(0.0001, t)
  param.exponentialRampToValueAtTime(Math.max(peak, 0.0001), t + a)
  if (sustain > 0) {
    param.setValueAtTime(Math.max(peak, 0.0001), t + a)
    param.exponentialRampToValueAtTime(Math.max(s, 0.0001), t + a + sustain)
    param.exponentialRampToValueAtTime(0.0001, t + a + sustain + d)
  } else {
    param.exponentialRampToValueAtTime(0.0001, t + a + d)
  }
}

// 把一个声部同时送往干声总线与混响总线
function route(v: Voice, node: AudioNode, send: number, pan?: number) {
  const { ctx, out, wet } = v
  let tail: AudioNode = node
  if (pan !== undefined && ctx.createStereoPanner) {
    const p = ctx.createStereoPanner(); p.pan.value = pan
    node.connect(p); tail = p
  }
  tail.connect(out)
  if (send > 0) {
    const s = ctx.createGain(); s.gain.value = send
    tail.connect(s).connect(wet)
  }
}

// 单音：振荡器 + 可选缓慢颤音（vibrato）+ 增益包络
function tone(v: Voice, opts: {
  freq: number; type?: OscillatorType; at?: number; dur: number; peak?: number;
  attack?: number; glideTo?: number; detune?: number; pan?: number;
  vibrato?: number; vibratoRate?: number; send?: number; sustain?: number; s?: number;
}) {
  const { ctx } = v
  const t = v.t + (opts.at ?? 0)
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = opts.type ?? 'sine'
  osc.frequency.setValueAtTime(opts.freq, t)
  if (opts.glideTo) osc.frequency.exponentialRampToValueAtTime(opts.glideTo, t + opts.dur)
  if (opts.detune) osc.detune.setValueAtTime(opts.detune, t)
  // 颤音让长音"活"起来，不再是死板的电子正弦
  if (opts.vibrato) {
    const lfo = ctx.createOscillator(); const lfoGain = ctx.createGain()
    lfo.frequency.value = opts.vibratoRate ?? 5.5
    lfoGain.gain.value = opts.vibrato
    lfo.connect(lfoGain).connect(osc.frequency)
    lfo.start(t); lfo.stop(t + opts.dur + 0.3)
  }
  const attack = opts.attack ?? 0.006
  env(ctx, g.gain, t, attack, opts.peak ?? 0.3, opts.dur, opts.sustain ?? 0, opts.s ?? 0)
  osc.connect(g)
  route(v, g, opts.send ?? 0.35, opts.pan)
  osc.start(t)
  osc.stop(t + opts.dur + attack + (opts.sustain ?? 0) + 0.3)
}

// 噪声段：白噪声 + 带通/低通，用来做风、擦声、鼓皮、破空
function noise(v: Voice, opts: {
  at?: number; dur: number; peak?: number; attack?: number;
  type?: BiquadFilterType; freq?: number; q?: number; sweepTo?: number; send?: number; pan?: number;
}) {
  const { ctx } = v
  const t = v.t + (opts.at ?? 0)
  const len = Math.max(1, Math.floor(ctx.sampleRate * (opts.dur + 0.1)))
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource(); src.buffer = buf
  const filt = ctx.createBiquadFilter()
  filt.type = opts.type ?? 'bandpass'
  filt.frequency.setValueAtTime(opts.freq ?? 1200, t)
  if (opts.sweepTo) filt.frequency.exponentialRampToValueAtTime(opts.sweepTo, t + opts.dur)
  filt.Q.value = opts.q ?? 1
  const g = ctx.createGain()
  env(ctx, g.gain, t, opts.attack ?? 0.005, opts.peak ?? 0.2, opts.dur)
  src.connect(filt).connect(g)
  route(v, g, opts.send ?? 0.25, opts.pan)
  src.start(t); src.stop(t + opts.dur + 0.12)
}

// 低频鼓：正弦下滑 + 短噪声鼓皮
function drum(v: Voice, at: number, freq = 150, peak = 0.7) {
  tone(v, { at, freq, glideTo: freq * 0.4, type: 'sine', dur: 0.4, peak, attack: 0.002, send: 0.2 })
  noise(v, { at, dur: 0.09, peak: peak * 0.25, type: 'lowpass', freq: 900, attack: 0.001, send: 0.1 })
}

// 金属/钟：多泛音叠加 + 长尾混响
function bell(v: Voice, at: number, base: number, dur = 1.8, peak = 0.24, send = 0.55) {
  const partials = [1, 2.01, 2.76, 3.92, 5.4, 6.8]
  const gains = [1, 0.55, 0.38, 0.24, 0.15, 0.08]
  partials.forEach((p, i) => tone(v, {
    at, freq: base * p, type: 'sine', dur: dur * (1 - i * 0.1), peak: peak * gains[i], attack: 0.003, send,
  }))
}

// 拨弦/古筝：三角波快起慢落 + 少量二次谐波
function pluck(v: Voice, at: number, freq: number, dur = 0.9, peak = 0.2, pan?: number) {
  tone(v, { at, freq, type: 'triangle', dur, peak, attack: 0.004, send: 0.4, pan })
  tone(v, { at, freq: freq * 2, type: 'sine', dur: dur * 0.6, peak: peak * 0.3, attack: 0.004, send: 0.4, pan })
}

// 笛：正弦 + 气声 + 颤音
function flute(v: Voice, at: number, freq: number, dur = 0.5, peak = 0.18, pan?: number) {
  tone(v, { at, freq, type: 'sine', dur, peak, attack: 0.03, vibrato: freq * 0.012, vibratoRate: 6, send: 0.45, pan })
  noise(v, { at, dur: dur * 0.8, peak: peak * 0.12, type: 'bandpass', freq: freq * 2.2, q: 3, send: 0.3, pan })
}

// 铺底和弦垫（pad）：多音缓入缓出，撑起空间
function pad(v: Voice, at: number, freqs: number[], dur = 2.2, peak = 0.1) {
  freqs.forEach((f, i) => tone(v, {
    at, freq: f, type: 'sine', dur: dur * 0.5, peak, attack: 0.25,
    sustain: dur * 0.4, s: peak * 0.7, detune: (i - 1) * 4, vibrato: f * 0.006, vibratoRate: 4.5, send: 0.6,
  }))
}

// C 大调五声音阶几个常用音
const P = { C4: 261.6, D4: 293.7, E4: 329.6, G4: 392, A4: 440, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880, C6: 1046.5 }

export type SoundName =
  | 'tap' | 'nav' | 'summon' | 'breakthrough'
  | 'realm:stone_spirit' | 'realm:spirit_monkey' | 'realm:wukong'
  | 'realm:battle_wukong' | 'realm:great_sage' | 'realm:destiny_sage' | 'realm:infinite_sage'

const RECIPES: Record<SoundName, (v: Voice) => void> = {
  // ── UI ──
  tap: (v) => { pluck(v, 0, P.A5, 0.4, 0.12); tone(v, { freq: P.E5, type: 'sine', dur: 0.25, peak: 0.06, send: 0.5 }) },
  nav: (v) => {
    pluck(v, 0, P.G4, 0.5, 0.12, -0.15)
    pluck(v, 0.06, P.C5, 0.6, 0.1, 0.15)
    noise(v, { dur: 0.4, peak: 0.05, type: 'bandpass', freq: 700, sweepTo: 2000, q: 0.7, send: 0.3 })
  },

  // ── 召唤成功：大锣 + 上行五声琶音 + 金光炸裂 + 混响长尾 ──
  summon: (v) => {
    drum(v, 0, 96, 0.8)
    bell(v, 0.0, P.C4, 2.6, 0.26)
    bell(v, 0.02, P.G4, 2.2, 0.16)
    ;[P.C5, P.E5, P.G5, P.C6].forEach((f, i) => pluck(v, 0.12 + i * 0.1, f, 1.4, 0.18))
    pad(v, 0.1, [P.C4, P.E4, P.G4], 2.8, 0.08)
    noise(v, { at: 0.04, dur: 1.2, peak: 0.14, type: 'highpass', freq: 2600, sweepTo: 8000, q: 0.5, send: 0.5 })
    tone(v, { at: 0.04, freq: 300, type: 'sine', dur: 1.6, peak: 0.16, glideTo: 1200, send: 0.5 })
  },

  // ── 突破升阶：上行钟声音阶 + 和弦垫 + 光爆 ──
  breakthrough: (v) => {
    ;[P.C5, P.D5, P.E5, P.G5, P.C6].forEach((f, i) => bell(v, i * 0.14, f, 1.6, 0.2))
    pad(v, 0, [P.C4, P.G4, P.C5], 2.6, 0.09)
    noise(v, { at: 0.5, dur: 1.0, peak: 0.12, type: 'highpass', freq: 3000, sweepTo: 9000, send: 0.5 })
    drum(v, 0, 84, 0.5)
  },

  // ── 各仙境入场音（配合劈光/白闪/冲击波），都做成 1.5–2.6s 的乐句 ──
  // 石灵：清脆水滴 + 灵气钟 + 古筝点缀
  'realm:stone_spirit': (v) => {
    tone(v, { freq: 1500, type: 'sine', dur: 0.4, peak: 0.14, glideTo: 760, send: 0.6 })
    tone(v, { at: 0.16, freq: 2100, type: 'sine', dur: 0.4, peak: 0.1, glideTo: 1100, send: 0.6 })
    pluck(v, 0.28, P.A4, 1.2, 0.14)
    pluck(v, 0.42, P.C5, 1.4, 0.12)
    pad(v, 0.1, [P.C4, P.E4, P.G4], 2.2, 0.06)
    bell(v, 0.06, P.C5, 1.6, 0.09)
  },
  // 灵猴：竹笛上行短句 + 灵动
  'realm:spirit_monkey': (v) => {
    ;[P.G4, P.A4, P.C5, P.D5, P.E5].forEach((f, i) => flute(v, i * 0.11, f, 0.5, 0.16, i % 2 ? 0.2 : -0.2))
    pluck(v, 0.2, P.G4, 1.0, 0.1)
    pad(v, 0, [P.C4, P.G4], 1.8, 0.05)
  },
  // 悟空：鼓点 + 兵器出鞘"锵" + 五声动机
  'realm:wukong': (v) => {
    drum(v, 0, 150, 0.55)
    drum(v, 0.2, 120, 0.4)
    bell(v, 0.08, P.A5, 1.4, 0.2) // 出鞘的金属高频
    noise(v, { at: 0.08, dur: 0.5, peak: 0.16, type: 'highpass', freq: 3000, sweepTo: 6500, send: 0.5 })
    pluck(v, 0.24, P.E4, 1.2, 0.16)
    pluck(v, 0.36, P.G4, 1.2, 0.14)
    pad(v, 0.1, [P.C4, P.E4, P.G4], 2.0, 0.06)
  },
  // 斗战悟空：连击大鼓 + 战旗齐吼底 + 破空 + 号角
  'realm:battle_wukong': (v) => {
    drum(v, 0, 76, 0.95)
    drum(v, 0.15, 92, 0.75)
    drum(v, 0.3, 76, 0.7)
    tone(v, { at: 0, freq: 150, type: 'sawtooth', dur: 1.2, peak: 0.16, glideTo: 66, send: 0.4 }) // 号角低吼
    tone(v, { at: 0.08, freq: P.C4, type: 'sawtooth', dur: 1.0, peak: 0.12, glideTo: P.G4, send: 0.4 }) // 号角上扬
    noise(v, { at: 0.05, dur: 0.7, peak: 0.2, type: 'lowpass', freq: 1400, sweepTo: 500, send: 0.4 }) // 齐吼
    noise(v, { at: 0.34, dur: 0.32, peak: 0.2, type: 'bandpass', freq: 2200, sweepTo: 5200, q: 1.2, send: 0.4 }) // 破空
    bell(v, 0.36, P.C5, 1.6, 0.14)
  },
  // 齐天大圣：编钟长鸣 + 恢弘和弦垫 + 金光
  'realm:great_sage': (v) => {
    bell(v, 0, P.G4, 2.4, 0.26)
    bell(v, 0.14, P.D5, 2.0, 0.18)
    bell(v, 0.28, P.G5, 1.8, 0.12)
    pad(v, 0.02, [P.G4 / 2, P.D4, P.G4, P.C5], 2.8, 0.1)
    noise(v, { at: 0.25, dur: 1.2, peak: 0.07, type: 'highpass', freq: 4000, sweepTo: 9000, send: 0.5 })
  },
  // 天命大圣：颂钵 + 空灵人声"嗡" + 法铃 + 金光收束
  'realm:destiny_sage': (v) => {
    bell(v, 0, P.C5, 2.8, 0.22)
    pad(v, 0, [P.C4 / 2, P.C4, P.G4, P.C5], 3.0, 0.11) // 颂钵 + 人声嗡
    tone(v, { at: 0.05, freq: P.E4, type: 'sine', dur: 2.6, peak: 0.08, detune: 6, vibrato: 3, vibratoRate: 4, send: 0.6 })
    pluck(v, 0.5, P.G5, 1.6, 0.12)
    tone(v, { at: 0.7, freq: 800, type: 'sine', dur: 1.6, peak: 0.1, glideTo: 1800, send: 0.6 }) // 金光收束
    noise(v, { at: 0.5, dur: 1.6, peak: 0.05, type: 'highpass', freq: 5000, sweepTo: 11000, send: 0.5 })
  },
  // 无极大圣：低频宇宙回响 + 深空和弦 + 反色瞬间的遥远回响
  'realm:infinite_sage': (v) => {
    tone(v, { freq: 55, type: 'sine', dur: 3.0, peak: 0.26, glideTo: 42, send: 0.5 })
    tone(v, { at: 0.05, freq: 82, type: 'sine', dur: 2.8, peak: 0.14, detune: -8, send: 0.5 })
    pad(v, 0.1, [P.C4 / 2, P.G4 / 2, P.C4], 3.2, 0.09)
    drum(v, 0, 58, 0.8)
    noise(v, { at: 0.02, dur: 2.4, peak: 0.1, type: 'lowpass', freq: 400, sweepTo: 110, send: 0.4 })
    bell(v, 1.1, P.A4, 2.2, 0.1) // 反色后一声遥远回响
  },
}

// 生成一段柔和的混响脉冲响应（指数衰减噪声），给所有声音空间感
function makeReverbIR(ctx: AudioContext, seconds = 2.6, decay = 3.2) {
  const rate = ctx.sampleRate
  const len = Math.floor(rate * seconds)
  const ir = ctx.createBuffer(2, len, rate)
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
  }
  return ir
}

export class SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null // 干声总线
  private wet: GainNode | null = null    // 混响送入总线
  private _volume = 0.7
  private _muted = false

  get muted() { return this._muted }
  get volume() { return this._volume }

  private ensure() {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      this.ctx = new AC()
      const outGain = this.ctx.createGain()
      outGain.gain.value = this._muted ? 0 : this._volume
      outGain.connect(this.ctx.destination)

      // 干声直接进 outGain；湿声经卷积混响后再进 outGain
      this.master = this.ctx.createGain(); this.master.connect(outGain)
      const convolver = this.ctx.createConvolver()
      convolver.buffer = makeReverbIR(this.ctx)
      const wetGain = this.ctx.createGain(); wetGain.gain.value = 0.9
      this.wet = this.ctx.createGain()
      this.wet.connect(convolver).connect(wetGain).connect(outGain)

      // outGain 作为音量/静音控制点
      this._outGain = outGain
    }
    return this.ctx
  }

  private _outGain: GainNode | null = null

  // 浏览器要求首次用户手势后才能出声
  unlock() {
    const ctx = this.ensure()
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
  }

  setMuted(m: boolean) {
    this._muted = m
    if (this._outGain && this.ctx) this._outGain.gain.setTargetAtTime(m ? 0 : this._volume, this.ctx.currentTime, 0.02)
  }

  setVolume(vol: number) {
    this._volume = Math.max(0, Math.min(1, vol))
    if (this._outGain && this.ctx && !this._muted) this._outGain.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.02)
  }

  play(name: SoundName) {
    if (this._muted) return
    const ctx = this.ensure()
    if (!ctx || !this.master || !this.wet) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const recipe = RECIPES[name]
    if (!recipe) return
    recipe({ ctx, out: this.master, wet: this.wet, t: ctx.currentTime + 0.02 })
  }
}
