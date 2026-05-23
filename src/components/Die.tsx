import { motion } from 'framer-motion'

interface Props {
  value: number
  held: boolean
  canHold: boolean
  onClick: () => void
  rolling?: boolean
}

const dots: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
}

export default function Die({ value, held, canHold, onClick, rolling }: Props) {
  const facePositions = value > 0 ? dots[value] : []

  return (
    <motion.div
      onClick={canHold ? onClick : undefined}
      className={`relative w-14 h-14 sm:w-14 sm:h-14 rounded-lg cursor-pointer select-none
        ${held
          ? 'bg-neon-green/20 border-2 border-neon-green shadow-[0_0_12px_#39ff14]'
          : value > 0
            ? 'bg-arcade-panel border-2 border-neon-pink shadow-[0_0_8px_#ff2d78] hover:border-neon-yellow hover:shadow-[0_0_12px_#ffe600]'
            : 'bg-arcade-panel border-2 border-gray-600 opacity-50'
        }
        ${canHold ? 'cursor-pointer' : 'cursor-default'}
      `}
      animate={rolling ? { rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.1, 0.95, 1.05, 1] } : {}}
      transition={{ duration: 0.35 }}
      whileTap={canHold ? { scale: 0.9 } : {}}
    >
      {facePositions.map(([x, y], i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-white shadow-[0_0_4px_white]"
          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
        />
      ))}
      {held && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-neon-green text-xs font-pixel tracking-tight">
          HOLD
        </div>
      )}
    </motion.div>
  )
}
