import GameCanvas from './components/GameCanvas'
import MusicBar from './components/MusicBar'
import ScoreDisplay from './components/ScoreDisplay'
import Shop from './components/Shop'
import { GameStateProvider } from './context/GameState'

export default function App() {
  return (
    <GameStateProvider>
      <MusicBar />
      <GameCanvas />
      <ScoreDisplay />
      <Shop />
      {/* SVG filter for optional sketchy UI — use filter: url(#sketch-filter) */}
      <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="sketch-filter" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </GameStateProvider>
  )
}
