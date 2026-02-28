import { LEAF_RADIUS_MIN, LEAF_RADIUS_MAX, BASE } from './constants'

export function createTrash(width, height, spawnRateMultiplier = 1) {
  const r = LEAF_RADIUS_MIN + Math.random() * (LEAF_RADIUS_MAX - LEAF_RADIUS_MIN)
  const padding = 40
  const x = padding + r + Math.random() * (width - 2 * padding - 2 * r)
  const y = -r - 20 - Math.random() * 30
  const drift = (Math.random() - 0.5) * 2 * BASE.TRASH_DRIFT_SPEED
  return {
    id: Math.random().toString(36).slice(2),
    x,
    y,
    vx: drift,
    baseDrift: drift,
    vy: 0,
    radius: r,
    rotation: Math.random() * Math.PI * 2,
    shape: Math.floor(Math.random() * 3),
    colorKey: Math.floor(Math.random() * 4),
    type: 'leaf',
    swayPhase: Math.random() * Math.PI * 2,
  }
}

export function updateTrash(trash, width, height, time = 0) {
  const groundLevel = height - BASE.GROUND_MARGIN - trash.radius
  if (trash.y >= groundLevel) {
    trash.y = groundLevel
    trash.vy = 0
    trash.vx *= BASE.GROUND_FRICTION
  } else {
    trash.vy += BASE.GRAVITY
    if (trash.type === 'leaf' || trash.type === 'grassBlade') {
      const sway = Math.sin((trash.swayPhase || 0) + time * BASE.LEAF_SWAY_FREQ) * BASE.LEAF_SWAY_AMP
      trash.vx = (trash.baseDrift ?? trash.vx) + sway
    }
  }
  trash.x += trash.vx
  trash.y += trash.vy
  if (trash.y < groundLevel) {
    trash.rotation += 0.015
    trash.vx *= 0.995
  }
}

export function isOnGround(trash, height) {
  return trash.y >= height - BASE.GROUND_MARGIN - trash.radius
}

// Off left/right = swept off (reward). Off bottom = cleanup only. Don’t remove when above top.
export function isOffScreen(trash, width, height) {
  const margin = trash.radius + 4
  return trash.x < -margin || trash.x > width + margin || trash.y > height + margin
}

export function isSweptOffSide(trash, width) {
  const margin = trash.radius + 4
  return trash.x < -margin || trash.x > width + margin
}
