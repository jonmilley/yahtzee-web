import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import type { Player } from '../game/types'
import { totalScore } from '../game/scoring'
import DicePanel from './DicePanel'
import ScoreCard from './ScoreCard'
import GameOver from './GameOver'

export default function GameBoard() {
  const { players, round, message, phase, currentPlayerIdx, mode, backToMenu } = useGameStore()
  const isScoreAttack = mode === 'scoreattack'

  return (
    <div className="min-h-screen bg-arcade-bg flex flex-col items-center">
      {/* Scanlines overlay */}
      <div className="pointer-events-none fixed inset-0 bg-scanlines opacity-10 z-50" />

      {/* Header */}
      <div className="w-full flex justify-between items-center px-4 py-3 border-b border-gray-800">
        <button
          onClick={backToMenu}
          className="font-pixel text-xs text-gray-500 hover:text-neon-pink transition-colors"
        >
          ← MENU
        </button>
        <div className="flex items-center gap-2">
          {isScoreAttack && (
            <span className="font-pixel text-[8px] text-[#00d4ff] tracking-widest hidden sm:inline">
              SCORE ATTACK
            </span>
          )}
          <div className="font-pixel text-neon-yellow text-xs sm:text-sm tracking-widest">
            ROUND {round} / 13
          </div>
        </div>
        <div className="font-pixel text-[10px] text-gray-500 truncate max-w-[80px] sm:max-w-none">
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
          className="font-pixel text-[10px] sm:text-xs text-neon-green tracking-wider mt-3 h-5 px-2 text-center"
        >
          {message}
        </motion.div>
      </AnimatePresence>

      {/* ── MOBILE layout (< md) ── */}
      <div className="flex flex-col items-center gap-4 w-full px-3 mt-2 md:hidden">
        <DicePanel />
        {isScoreAttack ? (
          <div className="w-full max-w-sm">
            {players[0] && <ScoreCard player={players[0]} playerIdx={0} fullWidth />}
          </div>
        ) : (
          <MobileScoreCards players={players} currentPlayerIdx={currentPlayerIdx} />
        )}
      </div>

      {/* ── DESKTOP layout (≥ md) ── */}
      {isScoreAttack ? (
        <div className="hidden md:flex items-start gap-6 mt-4 px-4 justify-center">
          {players[0] && <ScoreCard player={players[0]} playerIdx={0} />}
          <DicePanel />
        </div>
      ) : (
        <div className="hidden md:flex items-start gap-6 mt-4 px-4 overflow-x-auto w-full justify-center">
          {players[0] && <ScoreCard player={players[0]} playerIdx={0} />}
          <DicePanel />
          {players[1] && <ScoreCard player={players[1]} playerIdx={1} />}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-6 pb-4 font-mono text-gray-700 text-xs text-center leading-relaxed px-4">
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

// ── Mobile tabbed score cards ──────────────────────────────────────────────────

function MobileScoreCards({
  players,
  currentPlayerIdx,
}: {
  players: Player[]
  currentPlayerIdx: number
}) {
  const [activeTab, setActiveTab] = useState(currentPlayerIdx)

  // Follow the active player's turn automatically
  useEffect(() => {
    setActiveTab(currentPlayerIdx)
  }, [currentPlayerIdx])

  return (
    <div className="w-full max-w-sm">
      {/* Tab strip */}
      <div className="flex gap-2 mb-3">
        {players.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-1.5 px-1 rounded-lg border font-pixel text-[9px] tracking-wide transition-all
              ${activeTab === i
                ? i === currentPlayerIdx
                  ? 'border-neon-pink text-neon-pink bg-neon-pink/10 shadow-[0_0_8px_rgba(255,45,120,0.3)]'
                  : 'border-gray-400 text-gray-200 bg-white/5'
                : 'border-gray-700 text-gray-600'
              }`}
          >
            <span className="truncate block">{p.name}{p.isAI && <span className="text-neon-yellow"> [CPU]</span>}</span>
            <span className={`block font-mono text-[11px] mt-0.5 ${
              activeTab === i && i === currentPlayerIdx ? 'text-neon-green' : 'text-gray-400'
            }`}>
              {totalScore(p.scoreCard, p.yahtzeeBonus)}
            </span>
            {i === currentPlayerIdx && (
              <span className="block text-[7px] text-neon-green mt-0.5 font-mono">● ACTIVE</span>
            )}
          </button>
        ))}
      </div>

      {/* Active score card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 0 ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {players[activeTab] && (
            <ScoreCard player={players[activeTab]} playerIdx={activeTab} fullWidth />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
