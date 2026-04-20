import { motion } from 'framer-motion'

interface Props {
  onClose: () => void
}

const MESSAGE = `Welcome to Yahtzee, Prepare to have
lot's of fun... This version of
LHJM Yahtzee (1.0) assumes that you know
the rules.
Some of the things you need to know
special about our version are:
1. Click the Roll button to roll
   your dice.
2. Select (in green) the dice you wish
   to roll.
3. Click on the score categories to
   calculate your score.
4. You can change your score category.
5. Click Finished Turn when you are
   finished.
6. Keep Safe, and have fun!!`

export default function WelcomeDialog({ onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        transition={{ type: 'spring', bounce: 0.35 }}
        className="bg-arcade-panel border-2 border-neon-yellow shadow-[0_0_40px_rgba(255,230,0,0.35)]
          rounded-xl p-8 max-w-sm w-full mx-4 flex flex-col gap-5"
      >
        {/* Header */}
        <div className="text-center">
          <div className="font-pixel text-neon-yellow text-base tracking-widest drop-shadow-[0_0_8px_#ffe600]">
            YAHTZEE!
          </div>
          <div className="font-pixel text-neon-pink text-[9px] tracking-widest mt-1">
            by LH &amp; JM
          </div>
        </div>

        {/* Original message verbatim */}
        <pre className="font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap border border-gray-700 rounded p-3 bg-black/40">
          {MESSAGE}
        </pre>

        <motion.button
          onClick={onClose}
          className="w-full py-3 font-pixel text-xs bg-neon-pink text-black rounded
            shadow-[0_0_14px_#ff2d78] hover:shadow-[0_0_24px_#ff2d78] tracking-widest transition-all"
          whileTap={{ scale: 0.97 }}
          autoFocus
        >
          Play Yahtzeee!
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
