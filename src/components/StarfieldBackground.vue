<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const DEFAULT_WIDTH = 1440
const DEFAULT_HEIGHT = 900
const TAU = Math.PI * 2

const canvasRef = ref(null)
const farLayerShadow = ref('')
const midLayerShadow = ref('')
const nearLayerShadow = ref('')

let ctx = null
let width = DEFAULT_WIDTH
let height = DEFAULT_HEIGHT
let dpr = 1
let animationFrameId = 0
let resizeTimer = 0
let idleTimer = 0
let lastTimestamp = 0
let stars = []
let isLowPowerDevice = false
let prefersReducedMotion = false

function createSeededRandom(seed) {
  let value = seed >>> 0

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function buildShadowLayer(count, seed, blurRange, alphaRange) {
  const random = createSeededRandom(seed)
  const shadows = []

  for (let index = 0; index < count; index += 1) {
    const x = Math.round(random() * width)
    const y = Math.round(random() * height)
    const blur = (blurRange[0] + random() * (blurRange[1] - blurRange[0])).toFixed(2)
    const alpha = (alphaRange[0] + random() * (alphaRange[1] - alphaRange[0])).toFixed(2)
    const hue = 200 + Math.round(random() * 20)

    shadows.push(`${x}px ${y}px ${blur}px rgba(225, 238, 255, ${alpha})`)

    if (index % 9 === 0) {
      shadows.push(`${x}px ${y}px ${Number(blur) + 10}px rgba(${hue}, 225, 255, ${alpha * 0.08})`)
    }
  }

  return shadows.join(', ')
}

function updateShadowLayers() {
  const area = width * height
  const densityFactor = isLowPowerDevice ? 22000 : 16000
  const farCount = Math.max(45, Math.round(area / densityFactor))
  const midCount = Math.max(28, Math.round(area / (densityFactor * 1.7)))
  const nearCount = Math.max(18, Math.round(area / (densityFactor * 2.8)))
  const seedBase = width * 13 + height * 17

  farLayerShadow.value = buildShadowLayer(farCount, seedBase + 11, [0, 1.2], [0.2, 0.55])
  midLayerShadow.value = buildShadowLayer(midCount, seedBase + 29, [0.5, 1.8], [0.35, 0.72])
  nearLayerShadow.value = buildShadowLayer(nearCount, seedBase + 47, [1.2, 2.6], [0.4, 0.92])
}

function getProjectedPoint(star, z) {
  const spread = Math.min(width, height) * 0.44
  const depth = 1 / Math.max(z, 0.08)

  return {
    x: width / 2 + star.x * spread * depth,
    y: height / 2 + star.y * spread * depth,
  }
}

function createStar(initial = false) {
  const angle = Math.random() * TAU
  const distance = Math.pow(Math.random(), 1.6) * 1.15

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    z: initial ? 0.12 + Math.random() * 0.88 : 0.85 + Math.random() * 0.18,
    speed: (isLowPowerDevice ? 0.16 : 0.22) + Math.random() * 0.22,
    radius: 0.5 + Math.random() * 1.6,
    alpha: 0.2 + Math.random() * 0.75,
  }
}

function resetStars() {
  const area = width * height
  const targetCount = prefersReducedMotion
    ? Math.max(40, Math.round(area / 24000))
    : Math.max(70, Math.round(area / (isLowPowerDevice ? 20000 : 13000)))

  stars = Array.from({ length: Math.min(targetCount, 160) }, () => createStar(true))
}

function resizeCanvas() {
  const canvas = canvasRef.value

  if (!canvas) {
    return
  }

  width = window.innerWidth || DEFAULT_WIDTH
  height = window.innerHeight || DEFAULT_HEIGHT
  dpr = Math.min(window.devicePixelRatio || 1, isLowPowerDevice ? 1.2 : 1.5)

  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  ctx = canvas.getContext('2d', { alpha: true })

  if (!ctx) {
    return
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  updateShadowLayers()
  resetStars()
  drawFrame(16)
}

function drawFrame(delta) {
  if (!ctx) {
    return
  }

  ctx.clearRect(0, 0, width, height)

  for (let index = 0; index < stars.length; index += 1) {
    const star = stars[index]
    const previousZ = star.z

    if (!prefersReducedMotion) {
      star.z -= star.speed * delta * 0.00042
    }

    if (star.z <= 0.08) {
      stars[index] = createStar()
      continue
    }

    const previousPoint = getProjectedPoint(star, previousZ)
    const currentPoint = getProjectedPoint(star, star.z)

    if (
      currentPoint.x < -80 ||
      currentPoint.x > width + 80 ||
      currentPoint.y < -80 ||
      currentPoint.y > height + 80
    ) {
      stars[index] = createStar()
      continue
    }

    const glow = (1.2 - star.z) * star.alpha
    const lineWidth = Math.max(0.6, star.radius * (1.45 - star.z))
    const trailOpacity = Math.min(0.92, glow * 0.72)
    const pointOpacity = Math.min(0.98, glow * 0.95 + 0.08)

    ctx.beginPath()
    ctx.strokeStyle = `rgba(185, 220, 255, ${trailOpacity})`
    ctx.lineWidth = lineWidth
    ctx.moveTo(previousPoint.x, previousPoint.y)
    ctx.lineTo(currentPoint.x, currentPoint.y)
    ctx.stroke()

    ctx.beginPath()
    ctx.fillStyle = `rgba(255, 255, 255, ${pointOpacity})`
    ctx.arc(currentPoint.x, currentPoint.y, lineWidth * 0.7, 0, TAU)
    ctx.fill()
  }
}

function animate(timestamp) {
  if (document.hidden) {
    animationFrameId = 0
    return
  }

  const delta = Math.min(32, timestamp - lastTimestamp || 16)
  lastTimestamp = timestamp
  drawFrame(delta)

  if (!prefersReducedMotion) {
    animationFrameId = window.requestAnimationFrame(animate)
  }
}

function startAnimation() {
  window.clearTimeout(idleTimer)

  idleTimer = window.setTimeout(() => {
    resizeCanvas()

    if (prefersReducedMotion) {
      return
    }

    cancelAnimationFrame(animationFrameId)
    lastTimestamp = performance.now()
    animationFrameId = window.requestAnimationFrame(animate)
  }, 40)
}

function handleResize() {
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    resizeCanvas()

    if (!prefersReducedMotion && !animationFrameId) {
      lastTimestamp = performance.now()
      animationFrameId = window.requestAnimationFrame(animate)
    }
  }, 120)
}

