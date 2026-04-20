let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function note(freq: number, start: number, dur: number, vol = 0.3, type: OscillatorType = 'square') {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime + start)
  gain.gain.setValueAtTime(vol, ac.currentTime + start)
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + dur + 0.01)
}

export const sounds = {
  roll() {
    for (let i = 0; i < 8; i++) {
      const freq = 100 + Math.random() * 400
      note(freq, i * 0.04, 0.05, 0.15, 'sawtooth')
    }
  },

  hold() {
    note(600, 0, 0.08, 0.2, 'square')
    note(900, 0.06, 0.08, 0.2, 'square')
  },

  score() {
    const melody = [523, 659, 784, 1047]
    melody.forEach((f, i) => note(f, i * 0.08, 0.12, 0.25, 'square'))
  },

  zero() {
    note(200, 0, 0.15, 0.25, 'sawtooth')
    note(150, 0.1, 0.2, 0.2, 'sawtooth')
  },

  yahtzee() {
    const melody = [523, 659, 784, 1047, 1047, 1175, 1319, 1568]
    melody.forEach((f, i) => note(f, i * 0.07, 0.15, 0.3, 'square'))
    // Add some harmony
    const harmony = [659, 784, 988, 1319, 1319, 1480, 1568, 1976]
    harmony.forEach((f, i) => note(f, i * 0.07, 0.15, 0.15, 'sawtooth'))
  },

  click() {
    note(800, 0, 0.04, 0.1, 'square')
  },

  gameover() {
    const melody = [523, 494, 440, 392, 349]
    melody.forEach((f, i) => note(f, i * 0.15, 0.2, 0.3, 'square'))
  },

  win() {
    const melody = [523, 659, 784, 1047, 784, 1047, 1319]
    melody.forEach((f, i) => note(f, i * 0.1, 0.15, 0.3, 'square'))
  },
}
