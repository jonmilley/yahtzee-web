import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Die from './Die'
import { useGameStore } from '../store/gameStore'
import { getTurn } from '../store/turn'
import { detectCombo } from '../game/scoring'
import type { CategoryId } from '../game/types'
import { sounds } from '../sounds/sounds'

const CALLOUT: Partial<Record<CategoryId, string>> = {
  yahtzee: 'Yahtzee!',
  largeStraight: 'Large straight!',
  fullHouse: 'Full house!',
  fourOfAKind: 'Four of a kind!',
  smallStraight: 'Small straight!',
}

export default function DiceTray({ onYahtzee }: { onYahtzee: () => void }) {
  const state = useGameStore()
  const { dice, rollId, toggleHold } = state
  const { canHold } = getTurn(state)
  const [callout, setCallout] = useState<{ rollId: number; text: string } | null>(null)

  const unrolled = dice.every(d => d.value === 0)

  // Once the dice land, call out anything worth celebrating
  useEffect(() => {
    if (!rollId) return
    const { dice, players, currentPlayerIdx } = useGameStore.getState()
    const combo = detectCombo(dice)
    if (!combo) return
    const stillOpen = players[currentPlayerIdx]?.scoreCard[combo] === undefined
    if (combo !== 'yahtzee' && !stillOpen) return

    const show = setTimeout(() => {
      setCallout({ rollId, text: CALLOUT[combo]! })
      if (combo === 'yahtzee') {
        sounds.yahtzee()
        onYahtzee()
      } else {
        sounds.combo()
      }
    }, 800)
    const hide = setTimeout(() => setCallout(null), 2600)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [rollId, onYahtzee])

  const showCallout = callout && callout.rollId === rollId && !unrolled

  return (
    <div className="tray">
      <div className="tray-felt flex h-[13.5rem] items-center justify-center gap-[calc(var(--die)*0.22)] px-3 [--die:3.25rem] min-[420px]:[--die:3.75rem] sm:h-[15.5rem] sm:[--die:4.4rem] xl:h-[17rem] xl:[--die:5rem]">
        {unrolled
          ? dice.map(d => <span key={d.id} className="ghost-slot" aria-hidden />)
          : dice.map((d, i) => (
              <Die
                key={d.id}
                value={d.value}
                rollId={rollId}
                held={d.held}
                disabled={!canHold}
                label={`Die ${i + 1} showing ${d.value}${d.held ? ', held' : ''}`}
                pressed={d.held}
                onClick={() => toggleHold(d.id)}
              />
            ))}

        <AnimatePresence>
          {showCallout && (
            <motion.div
              key={callout.rollId}
              role="status"
              className="pointer-events-none absolute inset-x-0 top-3 text-center sm:top-4"
              initial={{ opacity: 0, scale: 2, rotate: -14 }}
              animate={{ opacity: 1, scale: 1, rotate: -5 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            >
              <span className="stamp-text text-[2rem] leading-none sm:text-[2.5rem]">{callout.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
