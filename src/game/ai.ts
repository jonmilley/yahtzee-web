import type { CategoryId, Die } from './types'
import { CATEGORIES } from './types'
import { calculateScore } from './scoring'

// Returns bitmask of dice indices to hold (true = hold)
export function chooseHeld(dice: Die[], scoreCard: Partial<Record<CategoryId, number>>, rollsLeft: number): boolean[] {
  const available = CATEGORIES.filter(c => scoreCard[c.id] === undefined).map(c => c.id)
  if (available.length === 0 || rollsLeft === 0) return dice.map(() => true)

  // Try every subset of dice to hold, pick the one with best expected value
  const best = { mask: dice.map(() => true), ev: -1 }

  for (let mask = 0; mask < 32; mask++) {
    const heldIndices = dice.map((_, i) => !!(mask & (1 << i)))
    const ev = estimateEV(dice, heldIndices, available)
    if (ev > best.ev) {
      best.ev = ev
      best.mask = heldIndices
    }
  }

  return best.mask
}

function estimateEV(dice: Die[], held: boolean[], available: CategoryId[]): number {
  // Simulate re-rolling free dice many times and average best score
  const heldValues = dice.filter((_, i) => held[i]).map(d => d.value)
  const freeCount = held.filter(h => !h).length

  if (freeCount === 0) {
    return bestScore(dice, available)
  }

  let total = 0
  const samples = 50
  for (let s = 0; s < samples; s++) {
    const sim = [...heldValues]
    for (let j = 0; j < freeCount; j++) sim.push(Math.ceil(Math.random() * 6))
    const simDice: Die[] = sim.map((v, i) => ({ id: i, value: v, held: false }))
    total += bestScore(simDice, available)
  }

  return total / samples
}

function bestScore(dice: Die[], available: CategoryId[]): number {
  let best = 0
  for (const id of available) {
    const s = calculateScore(id, dice)
    if (s > best) best = s
  }
  return best
}

// Pick best available category for current dice
export function chooseBestCategory(dice: Die[], scoreCard: Partial<Record<CategoryId, number>>): CategoryId {
  const available = CATEGORIES.filter(c => scoreCard[c.id] === undefined)
  let bestCat = available[0].id
  let bestScore = -1

  for (const cat of available) {
    const s = calculateScore(cat.id, dice)
    if (s > bestScore) {
      bestScore = s
      bestCat = cat.id
    }
  }

  // Prefer not zeroing out valuable categories if we can use chance or a low upper
  return bestCat
}
