import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { totalScore } from '../game/scoring'
import { sounds } from '../sounds/sounds'
import { useEffect, useState } from 'react'
import { getScoreAttackBest, saveScoreAttackBest, getTier, getNextTier } from '../utils/highScores'
import type { Player } from '../game/types'

export default function GameOver() {
  const { players, mode, aiDifficulty, startGame, backToMenu } = useGameStore()
  const names = players.map(p => p.name)

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
      {mode === 'scoreattack'
        ? <ScoreAttackResult
            player={players[0]}
            onPlayAgain={() => startGame('scoreattack', names)}
            onMenu={backToMenu}
          />
        : <MultiplayerResult
            players={players}
            onPlayAgain={() => startGame(mode as 'solo' | 'local2p', names, aiDifficulty)}
            onMenu={backToMenu}
          />
      }
    </motion.div>
  )
}

// ─── Score Attack Result ──────────────────────────────────────────────────────

function ScoreAttackResult({
  player,
  onPlayAgain,
  onMenu,
}: {
  player: Player
  onPlayAgain: () => void
  onMenu: () => void
}) {
  const finalScore = totalScore(player.scoreCard, player.yahtzeeBonus)
  const [prevBest] = useState(() => getScoreAttackBest())
  const [isNewRecord] = useState(() => saveScoreAttackBest(finalScore))
  const tier = getTier(finalScore)
  const nextTier = getNextTier(finalScore)

  return (
    <motion.div
      initial={{ scale: 0.7, y: 40 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.4 }}
      className="bg-arcade-panel border-2 border-[#00d4ff] shadow-[0_0_40px_rgba(0,212,255,0.35)]
        rounded-xl p-10 text-center max-w-sm w-full"
    >
      {/* Header */}
      <div className="font-pixel text-[#00d4ff] text-sm tracking-widest mb-1">SCORE ATTACK</div>
      <div className="font-pixel text-neon-yellow text-lg tracking-widest">GAME OVER</div>

      {/* Final score */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: 'spring', bounce: 0.5 }}
        className="mt-6"
      >
        <div className="font-mono text-gray-400 text-xs mb-1">{player.name}</div>
        <div className={`font-pixel text-5xl ${tier.color} ${tier.glow} tracking-wider`}>
          {finalScore}
        </div>
        <div className={`font-pixel text-xs mt-2 tracking-widest ${tier.color} ${tier.glow}`}>
          {tier.label}
        </div>
      </motion.div>

      {/* New record flash */}
      {isNewRecord && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 font-pixel text-[10px] text-neon-yellow drop-shadow-[0_0_8px_#ffe600] tracking-widest"
        >
          ★ NEW PERSONAL BEST! ★
        </motion.div>
      )}

      {/* Previous best (shown only if not a new record) */}
      {!isNewRecord && prevBest > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 flex justify-between px-4 font-mono text-xs text-gray-500"
        >
          <span>Personal best</span>
          <span>{prevBest}</span>
        </motion.div>
      )}

      {/* Next tier target */}
      {nextTier && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-3 font-mono text-[10px] text-gray-600"
        >
          {nextTier.minScore - finalScore} pts to reach{' '}
          <span className={nextTier.color}>{nextTier.label}</span>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 mt-8 justify-center">
        <button
          onClick={onPlayAgain}
          className="px-6 py-2 font-pixel text-xs bg-[#00d4ff] text-black rounded
            shadow-[0_0_12px_#00d4ff] hover:shadow-[0_0_20px_#00d4ff] transition-all"
        >
          PLAY AGAIN
        </button>
        <button
          onClick={onMenu}
          className="px-6 py-2 font-pixel text-xs bg-gray-700 text-gray-300 rounded
            hover:bg-gray-600 transition-all"
        >
          MENU
        </button>
      </div>
    </motion.div>
  )
}

// ─── Multiplayer Result ───────────────────────────────────────────────────────

function MultiplayerResult({
  players,
  onPlayAgain,
  onMenu,
}: {
  players: Player[]
  onPlayAgain: () => void
  onMenu: () => void
}) {
  const scores = players.map(p => ({ ...p, total: totalScore(p.scoreCard, p.yahtzeeBonus) }))
  const sorted = [...scores].sort((a, b) => b.total - a.total)
  const winner = sorted[0]
  const tie = sorted.length > 1 && sorted[0].total === sorted[1].total

  return (
    <motion.div
      initial={{ scale: 0.7, y: 40 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.4 }}
      className="bg-arcade-panel border-2 border-neon-yellow shadow-[0_0_40px_rgba(255,230,0,0.4)]
        rounded-xl p-10 text-center max-w-sm w-full"
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
          onClick={onPlayAgain}
          className="px-6 py-2 font-pixel text-xs bg-neon-pink text-black rounded
            shadow-[0_0_12px_#ff2d78] hover:shadow-[0_0_20px_#ff2d78] transition-all"
        >
          PLAY AGAIN
        </button>
        <button
          onClick={onMenu}
          className="px-6 py-2 font-pixel text-xs bg-gray-700 text-gray-300 rounded
            hover:bg-gray-600 transition-all"
        >
          MENU
        </button>
      </div>
    </motion.div>
  )
}
