import { useState } from 'react'
import { useGameState } from '../context/GameState'

const UPGRADE_LABELS = {
  broomWidth: 'Broom Width',
  broomSpeed: 'Broom Speed',
  trashSpawnRate: 'Trash Spawn Rate',
}

export default function Shop() {
  const [open, setOpen] = useState(false)
  const { state, upgrade } = useGameState()

  return (
    <>
      <div className="ui-overlay" style={{ position: 'fixed', top: 16, right: 16, zIndex: 10 }}>
        <button type="button" className="shop-btn" onClick={() => setOpen(true)}>
          Shop
        </button>
      </div>
      {open && (
        <div className="shop-backdrop" onClick={() => setOpen(false)} role="presentation">
          <div className="shop-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Upgrades shop">
            <h2>Upgrades</h2>
            {(Object.keys(UPGRADE_LABELS)).map((key) => {
              const cost = state.upgradeCosts[key]
              const level = state.upgrades[key]
              const canAfford = state.currency >= cost
              return (
                <div key={key} className="shop-item">
                  <div className="shop-item-info">
                    <strong>{UPGRADE_LABELS[key]}</strong>
                    <span>Level {level} · Next: {cost}</span>
                  </div>
                  <button
                    type="button"
                    className="shop-item-action"
                    disabled={!canAfford}
                    onClick={() => upgrade(key)}
                  >
                    Buy
                  </button>
                </div>
              )
            })}
            <button type="button" className="shop-close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
