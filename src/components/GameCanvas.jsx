import { useRef, useEffect, useCallback, useState } from 'react'
import { useGameState } from '../context/GameState'
import { BASE } from '../game/constants'
import { createTrash, updateTrash, isOnGround, isOffScreen, isSweptOffSide } from '../game/trash'
import { broomOverlapsTrash, pushTrashDownward, pushTrashTowardNearestSide } from '../game/collision'
import { drawBackground, drawBroom, drawTrash } from '../game/render'
import { drawCityBackground } from '../game/cityBackground'

export default function GameCanvas() {
  const canvasRef = useRef(null)
  const [housesImage, setHousesImage] = useState(null)
  const { state, addCurrency } = useGameState()

  useEffect(() => {
    const img = new Image()
    img.src = '/houses.png'
    img.onload = () => setHousesImage(img)
  }, [])
  const { broomWidth, broomSpeed, trashSpawnRate } = state.upgrades

  const gameRef = useRef({
    broom: { x: 0, y: 0, width: BASE.BROOM_WIDTH * broomWidth, height: 14 },
    target: { x: 0, y: 0 },
    trash: [],
    lastSpawn: -2000,
    mouseMoved: false,
  })

  const onMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    gameRef.current.target.x = e.clientX - rect.left
    gameRef.current.target.y = e.clientY - rect.top
    gameRef.current.mouseMoved = true
  }, [])

  const onTouchMove = useCallback((e) => {
    e.preventDefault()
    const t = e.touches[0]
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || !t) return
    gameRef.current.target.x = t.clientX - rect.left
    gameRef.current.target.y = t.clientY - rect.top
    gameRef.current.mouseMoved = true
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let rafId
    const g = gameRef.current

    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        if (!g.mouseMoved) {
          g.broom.x = w / 2
          g.broom.y = h / 2
          g.target.x = w / 2
          g.target.y = h / 2
        }
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const effSpawn = 1 + (trashSpawnRate - 1) * 0.22
    const spawnInterval = BASE.TRASH_SPAWN_INTERVAL_MS / effSpawn

    const loop = (time) => {
      const g = gameRef.current
      const w = canvas.width
      const h = canvas.height

      // Sync upgrade values (muted per-level impact)
      const effWidth = 1 + (broomWidth - 1) * 0.18
      const effSpeed = 1 + (broomSpeed - 1) * 0.15
      g.broom.width = BASE.BROOM_WIDTH * effWidth
      const lerpFactor = Math.min(1, BASE.BROOM_LERP * effSpeed)

      // Lerp broom toward cursor (weighted feel)
      g.broom.x += (g.target.x - g.broom.x) * lerpFactor
      g.broom.y += (g.target.y - g.broom.y) * lerpFactor

      // Spawn trash
      if (time - g.lastSpawn > spawnInterval) {
        g.trash.push(createTrash(w, h, trashSpawnRate))
        g.lastSpawn = time
      }

      // Update trash; broom pushes down in air, or toward nearest side when on ground
      for (const t of g.trash) {
        updateTrash(t, w, h, time)
        if (broomOverlapsTrash(g.broom, t)) {
          if (isOnGround(t, h)) pushTrashTowardNearestSide(t, w)
          else pushTrashDownward(t)
        }
      }

      // Remove off-screen; currency only when swept off left/right
      let collected = 0
      g.trash = g.trash.filter((t) => {
        if (isOffScreen(t, w, h)) {
          if (isSweptOffSide(t, w)) collected++
          return false
        }
        return true
      })
      if (collected > 0) addCurrency(collected)

      // Draw
      ctx.clearRect(0, 0, w, h)
      drawCityBackground(ctx, w, h, housesImage)
      drawBackground(ctx, w, h)
      g.trash.forEach((t) => drawTrash(ctx, t))
      drawBroom(ctx, g.broom)

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [broomWidth, broomSpeed, trashSpawnRate, addCurrency, housesImage])

  return (
    <div
      id="game-root"
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onTouchStart={(e) => e.touches[0] && onTouchMove(e)}
    >
      <canvas ref={canvasRef} id="game-canvas" />
    </div>
  )
}
