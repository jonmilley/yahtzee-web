import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getTurn } from '../store/turn'
import DiceTray from './DiceTray'
import TurnControls from './TurnControls'
import PlayersBar from './PlayersBar'
import ScorePad from './ScorePad'
import GameOver from './GameOver'
import MuteButton from './MuteButton'
import Credits from './Credits'
import Confetti from './Confetti'

export default function GameBoard() {
  const { round, phase, backToMenu } = useGameStore()
  const [burst, setBurst] = useState(0)
  const celebrate = useCallback(() => setBurst(b => b + 1), [])

  useKeyboardShortcuts()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div>
          <button type="button" onClick={backToMenu} className="btn-ghost text-sm">
            <span aria-hidden>←</span> Menu
          </button>
        </div>
        <div className="logo-text hidden -rotate-3 text-[2.3rem] leading-none sm:block" aria-hidden>
          Yahtzee
        </div>
        <div className="flex items-center justify-end gap-2 sm:gap-4">
          <RoundTracker round={round} />
          <MuteButton />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl items-start gap-6 px-4 pb-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-10">
        <h1 className="sr-only">Yahtzee, round {round} of 13</h1>
        <section aria-label="Dice and turn" className="flex flex-col gap-5 lg:sticky lg:top-6 lg:pt-2">
          <PlayersBar />
          <DiceTray onYahtzee={celebrate} />
          <TurnControls />
        </section>
        <ScorePad />
      </main>

      <div className="mt-auto">
        <Credits />
      </div>

      <Confetti burst={burst} />
      <AnimatePresence>{phase === 'gameover' && <GameOver />}</AnimatePresence>
    </div>
  )
}

function RoundTracker({ round }: { round: number }) {
  const shown = Math.min(round, 13)
  return (
    <div className="flex flex-col items-end gap-1" role="img" aria-label={`Round ${shown} of 13`}>
      <span className="whitespace-nowrap text-sm font-semibold leading-none">
        Round {shown} <span className="text-paper/55">of 13</span>
      </span>
      <span className="hidden gap-[3px] sm:flex">
        {Array.from({ length: 13 }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-2 rounded-[2px] ${
              i + 1 < shown ? 'bg-paper/75' : i + 1 === shown ? 'bg-marigold' : 'bg-paper/20'
            }`}
          />
        ))}
      </span>
    </div>
  )
}

// Space/Enter rolls or scores, 1–5 toggle holds. Focused buttons keep their own Space/Enter.
function useKeyboardShortcuts() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const target = e.target instanceof HTMLElement ? e.target : null
      if (target?.closest('input, textarea, select, [role="dialog"]')) return

      const s = useGameStore.getState()
      if (s.phase !== 'rolling') return
      const turn = getTurn(s)

      if (/^[1-5]$/.test(e.key)) {
        if (turn.canHold) s.toggleHold(Number(e.key) - 1)
        return
      }
      if (e.key === ' ' || e.key === 'Enter') {
        if (target?.closest('button, a')) return
        e.preventDefault()
        if (turn.primary.kind === 'roll') s.rollDice()
        else if (turn.primary.kind === 'score') s.scoreCategory()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
