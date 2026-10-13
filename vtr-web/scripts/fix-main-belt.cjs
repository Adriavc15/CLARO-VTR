/**
 * Correa Comfy Cakes continua:
 * textura del sprite original + borde superior suave en todo el ancho
 * (sin el “sierra” de repetir la onda cada 100px).
 */
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const DIR = path.resolve(__dirname, '../public/juegos/purble/cakes/ui')
const SRC = path.join(DIR, 'main-belt_f0.png')
const OUT = path.join(DIR, 'main-belt-strip.png')

const tile = PNG.sync.read(fs.readFileSync(SRC))
const TW = tile.width
const TH = tile.height
const src = Buffer.from(tile.data)

function sidx(x, y) {
  return (y * TW + (((x % TW) + TW) % TW)) * 4
}

// Quitar diagonal brillante suelta del frame
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
    const avg = neigh.reduce((a, b) => a + b, 0) / neigh.length
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

// Perfil superior/inferior del tile (para promedio)
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
const avgTop = Math.round(topYs.reduce((a, b) => a + b, 0) / topYs.length)
const avgBot = Math.round(botYs.reduce((a, b) => a + b, 0) / botYs.length)

const TILES = 9
const W = TW * TILES
const pad = 2
const H = avgBot - avgTop + 1 + pad * 2
const out = new PNG({ width: W, height: H })
out.data.fill(0)

function topEdge(x) {
  // Onda suave continua (periodo largo) — sin reset cada 100px
  return avgTop + Math.sin((x / W) * Math.PI * 2) * 1.2 + Math.sin((x / 180) * Math.PI * 2) * 0.6
}

function botEdge(x) {
  return avgBot + Math.sin((x / 140) * Math.PI * 2) * 0.4
}

for (let x = 0; x < W; x++) {
  const t0 = topEdge(x)
  const b0 = botEdge(x)
  for (let y = 0; y < H; y++) {
    const sy = avgTop - pad + y
    const i = (y * W + x) * 4
    if (sy < t0 - 0.5 || sy > b0 + 0.5) {
      out.data[i + 3] = 0
      continue
    }

    // Sample body from original (skip very top/bottom 2px of tile — redraw edges)
    const sampleY = Math.max(avgTop + 2, Math.min(avgBot - 8, Math.round(sy)))
    const j = sidx(x, sampleY)
    let r = src[j]
    let g = src[j + 1]
    let b = src[j + 2]
    let a = src[j + 3]

    // Soft top antialias
    const dTop = sy - t0
    if (dTop < 1.2) a = Math.round(a * Math.max(0, dTop / 1.2))
    const dBot = b0 - sy
    if (dBot < 1.2) a = Math.round(a * Math.max(0, dBot / 1.2))

    // Highlight superior sutil
    if (dTop >= 0 && dTop < 2.5 && a > 100) {
      r = Math.min(255, r + 18)
      g = Math.min(255, g + 18)
      b = Math.min(255, b + 16)
    }

    // Diagonal continua, periodo 100 (rodillos)
    const localY = sy - avgTop
    if (a > 180 && localY > 5 && localY < H - 16) {
      const phase = (x + localY * 0.9) % 100
      if (phase > 96.5 && phase < 98.5) {
        r = Math.min(255, r + 34)
        g = Math.min(255, g + 34)
        b = Math.min(255, b + 32)
      }
    }

    out.data[i] = r
    out.data[i + 1] = g
    out.data[i + 2] = b
    out.data[i + 3] = a
  }
}

// Rodillos del original, espaciados cada 100px (posición relativa del tile ~x65)
for (let t = 0; t < TILES; t++) {
  const cx = t * TW + 65
  for (let dy = -8; dy <= 8; dy++) {
    for (let dx = -8; dx <= 8; dx++) {
      const d2 = dx * dx + dy * dy
      if (d2 > 64) continue
      const x = cx + dx
      const y = H - 12 + dy
      if (x < 0 || x >= W || y < 0 || y >= H) continue
      const si = sidx(65 + dx, avgBot - 6 + dy)
      // Solo copiar si el original tiene rodillo ahí
      if (src[si + 3] < 80) continue
      const i = (y * W + x) * 4
      out.data[i] = src[si]
      out.data[i + 1] = src[si + 1]
      out.data[i + 2] = src[si + 2]
      out.data[i + 3] = src[si + 3]
    }
  }
}

fs.writeFileSync(OUT, PNG.sync.write(out))
console.log('smooth belt', W + 'x' + H, 'avgTop', avgTop, 'avgBot', avgBot)
