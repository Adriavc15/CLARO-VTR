/**
 * Arregla visuals Comfy Cakes:
 * 1) Fondo: canal de cinta limpio (sin sierra/picos)
 * 2) Strip de cinta continuo, tope plano, sin diagonales artificiales
 * 3) Plataforma: estrella con más contraste
 */
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const DIR = path.resolve(__dirname, '../public/juegos/purble/cakes')
const UI = path.join(DIR, 'ui')

function readPng(fp) {
  return PNG.sync.read(fs.readFileSync(fp))
}
function writePng(fp, png) {
  fs.writeFileSync(fp, PNG.sync.write(png))
}
function idx(png, x, y) {
  return (y * png.width + x) * 4
}
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v))
}

/* ─── 1) Fondo: canal de cinta liso ─── */
const bgPath = path.join(DIR, 'background.png')
const triPath = path.join(DIR, 'background.with-triangles.png')
const mesaPath = path.join(DIR, 'background-mesa.png')

const origBytes = fs.readFileSync(bgPath)
try {
  if (!fs.existsSync(triPath)) fs.writeFileSync(triPath, origBytes)
} catch {
  /* ignore locked backup */
}
const bg = readPng(bgPath)

// Región del canal donde va la cinta móvil (MainBelt ~ y 221–288, x 5–690)
const X0 = 5
const X1 = 690
const Y0 = 218
const Y1 = 272

// Color medio de la cinta (muestra zona central limpia)
const samples = []
for (let y = 230; y <= 255; y++) {
  for (let x = 80; x <= 600; x += 4) {
    const i = idx(bg, x, y)
    if (bg.data[i + 3] < 200) continue
    const L = (bg.data[i] + bg.data[i + 1] + bg.data[i + 2]) / 3
    // Evitar paneles plateados claros y huecos muy negros
    if (L > 70 && L < 145) samples.push([bg.data[i], bg.data[i + 1], bg.data[i + 2]])
  }
}
samples.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]))
const mid = samples[Math.floor(samples.length / 2)] || [95, 95, 100]
console.log('belt trough color', mid, 'from', samples.length, 'samples')

for (let y = Y0; y <= Y1; y++) {
  const edgeT = (y - Y0) / 6
  const edgeB = (Y1 - y) / 5
  const fade = Math.min(1, edgeT, edgeB, 1)
  for (let x = X0; x <= X1; x++) {
    const i = idx(bg, x, y)
    if (bg.data[i + 3] < 180) continue
    const r = bg.data[i]
    const g = bg.data[i + 1]
    const b = bg.data[i + 2]
    const L = (r + g + b) / 3
    // No tocar paneles plateados verticales (muy claros) ni el borde inferior metálico
    if (L > 165) continue
    // Suavizar picos oscuros / sierra y manchas irregulares hacia el color de canal
    const blend = fade * (L < 85 ? 0.92 : L > 140 ? 0.55 : 0.72)
    bg.data[i] = Math.round(r * (1 - blend) + mid[0] * blend)
    bg.data[i + 1] = Math.round(g * (1 - blend) + mid[1] * blend)
    bg.data[i + 2] = Math.round(b * (1 - blend) + mid[2] * blend)
  }
}

// Suavizado horizontal ligero (quita dientes residuales)
for (let y = Y0 + 2; y <= Y1 - 2; y++) {
  for (let x = X0 + 2; x <= X1 - 2; x++) {
    const i = idx(bg, x, y)
    if (bg.data[i + 3] < 180) continue
    const L = (bg.data[i] + bg.data[i + 1] + bg.data[i + 2]) / 3
    if (L > 160) continue
    let r = 0
    let g = 0
    let b = 0
    let n = 0
    for (let dx = -2; dx <= 2; dx++) {
      const j = idx(bg, x + dx, y)
      if (bg.data[j + 3] < 180) continue
      const Lj = (bg.data[j] + bg.data[j + 1] + bg.data[j + 2]) / 3
      if (Lj > 160) continue
      r += bg.data[j]
      g += bg.data[j + 1]
      b += bg.data[j + 2]
      n++
    }
    if (n >= 3) {
      bg.data[i] = Math.round(r / n)
      bg.data[i + 1] = Math.round(g / n)
      bg.data[i + 2] = Math.round(b / n)
    }
  }
}

const cleanPath = path.join(DIR, 'background.clean.png')
writePng(cleanPath, bg)
try {
  writePng(bgPath, bg)
  console.log('background cleaned → background.png')
} catch (e) {
  console.warn('background.png locked, using background.clean.png / mesa:', e.code)
}
try {
  writePng(mesaPath, bg)
} catch (e) {
  console.warn('mesa write failed', e.code)
}
console.log('background cleaned →', cleanPath)

/* ─── 2) Strip de cinta ─── */
const tile = readPng(path.join(UI, 'main-belt_f0.png'))
const TW = tile.width
const TH = tile.height
const src = Buffer.from(tile.data)

function sidx(x, y) {
  return (y * TW + (((x % TW) + TW) % TW)) * 4
}

