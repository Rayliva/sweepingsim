/**
 * Interactive grass tufts. Click to harvest a blade (15 currency).
 * Per-tuft cooldown; hover shows time until next harvest.
 */

export const GRASS_COOLDOWN_MS = 60_000
export const HARVEST_ANIM_DURATION_MS = 350

export function getGrassTuftBounds(width, height) {
  const sidewalkTop = height * 0.92
  const grassH = 56
  const grassW = 56
  const destY = sidewalkTop - grassH + 10
  const positions = [width * 0.15, width * 0.5, width * 0.85]
  return positions.map((centerX) => ({
    x: centerX - grassW / 2,
    y: destY,
    w: grassW,
    h: grassH,
    centerX,
  }))
}

export function getTuftAtPoint(px, py, width, height) {
  const bounds = getGrassTuftBounds(width, height)
  for (let i = 0; i < bounds.length; i++) {
    const b = bounds[i]
    if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return i
  }
  return -1
}

export function createGrassBlade(tuftX, width, height) {
  const spread = 20
  const x = tuftX + (Math.random() - 0.5) * spread
  const y = height * 0.9 - 15 - Math.random() * 10
  const r = 4 + Math.random() * 3
  return {
    id: Math.random().toString(36).slice(2),
    x,
    y,
    vx: (Math.random() - 0.5) * 0.4,
    vy: 0,
    baseDrift: (Math.random() - 0.5) * 0.3,
    radius: r,
    rotation: Math.random() * Math.PI * 2,
    shape: 1,
    colorKey: 0,
    type: 'grassBlade',
    value: 15,
    swayPhase: Math.random() * Math.PI * 2,
  }
}
