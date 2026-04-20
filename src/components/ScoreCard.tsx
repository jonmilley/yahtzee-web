import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import type { CategoryId, Player } from '../game/types'
import { CATEGORIES } from '../game/types'
import { calculateScore, upperTotal, bonus, totalScore } from '../game/scoring'

interface Props {
  player: Player
  playerIdx: number
}

export default function ScoreCard({ player, playerIdx }: Props) {
  const { currentPlayerIdx, dice, rollsLeft, phase, pendingCategory, selectCategory, scoreCategory, aiThinking } = useGameStore()
  const isActive = currentPlayerIdx === playerIdx
  const canScore = isActive && rollsLeft < 3 && phase === 'rolling' && !player.isAI && !aiThinking

  const upper = CATEGORIES.filter(c => c.section === 'upper')
  const lower = CATEGORIES.filter(c => c.section === 'lower')
  const upTotal = upperTotal(player.scoreCard)
  const bonusVal = bonus(player.scoreCard)
  const total = totalScore(player.scoreCard)

  function handleClick(catId: CategoryId) {
    if (!canScore) return
    if (player.scoreCard[catId] !== undefined) return
    if (pendingCategory === catId) {
      scoreCategory()
    } else {
      selectCategory(catId)
    }
  }

  function rowClass(catId: CategoryId) {
    const scored = player.scoreCard[catId] !== undefined
    const isPending = pendingCategory === catId && isActive
    const isPreview = canScore && !scored
    if (isPending) return 'bg-neon-yellow/20 border border-neon-yellow text-neon-yellow cursor-pointer'
    if (scored) return 'text-gray-400 border border-transparent'
    if (isPreview) return 'hover:bg-neon-pink/10 border border-transparent hover:border-neon-pink/50 cursor-pointer text-white'
    return 'text-gray-500 border border-transparent'
  }

  function displayScore(catId: CategoryId): string {
    if (player.scoreCard[catId] !== undefined) return String(player.scoreCard[catId])
    if (canScore) return String(calculateScore(catId, dice))
    return '-'
  }

  const scoreColor = (catId: CategoryId) => {
    if (player.scoreCard[catId] !== undefined) return 'text-neon-green'
    if (canScore) {
      const s = calculateScore(catId, dice)
      return s > 0 ? 'text-neon-yellow' : 'text-red-500'
    }
    return 'text-gray-600'
  }

  return (
    <div className={`bg-arcade-panel rounded-lg p-3 w-48 border transition-all
      ${isActive ? 'border-neon-pink shadow-[0_0_16px_rgba(255,45,120,0.3)]' : 'border-gray-700'}`}>
      <div className={`font-pixel text-xs text-center mb-3 pb-2 border-b
        ${isActive ? 'text-neon-pink border-neon-pink' : 'text-gray-500 border-gray-700'}`}>
        {player.name}
        {player.isAI && <span className="ml-1 text-neon-yellow">[CPU]</span>}
      </div>

      <div className="space-y-0.5 text-xs font-mono">
        <div className="text-gray-500 font-pixel text-[10px] mb-1">— UPPER —</div>
        {upper.map(cat => (
          <motion.div
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            className={`flex justify-between px-2 py-0.5 rounded transition-all ${rowClass(cat.id)}`}
            whileTap={canScore && player.scoreCard[cat.id] === undefined ? { scale: 0.97 } : {}}
          >
            <span>{cat.label}</span>
            <span className={scoreColor(cat.id)}>{displayScore(cat.id)}</span>
          </motion.div>
        ))}

        <div className="flex justify-between px-2 py-0.5 mt-1 border-t border-gray-700 text-gray-400">
          <span>Subtotal</span><span>{upTotal}</span>
        </div>
        <div className={`flex justify-between px-2 py-0.5 ${bonusVal > 0 ? 'text-neon-green' : 'text-gray-600'}`}>
          <span>Bonus (+35)</span><span>{bonusVal > 0 ? '+35' : upTotal >= 63 ? '+35' : `${upTotal}/63`}</span>
        </div>

        <div className="text-gray-500 font-pixel text-[10px] mb-1 mt-2">— LOWER —</div>
        {lower.map(cat => (
          <motion.div
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            className={`flex justify-between px-2 py-0.5 rounded transition-all ${rowClass(cat.id)}`}
            whileTap={canScore && player.scoreCard[cat.id] === undefined ? { scale: 0.97 } : {}}
          >
            <span>{cat.label}</span>
            <span className={scoreColor(cat.id)}>{displayScore(cat.id)}</span>
          </motion.div>
        ))}

        <div className="flex justify-between px-2 py-1 mt-2 border-t border-neon-pink/40 font-pixel text-[11px]">
          <span className="text-neon-pink">TOTAL</span>
          <span className="text-neon-green">{total}</span>
        </div>
      </div>

      {pendingCategory && isActive && !player.isAI && (
        <motion.button
          onClick={scoreCategory}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-2 py-1.5 bg-neon-yellow text-black font-pixel text-[10px] rounded
            shadow-[0_0_10px_#ffe600] hover:shadow-[0_0_18px_#ffe600] transition-all"
        >
          CONFIRM SCORE
        </motion.button>
      )}
    </div>
  )
}
