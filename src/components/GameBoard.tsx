import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import DicePanel from './DicePanel'
import ScoreCard from './ScoreCard'
import GameOver from './GameOver'

export default function GameBoard() {
  const { players, round, message, phase, currentPlayerIdx, backToMenu } = useGameStore()

  return (
    <div className="min-h-screen bg-arcade-bg flex flex-col items-center">
      {/* Scanlines overlay */}
      <div className="pointer-events-none fixed inset-0 bg-scanlines opacity-10 z-50" />

      {/* Header */}
      <div className="w-full flex justify-between items-center px-6 py-3 border-b border-gray-800">
        <button
          onClick={backToMenu}
          className="font-pixel text-xs text-gray-500 hover:text-neon-pink transition-colors"
        >
          ← MENU
        </button>
        <div className="font-pixel text-neon-yellow text-sm tracking-widest">
          ROUND {round} / 13
        </div>
        <div className="font-pixel text-xs text-gray-500">
          {players[currentPlayerIdx]?.name ?? ''}
        </div>
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="font-pixel text-xs text-neon-green tracking-wider mt-4 h-5"
        >
          {message}
        </motion.div>
      </AnimatePresence>

      {/* Main layout */}
      <div className="flex items-start gap-6 mt-4 px-4 overflow-x-auto w-full justify-center">
        {players[0] && <ScoreCard player={players[0]} playerIdx={0} />}

        <DicePanel />

        {players[1] && <ScoreCard player={players[1]} playerIdx={1} />}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 pb-4 font-mono text-gray-700 text-xs text-center leading-relaxed">
        Welcome to Yahtzee, Brought to you by<br />
        Jonathan Milley, and Lori Hogan<br />
        <span className="text-gray-600">Converted from Java to React by Jonathan Milley and Claude Sonnet 4.6</span><br />
        <a
          href="/yahtzee.jar"
          download="yahtzee.jar"
          className="text-neon-pink/50 hover:text-neon-pink transition-colors mt-1 inline-block"
        >
          ↓ Download original Java version (v1.0)
        </a>
      </div>

      {/* Game Over overlay */}
      <AnimatePresence>
        {phase === 'gameover' && <GameOver />}
      </AnimatePresence>
    </div>
  )
}
