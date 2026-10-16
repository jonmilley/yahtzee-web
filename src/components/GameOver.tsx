import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { totalScore } from '../game/scoring'
import { sounds } from '../sounds/sounds'
import Confetti from './Confetti'

export default function GameOver() {
  const { players, mode, startGame, backToMenu } = useGameStore()
  const playAgainRef = useRef<HTMLButtonElement>(null)

  const scores = players.map(p => ({ ...p, total: totalScore(p.scoreCard) }))
  const sorted = [...scores].sort((a, b) => b.total - a.total)
  const winner = sorted[0]
  const tie = sorted.length > 1 && sorted[0].total === sorted[1].total
  const happyEnding = !tie && !winner.isAI

  const headline = tie ? 'It’s a tie!' : winner.name === 'You' ? 'You win!' : `${winner.name} wins!`

  useEffect(() => {
    playAgainRef.current?.focus()
    const t = setTimeout(() => (happyEnding ? sounds.win() : sounds.gameover()), 350)
    return () => clearTimeout(t)
  }, [happyEnding])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-[2px]"
    >
      <Confetti burst={happyEnding ? 1 : 0} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gameover-title"
        initial={{ scale: 0.85, y: 50, rotate: 3 }}
        animate={{ scale: 1, y: 0, rotate: -1 }}
        transition={{ type: 'spring', bounce: 0.4, delay: 0.15 }}
        className="paper w-full max-w-sm rounded-2xl px-7 pb-7 pt-6 text-center"
      >
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-print/55">Final score</p>
        <h2 id="gameover-title" className="mt-1 font-display text-[2.6rem] leading-tight">
          {headline}
        </h2>

        <ol className="mt-5 divide-y divide-print/15 border-y border-print/15">
          {sorted.map(p => {
            const top = !tie && p.id === winner.id
            return (
              <li key={p.id} className="flex items-center justify-between px-2 py-2.5">
                <span className={`text-lg ${top ? 'font-bold' : 'font-medium text-print/70'}`}>{p.name}</span>
                <span className="relative px-2">
                  {top && <span className="highlighter" />}
                  <span className="relative font-hand text-[2.2rem] leading-none text-ink">{p.total}</span>
                </span>
              </li>
            )
          })}
        </ol>

        <div className="mt-7 flex gap-3">
          <button type="button" onClick={backToMenu} className="btn-ghost">
            Main menu
          </button>
          <button
            ref={playAgainRef}
            type="button"
            onClick={() => startGame(mode, players.map(p => p.name))}
            className="btn-chunky flex-1"
          >
            Play again
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
