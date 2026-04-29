import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

const [, , outputPath, widthArg, heightArg, iconPath] = process.argv

if (!outputPath || !widthArg || !heightArg || !iconPath) {
  console.error(
    'Usage: node scripts/render-macos-dmg-background.mjs <output> <width> <height> <icon-path>',
  )
  process.exit(1)
}

const width = Number(widthArg)
const height = Number(heightArg)

if (!Number.isFinite(width) || !Number.isFinite(height)) {
  console.error('Width and height must be valid numbers.')
  process.exit(1)
}

const png = new PNG({ width, height })
const icon = PNG.sync.read(fs.readFileSync(iconPath))

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function blendPixel(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= width || y >= height || a <= 0) return

  const index = (width * y + x) << 2
  const sourceAlpha = clamp(a, 0, 1)
  const targetAlpha = png.data[index + 3] / 255
  const outAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha)

  if (outAlpha <= 0) return

  png.data[index] = Math.round(
    (r * sourceAlpha + png.data[index] * targetAlpha * (1 - sourceAlpha)) / outAlpha,
  )
  png.data[index + 1] = Math.round(
    (g * sourceAlpha + png.data[index + 1] * targetAlpha * (1 - sourceAlpha)) / outAlpha,
  )
  png.data[index + 2] = Math.round(
    (b * sourceAlpha + png.data[index + 2] * targetAlpha * (1 - sourceAlpha)) / outAlpha,
  )
  png.data[index + 3] = Math.round(outAlpha * 255)
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function fillVerticalGradient(topColor, bottomColor) {
  for (let y = 0; y < height; y += 1) {
    const t = y / Math.max(1, height - 1)
    const r = Math.round(lerp(topColor[0], bottomColor[0], t))
    const g = Math.round(lerp(topColor[1], bottomColor[1], t))
    const b = Math.round(lerp(topColor[2], bottomColor[2], t))

    for (let x = 0; x < width; x += 1) {
      blendPixel(x, y, r, g, b, 1)
    }
  }
}

function fillCircle(cx, cy, radius, color, alpha) {
  const minX = Math.floor(cx - radius)
  const maxX = Math.ceil(cx + radius)
  const minY = Math.floor(cy - radius)
  const maxY = Math.ceil(cy + radius)

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const distance = Math.hypot(x - cx, y - cy)
      if (distance > radius) continue

      const fade = 1 - distance / radius
      blendPixel(x, y, color[0], color[1], color[2], alpha * fade * fade)
    }
  }
}

function fillRoundedRect(x, y, rectWidth, rectHeight, radius, color, alpha) {
  const minX = Math.floor(x)
  const maxX = Math.ceil(x + rectWidth)
  const minY = Math.floor(y)
  const maxY = Math.ceil(y + rectHeight)
  const maxRadius = Math.min(radius, rectWidth / 2, rectHeight / 2)

  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const localX = px - x
      const localY = py - y

      const insideCore =
        localX >= maxRadius &&
        localX <= rectWidth - maxRadius &&
        localY >= 0 &&
        localY <= rectHeight

      const insideMiddle =
        localY >= maxRadius &&
        localY <= rectHeight - maxRadius &&
        localX >= 0 &&
        localX <= rectWidth

      let insideCorner = false

      const corners = [
        [maxRadius, maxRadius],
        [rectWidth - maxRadius, maxRadius],
        [maxRadius, rectHeight - maxRadius],
        [rectWidth - maxRadius, rectHeight - maxRadius],
      ]

      for (const [cornerX, cornerY] of corners) {
        if (Math.hypot(localX - cornerX, localY - cornerY) <= maxRadius) {
          insideCorner = true
          break
        }
      }

      if (insideCore || insideMiddle || insideCorner) {
        blendPixel(px, py, color[0], color[1], color[2], alpha)
      }
    }
  }
}

function strokeRoundedRect(x, y, rectWidth, rectHeight, radius, color, alpha, thickness) {
  fillRoundedRect(x, y, rectWidth, rectHeight, radius, color, alpha)
  fillRoundedRect(
    x + thickness,
    y + thickness,
    rectWidth - thickness * 2,
    rectHeight - thickness * 2,
    Math.max(0, radius - thickness),
    [0, 0, 0],
    0,
  )
}

function drawGrid(spacing, color, alpha) {
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += 1) {
      blendPixel(x, y, color[0], color[1], color[2], alpha)
    }
  }

  for (let y = 0; y < height; y += spacing) {
    for (let x = 0; x < width; x += 1) {
      blendPixel(x, y, color[0], color[1], color[2], alpha)
    }
  }
}

