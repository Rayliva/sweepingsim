import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'sweepingsim-game'

const initialState = {
  currency: 0,
  upgrades: {
    broomWidth: 1,
    broomSpeed: 1,
    trashSpawnRate: 1,
  },
  upgradeCosts: {
    broomWidth: 25,
    broomSpeed: 30,
    trashSpawnRate: 35,
  },
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const saved = JSON.parse(raw)
    return { ...initialState, ...saved }
  } catch {
    return initialState
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / privacy mode
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_CURRENCY':
      return { ...state, currency: state.currency + action.payload }
    case 'UPGRADE':
      const { key } = action.payload
      const cost = state.upgradeCosts[key]
      if (state.currency < cost) return state
      return {
        ...state,
        currency: state.currency - cost,
        upgrades: { ...state.upgrades, [key]: state.upgrades[key] + 1 },
        upgradeCosts: {
          ...state.upgradeCosts,
          [key]: Math.floor(cost * 1.55),
        },
      }
    default:
      return state
  }
}

const GameStateContext = createContext(null)

export function GameStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const addCurrency = useCallback((amount) => {
    dispatch({ type: 'ADD_CURRENCY', payload: amount })
  }, [])

  const upgrade = useCallback((key) => {
    dispatch({ type: 'UPGRADE', payload: { key } })
  }, [])

  return (
    <GameStateContext.Provider value={{ state, addCurrency, upgrade }}>
      {children}
    </GameStateContext.Provider>
  )
}

export function useGameState() {
  const ctx = useContext(GameStateContext)
  if (!ctx) throw new Error('useGameState must be used within GameStateProvider')
  return ctx
}
