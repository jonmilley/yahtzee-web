import { useGameStore } from './store/gameStore'
import Menu from './components/Menu'
import GameBoard from './components/GameBoard'

export default function App() {
  const { mode } = useGameStore()
  return mode === 'menu' ? <Menu /> : <GameBoard />
}
