const HS_KEY = 'yahtzee_score_attack_best'

export function getScoreAttackBest(): number {
  try {
    const stored = localStorage.getItem(HS_KEY)
    return stored ? parseInt(stored, 10) : 0
  } catch {
    return 0
  }
}

export function saveScoreAttackBest(score: number): boolean {
  try {
    const prev = getScoreAttackBest()
    if (score > prev) {
      localStorage.setItem(HS_KEY, String(score))
      return true // new record
    }
    return false
  } catch {
    return false
  }
}

export interface ScoreTier {
  label: string
  minScore: number
  color: string
  glow: string
}

export const SCORE_TIERS: ScoreTier[] = [
  { label: 'BEGINNER',    minScore: 0,   color: 'text-gray-400',    glow: '' },
  { label: 'AMATEUR',     minScore: 150, color: 'text-neon-green',  glow: 'drop-shadow-[0_0_6px_#39ff14]' },
  { label: 'INTERMEDIATE',minScore: 200, color: 'text-neon-yellow', glow: 'drop-shadow-[0_0_6px_#ffe600]' },
  { label: 'ADVANCED',    minScore: 250, color: 'text-orange-400',  glow: 'drop-shadow-[0_0_6px_#fb923c]' },
  { label: 'EXPERT',      minScore: 300, color: 'text-neon-pink',   glow: 'drop-shadow-[0_0_6px_#ff2d78]' },
  { label: 'YAHTZEE PRO', minScore: 350, color: 'text-white',       glow: 'drop-shadow-[0_0_10px_white]'  },
]

export function getTier(score: number): ScoreTier {
  return [...SCORE_TIERS].reverse().find(t => score >= t.minScore) ?? SCORE_TIERS[0]
}

/** Returns the next tier above the current one, or null if already max. */
export function getNextTier(score: number): ScoreTier | null {
  const idx = [...SCORE_TIERS].reverse().findIndex(t => score >= t.minScore)
  const currentIdx = SCORE_TIERS.length - 1 - idx
  return SCORE_TIERS[currentIdx + 1] ?? null
}
