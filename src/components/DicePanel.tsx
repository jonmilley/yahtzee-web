import { useState } from 'react'
import { motion } from 'framer-motion'
import Die from './Die'
import { useGameStore } from '../store/gameStore'

export default function DicePanel() {
  const { dice, rollsLeft, phase, players, currentPlayerIdx, aiThinking, rollDice, toggleHold } = useGameStore()
  const currentPlayer = players[currentPlayerIdx]
  const isAI = currentPlayer?.isAI
  const [rolling, setRolling] = useState(false)

  const canRoll = rollsLeft > 0 && phase === 'rolling' && !isAI && !aiThinking
  const canHold = rollsLeft < 3 && rollsLeft > 0 && phase === 'rolling' && !isAI && !aiThinking

  function handleRoll() {
    if (!canRoll) return
    setRolling(true)
    rollDice()
    setTimeout(() => setRolling(false), 400)
  }

  const rollLabel =
    rollsLeft === 3 ? 'ROLL' :
    rollsLeft === 2 ? 'ROLL 2' :
    rollsLeft === 1 ? 'ROLL 3' : 'SCORE'

  return (
    <div className="flex flex-col items-center gap-6 shrink-0">
      <div className="flex gap-3 items-center pt-6">
        {dice.map(die => (
          <Die
            key={die.id}
            value={die.value}
            held={die.held}
            canHold={canHold}
            onClick={() => toggleHold(die.id)}
            rolling={rolling && !die.held}
          />
        ))}
      </div>

      <motion.button
        onClick={handleRoll}
        disabled={!canRoll}
        className={`px-10 py-3 font-pixel text-sm tracking-widest rounded
          ${canRoll
            ? 'bg-neon-pink text-black shadow-[0_0_16px_#ff2d78] hover:shadow-[0_0_24px_#ff2d78] hover:scale-105'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          } transition-all`}
        whileTap={canRoll ? { scale: 0.95 } : {}}
      >
        {aiThinking ? 'CPU...' : rollLabel}
      </motion.button>

      <div className="flex gap-1">
        {[3, 2, 1].map(n => (
          <div
            key={n}
            className={`w-2 h-2 rounded-full ${rollsLeft >= n ? 'bg-neon-pink shadow-[0_0_4px_#ff2d78]' : 'bg-gray-700'}`}
          />
        ))}
      </div>
    </div>
  )
}