function handleVisibilityChange() {
  if (document.hidden) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = 0
    return
  }

  if (!prefersReducedMotion && !animationFrameId) {
    lastTimestamp = performance.now()
    animationFrameId = window.requestAnimationFrame(animate)
  }
}

updateShadowLayers()

onMounted(() => {
  const memory = navigator.deviceMemory || 8
  isLowPowerDevice = memory <= 4
  prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  updateShadowLayers()
  startAnimation()

  window.addEventListener('resize', handleResize, { passive: true })
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  window.clearTimeout(resizeTimer)
  window.clearTimeout(idleTimer)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="starfield" aria-hidden="true">
    <div class="starfield__gradient"></div>
    <div class="starfield__nebula starfield__nebula--left"></div>
    <div class="starfield__nebula starfield__nebula--right"></div>
    <div class="starfield__grid"></div>
    <span class="starfield__stars starfield__stars--far" :style="{ boxShadow: farLayerShadow }"></span>
    <span class="starfield__stars starfield__stars--mid" :style="{ boxShadow: midLayerShadow }"></span>
    <span class="starfield__stars starfield__stars--near" :style="{ boxShadow: nearLayerShadow }"></span>
    <canvas ref="canvasRef" class="starfield__canvas"></canvas>
    <div class="starfield__vignette"></div>
  </div>
</template>

<style scoped>
.starfield {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 55%, rgba(31, 63, 112, 0.22), transparent 28%),
    radial-gradient(circle at top, rgba(70, 112, 186, 0.18), transparent 26%),
    linear-gradient(180deg, #020611 0%, #050b18 34%, #091323 68%, #050915 100%);
}

.starfield__gradient,
.starfield__nebula,
.starfield__grid,
.starfield__canvas,
.starfield__vignette,
.starfield__stars {
  position: absolute;
  inset: 0;
}

.starfield__gradient {
  background:
    radial-gradient(circle at 18% 18%, rgba(107, 144, 255, 0.12), transparent 22%),
    radial-gradient(circle at 82% 14%, rgba(126, 211, 255, 0.1), transparent 18%),
    radial-gradient(circle at 50% 80%, rgba(255, 173, 115, 0.08), transparent 20%);
}

.starfield__nebula {
  filter: blur(46px);
  opacity: 0.82;
}

.starfield__nebula--left {
  inset: 8% auto auto 4%;
  width: 42vw;
  height: 32vw;
  max-width: 620px;
  max-height: 480px;
  background: radial-gradient(circle, rgba(34, 71, 132, 0.26), transparent 68%);
}

.starfield__nebula--right {
  inset: auto 2% 6% auto;
  width: 38vw;
  height: 30vw;
  max-width: 560px;
  max-height: 440px;
  background: radial-gradient(circle, rgba(20, 90, 164, 0.22), transparent 70%);
}

.starfield__grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 160px 160px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.16), transparent 74%);
  opacity: 0.15;
}

.starfield__stars {
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  border-radius: 50%;
  transform: translateZ(0);
}

.starfield__stars--far {
  opacity: 0.85;
}

.starfield__stars--mid {
  width: 1.5px;
  height: 1.5px;
  opacity: 0.78;
}

.starfield__stars--near {
  width: 2px;
  height: 2px;
  opacity: 0.96;
}

.starfield__canvas {
  width: 100%;
  height: 100%;
  opacity: 0.92;
}

.starfield__vignette {
  background:
    radial-gradient(circle at center, transparent 0%, transparent 48%, rgba(2, 6, 17, 0.3) 76%, rgba(2, 6, 17, 0.82) 100%),
    linear-gradient(180deg, rgba(2, 6, 17, 0.18) 0%, transparent 18%, transparent 78%, rgba(2, 6, 17, 0.45) 100%);
}

@media (max-width: 960px) {
  .starfield__grid {
    background-size: 120px 120px;
  }

  .starfield__nebula--left,
  .starfield__nebula--right {
    width: 60vw;
    height: 48vw;
  }
}

@media (prefers-reduced-motion: reduce) {
  .starfield__canvas {
    opacity: 0.65;
  }
}
</style>
