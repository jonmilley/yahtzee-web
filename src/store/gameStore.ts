import { create } from 'zustand'
import type { CategoryId, Die, GameMode, GamePhase, Player } from '../game/types'
import { CATEGORIES } from '../game/types'
import { calculateScore } from '../game/scoring'
import { chooseHeld, chooseBestCategory } from '../game/ai'
import { sounds } from '../sounds/sounds'

export interface GameStore {
  mode: GameMode
  phase: GamePhase
  players: Player[]
  currentPlayerIdx: number
  dice: Die[]
  rollsLeft: number
  pendingCategory: CategoryId | null
  round: number
  aiThinking: boolean
  // Increments on every roll so the dice can animate, including CPU rolls
  rollId: number
  // Increments on every new game or exit so stale CPU timers can bail out
  gameId: number

  startGame: (mode: GameMode, names?: string[]) => void
  rollDice: () => void
  toggleHold: (dieId: number) => void
  selectCategory: (cat: CategoryId) => void
  scoreCategory: () => void
  backToMenu: () => void
}

type Get = () => GameStore
type Set = (partial: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => void

function freshDice(): Die[] {
  return Array.from({ length: 5 }, (_, i) => ({ id: i, value: 0, held: false }))
}

function freshPlayer(id: number, name: string, isAI: boolean): Player {
  return { id, name, isAI, scoreCard: {} }
}

// setTimeout that is dropped if the player has left or restarted the game meanwhile
function later(get: Get, ms: number, fn: () => void) {
  const gameId = get().gameId
  setTimeout(() => {
    if (get().gameId === gameId) fn()
  }, ms)
}

function aiShouldScore(dice: Die[], scoreCard: Partial<Record<CategoryId, number>>): boolean {
  const available = CATEGORIES.filter(c => scoreCard[c.id] === undefined)
  const best = Math.max(...available.map(c => calculateScore(c.id, dice)))
  return best >= 40
}

function aiStep(rollsLeft: number, get: Get, set: Set) {
  if (rollsLeft === 0) {
    later(get, 900, () => {
      const { dice, players, currentPlayerIdx } = get()
      const p = players[currentPlayerIdx]
      const cat = chooseBestCategory(dice, p.scoreCard)
      set({ pendingCategory: cat, aiThinking: false })
      later(get, 700, () => get().scoreCategory())
    })
    return
  }

  set({ aiThinking: true })
  later(get, 1000, () => {
    const { dice: currentDice, players, currentPlayerIdx } = get()
    const p = players[currentPlayerIdx]
    const shouldScore = rollsLeft <= 1 || aiShouldScore(currentDice, p.scoreCard)

    if (shouldScore) {
      const cat = chooseBestCategory(currentDice, p.scoreCard)
      set({ pendingCategory: cat, aiThinking: false })
      later(get, 800, () => get().scoreCategory())
    } else {
      const heldMask = chooseHeld(currentDice, p.scoreCard, rollsLeft)
      const held = currentDice.map((d, i) => ({ ...d, held: heldMask[i] }))
      set({ dice: held, aiThinking: false })
      later(get, 700, () => get().rollDice())
    }
  })
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'menu',
  phase: 'rolling',
  players: [],
  currentPlayerIdx: 0,
  dice: freshDice(),
  rollsLeft: 3,
  pendingCategory: null,
  round: 1,
  aiThinking: false,
  rollId: 0,
  gameId: 0,

  startGame(mode, names) {
    const [n1 = '', n2 = ''] = names ?? []
    const players =
      mode === 'solo'
        ? [freshPlayer(0, n1.trim() || 'You', false), freshPlayer(1, 'CPU', true)]
        : [freshPlayer(0, n1.trim() || 'Player 1', false), freshPlayer(1, n2.trim() || 'Player 2', false)]
    set(s => ({
      mode,
      phase: 'rolling',
      players,
      currentPlayerIdx: 0,
      dice: freshDice(),
      rollsLeft: 3,
      pendingCategory: null,
      round: 1,
      aiThinking: false,
      gameId: s.gameId + 1,
    }))
  },

  rollDice() {
    const { rollsLeft, dice, phase, players, currentPlayerIdx, aiThinking, rollId } = get()
    if (rollsLeft === 0 || phase !== 'rolling' || aiThinking) return

    sounds.roll()

    const newDice = dice.map(d =>
      d.held ? d : { ...d, value: Math.floor(Math.random() * 6) + 1 }
    )
    const newRollsLeft = rollsLeft - 1

    set({ dice: newDice, rollsLeft: newRollsLeft, pendingCategory: null, rollId: rollId + 1 })

    if (players[currentPlayerIdx].isAI) {
      aiStep(newRollsLeft, get, set)
    }
  },

  toggleHold(dieId) {
    const { rollsLeft, phase, players, currentPlayerIdx, aiThinking, dice } = get()
    if (rollsLeft === 3 || rollsLeft === 0 || phase !== 'rolling' || aiThinking) return
    if (players[currentPlayerIdx].isAI) return

    sounds.hold()
    set({ dice: dice.map(d => d.id === dieId ? { ...d, held: !d.held } : d) })
  },

  selectCategory(cat) {
    const { players, currentPlayerIdx, phase, aiThinking, rollsLeft } = get()
    if (phase !== 'rolling' || aiThinking) return
    if (rollsLeft === 3) return
    const player = players[currentPlayerIdx]
    if (player.isAI) return
    if (player.scoreCard[cat] !== undefined) return

    sounds.click()
    set({ pendingCategory: cat })
  },

  scoreCategory() {
    const { pendingCategory, players, currentPlayerIdx, dice, round } = get()
    if (!pendingCategory) return

    const player = players[currentPlayerIdx]
    const score = calculateScore(pendingCategory, dice)

    if (score === 0) sounds.zero()
    else if (pendingCategory === 'yahtzee') sounds.yahtzee()
    else sounds.score()

    const updatedPlayer: Player = {
      ...player,
      scoreCard: { ...player.scoreCard, [pendingCategory]: score },
    }
    const updatedPlayers = players.map(p => p.id === player.id ? updatedPlayer : p)

    const nextPlayerIdx = (currentPlayerIdx + 1) % 2
    const nextRound = nextPlayerIdx === 0 ? round + 1 : round

    if (nextRound > 13) {
      set({ players: updatedPlayers, pendingCategory: null, phase: 'gameover' })
      return
    }

    const nextPlayer = updatedPlayers[nextPlayerIdx]
    set({
      players: updatedPlayers,
      currentPlayerIdx: nextPlayerIdx,
      dice: freshDice(),
      rollsLeft: 3,
      pendingCategory: null,
      round: nextRound,
    })

    if (nextPlayer.isAI) {
      later(get, 900, () => get().rollDice())
    }
  },

  backToMenu() {
    set(s => ({ mode: 'menu', phase: 'rolling', aiThinking: false, gameId: s.gameId + 1 }))
  },
}))
