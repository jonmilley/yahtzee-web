let ctx: AudioContext | null = null
let noise: AudioBuffer | null = null

const MUTE_KEY = 'yahtzee.muted'
let muted = (() => {
  try { return localStorage.getItem(MUTE_KEY) === '1' } catch { return false }
})()

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function getNoise(ac: AudioContext): AudioBuffer {
  if (!noise) {
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return noise
}

function tone(freq: number, start: number, dur: number, vol = 0.2, type: OscillatorType = 'triangle', slideTo?: number) {
  const ac = getCtx()
  const t = ac.currentTime + start
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

// A short band-passed noise burst: sounds like a die knocking on wood or another die
function clack(start: number, freq: number, vol = 0.5, dur = 0.035, q = 6) {
  const ac = getCtx()
  const t = ac.currentTime + start
  const src = ac.createBufferSource()
  src.buffer = getNoise(ac)
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  filter.Q.value = q
  const gain = ac.createGain()
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)
  src.start(t, Math.random() * 0.5)
  src.stop(t + dur + 0.02)
}

function play(fn: () => void) {
  if (muted) return
  try { fn() } catch { /* audio unavailable */ }
}

export const sounds = {
  isMuted: () => muted,

  setMuted(value: boolean) {
    muted = value
    try { localStorage.setItem(MUTE_KEY, value ? '1' : '0') } catch { /* storage unavailable */ }
  },

  roll() {
    play(() => {
      // Rattle in the hand, then the dice hit the felt and settle
      let t = 0
      for (let i = 0; i < 9; i++) {
        t += 0.025 + Math.random() * 0.035
        clack(t, 2200 + Math.random() * 1800, 0.25 + Math.random() * 0.2)
      }
      const land = t + 0.12
      clack(land, 900, 0.7, 0.06, 2)
      for (let i = 0; i < 6; i++) {
        clack(land + 0.05 + i * (0.05 + Math.random() * 0.04), 1600 + Math.random() * 1600, 0.35 / (i + 1))
      }
    })
  },

  hold() {
    play(() => {
      clack(0, 1300, 0.6, 0.05, 3)
      tone(660, 0.01, 0.08, 0.06, 'sine')
    })
  },

  click() {
    play(() => clack(0, 2600, 0.35, 0.03, 4))
  },

  score() {
    play(() => {
      // Pen scratch, then a small chime
      for (let i = 0; i < 4; i++) clack(i * 0.035, 4200 + i * 300, 0.18, 0.04, 1.5)
      tone(784, 0.14, 0.25, 0.12)
      tone(1175, 0.2, 0.35, 0.1)
    })
  },

  zero() {
    play(() => {
      for (let i = 0; i < 3; i++) clack(i * 0.04, 3800, 0.15, 0.05, 1.5)
      tone(220, 0.1, 0.35, 0.16, 'triangle', 130)
    })
  },

  combo() {
    play(() => {
      tone(988, 0, 0.18, 0.1)
      tone(1319, 0.08, 0.3, 0.1)
    })
  },

  yahtzee() {
    play(() => {
      const notes = [523, 659, 784, 1047, 1319, 1568, 2093]
      notes.forEach((f, i) => tone(f, i * 0.07, 0.3, 0.13))
      notes.forEach((f, i) => tone(f * 2, i * 0.07 + 0.03, 0.15, 0.03, 'sine'))
      tone(1047, 0.55, 0.9, 0.12)
      tone(1568, 0.55, 0.9, 0.08)
    })
  },

  win() {
    play(() => {
      const notes = [523, 659, 784, 659, 784, 1047]
      notes.forEach((f, i) => tone(f, i * 0.11, 0.28, 0.13))
      tone(1319, 0.7, 0.8, 0.1)
    })
  },

  gameover() {
    play(() => {
      const notes = [523, 466, 415, 392]
      notes.forEach((f, i) => tone(f, i * 0.18, 0.32, 0.12))
    })
  },
}
