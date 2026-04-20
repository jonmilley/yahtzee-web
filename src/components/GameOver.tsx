import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { totalScore } from '../game/scoring'
import { sounds } from '../sounds/sounds'
import { useEffect } from 'react'

export default function GameOver() {
  const { players, mode, startGame, backToMenu } = useGameStore()
  const names = players.map(p => p.name)

  const scores = players.map(p => ({ ...p, total: totalScore(p.scoreCard) }))
  const sorted = [...scores].sort((a, b) => b.total - a.total)
  const winner = sorted[0]
  const tie = sorted.length > 1 && sorted[0].total === sorted[1].total

  useEffect(() => {
    setTimeout(() => sounds.win(), 300)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-40"
    >
      <motion.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="bg-arcade-panel border-2 border-neon-yellow shadow-[0_0_40px_rgba(255,230,0,0.4)] rounded-xl p-10 text-center max-w-sm w-full"
      >
        <div className="font-pixel text-neon-yellow text-lg mb-1 tracking-widest">GAME OVER</div>

        {tie ? (
          <div className="font-pixel text-neon-green text-sm mt-2">IT'S A TIE!</div>
        ) : (
          <div className="font-pixel text-neon-green text-sm mt-2">
            {winner.name} WINS!
          </div>
        )}

        <div className="mt-6 space-y-2">
          {sorted.map(p => (
            <div key={p.id} className="flex justify-between font-mono text-sm px-4">
              <span className={p.id === winner.id && !tie ? 'text-neon-yellow' : 'text-gray-400'}>
                {p.name}
              </span>
              <span className={p.id === winner.id && !tie ? 'text-neon-green font-bold' : 'text-gray-400'}>
                {p.total}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8 justify-center">
          <button
            onClick={() => startGame(mode as 'solo' | 'local2p', names)}
            className="px-6 py-2 font-pixel text-xs bg-neon-pink text-black rounded
              shadow-[0_0_12px_#ff2d78] hover:shadow-[0_0_20px_#ff2d78] transition-all"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={backToMenu}
            className="px-6 py-2 font-pixel text-xs bg-gray-700 text-gray-300 rounded
              hover:bg-gray-600 transition-all"
          >
            MENU
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