function drawCurve(points, color, alpha, thickness) {
  for (let index = 0; index < points.length - 1; index += 1) {
    const [x1, y1] = points[index]
    const [x2, y2] = points[index + 1]
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1)))

    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps
      const x = lerp(x1, x2, t)
      const y = lerp(y1, y2, t)
      fillCircle(x, y, thickness, color, alpha)
    }
  }
}

function drawArrowHead(x, y, color, alpha, size) {
  drawCurve(
    [
      [x, y],
      [x - size, y - size * 0.62],
    ],
    color,
    alpha,
    2.4,
  )
  drawCurve(
    [
      [x, y],
      [x - size, y + size * 0.62],
    ],
    color,
    alpha,
    2.4,
  )
}

function compositeIcon(cx, cy, targetSize, alpha) {
  const scale = targetSize / icon.width
  const startX = Math.round(cx - targetSize / 2)
  const startY = Math.round(cy - targetSize / 2)

  for (let y = 0; y < targetSize; y += 1) {
    for (let x = 0; x < targetSize; x += 1) {
      const sourceX = Math.min(icon.width - 1, Math.floor(x / scale))
      const sourceY = Math.min(icon.height - 1, Math.floor(y / scale))
      const sourceIndex = (icon.width * sourceY + sourceX) << 2
      const sourceAlpha = (icon.data[sourceIndex + 3] / 255) * alpha

      blendPixel(
        startX + x,
        startY + y,
        icon.data[sourceIndex],
        icon.data[sourceIndex + 1],
        icon.data[sourceIndex + 2],
        sourceAlpha,
      )
    }
  }
}

fillVerticalGradient([8, 15, 29], [3, 7, 15])

fillCircle(width * 0.18, height * 0.16, width * 0.24, [56, 112, 255], 0.18)
fillCircle(width * 0.82, height * 0.2, width * 0.18, [50, 180, 255], 0.13)
fillCircle(width * 0.75, height * 0.68, width * 0.2, [28, 112, 255], 0.16)
fillCircle(width * 0.83, height * 0.66, width * 0.11, [255, 181, 103], 0.18)

drawGrid(Math.max(26, Math.round(width / 18)), [145, 179, 255], 0.045)

const panelX = width * 0.07
const panelY = height * 0.12
const panelWidth = width * 0.34
const panelHeight = height * 0.76
fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 26, [11, 20, 38], 0.82)
strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 26, [135, 175, 255], 0.12, 2)

fillRoundedRect(panelX + 24, panelY + 28, panelWidth * 0.38, 28, 14, [18, 31, 58], 0.92)
fillRoundedRect(panelX + 24, panelY + 76, panelWidth * 0.62, 14, 7, [241, 246, 255], 0.9)
fillRoundedRect(panelX + 24, panelY + 100, panelWidth * 0.44, 14, 7, [130, 182, 255], 0.86)
fillRoundedRect(panelX + 24, panelY + 138, panelWidth * 0.78, 8, 4, [160, 178, 214], 0.42)
fillRoundedRect(panelX + 24, panelY + 158, panelWidth * 0.72, 8, 4, [160, 178, 214], 0.34)
fillRoundedRect(panelX + 24, panelY + 178, panelWidth * 0.63, 8, 4, [160, 178, 214], 0.28)

for (let index = 0; index < 3; index += 1) {
  const y = panelY + 238 + index * 56
  fillCircle(panelX + 38, y, 12, [110, 170, 255], 0.74)
  fillRoundedRect(panelX + 64, y - 8, panelWidth * 0.44, 10, 5, [230, 238, 255], 0.62)
  fillRoundedRect(panelX + 64, y + 10, panelWidth * 0.28, 7, 3.5, [143, 166, 209], 0.34)
}

compositeIcon(panelX + panelWidth - 72, panelY + panelHeight - 78, Math.round(width * 0.09), 0.25)

const arrowPoints = []
for (let step = 0; step <= 1; step += 0.02) {
  const x = lerp(width * 0.5, width * 0.71, step)
  const y = lerp(height * 0.42, height * 0.47, step) - Math.sin(step * Math.PI) * height * 0.06
  arrowPoints.push([x, y])
}

drawCurve(arrowPoints, [126, 184, 255], 0.6, 3.1)
drawArrowHead(width * 0.71, height * 0.47, [245, 178, 111], 0.94, width * 0.018)

fillCircle(width * 0.73, height * 0.63, width * 0.09, [120, 174, 255], 0.1)
fillCircle(width * 0.73, height * 0.63, width * 0.05, [245, 178, 111], 0.18)

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, PNG.sync.write(png))
