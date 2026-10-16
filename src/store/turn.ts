import type { GameStore } from './gameStore'
import { CATEGORIES } from '../game/types'
import { calculateScore } from '../game/scoring'

export type PrimaryAction =
  | { kind: 'roll'; label: string }
  | { kind: 'score'; label: string }
  | { kind: 'wait'; label: string }

// What the current player is allowed to do right now, shared by buttons and keyboard shortcuts
export function getTurn(s: GameStore) {
  const player = s.players[s.currentPlayerIdx]
  const isCPU = !!player?.isAI
  const playing = s.phase === 'rolling' && !!player
  const human = playing && !isCPU && !s.aiThinking

  const canRoll = human && s.rollsLeft > 0
  const canHold = human && s.rollsLeft > 0 && s.rollsLeft < 3
  const canScore = human && s.rollsLeft < 3

  let primary: PrimaryAction
  if (isCPU) {
    primary = { kind: 'wait', label: s.pendingCategory ? 'CPU is scoring…' : 'CPU is rolling…' }
  } else if (s.pendingCategory && canScore) {
    const cat = CATEGORIES.find(c => c.id === s.pendingCategory)!
    const pts = calculateScore(cat.id, s.dice)
    primary = { kind: 'score', label: `Score ${pts} in ${cat.label}` }
  } else if (canRoll) {
    primary = { kind: 'roll', label: s.rollsLeft === 3 ? 'Roll the dice' : 'Roll again' }
  } else {
    primary = { kind: 'wait', label: 'Pick a box to score' }
  }

  return { player, isCPU, canRoll, canHold, canScore, primary }
}

export function possessive(name: string) {
  if (name === 'You') return 'Your'
  return name.endsWith('s') ? `${name}’` : `${name}’s`
}
