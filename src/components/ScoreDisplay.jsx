import { useGameState } from '../context/GameState'

export default function ScoreDisplay() {
  const { state } = useGameState()
  return (
    <div className="ui-overlay" style={{ position: 'fixed', top: 16, left: 16, zIndex: 10 }}>
      <div className="score-card">
        <div className="score-label">Currency</div>
        <div className="score-value">{state.currency}</div>
      </div>
    </div>
  )
}
