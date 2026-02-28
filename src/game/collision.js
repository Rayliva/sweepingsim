import { BASE } from './constants'

// AABB-style: broom rect vs circle (trash). Push trash toward nearest screen edge.
export function broomOverlapsTrash(broom, trash) {
  const halfW = broom.width / 2
  const halfH = broom.height / 2
  const cx = broom.x
  const cy = broom.y
  const closestX = Math.max(cx - halfW, Math.min(trash.x, cx + halfW))
  const closestY = Math.max(cy - halfH, Math.min(trash.y, cy + halfH))
  const dx = trash.x - closestX
  const dy = trash.y - closestY
  const distSq = dx * dx + dy * dy
  return distSq <= trash.radius * trash.radius
}

export function pushTrashDownward(trash, strength = BASE.PUSH_STRENGTH) {
  trash.vy += strength
  trash.vx *= 0.96
}

export function pushTrashTowardNearestSide(trash, width, strength = BASE.PUSH_SWEEP) {
  const dir = trash.x < width / 2 ? -1 : 1
  trash.vx += dir * strength
}
