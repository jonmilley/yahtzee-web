import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { sounds } from '../sounds/sounds'
import WelcomeDialog from './WelcomeDialog'
import MuteButton from './MuteButton'
import Credits from './Credits'
import Die from './Die'
import Confetti from './Confetti'

type NamingState = { mode: 'solo' | 'local2p'; names: string[] } | null

const NOTE_KEY = 'yahtzee.seenNote'

function hasSeenNote() {
  try { return localStorage.getItem(NOTE_KEY) === '1' } catch { return false }
}

export default function Menu() {
  const { startGame } = useGameStore()
  const [naming, setNaming] = useState<NamingState>(null)
  const [showNote, setShowNote] = useState(() => !hasSeenNote())
  const [dice, setDice] = useState({ values: [6, 6, 6, 6, 6], rollId: 1 })
  const [burst, setBurst] = useState(0)

  function closeNote() {
    sounds.click()
    setShowNote(false)
    try { localStorage.setItem(NOTE_KEY, '1') } catch { /* storage unavailable */ }
  }

  function rollMenuDice() {
    const values = dice.values.map(() => Math.floor(Math.random() * 6) + 1)
    setDice({ values, rollId: dice.rollId + 1 })
    sounds.roll()
    if (values.every(v => v === values[0])) {
      setTimeout(() => {
        sounds.yahtzee()
        setBurst(b => b + 1)
      }, 850)
    }
  }

  function openNaming(mode: 'solo' | 'local2p') {
    sounds.click()
    setNaming({ mode, names: mode === 'solo' ? [''] : ['', ''] })
  }

  function launch() {
    if (!naming) return
    sounds.click()
    startGame(naming.mode, naming.names)
  }

  function setName(idx: number, val: string) {
    setNaming(prev => {
      if (!prev) return prev
      const names = [...prev.names]
      names[idx] = val
      return { ...prev, names }
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex justify-end px-4 pt-3 sm:px-6">
        <MuteButton />
      </div>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -30, rotate: -10 }}
          animate={{ opacity: 1, y: 0, rotate: -4 }}
          transition={{ type: 'spring', bounce: 0.45, duration: 0.9 }}
          className="logo-text text-[clamp(4rem,15vw,7.5rem)] leading-[0.9]"
        >
          Yahtzee
        </motion.h1>

        <div className="tray mt-9 w-full max-w-lg">
          <div className="tray-felt flex h-[10.5rem] items-center justify-center gap-[calc(var(--die)*0.25)] [--die:3.25rem] min-[420px]:[--die:3.75rem] sm:h-[12rem] sm:[--die:4.25rem]">
            {dice.values.map((v, i) => (
              <Die key={i} value={v} rollId={dice.rollId} label="Roll the dice" onClick={rollMenuDice} />
            ))}
          </div>
        </div>
        <p className="mt-3 -rotate-1 font-hand text-[1.35rem] text-marigold">Tap the dice to give them a roll</p>

        <div className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => openNaming('solo')} className="btn-chunky flex-1 flex-col gap-0.5 py-4">
            <span className="text-[1.15rem]">Play the computer</span>
            <span className="text-[0.8rem] font-medium opacity-70">You against the CPU</span>
          </button>
          <button type="button" onClick={() => openNaming('local2p')} className="btn-chunky btn-paper flex-1 flex-col gap-0.5 py-4">
            <span className="text-[1.15rem]">Pass and play</span>
            <span className="text-[0.8rem] font-medium opacity-70">2 players, one device</span>
          </button>
        </div>

        <p className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-paper/75">
          Roll five dice up to three times a turn and hold the ones you want to keep. Fill all 13 boxes on
          your score card. Highest total wins.
        </p>
        <button
          type="button"
          onClick={() => { sounds.click(); setShowNote(true) }}
          className="mt-3 cursor-pointer text-[0.9rem] text-paper/70 underline decoration-paper/30 underline-offset-2 hover:text-marigold hover:decoration-marigold"
        >
          Read the note from the original 1.0
        </button>
      </main>

      <Credits />
      <Confetti burst={burst} />

      <AnimatePresence>{showNote && <WelcomeDialog onClose={closeNote} />}</AnimatePresence>

      <AnimatePresence>
        {naming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-4 backdrop-blur-[2px]"
            onClick={e => { if (e.target === e.currentTarget) setNaming(null) }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="naming-title"
              onKeyDown={e => { if (e.key === 'Escape') setNaming(null) }}
              initial={{ scale: 0.9, y: 30, rotate: 2 }}
              animate={{ scale: 1, y: 0, rotate: -1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="paper w-full max-w-sm rounded-2xl p-7 text-left"
            >
              <h2 id="naming-title" className="font-display text-[2rem] leading-tight">
                {naming.mode === 'solo' ? 'What’s your name?' : 'Who’s playing?'}
              </h2>
              <p className="mt-1 text-[0.9rem] text-print/65">
                {naming.mode === 'solo' ? 'It goes at the top of your score card.' : 'Player 1 rolls first.'}
              </p>

              <form onSubmit={e => { e.preventDefault(); launch() }} className="mt-5 flex flex-col gap-5">
                {naming.names.map((name, i) => (
                  <label key={i} className="flex flex-col gap-1">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-print/60">
                      {naming.mode === 'solo' ? 'Your name' : `Player ${i + 1}`}
                    </span>
                    <input
                      type="text"
                      value={name}
                      placeholder={naming.mode === 'solo' ? 'You' : `Player ${i + 1}`}
                      maxLength={16}
                      autoFocus={i === 0}
                      onChange={e => setName(i, e.target.value)}
                      className="border-b-2 border-print/30 bg-transparent py-1 font-hand text-[1.7rem] leading-tight text-ink outline-none transition-colors placeholder:text-pencil/50 focus:border-ink focus-visible:outline-none"
                    />
                  </label>
                ))}

                <div className="mt-2 flex gap-3">
                  <button type="button" onClick={() => setNaming(null)} className="btn-ghost">
                    Back
                  </button>
                  <button type="submit" className="btn-chunky flex-1">
                    Start game
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
