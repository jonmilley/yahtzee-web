import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { totalScore } from '../game/scoring'

export default function PlayersBar() {
  const { players, currentPlayerIdx, phase } = useGameStore()

  return (
    <div className="grid grid-cols-2 gap-3">
      {players.map((p, i) => {
        const active = i === currentPlayerIdx && phase === 'rolling'
        const total = totalScore(p.scoreCard)
        return (
          <div
            key={p.id}
            className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 transition-colors ${
              active ? 'bg-black/30 ring-2 ring-marigold' : 'bg-black/15'
            }`}
          >
            <div className="min-w-0">
              <div
                className={`flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${
                  active ? 'text-marigold' : 'text-paper/50'
                }`}
              >
                {active && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-marigold" />}
                {active ? 'Playing' : 'Next'}
              </div>
              <div className="truncate text-lg font-semibold leading-tight">{p.name}</div>
            </div>
            <div className="relative h-9 min-w-[2.5ch] overflow-hidden text-right">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={total}
                  initial={{ y: 22, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -22, opacity: 0 }}
                  className="block font-hand text-[2rem] leading-9"
                >
                  {total}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  )
}
