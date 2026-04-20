export type CategoryId =
  | 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
  | 'threeOfAKind' | 'fourOfAKind' | 'fullHouse'
  | 'smallStraight' | 'largeStraight' | 'yahtzee' | 'chance'

export interface Category {
  id: CategoryId
  label: string
  section: 'upper' | 'lower'
}

export interface Die {
  id: number
  value: number  // 1-6, 0 = unrolled
  held: boolean
}

export interface ScoreCard {
  [key: string]: number | undefined
}

export interface Player {
  id: number
  name: string
  isAI: boolean
  scoreCard: Partial<Record<CategoryId, number>>
}

export type GameMode = 'menu' | 'solo' | 'local2p'
export type GamePhase = 'rolling' | 'scoring' | 'gameover'

export const CATEGORIES: Category[] = [
  { id: 'ones',         label: 'Ones',           section: 'upper' },
  { id: 'twos',         label: 'Twos',           section: 'upper' },
  { id: 'threes',       label: 'Threes',         section: 'upper' },
  { id: 'fours',        label: 'Fours',          section: 'upper' },
  { id: 'fives',        label: 'Fives',          section: 'upper' },
  { id: 'sixes',        label: 'Sixes',          section: 'upper' },
  { id: 'threeOfAKind', label: 'Three of a Kind',section: 'lower' },
  { id: 'fourOfAKind',  label: 'Four of a Kind', section: 'lower' },
  { id: 'fullHouse',    label: 'Full House',     section: 'lower' },
  { id: 'smallStraight',label: 'Sm. Straight',   section: 'lower' },
  { id: 'largeStraight',label: 'Lg. Straight',   section: 'lower' },
  { id: 'yahtzee',      label: 'YAHTZEE!',       section: 'lower' },
  { id: 'chance',       label: 'Chance',         section: 'lower' },
]
