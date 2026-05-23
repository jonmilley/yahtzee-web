import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { sounds } from '../sounds/sounds'
import WelcomeDialog from './WelcomeDialog'
import type { AiDifficulty } from '../game/types'
import { getScoreAttackBest, getTier } from '../utils/highScores'

type NamingState = { mode: 'solo' | 'local2p' | 'scoreattack'; names: string[] } | null

const DIFFICULTY_OPTIONS: { value: AiDifficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy',   label: 'EASY',   desc: 'Relaxed CPU',     color: 'border-neon-green  text-neon-green  shadow-[0_0_8px_#39ff14]' },
  { value: 'medium', label: 'MEDIUM', desc: 'Smart CPU',       color: 'border-neon-yellow text-neon-yellow shadow-[0_0_8px_#ffe600]' },
  { value: 'hard',   label: 'HARD',   desc: 'Ruthless CPU',    color: 'border-neon-pink   text-neon-pink   shadow-[0_0_8px_#ff2d78]' },
]

export default function Menu() {
  const { startGame } = useGameStore()
  const [naming, setNaming] = useState<NamingState>(null)
  const [difficulty, setDifficulty] = useState<AiDifficulty>('medium')
  const [showWelcome, setShowWelcome] = useState(true)

  function openNaming(mode: 'solo' | 'local2p' | 'scoreattack') {
    sounds.click()
    setNaming({ mode, names: mode === 'local2p' ? ['', ''] : [''] })
  }

  function handleLaunch() {
    if (!naming) return
    sounds.click()
    startGame(naming.mode, naming.names, naming.mode === 'solo' ? difficulty : undefined)
  }

  function setName(idx: number, val: string) {
    setNaming(prev => {
      if (!prev) return prev
      const names = [...prev.names]
      names[idx] = val
      return { ...prev, names }
    })
  }

  return (
    <div className="min-h-screen bg-arcade-bg flex flex-col items-center justify-center">
      <div className="pointer-events-none fixed inset-0 bg-scanlines opacity-10 z-50" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Title */}
        <div className="relative mb-2">
          <div className="font-pixel text-5xl text-neon-pink tracking-wider drop-shadow-[0_0_20px_#ff2d78]">
            YAHTZEE
          </div>
          <div className="font-pixel text-5xl text-neon-yellow absolute inset-0 translate-x-0.5 translate-y-0.5 opacity-40">
            YAHTZEE
          </div>
        </div>
        <div className="font-pixel text-neon-green text-xs tracking-[0.4em] mb-12">
          by LH&amp;JM
        </div>

        {/* Animated dice row */}
        <motion.div
          className="flex justify-center gap-4 mb-12"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          {[1, 2, 3, 4, 5].map((v, i) => (
            <DiceFace key={i} value={v} delay={i * 0.1} />
          ))}
        </motion.div>

        {/* Mode buttons */}
        <div className="flex flex-col gap-4 items-center">
          <motion.button
            onClick={() => openNaming('solo')}
            className="w-64 py-4 font-pixel text-sm bg-neon-pink text-black rounded-lg
              shadow-[0_0_20px_#ff2d78] hover:shadow-[0_0_32px_#ff2d78] tracking-widest"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            1 PLAYER
            <div className="text-[10px] opacity-70 font-mono mt-0.5">vs CPU</div>
          </motion.button>

          <motion.button
            onClick={() => openNaming('local2p')}
            className="w-64 py-4 font-pixel text-sm bg-neon-yellow text-black rounded-lg
              shadow-[0_0_20px_#ffe600] hover:shadow-[0_0_32px_#ffe600] tracking-widest"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            2 PLAYERS
            <div className="text-[10px] opacity-70 font-mono mt-0.5">local co-op</div>
          </motion.button>

          <ScoreAttackButton openNaming={openNaming} />
        </div>

        {/* Rules hint */}
        <div className="mt-12 font-mono text-gray-600 text-xs max-w-xs mx-auto leading-relaxed">
          Roll 5 dice up to 3 times per turn.<br />
          Fill all 13 categories to win.<br />
          Click dice to hold between rolls.
        </div>
      </motion.div>

      {/* Welcome dialog */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeDialog onClose={() => { sounds.click(); setShowWelcome(false) }} />
        )}
      </AnimatePresence>

      {/* Name entry overlay */}
      <AnimatePresence>
        {naming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-40"
            onClick={(e) => { if (e.target === e.currentTarget) setNaming(null) }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="bg-arcade-panel border-2 border-neon-pink shadow-[0_0_30px_rgba(255,45,120,0.4)]
                rounded-xl p-8 w-80 flex flex-col gap-5"
            >
              <div className="font-pixel text-neon-pink text-xs text-center tracking-widest">
                {naming.mode === 'solo' ? 'ENTER YOUR NAME'
                  : naming.mode === 'scoreattack' ? 'SCORE ATTACK'
                  : 'PLAYER NAMES'}
              </div>

              {naming.names.map((name, i) => (
                <NameInput
                  key={i}
                  label={naming.mode === 'solo' ? 'Your name' : `Player ${i + 1}`}
                  value={name}
                  placeholder={naming.mode === 'solo' ? 'Player 1' : `Player ${i + 1}`}
                  autoFocus={i === 0}
                  onChange={val => setName(i, val)}
                  onEnter={i === naming.names.length - 1 ? handleLaunch : undefined}
                />
              ))}

              {/* Personal best – only for score attack */}
              {naming.mode === 'scoreattack' && <PersonalBestBadge />}

              {/* Difficulty selector – only for solo mode */}
              {naming.mode === 'solo' && (
                <div className="flex flex-col gap-2">
                  <div className="font-pixel text-[9px] text-gray-400 tracking-widest">CPU DIFFICULTY</div>
                  <div className="flex gap-2">
                    {DIFFICULTY_OPTIONS.map(opt => (
                      <motion.button
                        key={opt.value}
                        onClick={() => { sounds.click(); setDifficulty(opt.value) }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-1.5 rounded border font-pixel text-[9px] transition-all
                          ${difficulty === opt.value
                            ? opt.color + ' bg-white/5'
                            : 'border-gray-600 text-gray-500 hover:border-gray-400'
                          }`}
                      >
                        {opt.label}
                        <div className="font-mono text-[7px] opacity-60 mt-0.5">{opt.desc}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  onClick={() => setNaming(null)}
                  className="flex-1 py-2 font-pixel text-[10px] bg-gray-700 text-gray-300 rounded
                    hover:bg-gray-600 transition-all"
                >
                  BACK
                </button>
                <motion.button
                  onClick={handleLaunch}
                  className="flex-1 py-2 font-pixel text-[10px] bg-neon-pink text-black rounded
                    shadow-[0_0_10px_#ff2d78] hover:shadow-[0_0_18px_#ff2d78] transition-all"
                  whileTap={{ scale: 0.97 }}
                >
                  PLAY!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NameInput({ label, value, placeholder, autoFocus, onChange, onEnter }: {
  label: string
  value: string
  placeholder: string
  autoFocus?: boolean
  onChange: (v: string) => void
  onEnter?: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (autoFocus) ref.current?.focus() }, [autoFocus])

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-pixel text-[9px] text-gray-400 tracking-widest">{label.toUpperCase()}</label>
      <input
        ref={ref}
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={16}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && onEnter) onEnter() }}
        className="bg-black border border-neon-pink/50 focus:border-neon-pink rounded px-3 py-2
          font-mono text-sm text-white placeholder-gray-600 outline-none
          focus:shadow-[0_0_8px_rgba(255,45,120,0.4)] transition-all"
      />
    </div>
  )
}

function ScoreAttackButton({ openNaming }: { openNaming: (m: 'scoreattack') => void }) {
  const best = getScoreAttackBest()
  const tier = getTier(best)
  return (
    <motion.button
      onClick={() => openNaming('scoreattack')}
      className="w-64 py-4 font-pixel text-sm bg-[#00d4ff] text-black rounded-lg
        shadow-[0_0_20px_#00d4ff] hover:shadow-[0_0_32px_#00d4ff] tracking-widest"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      SCORE ATTACK
      <div className="text-[10px] font-mono mt-0.5 opacity-70">
        {best > 0 ? `best: ${best} · ${tier.label}` : 'beat your best'}
      </div>
    </motion.button>
  )
}

function PersonalBestBadge() {
  const best = getScoreAttackBest()
  const tier = getTier(best)
  if (best === 0) {
    return (
      <div className="text-center font-mono text-[10px] text-gray-500">
        No record yet — good luck!
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded bg-black/40 border border-gray-700">
      <span className="font-pixel text-[9px] text-gray-400">PERSONAL BEST</span>
      <span className={`font-pixel text-[10px] ${tier.color} ${tier.glow}`}>
        {best} · {tier.label}
      </span>
    </div>
  )
}

function DiceFace({ value, delay }: { value: number; delay: number }) {
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  }

  return (
    <motion.div
      className="relative w-12 h-12 rounded-lg bg-arcade-panel border-2 border-neon-pink shadow-[0_0_8px_#ff2d78]"
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ repeat: Infinity, duration: 3, delay, ease: 'easeInOut' }}
    >
      {dots[value]?.map(([x, y], i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_4px_white]"
          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}
        />
      ))}
    </motion.div>
  )
}
