const REMOTE_URL_PATTERN = /^https?:\/\//i
const DATA_URL_PATTERN = /^data:/i
const COLOR_PAIRS = [
  ['#0f172a', '#2563eb'],
  ['#111827', '#0891b2'],
  ['#1e1b4b', '#7c3aed'],
  ['#3f1d2e', '#f97316'],
  ['#0f3d3e', '#14b8a6'],
]

function getBaseUrl() {
  return import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
}

function getAvatarLabel(label) {
  const normalized = String(label || '').trim()

  if (!normalized) {
    return 'AI'
  }

  return Array.from(normalized).slice(0, 2).join('').toUpperCase()
}

function createAvatarPlaceholder(label, seed = 0) {
  const [startColor, endColor] = COLOR_PAIRS[Math.abs(seed) % COLOR_PAIRS.length]
  const avatarLabel = getAvatarLabel(label)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${avatarLabel}">
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="36" fill="url(#avatarGradient)" />
      <circle cx="80" cy="80" r="58" fill="rgba(255,255,255,0.12)" />
      <text
        x="50%"
        y="54%"
        fill="#f8fafc"
        font-family="PingFang SC, Microsoft YaHei, sans-serif"
        font-size="48"
        font-weight="700"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${avatarLabel}
      </text>
    </svg>
  `.trim()

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function resolveAppAssetUrl(assetPath = '') {
  if (!assetPath) {
    return ''
  }

  if (REMOTE_URL_PATTERN.test(assetPath) || DATA_URL_PATTERN.test(assetPath)) {
    return assetPath
  }

  const normalizedPath = assetPath.replace(/^\//, '')
  return `${getBaseUrl()}${normalizedPath}`
}

export function resolveTalentAvatar(talent, seed = 0) {
  const avatarPath = talent?.avatar?.trim?.() || ''

  if (avatarPath && !REMOTE_URL_PATTERN.test(avatarPath)) {
    return resolveAppAssetUrl(avatarPath)
  }

  return createAvatarPlaceholder(talent?.name || talent?.organization || 'AI', seed)
}
