export type CategoryId =
  | 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
  | 'threeOfAKind' | 'fourOfAKind' | 'fullHouse'
  | 'smallStraight' | 'largeStraight' | 'yahtzee' | 'chance'

export interface Category {
  id: CategoryId
  label: string
  hint: string
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
  { id: 'ones',          label: 'Ones',            hint: 'Add up the 1s',        section: 'upper' },
  { id: 'twos',          label: 'Twos',            hint: 'Add up the 2s',        section: 'upper' },
  { id: 'threes',        label: 'Threes',          hint: 'Add up the 3s',        section: 'upper' },
  { id: 'fours',         label: 'Fours',           hint: 'Add up the 4s',        section: 'upper' },
  { id: 'fives',         label: 'Fives',           hint: 'Add up the 5s',        section: 'upper' },
  { id: 'sixes',         label: 'Sixes',           hint: 'Add up the 6s',        section: 'upper' },
  { id: 'threeOfAKind',  label: 'Three of a kind', hint: '3 alike, sum of dice', section: 'lower' },
  { id: 'fourOfAKind',   label: 'Four of a kind',  hint: '4 alike, sum of dice', section: 'lower' },
  { id: 'fullHouse',     label: 'Full house',      hint: '3 + 2 alike, 25',      section: 'lower' },
  { id: 'smallStraight', label: 'Small straight',  hint: '4 in a row, 30',       section: 'lower' },
  { id: 'largeStraight', label: 'Large straight',  hint: '5 in a row, 40',       section: 'lower' },
  { id: 'yahtzee',       label: 'Yahtzee',         hint: '5 alike, 50',          section: 'lower' },
  { id: 'chance',        label: 'Chance',          hint: 'Any dice, sum',        section: 'lower' },
]
