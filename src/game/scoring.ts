import type { CategoryId, Die } from './types'

function vals(dice: Die[]): number[] {
  return dice.map(d => d.value)
}

function sum(dice: Die[]): number {
  return vals(dice).reduce((a, b) => a + b, 0)
}

function counts(dice: Die[]): Record<number, number> {
  const c: Record<number, number> = {}
  for (const v of vals(dice)) c[v] = (c[v] ?? 0) + 1
  return c
}

function hasStraight(dice: Die[], len: number): boolean {
  const unique = [...new Set(vals(dice))].sort((a, b) => a - b)
  let streak = 1
  for (let i = 1; i < unique.length; i++) {
    streak = unique[i] === unique[i - 1] + 1 ? streak + 1 : 1
    if (streak >= len) return true
  }
  return false
}

export function calculateScore(category: CategoryId, dice: Die[]): number {
  const c = counts(dice)
  const maxCount = Math.max(...Object.values(c))

  switch (category) {
    case 'ones':   return vals(dice).filter(v => v === 1).length * 1
    case 'twos':   return vals(dice).filter(v => v === 2).length * 2
    case 'threes': return vals(dice).filter(v => v === 3).length * 3
    case 'fours':  return vals(dice).filter(v => v === 4).length * 4
    case 'fives':  return vals(dice).filter(v => v === 5).length * 5
    case 'sixes':  return vals(dice).filter(v => v === 6).length * 6
    case 'threeOfAKind': return maxCount >= 3 ? sum(dice) : 0
    case 'fourOfAKind':  return maxCount >= 4 ? sum(dice) : 0
    case 'fullHouse': {
      const cv = Object.values(c)
      return cv.includes(3) && cv.includes(2) ? 25 : 0
    }
    case 'smallStraight': return hasStraight(dice, 4) ? 30 : 0
    case 'largeStraight': return hasStraight(dice, 5) ? 40 : 0
    case 'yahtzee': return maxCount === 5 ? 50 : 0
    case 'chance': return sum(dice)
    default: return 0
  }
}

export function upperTotal(scoreCard: Partial<Record<CategoryId, number>>): number {
  const upper: CategoryId[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes']
  return upper.reduce((t, id) => t + (scoreCard[id] ?? 0), 0)
}

export function bonus(scoreCard: Partial<Record<CategoryId, number>>): number {
  return upperTotal(scoreCard) >= 63 ? 35 : 0
}

export function totalScore(scoreCard: Partial<Record<CategoryId, number>>): number {
  return Object.values(scoreCard).reduce((t, v) => t + (v ?? 0), 0) + bonus(scoreCard)
}
