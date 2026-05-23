import type { AiDifficulty, CategoryId, Die } from './types'
import { CATEGORIES } from './types'
import { calculateScore } from './scoring'

// ─── Hold Selection ───────────────────────────────────────────────────────────

/**
 * Returns a boolean mask indicating which dice the AI should hold.
 * difficulty controls the quality of the decision:
 *   easy   – holds each die randomly (50 % chance)
 *   medium – EV simulation with 50 samples  (original behaviour)
 *   hard   – EV simulation with 250 samples + smarter tie-breaking
 */
export function chooseHeld(
  dice: Die[],
  scoreCard: Partial<Record<CategoryId, number>>,
  rollsLeft: number,
  difficulty: AiDifficulty = 'medium'
): boolean[] {
  const available = CATEGORIES.filter(c => scoreCard[c.id] === undefined).map(c => c.id)
  if (available.length === 0 || rollsLeft === 0) return dice.map(() => true)

  // Easy: random holds – intentionally suboptimal
  if (difficulty === 'easy') {
    return dice.map(() => Math.random() > 0.5)
  }

  const samples = difficulty === 'hard' ? 250 : 50

  const best = { mask: dice.map(() => true), ev: -1 }

  for (let mask = 0; mask < 32; mask++) {
    const heldIndices = dice.map((_, i) => !!(mask & (1 << i)))
    const ev = estimateEV(dice, heldIndices, available, samples)
    if (ev > best.ev) {
      best.ev = ev
      best.mask = heldIndices
    }
  }

  return best.mask
}

function estimateEV(
  dice: Die[],
  held: boolean[],
  available: CategoryId[],
  samples: number
): number {
  const heldValues = dice.filter((_, i) => held[i]).map(d => d.value)
  const freeCount = held.filter(h => !h).length

  if (freeCount === 0) {
    return bestScore(dice, available)
  }

  let total = 0
  for (let s = 0; s < samples; s++) {
    const sim = [...heldValues]
    for (let j = 0; j < freeCount; j++) sim.push(Math.floor(Math.random() * 6) + 1)
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

// ─── Category Selection ───────────────────────────────────────────────────────

/**
 * Picks the best available category for the current dice.
 * difficulty controls decision quality:
 *   easy  – random category (intentionally suboptimal)
 *   medium – highest raw score (original behaviour)
 *   hard  – highest raw score with strategic tie-breaking:
 *            avoids zeroing out Yahtzee/Large Straight when alternatives exist
 */
export function chooseBestCategory(
  dice: Die[],
  scoreCard: Partial<Record<CategoryId, number>>,
  difficulty: AiDifficulty = 'medium'
): CategoryId {
  const available = CATEGORIES.filter(c => scoreCard[c.id] === undefined)

  // Easy: random pick
  if (difficulty === 'easy') {
    return available[Math.floor(Math.random() * available.length)].id
  }

  // Score every available category
  const scored = available.map(cat => ({
    id: cat.id,
    score: calculateScore(cat.id, dice),
  }))

  const maxScore = Math.max(...scored.map(s => s.score))

  if (difficulty === 'hard') {
    // Among tied top scores, prefer less "precious" categories
    // (i.e. avoid wasting a Yahtzee/LargeStraight slot with 0)
    const PRECIOUS: CategoryId[] = ['yahtzee', 'largeStraight', 'smallStraight', 'fullHouse']
    const top = scored.filter(s => s.score === maxScore)

    // If we'd score > 0, just pick the best
    if (maxScore > 0) {
      // Prefer scoring precious categories if they're achievable (lock in the big points)
      const preciousTop = top.find(s => PRECIOUS.includes(s.id))
      return preciousTop ? preciousTop.id : top[0].id
    }

    // All options are 0 — pick the least painful zero
    // Sacrifice upper section (low value) before lower section big categories
    const nonPrecious = scored.find(s => !PRECIOUS.includes(s.id))
    return nonPrecious ? nonPrecious.id : scored[0].id
  }

  // Medium: simple highest score
  let bestCat = available[0].id
  let best = -1
  for (const { id, score } of scored) {
    if (score > best) { best = score; bestCat = id }
  }
  return bestCat
}
