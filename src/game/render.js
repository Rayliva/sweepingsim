import { BASE } from './constants'

const PALETTE = {
  outline: '#2a2522',
  broomFill: '#9a9a94',
  broomStroke: '#2a2522',
  bgTint: 'rgba(212, 207, 200, 0.15)',
}

const LEAF_COLORS = [
  { fill: '#6b8f71', vein: '#5a7a5f' },
  { fill: '#7d9a6b', vein: '#6a8558' },
  { fill: '#8f7d5c', vein: '#75684a' },
  { fill: '#9a6b5a', vein: '#7d5648' },
]

export function drawBackground(ctx, width, height) {
  ctx.save()
  ctx.fillStyle = PALETTE.bgTint
  ctx.fillRect(0, 0, width, height)
  const groundY = height - 6
  ctx.strokeStyle = PALETTE.outline
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.35
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(width, groundY)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.restore()
}

function jitter(max = BASE.JITTER_AMOUNT) {
  return (Math.random() - 0.5) * 2 * max
}

function drawLeafShape(ctx, L, W, shape, jitter) {
  const j = (n) => n + jitter(0.4)
  const L_ = j(L)
  const W_ = j(W)
  ctx.beginPath()
  if (shape === 0) {
    ctx.moveTo(0, L_ * 0.48)
    ctx.bezierCurveTo(-W_ * 0.95, L_ * 0.2, -W_ * 0.65, -L_ * 0.45, 0, -L_ * 0.5)
    ctx.bezierCurveTo(W_ * 0.65, -L_ * 0.45, W_ * 0.95, L_ * 0.2, 0, L_ * 0.48)
  } else if (shape === 1) {
    ctx.moveTo(0, L_ * 0.5)
    ctx.bezierCurveTo(-W_ * 0.6, L_ * 0.1, -W_ * 0.85, -L_ * 0.35, 0, -L_ * 0.48)
    ctx.bezierCurveTo(W_ * 0.85, -L_ * 0.35, W_ * 0.6, L_ * 0.1, 0, L_ * 0.5)
  } else {
    ctx.moveTo(0, L_ * 0.42)
    ctx.bezierCurveTo(-W_ * 1.0, L_ * 0.25, -W_ * 0.5, -L_ * 0.5, 0, -L_ * 0.45)
    ctx.bezierCurveTo(W_ * 0.5, -L_ * 0.5, W_ * 1.0, L_ * 0.25, 0, L_ * 0.42)
  }
  ctx.closePath()
}

function drawLeaf(ctx, radius, shape, colorKey, jitter) {
  const j = (n) => n + jitter(0.4)
  const L = j(radius * 2.2)
  const W = j(radius * (shape === 1 ? 0.9 : shape === 2 ? 1.25 : 1.1))
  drawLeafShape(ctx, L, W, shape, jitter)
  const colors = LEAF_COLORS[colorKey % LEAF_COLORS.length]
  ctx.fillStyle = colors.fill
  ctx.fill()
  ctx.strokeStyle = PALETTE.outline
  ctx.stroke()
  ctx.strokeStyle = colors.vein
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(0, L * 0.38)
  ctx.lineTo(0, -L * 0.32)
  ctx.stroke()
  ctx.lineWidth = 2
}

export function drawBroom(ctx, broom) {
  const { x, y, width } = broom
  const hw = width / 2
  const bristleH = 18
  const handleLen = 40
  const handleTopW = 2.5
  const handleBaseW = 4
  const headH = 6
  ctx.save()

  const handleAngle = -0.4 * Math.PI
  ctx.translate(x, y)
  ctx.rotate(handleAngle)

  // Handle — long, straight, tapered (clip art orange-red)
  ctx.fillStyle = '#b87d6a'
  ctx.strokeStyle = PALETTE.outline
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-handleBaseW / 2, 0)
  ctx.lineTo(-handleTopW / 2, -handleLen)
  ctx.lineTo(handleTopW / 2, -handleLen)
  ctx.lineTo(handleBaseW / 2, 0)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Broom head block — rectangular, same color as handle
  ctx.fillStyle = '#b87d6a'
  ctx.fillRect(-hw * 0.95, -headH, hw * 1.9, headH)
  ctx.strokeRect(-hw * 0.95, -headH, hw * 1.9, headH)

  // Bristles — blue-green with gradient, curved scoop bottom, vertical lines
  const bristleGrad = ctx.createLinearGradient(0, -headH, 0, bristleH)
  bristleGrad.addColorStop(0, '#4a7a6a')
  bristleGrad.addColorStop(1, '#6b9a7a')
  ctx.fillStyle = bristleGrad
  ctx.beginPath()
  ctx.moveTo(-hw * 0.9, 0)
  ctx.lineTo(hw * 0.9, 0)
  ctx.quadraticCurveTo(hw * 0.7, bristleH * 0.6, hw * 0.5, bristleH)
  ctx.lineTo(-hw * 0.5, bristleH)
  ctx.quadraticCurveTo(-hw * 0.7, bristleH * 0.6, -hw * 0.9, 0)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Individual bristle lines (clip art detail)
  ctx.strokeStyle = PALETTE.outline
  ctx.lineWidth = 1
  for (let i = 0; i < 12; i++) {
    const t = (i / 11) * 2 - 1
    const baseX = t * hw * 0.75
    const tipY = bristleH * (0.3 + 0.7 * (1 - Math.abs(t) * 0.3))
    ctx.beginPath()
    ctx.moveTo(baseX, 0)
    ctx.lineTo(baseX + t * 2, tipY)
    ctx.stroke()
  }

  ctx.restore()
}

export function drawTrash(ctx, trash, grassImage = null) {
  const { x, y, radius, rotation, shape = 0, colorKey = 0, type } = trash
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  if (type === 'grassBlade' && grassImage && grassImage.complete && grassImage.naturalWidth > 0) {
    const size = 32
    ctx.drawImage(
      grassImage,
      0, 0, grassImage.naturalWidth, grassImage.naturalHeight,
      -size / 2, -size / 2, size, size
    )
  } else {
    ctx.strokeStyle = PALETTE.outline
    ctx.lineWidth = 2
    drawLeaf(ctx, radius, shape, colorKey, jitter)
  }

  ctx.restore()
}
