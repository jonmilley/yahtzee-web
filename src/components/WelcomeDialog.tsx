import { motion } from 'framer-motion'

interface Props {
  onClose: () => void
}

// The welcome message from the original Java version, kept word for word
const STEPS = [
  'Click the Roll button to roll your dice.',
  'Select (in green) the dice you wish to roll.',
  'Click on the score categories to calculate your score.',
  'You can change your score category.',
  'Click Finished Turn when you are finished.',
  'Keep Safe, and have fun!!',
]

export default function WelcomeDialog({ onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-[2px]"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-title"
        onKeyDown={e => { if (e.key === 'Escape') onClose() }}
        initial={{ y: 60, rotate: -6, opacity: 0 }}
        animate={{ y: 0, rotate: -1.5, opacity: 1 }}
        exit={{ y: 40, rotate: 3, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className="paper notebook w-full max-w-md rounded-sm py-5 pl-14 pr-6"
      >
        <p className="text-[0.68rem] font-semibold uppercase leading-7 tracking-[0.16em] text-print/55">
          A note from LHJM Yahtzee 1.0
        </p>
        <div className="font-hand text-[1.3rem] leading-7 text-ink">
          <h2 id="note-title" className="text-[1.6rem] leading-7">Welcome to Yahtzee,</h2>
          <p>
            Prepare to have lot's of fun... This version of LHJM Yahtzee (1.0) assumes that you know the rules.
          </p>
          <p>Some of the things you need to know special about our version are:</p>
          <ol className="list-decimal pl-6">
            {STEPS.map(s => <li key={s}>{s}</li>)}
          </ol>
          <p className="mt-7 text-right text-print/70">LH &amp; JM</p>
        </div>

        <p className="mt-3 border-t border-print/20 pt-3 text-[0.85rem] leading-snug text-print/75">
          In this version, tap dice to hold them, then tap a box on the score card twice to score it.
        </p>

        <button type="button" onClick={onClose} autoFocus className="btn-chunky mt-4 w-full">
          Let’s play
        </button>
      </motion.div>
    </motion.div>
  )
}
