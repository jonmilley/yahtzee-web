import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getTurn, possessive } from '../store/turn'

export default function TurnControls() {
  const state = useGameStore()
  const { rollsLeft, aiThinking, pendingCategory, rollDice, scoreCategory } = state
  const { player, isCPU, canRoll, primary } = getTurn(state)
  if (!player) return null

  let status: string
  if (isCPU) status = aiThinking ? 'CPU is deciding what to keep…' : pendingCategory ? 'CPU picked a box.' : 'CPU is rolling…'
  else if (rollsLeft === 3) status = `${possessive(player.name)} turn. Roll the dice!`
  else if (rollsLeft === 0) status = 'Out of rolls. Pick a box on the score card.'
  else if (pendingCategory) status = 'Tap the box again or use the button to score it.'
  else status = 'Tap dice to hold them, then roll again or pick a box.'

  function onPrimary() {
    if (primary.kind === 'roll') rollDice()
    else if (primary.kind === 'score') scoreCategory()
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={status}
          aria-live="polite"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="min-h-[1.75rem] font-hand text-[1.35rem] leading-snug text-paper"
        >
          {status}
        </motion.p>
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3">
        <RollsLeft count={rollsLeft} />

        <button
          type="button"
          className="btn-chunky min-w-0 flex-1 sm:flex-none sm:min-w-[15rem]"
          onClick={onPrimary}
          onMouseDown={e => e.preventDefault()}
          disabled={primary.kind === 'wait'}
        >
          {primary.label}
        </button>

        {primary.kind === 'score' && canRoll && (
          <button
            type="button"
            className="btn-ghost"
            onClick={rollDice}
            onMouseDown={e => e.preventDefault()}
          >
            Roll again instead
          </button>
        )}
      </div>

      <p className="hidden text-[0.8rem] text-paper/55 sm:block">
        Keyboard: <Kbd>Space</Kbd> roll or score, <Kbd>1</Kbd>–<Kbd>5</Kbd> hold a die
      </p>
    </div>
  )
}

function RollsLeft({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`${count} ${count === 1 ? 'roll' : 'rolls'} left`} role="img">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-paper/60">Rolls</span>
      <span className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{ scale: i < count ? 1 : 0.8, opacity: i < count ? 1 : 0.3 }}
            className={`block h-4 w-4 rounded-[5px] ${i < count ? 'bg-marigold shadow-[0_2px_0_var(--color-marigold-deep)]' : 'bg-paper/40'}`}
          />
        ))}
      </span>
    </div>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-paper/30 bg-black/20 px-1.5 py-px font-ui text-[0.75rem] text-paper/80">
      {children}
    </kbd>
  )
}
