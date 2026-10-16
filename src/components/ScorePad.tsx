import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getTurn } from '../store/turn'
import type { Category, Player } from '../game/types'
import { CATEGORIES } from '../game/types'
import { calculateScore, upperTotal, bonus, totalScore } from '../game/scoring'
import PipFace from './PipFace'

const UPPER = CATEGORIES.filter(c => c.section === 'upper')
const LOWER = CATEGORIES.filter(c => c.section === 'lower')

export default function ScorePad() {
  const state = useGameStore()
  const { players, currentPlayerIdx, dice, pendingCategory, phase, selectCategory, scoreCategory } = state
  const { canScore } = getTurn(state)
  const columns = { gridTemplateColumns: `minmax(0, 1fr) repeat(${players.length}, 4.5rem)` }
  const current = players[currentPlayerIdx]

  function choose(cat: Category) {
    if (pendingCategory === cat.id) scoreCategory()
    else selectCategory(cat.id)
  }

  function cellTone(i: number) {
    return i === currentPlayerIdx && phase === 'rolling' ? 'bg-marigold/15' : ''
  }

  function categoryRow(cat: Category) {
    const selectable = canScore && current?.scoreCard[cat.id] === undefined
    const pending = pendingCategory === cat.id
    const preview = calculateScore(cat.id, dice)
    const face = UPPER.indexOf(cat) + 1

    const label = (
      <span className="flex min-w-0 items-center gap-2.5 px-3 py-1.5">
        {face > 0 && <PipFace value={face} className="h-[1.1rem] w-[1.1rem] text-print/70" />}
        <span className="min-w-0">
          <span className={`block text-[0.95rem] leading-tight ${pending ? 'font-bold' : 'font-semibold'}`}>{cat.label}</span>
          <span className={`block truncate text-[0.72rem] leading-tight ${pending ? 'font-semibold text-ink' : 'text-print/55'}`}>
            {pending && selectable ? 'Tap again to score' : cat.hint}
          </span>
        </span>
      </span>
    )

    const cells = players.map((p, i) => {
      const value = p.scoreCard[cat.id]
      const isCurrent = i === currentPlayerIdx
      let content: ReactNode = null
      if (value !== undefined) {
        content = <Written value={value} />
      } else if (isCurrent && pending) {
        content = (
          <>
            <motion.span
              className="highlighter"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ originX: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
            <span className="relative font-hand text-[1.6rem] leading-none text-print">{preview}</span>
          </>
        )
      } else if (isCurrent && canScore) {
        content = (
          <span className={`font-hand text-[1.35rem] leading-none ${preview ? 'text-pencil' : 'text-pencil/45'}`}>
            {preview}
          </span>
        )
      }
      return (
        <span key={p.id} className={`relative flex h-full items-center justify-center border-l border-print/15 ${cellTone(i)}`}>
          {content}
        </span>
      )
    })

    const rowClass = 'grid min-h-[2.4rem] w-full items-stretch border-b border-print/12 text-left'

    if (!selectable) {
      return (
        <div key={cat.id} className={rowClass} style={columns}>
          {label}
          {cells}
        </div>
      )
    }

    return (
      <button
        key={cat.id}
        type="button"
        className={`${rowClass} cursor-pointer transition-colors hover:bg-ink/[0.06] focus-visible:relative focus-visible:z-10 focus-visible:outline-offset-[-3px] ${pending ? 'bg-ink/[0.06]' : ''}`}
        style={columns}
        onClick={() => choose(cat)}
        onMouseDown={e => e.preventDefault()}
        aria-label={`${cat.label}, scores ${preview}${pending ? '. Selected, press again to score it' : ''}`}
      >
        {label}
        {cells}
      </button>
    )
  }

  function totalRow(label: string, render: (p: Player) => ReactNode, strong = false) {
    return (
      <div className={`grid min-h-[2.2rem] items-stretch border-b border-print/12 ${strong ? 'bg-print/[0.04]' : ''}`} style={columns}>
        <span className={`flex items-center px-3 ${strong ? 'text-sm font-bold uppercase tracking-[0.12em]' : 'text-[0.85rem] font-semibold text-print/75'}`}>
          {label}
        </span>
        {players.map((p, i) => (
          <span key={p.id} className={`flex items-center justify-center border-l border-print/15 ${cellTone(i)}`}>
            {render(p)}
          </span>
        ))}
      </div>
    )
  }

  return (
    <section aria-label="Score card" className="paper overflow-hidden rounded-xl">
      <header className="border-b-[3px] border-print px-3 pb-2 pt-3">
        <h2 className="font-display text-[1.6rem] leading-none">Score card</h2>
      </header>

      <div className="grid items-stretch border-b-2 border-print/70" style={columns}>
        <span />
        {players.map((p, i) => (
          <span key={p.id} className={`truncate border-l border-print/15 px-1 py-1.5 text-center text-[0.8rem] font-bold ${cellTone(i)}`}>
            {p.name}
          </span>
        ))}
      </div>

      <SectionLabel>Upper section</SectionLabel>
      {UPPER.map(categoryRow)}
      {totalRow('Subtotal', p => <span className="text-[0.95rem] font-semibold tabular-nums">{upperTotal(p.scoreCard)}</span>)}
      {totalRow('Bonus at 63+', p => <BonusCell player={p} />)}

      <SectionLabel>Lower section</SectionLabel>
      {LOWER.map(categoryRow)}
      {totalRow('Total', p => <span className="font-hand text-[1.9rem] leading-none text-ink">{totalScore(p.scoreCard)}</span>, true)}
    </section>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-print/25 bg-print px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-paper">
      {children}
    </div>
  )
}

// A score "written in" with a pen stroke reveal
function Written({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`inline-block font-hand text-[1.6rem] leading-none ${value === 0 ? 'text-redpen' : 'text-ink'}`}
    >
      {value === 0 ? (
        <>
          <span aria-hidden>✕</span>
          <span className="sr-only">0</span>
        </>
      ) : (
        value
      )}
    </motion.span>
  )
}

function BonusCell({ player }: { player: Player }) {
  const earned = bonus(player.scoreCard)
  if (earned) return <Written value={earned} />
  const up = upperTotal(player.scoreCard)
  return (
    <span className="flex w-full flex-col items-center gap-0.5 px-2" title={`${63 - up} more points in the upper section earns 35`}>
      <span className="text-[0.68rem] font-semibold tabular-nums text-print/60">{up}/63</span>
      <span className="block h-1 w-full overflow-hidden rounded-full bg-print/10">
        <span className="block h-full rounded-full bg-ink/60" style={{ width: `${Math.min(100, (up / 63) * 100)}%` }} />
      </span>
    </span>
  )
}
