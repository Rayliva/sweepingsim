/**
 * Cute city street background.
 */

const SIDEWALK_COLOR = '#b5b2ac'
const SIDEWALK_LINE = '#9a9a94'
const OUTLINE = '#2a2522'

export function drawCityBackground(ctx, width, height, housesImage = null) {
  ctx.save()

  const sidewalkTop = height * 0.92

  // Houses image — drawn higher so full doors are visible (margin at bottom)
  if (housesImage && housesImage.complete && housesImage.naturalWidth > 0) {
    const img = housesImage
    const srcH = img.naturalHeight * 0.95 // exclude bottom 5% (dark line)
    ctx.drawImage(img, 0, 0, img.naturalWidth, srcH, 0, 0, width, sidewalkTop)
  }

  // Sidewalk below the houses
  const sidewalkH = height - sidewalkTop
  ctx.fillStyle = SIDEWALK_COLOR
  ctx.fillRect(0, sidewalkTop, width, sidewalkH)
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 2
  ctx.strokeRect(0, sidewalkTop, width, sidewalkH)
  const slabW = 36
  const slabH = Math.max(8, Math.min(14, sidewalkH - 4))
  ctx.strokeStyle = SIDEWALK_LINE
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.5
  for (let sx = 0; sx < width; sx += slabW) {
    for (let sy = sidewalkTop + 2; sy < sidewalkTop + sidewalkH - 2; sy += slabH + 2) {
      ctx.strokeRect(sx + 1, sy, slabW - 2, slabH)
    }
  }
  ctx.globalAlpha = 1

  ctx.restore()
}