// Quitar diagonales brillantes del tile
for (let y = 0; y < TH; y++) {
  for (let x = 0; x < TW; x++) {
    const i = (y * TW + x) * 4
    if (src[i + 3] < 40) continue
    const L = src[i]
    const neigh = []
    for (const dx of [-2, -1, 1, 2]) {
      const nx = x + dx
      if (nx < 0 || nx >= TW) continue
      const j = (y * TW + nx) * 4
      if (src[j + 3] > 40) neigh.push(src[j])
    }
    if (!neigh.length) continue
    const avg = neigh.reduce((a, c) => a + c, 0) / neigh.length
    if (L > avg + 28 && L > 130) {
      let r = 0
      let g = 0
      let b = 0
      let n = 0
      for (const dx of [-2, -1, 1, 2]) {
        const nx = x + dx
        if (nx < 0 || nx >= TW) continue
        const j = (y * TW + nx) * 4
        if (src[j + 3] > 40 && src[j] <= avg + 15) {
          r += src[j]
          g += src[j + 1]
          b += src[j + 2]
          n++
        }
      }
      if (n) {
        src[i] = Math.round(r / n)
        src[i + 1] = Math.round(g / n)
        src[i + 2] = Math.round(b / n)
      }
    }
  }
}

const topYs = []
const botYs = []
for (let x = 0; x < TW; x++) {
  let ty = -1
  let by = -1
  for (let y = 0; y < TH; y++) {
    const i = (y * TW + x) * 4
    if (src[i + 3] > 80 && src[i] > 40) {
      if (ty < 0) ty = y
      by = y
    }
  }
  topYs.push(ty)
  botYs.push(by)
}
const avgTop = Math.round(topYs.reduce((a, c) => a + c, 0) / topYs.length)
const avgBot = Math.round(botYs.reduce((a, c) => a + c, 0) / botYs.length)

// Cubrir hasta la plataforma (x≈655) + margen
const TILES = 8
const W = TW * TILES
const pad = 1
const H = avgBot - avgTop + 1 + pad * 2
const out = new PNG({ width: W, height: H })
out.data.fill(0)

for (let x = 0; x < W; x++) {
  // Tope casi plano (sin sierra)
  const t0 = avgTop + Math.sin((x / 420) * Math.PI * 2) * 0.35
  const b0 = avgBot + Math.sin((x / 280) * Math.PI * 2) * 0.25
  for (let y = 0; y < H; y++) {
    const sy = avgTop - pad + y
    const i = (y * W + x) * 4
    if (sy < t0 - 0.5 || sy > b0 + 0.5) {
      out.data[i + 3] = 0
      continue
    }
    const sampleY = clamp(Math.round(sy), avgTop + 2, avgBot - 8)
    const j = sidx(x, sampleY)
    let r = src[j]
    let g = src[j + 1]
    let b = src[j + 2]
    let a = src[j + 3]

    const dTop = sy - t0
    if (dTop < 1.0) a = Math.round(a * Math.max(0, dTop / 1.0))
    const dBot = b0 - sy
    if (dBot < 1.0) a = Math.round(a * Math.max(0, dBot / 1.0))

    // Highlight superior suave (sin diagonales)
    if (dTop >= 0 && dTop < 2.0 && a > 100) {
      r = Math.min(255, r + 12)
      g = Math.min(255, g + 12)
      b = Math.min(255, b + 10)
    }

    out.data[i] = r
    out.data[i + 1] = g
    out.data[i + 2] = b
    out.data[i + 3] = a
  }
}

// Rodillos cada 100px
for (let t = 0; t < TILES; t++) {
  const cx = t * TW + 65
  for (let dy = -8; dy <= 8; dy++) {
    for (let dx = -8; dx <= 8; dx++) {
      if (dx * dx + dy * dy > 64) continue
      const x = cx + dx
      const y = H - 12 + dy
      if (x < 0 || x >= W || y < 0 || y >= H) continue
      const si = sidx(65 + dx, avgBot - 6 + dy)
      if (src[si + 3] < 80) continue
      const i = (y * W + x) * 4
      out.data[i] = src[si]
      out.data[i + 1] = src[si + 1]
      out.data[i + 2] = src[si + 2]
      out.data[i + 3] = src[si + 3]
    }
  }
}

const stripOut = path.join(UI, 'main-belt-strip.png')
writePng(stripOut, out)
console.log('smooth belt', W + 'x' + H, 'avgTop', avgTop, 'avgBot', avgBot)

/* ─── 3) Plataforma: reforzar estrella ─── */
const plat = readPng(path.join(UI, 'conveyor-platform.png'))
// Estrella pálida: pixels más claros que el azul de base, no demasiado blancos
for (let y = 0; y < plat.height; y++) {
  for (let x = 0; x < plat.width; x++) {
    const i = idx(plat, x, y)
    if (plat.data[i + 3] < 40) continue
    const r = plat.data[i]
    const g = plat.data[i + 1]
    const b = plat.data[i + 2]
    const L = (r + g + b) / 3
    // Base azul ~ (180,185,210); estrella ~ (210,205,170) pálida
    const isStarish = r > 175 && g > 165 && b < 200 && r + g > b + 40 && L > 175
    if (!isStarish) continue
    // Empujar hacia amarillo crema más legible
    plat.data[i] = clamp(Math.round(r * 0.55 + 235 * 0.45), 0, 255)
    plat.data[i + 1] = clamp(Math.round(g * 0.55 + 210 * 0.45), 0, 255)
    plat.data[i + 2] = clamp(Math.round(b * 0.7 + 90 * 0.3), 0, 255)
  }
}
writePng(path.join(UI, 'conveyor-platform.png'), plat)
console.log('platform star contrast boosted')

// cleanup temp frames
const tmp = path.join(UI, '_plat_frames')
if (fs.existsSync(tmp)) fs.rmSync(tmp, { recursive: true, force: true })

console.log('done')
