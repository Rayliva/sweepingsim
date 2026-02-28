import { useRef, useEffect, useCallback, useState } from 'react'
import { useGameState } from '../context/GameState'
import { BASE } from '../game/constants'
import { createTrash, updateTrash, isOnGround, isOffScreen, isSweptOffSide } from '../game/trash'
import { broomOverlapsTrash, pushTrashDownward, pushTrashTowardNearestSide } from '../game/collision'
import { drawBackground, drawBroom, drawTrash } from '../game/render'
import { drawCityBackground } from '../game/cityBackground'
import { drawGrassTufts } from '../game/cityBackground'
import {
  getTuftAtPoint,
  getGrassTuftBounds,
  createGrassBlade,
  GRASS_COOLDOWN_MS,
  HARVEST_ANIM_DURATION_MS,
} from '../game/grassTufts'

export default function GameCanvas() {
  const canvasRef = useRef(null)
  const [housesImage, setHousesImage] = useState(null)
  const [grassImage, setGrassImage] = useState(null)
  const [hoveredTuft, setHoveredTuft] = useState(-1)
  const [cooldownTick, setCooldownTick] = useState(0)
  const { state, addCurrency } = useGameState()

  useEffect(() => {
    const img = new Image()
    img.src = '/houses.png'
    img.onload = () => setHousesImage(img)
  }, [])
  useEffect(() => {
    const img = new Image()
    img.src = '/grass.png'
    img.onload = () => setGrassImage(img)
  }, [])
  const { broomWidth, broomSpeed, trashSpawnRate } = state.upgrades

  const gameRef = useRef({
    broom: { x: 0, y: 0, width: BASE.BROOM_WIDTH * broomWidth, height: 14 },
    target: { x: 0, y: 0 },
    trash: [],
    lastSpawn: -2000,
    mouseMoved: false,
    grassLastHarvest: [0, 0, 0],
    harvestAnim: { tuft: -1, start: 0 },
  })

  const onMouseMove = useCallback((e) => {
    const canvas = canvasRef.current
    const rect = canvas?.getBoundingClientRect()
    if (!rect) return
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX
    const cy = (e.clientY - rect.top) * scaleY
    gameRef.current.target.x = cx
    gameRef.current.target.y = cy
    gameRef.current.mouseMoved = true
    const tuft = getTuftAtPoint(cx, cy, canvas.width, canvas.height)
    setHoveredTuft(tuft)
  }, [])

  const onTouchMove = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const canvas = canvasRef.current
    const rect = canvas?.getBoundingClientRect()
    if (!rect || !touch) return
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    gameRef.current.target.x = (touch.clientX - rect.left) * scaleX
    gameRef.current.target.y = (touch.clientY - rect.top) * scaleY
    gameRef.current.mouseMoved = true
  }, [])

  const onMouseLeave = useCallback(() => setHoveredTuft(-1), [])

  const handlePointerDown = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = ((e.clientX ?? e.touches?.[0]?.clientX) - rect.left) * scaleX
    const cy = ((e.clientY ?? e.touches?.[0]?.clientY) - rect.top) * scaleY
    const tuft = getTuftAtPoint(cx, cy, canvas.width, canvas.height)
    if (tuft < 0) return
    const g = gameRef.current
    const now = performance.now()
    if (now - g.grassLastHarvest[tuft] < GRASS_COOLDOWN_MS) return
    g.grassLastHarvest[tuft] = now
    g.harvestAnim = { tuft, start: now }
    const bounds = getGrassTuftBounds(canvas.width, canvas.height)
    const blade = createGrassBlade(bounds[tuft].centerX, canvas.width, canvas.height)
    g.trash.push(blade)
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
          if (isSweptOffSide(t, w)) collected += t.value ?? 1
          return false
        }
        return true
      })
      if (collected > 0) addCurrency(collected)

      // Draw
      ctx.clearRect(0, 0, w, h)
      drawCityBackground(ctx, w, h, housesImage)
      drawBackground(ctx, w, h)
      g.trash.forEach((t) => drawTrash(ctx, t, grassImage))
      const harvestElapsed = time - g.harvestAnim.start
      const harvestPhase = g.harvestAnim.tuft >= 0 && harvestElapsed < HARVEST_ANIM_DURATION_MS
        ? harvestElapsed / HARVEST_ANIM_DURATION_MS
        : 0
      drawGrassTufts(ctx, w, h, grassImage, {
        animateTuft: harvestPhase > 0 ? g.harvestAnim.tuft : -1,
        animPhase: harvestPhase,
      })
      drawBroom(ctx, g.broom)

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [broomWidth, broomSpeed, trashSpawnRate, addCurrency, housesImage, grassImage])

  useEffect(() => {
    if (hoveredTuft < 0) return
    const id = setInterval(() => setCooldownTick((c) => c + 1), 1000)
    return () => clearInterval(id)
  }, [hoveredTuft])

  const tooltipText = (() => {
    if (hoveredTuft < 0) return ''
    const g = gameRef.current
    const remaining = GRASS_COOLDOWN_MS - (performance.now() - g.grassLastHarvest[hoveredTuft])
    if (remaining <= 0) return 'Ready to harvest'
    const sec = Math.ceil(remaining / 1000)
    return `${sec}s until you can harvest again`
  })()

  const canvas = canvasRef.current
  const bounds = canvas && canvas.width > 0
    ? getGrassTuftBounds(canvas.width, canvas.height)
    : []
  const tooltipRect = hoveredTuft >= 0 && bounds[hoveredTuft] && canvas
    ? (() => {
        const rect = canvas.getBoundingClientRect()
        const scaleX = rect.width / canvas.width
        const scaleY = rect.height / canvas.height
        const b = bounds[hoveredTuft]
        return {
          left: rect.left + b.centerX * scaleX,
          top: rect.top + b.y * scaleY,
        }
      })()
    : null

  return (
    <div
      id="game-root"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchMove={onTouchMove}
      onTouchStart={(e) => {
        if (e.touches[0]) onTouchMove(e)
        handlePointerDown(e)
      }}
      onMouseDown={handlePointerDown}
      style={{ cursor: hoveredTuft >= 0 ? 'pointer' : undefined }}
    >
      <canvas ref={canvasRef} id="game-canvas" />
      {hoveredTuft >= 0 && tooltipRect && (
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            left: tooltipRect.left,
            top: tooltipRect.top - 36,
            transform: 'translateX(-50%)',
            background: 'rgba(42, 37, 34, 0.95)',
            color: '#e8e4df',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {tooltipText}
        </div>
      )}
    </div>
  )
}
