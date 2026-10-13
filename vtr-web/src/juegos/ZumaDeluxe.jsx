/**
 * Zuma Deluxe — texturas + mapas, sonido, power-ups, combo, pausa y récord local.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react'

const ASSET = '/juegos/zuma'
const COLOR_KEYS = ['red', 'green', 'blue', 'yellow', 'purple']
const POWER_KEYS = ['bomb', 'slow', 'reverse', 'accuracy']
const BALL_R_BASE = 16
const FRAME = 32
const SHOT_SPEED = 11
const CHAIN_SPEED_BASE = 0.55
const LEVEL_W = 640
const LEVEL_H = 480
const HS_KEY = 'vtr-zuma-highscore'
const MUTE_KEY = 'vtr-zuma-muted'
const COIN_FW = 36
const COIN_FH = 40
const COIN_FRAMES = 27
const SPARK_FW = 20
const SPARK_FRAMES = 14
const WIN_CELEBRATE_FRAMES = 220
const TRANSITION_FRAMES = 36
const QUAKE_END = 32
const JUMP_START = 48
const JUMP_DUR = 100
/** En este punto del arco (0–1) se revela el siguiente mapa bajo el sapo */
const JUMP_SWAP_U = 0.42

const cap = (c) => c.charAt(0).toUpperCase() + c.slice(1)

const BALL_SRC = {
  red: `${ASSET}/balls/baBallRed.png`,
  green: `${ASSET}/balls/baBallGreen.png`,
  blue: `${ASSET}/balls/baBallBlue.png`,
  yellow: `${ASSET}/balls/baBallYellow.png`,
  purple: `${ASSET}/balls/baBallPurple.png`,
  white: `${ASSET}/balls/baBallWhite.png`,
}

/** Texturas originales de poderes (PopCap): Bomb / Slow / Backwards / Accuracy por color */
const POWER_BALL_SRC = {}
for (const c of COLOR_KEYS) {
  const C = cap(c)
  POWER_BALL_SRC[`bomb_${c}`] = `${ASSET}/balls/baBomb${C}.png`
  POWER_BALL_SRC[`slow_${c}`] = `${ASSET}/balls/baSlow${C}.png`
  POWER_BALL_SRC[`reverse_${c}`] = `${ASSET}/balls/baBackwards${C}.png`
  POWER_BALL_SRC[`accuracy_${c}`] = `${ASSET}/balls/baAccuracy${C}.png`
}
POWER_BALL_SRC.bomb_white = `${ASSET}/balls/baBombWhite.png`
POWER_BALL_SRC.slow_white = `${ASSET}/balls/baSlowWhite.png`
POWER_BALL_SRC.reverse_white = `${ASSET}/balls/baBackwardsWhite.png`
POWER_BALL_SRC.accuracy_white = `${ASSET}/balls/baAccuracyWhite.png`

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(src))
    img.src = src
  })
}

/** Quita el fondo del sapito de vidas usando la máscara blanca (_toadlives) */
function makeLivesIcon(colorImg, maskImg) {
  const w = colorImg.naturalWidth || colorImg.width
  const h = colorImg.naturalHeight || colorImg.height
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  ctx.drawImage(colorImg, 0, 0)
  const pix = ctx.getImageData(0, 0, w, h)
  if (maskImg) {
    const mc = document.createElement('canvas')
    mc.width = w
    mc.height = h
    const mctx = mc.getContext('2d')
    mctx.drawImage(maskImg, 0, 0, w, h)
    const mask = mctx.getImageData(0, 0, w, h)
    for (let i = 0; i < pix.data.length; i += 4) {
      const a = mask.data[i] // blanco = sapo
      pix.data[i + 3] = a
    }
  } else {
    // Fallback: chroma de verdes oscuros de fondo
    for (let i = 0; i < pix.data.length; i += 4) {
      const r = pix.data[i]
      const g = pix.data[i + 1]
      const b = pix.data[i + 2]
      if (g > r + 15 && g > b + 10 && g < 90) pix.data[i + 3] = 0
      else if (r < 40 && g < 55 && b < 40) pix.data[i + 3] = 0
    }
  }
  ctx.putImageData(pix, 0, 0)
  return c
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function layoutForCanvas(cw, ch) {
  const scale = Math.min(cw / LEVEL_W, ch / LEVEL_H)
  const w = LEVEL_W * scale
  const h = LEVEL_H * scale
  const ox = (cw - w) / 2
  const oy = (ch - h) / 2
  return { scale, ox, oy, w, h }
}

function mapPt(p, lay) {
  return { x: lay.ox + p.x * lay.scale, y: lay.oy + p.y * lay.scale }
}

function densifyPath(raw, lay, stepsPerSeg = 14) {
  if (!raw?.length) return []
  const pts = []
  for (let i = 0; i < raw.length - 1; i++) {
    const p0 = mapPt(raw[i], lay)
    const p2 = mapPt(raw[i + 1], lay)
    const ctrl =
      raw[i].cx != null
        ? mapPt({ x: raw[i].cx, y: raw[i].cy }, lay)
        : { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 }
    for (let s = 0; s < stepsPerSeg; s++) {
      const t = s / stepsPerSeg
      const u = 1 - t
      pts.push({
        x: u * u * p0.x + 2 * u * t * ctrl.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * ctrl.y + t * t * p2.y,
      })
    }
  }
  pts.push(mapPt(raw[raw.length - 1], lay))
  return pts
}

function pathLen(path) {
  let L = 0
  for (let i = 1; i < path.length; i++) L += dist(path[i - 1], path[i])
  return L
}

function pointOnPath(path, s) {
  if (!path.length) return { x: 0, y: 0, angle: 0 }
  if (s <= 0) {
    const a =
      path.length > 1
        ? Math.atan2(path[1].y - path[0].y, path[1].x - path[0].x)
        : 0
    return { ...path[0], angle: a }
  }
  let acc = 0
  for (let i = 1; i < path.length; i++) {
    const seg = dist(path[i - 1], path[i])
    if (acc + seg >= s) {
      const t = (s - acc) / seg
      const x = path[i - 1].x + (path[i].x - path[i - 1].x) * t
      const y = path[i - 1].y + (path[i].y - path[i - 1].y) * t
      const angle = Math.atan2(path[i].y - path[i - 1].y, path[i].x - path[i - 1].x)
      return { x, y, angle }
    }
    acc += seg
  }
  const n = path.length
  const angle =
    n > 1
      ? Math.atan2(path[n - 1].y - path[n - 2].y, path[n - 1].x - path[n - 2].x)
      : 0
  return { ...path[n - 1], angle }
}

function readHighScore() {
  try {
    const n = Number(localStorage.getItem(HS_KEY) || 0)
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function writeHighScore(score) {
  try {
    const prev = readHighScore()
    if (score > prev) localStorage.setItem(HS_KEY, String(score))
    return Math.max(prev, score)
  } catch {
    return score
  }
}

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

/** SFX: archivos originales del pack + fallback sintético */
function createSfx() {
  let ctx = null
  const ensure = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }

  const tone = (freq, dur, type = 'square', vol = 0.08, slide = 0) => {
    const ac = ensure()
    if (!ac) return
    const t0 = ac.currentTime
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, t0)
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur)
    g.gain.setValueAtTime(vol, t0)
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
    o.connect(g)
    g.connect(ac.destination)
    o.start(t0)
    o.stop(t0 + dur + 0.02)
  }

  const cache = {}
  const playOgg = (name, vol = 0.55) => {
    ensure()
    try {
      let a = cache[name]
      if (!a) {
        a = new Audio(`${ASSET}/sounds/${name}.ogg`)
        cache[name] = a
      }
      a.volume = vol
      a.currentTime = 0
      const p = a.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
      return true
    } catch {
      return false
    }
  }

  return {
    unlock: () => {
      ensure()
      playOgg('chant2', 0.01)
    },
    shoot: () => tone(420, 0.08, 'square', 0.06, 180),
    swap: () => tone(280, 0.06, 'triangle', 0.05),
    match: (n = 3) => {
      tone(520 + n * 40, 0.12, 'square', 0.07, 120)
      setTimeout(() => tone(660 + n * 30, 0.1, 'triangle', 0.05), 40)
    },
    combo: (c) => {
      tone(700 + c * 80, 0.15, 'sawtooth', 0.06, 200)
      setTimeout(() => tone(900 + c * 60, 0.12, 'square', 0.05), 60)
    },
    power: () => {
      tone(360, 0.1, 'triangle', 0.07, -80)
      setTimeout(() => tone(540, 0.14, 'square', 0.06, 200), 50)
    },
    warn: () => tone(180, 0.2, 'sawtooth', 0.04, -40),
    win: () => {
      if (!playOgg('chant5', 0.6)) {
        ;[523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.07), i * 90))
      }
      setTimeout(() => playOgg('endoflevelpop1', 0.45), 120)
    },
    earthquake: () => {
      if (!playOgg('earthquake', 0.7)) {
        tone(60, 0.8, 'sawtooth', 0.08, -20)
        tone(40, 1.0, 'triangle', 0.06, -10)
      }
    },
    frogland: () => {
      if (!playOgg('frogland2', 0.65)) tone(220, 0.15, 'triangle', 0.08, -80)
    },
    lose: () => {
      tone(300, 0.25, 'sawtooth', 0.07, -180)
      setTimeout(() => tone(160, 0.35, 'triangle', 0.06, -60), 120)
    },
  }
}

/** Parte el fondo del mapa en losas que vuelan (como el terremoto original) */
function shatterLevelBg(bg, ox, oy, bw, bh, cols = 11, rows = 8) {
  const tiles = []
  if (!bg) return tiles
  const sw = bg.naturalWidth || bg.width
  const sh = bg.naturalHeight || bg.height
  const tw = bw / cols
  const th = bh / rows
  const stx = sw / cols
  const sty = sh / rows
  const cx0 = ox + bw / 2
  const cy0 = oy + bh / 2
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = ox + col * tw
      const y = oy + row * th
      const cx = x + tw / 2
      const cy = y + th / 2
      const ang = Math.atan2(cy - cy0, cx - cx0)
      const d = Math.hypot(cx - cx0, cy - cy0)
      // Velocidades ya en píxeles de canvas (ox/oy/bw ya escalados)
      const kick = 1.6 + d * 0.012 + Math.random() * 1.8
      tiles.push({
        sx: col * stx,
        sy: row * sty,
        sw: stx,
        sh: sty,
        x,
        y,
        w: tw + 0.5,
        h: th + 0.5,
        vx: Math.cos(ang) * kick + (Math.random() - 0.5) * 1.2,
        vy: Math.sin(ang) * kick * 0.75 - 2.8 - Math.random() * 3.2,
        rot: 0,
        vr: (Math.random() - 0.5) * 0.16,
        delay: Math.floor(d * 0.035 + Math.random() * 6),
        active: false,
      })
    }
  }
  return tiles
}

/** Posición del sapo en un mapa (mismo layout de canvas) */
function frogPadOnMap(levelData, lay) {
  if (!levelData?.frog || !lay) return null
  return mapPt(levelData.frog, lay)
}

function colorsOnBoard(st) {
  const set = new Set()
  if (!st?.chains) return COLOR_KEYS.slice()
  for (const chain of st.chains) {
    for (const b of chain.balls) {
      if (b.s < -(st.ballR || 16) * 3) continue
      if (b.color && b.color !== 'white') set.add(b.color)
    }
  }
  const list = [...set]
  return list.length ? list : COLOR_KEYS.slice()
}

function rollBallSpec(forChain = false, colorPool = null) {
  const pool = colorPool?.length ? colorPool : COLOR_KEYS
  const r = Math.random()
  const powerChance = forChain ? 0.12 : 0.1
  const whiteChance = forChain ? 0.05 : 0.06
  if (r < powerChance) {
    const power = POWER_KEYS[Math.floor(Math.random() * POWER_KEYS.length)]
    return { color: pool[Math.floor(Math.random() * pool.length)], power }
  }
  if (r < powerChance + whiteChance) {
    return { color: 'white', power: 'white' }
  }
  return { color: pool[Math.floor(Math.random() * pool.length)], power: null }
}

function nextFrogBall(st) {
  return rollBallSpec(false, colorsOnBoard(st))
}

function makeChain(rawPath, lay, ballR, count, nextIdStart) {
  const path = densifyPath(rawPath, lay)
  const total = pathLen(path)
  const gap = ballR * 2
  const balls = []
  for (let i = 0; i < count; i++) {
    const spec = rollBallSpec(true)
    balls.push({
      id: nextIdStart + i,
      color: spec.color,
      power: spec.power,
      s: -i * gap - 50 * lay.scale,
      rot: Math.floor(Math.random() * 50),
    })
  }
  // Asegura al menos 2 poderes visibles en la cadena
  const powered = balls.filter((b) => b.power)
  if (powered.length < 2 && balls.length > 4) {
    const idxs = []
    while (idxs.length < 2) {
      const i = 2 + Math.floor(Math.random() * (balls.length - 3))
      if (!idxs.includes(i)) idxs.push(i)
    }
    for (const i of idxs) {
      if (balls[i].power) continue
      const power = POWER_KEYS[Math.floor(Math.random() * POWER_KEYS.length)]
      balls[i].power = power
      if (balls[i].color === 'white') balls[i].color = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)]
    }
  }
  return {
    path,
    total,
    balls,
    pendingJoinCheck: false,
    nextId: nextIdStart + count,
  }
}

function bestWildColor(balls, idx) {
  let best = COLOR_KEYS[0]
  let bestN = 0
  for (const c of COLOR_KEYS) {
    let L = idx
    let R = idx
    while (L > 0 && balls[L - 1].color === c) L--
    while (R < balls.length - 1 && balls[R + 1].color === c) R++
    const n = R - L + 1
    if (n > bestN) {
      bestN = n
      best = c
    }
  }
  return best
}

export default function ZumaDeluxe({ onSalir }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const assetsRef = useRef(null)
  const manifestRef = useRef([])
  const levelsCacheRef = useRef({})
  const rafRef = useRef(0)
  const sfxRef = useRef(null)
  const mutedRef = useRef(readMuted())
  const transitionRef = useRef(null)
  /** Salto continuo pad→pad (sobrevive al cargar el siguiente mapa) */
  const jumpTravelRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [loadErr, setLoadErr] = useState(null)
  const [muted, setMuted] = useState(readMuted())
  const [ui, setUi] = useState({
    score: 0,
    highScore: readHighScore(),
    lives: 3,
    status: 'playing',
    level: 1,
    mapName: '',
    mapIndex: 0,
    mapTotal: 0,
    combo: 0,
    effect: '',
    newRecord: false,
  })

  const play = useCallback((name, arg) => {
    if (mutedRef.current) return
    const sfx = sfxRef.current
    if (!sfx) return
    const fn = sfx[name]
    if (typeof fn === 'function') fn(arg)
  }, [])

  const applyLevelData = useCallback((levelData, levelNum, keepScore = 0, mapMeta = null, opts = {}) => {
    const canvas = canvasRef.current
    if (!canvas || !levelData) return
    // Evita layout a 0×0 (rompe caminos/fondo al cambiar de mapa)
    if (canvas.width < 32 || canvas.height < 32) {
      const wide = window.innerWidth >= 1024
      const availW = Math.max(280, window.innerWidth - (wide ? 16 : 8))
      const availH = Math.max(240, window.innerHeight - (wide ? 68 : 118))
      let w = availW
      let h = Math.round((w * LEVEL_H) / LEVEL_W)
      if (h > availH) {
        h = availH
        w = Math.round((h * LEVEL_W) / LEVEL_H)
      }
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    if (!levelData.path?.length || !levelData.frog) {
      console.warn('Zuma: mapa inválido', levelData?.id || mapMeta?.id)
      return
    }
    const lay = layoutForCanvas(canvas.width, canvas.height)
    const ballR = BALL_R_BASE * lay.scale
    const count = Math.min(24 + Math.floor(levelNum * 1.5), 44)
    const chain1 = makeChain(levelData.path, lay, ballR, count, 1)
    const chains = [chain1]
    if (levelData.path2?.length) {
      const count2 = Math.min(16 + Math.floor(levelNum), 28)
      chains.push(makeChain(levelData.path2, lay, ballR, count2, 1000))
    }
    const frogPt = mapPt(levelData.frog, lay)
    const levelId = levelData.id || mapMeta?.id || ''
    const levelName = levelData.name || mapMeta?.name || levelId
    const mapIndex = manifestRef.current.findIndex((m) => m.id === levelId)
    const baseSpeed = (CHAIN_SPEED_BASE + (levelNum - 1) * 0.06) * lay.scale
    const loadSpec = rollBallSpec(false)
    const queueSpec = rollBallSpec(false)
    const bgImg = levelData._bgImg || null
    stateRef.current = {
      lay,
      ballR,
      chains,
      frog: { x: frogPt.x, y: frogPt.y, angle: -Math.PI / 2 },
      loaded: loadSpec.color,
      loadedPower: loadSpec.power,
      queued: queueSpec.color,
      queuedPower: queueSpec.power,
      shots: [],
      score: keepScore,
      lives: 3,
      level: levelNum,
      mapId: levelId,
      mapName: levelName,
      mapIndex: mapIndex >= 0 ? mapIndex : 0,
      status: 'playing',
      baseSpeed,
      speed: baseSpeed,
      particles: [],
      fx: [],
      shake: 0,
      tick: 0,
      combo: 0,
      comboTimer: 0,
      slowTimer: 0,
      reverseTimer: 0,
      accuracyTimer: 0,
      dangerFlash: 0,
      lastWarnTick: 0,
      // Evita ganar al instante si la cadena nace vacía por error
      spawnGuard: opts.midJump ? 120 : 90,
      lifeCooldown: 0,
      introFade: opts.fadeIn && !opts.midJump ? TRANSITION_FRAMES / 2 : 0,
      frogLandT: opts.fromWinJump && !opts.midJump ? 40 : 0,
      hideFrog: !!opts.midJump,
      bgImg,
    }
    if (assetsRef.current) assetsRef.current.bg = bgImg
    if (opts.fromWinJump && !opts.midJump) {
      try {
        sfxRef.current?.frogland?.()
      } catch {
        /* ignore */
      }
    }
    setUi({
      score: keepScore,
      highScore: readHighScore(),
      lives: 3,
      status: opts.midJump ? 'celebrating' : 'playing',
      level: levelNum,
      mapName: levelName,
      mapIndex: mapIndex >= 0 ? mapIndex : 0,
      mapTotal: manifestRef.current.length,
      combo: 0,
      effect: opts.midJump ? '¡ZUMA!' : '',
      newRecord: false,
    })
  }, [])

  const loadMap = useCallback(
    async (mapIndex, levelNum, keepScore = 0, opts = {}) => {
      const list = manifestRef.current
      if (!list.length) return
      const meta = list[((mapIndex % list.length) + list.length) % list.length]
      if (!meta?.id) return
      try {
        let data = levelsCacheRef.current[meta.id]
        if (!data?._bgImg || !data?.path?.length) {
          const json = await fetch(`${ASSET}/levels/${meta.id}.json`).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status} ${meta.id}`)
            return r.json()
          })
          const bgImg = await loadImage(`${ASSET}/levels/${meta.bg || json.bg}`)
          data = {
            ...json,
            id: json.id || meta.id,
            name: json.name || meta.name,
            bg: json.bg || meta.bg,
            _bgImg: bgImg,
          }
          levelsCacheRef.current[meta.id] = data
        }
        applyLevelData(data, levelNum, keepScore, meta, opts)
      } catch (err) {
        console.error('Zuma loadMap failed', meta.id, err)
        // Reintenta el siguiente mapa del manifiesto para no dejar el nivel roto
        const fallback = list[((mapIndex + 1) % list.length + list.length) % list.length]
        if (fallback?.id && fallback.id !== meta.id) {
          try {
            const json = await fetch(`${ASSET}/levels/${fallback.id}.json`).then((r) => r.json())
            const bgImg = await loadImage(`${ASSET}/levels/${fallback.bg || json.bg}`)
            const data = { ...json, id: json.id || fallback.id, name: json.name || fallback.name, _bgImg: bgImg }
            levelsCacheRef.current[fallback.id] = data
            applyLevelData(data, levelNum, keepScore, fallback, opts)
          } catch (err2) {
            console.error('Zuma fallback map failed', err2)
            setLoadErr('No se pudo cargar el siguiente mapa.')
          }
        } else {
          setLoadErr('No se pudo cargar el siguiente mapa.')
        }
      }
    },
    [applyLevelData]
  )

  useEffect(() => {
    sfxRef.current = createSfx()
    let cancelled = false
    ;(async () => {
      try {
        const loadSoft = (src, key) =>
          loadImage(src)
            .then((img) => [key, img])
            .catch(() => {
              console.warn('Zuma asset missing', src)
              return [key, null]
            })

        const [manifest, ...imgEntries] = await Promise.all([
          fetch(`${ASSET}/levels/manifest.json`).then((r) => r.json()),
          ...Object.entries(BALL_SRC).map(([k, src]) => loadImage(src).then((img) => [k, img])),
          ...Object.entries(POWER_BALL_SRC).map(([k, src]) => loadSoft(src, k)),
          loadSoft(`${ASSET}/balls/ballshadow.png`, 'shadow'),
          loadSoft(`${ASSET}/balls/_baBomb.gif`, 'bombGlow'),
          loadSoft(`${ASSET}/balls/ballalpha.png`, 'ballAlpha'),
          loadSoft(`${ASSET}/ui/accuracyLight.gif`, 'accuracyLight'),
          loadSoft(`${ASSET}/ui/aimDot.gif`, 'aimDot'),
          loadSoft(`${ASSET}/balls/baLightYellow.gif`, 'aimGlow'),
          loadImage(`${ASSET}/ui/hole.png`).then((img) => ['hole', img]),
          loadImage(`${ASSET}/ui/frog.png`).then((img) => ['frog', img]),
          loadImage(`${ASSET}/ui/tongue.png`).then((img) => ['tongue', img]),
          loadImage(`${ASSET}/ui/explosion.png`).then((img) => ['explosion', img]),
          loadSoft(`${ASSET}/ui/lives.gif`, 'livesRaw'),
          loadSoft(`${ASSET}/ui/livesMask.gif`, 'livesMask'),
          loadSoft(`${ASSET}/ui/coin.gif`, 'coin'),
          loadSoft(`${ASSET}/ui/sparkle.gif`, 'sparkle'),
        ])
        if (cancelled) return
        manifestRef.current = manifest.levels || []
        const prevBg = assetsRef.current?.bg
        const assets = Object.fromEntries(imgEntries.filter(([, v]) => v))
        if (assets.livesRaw) {
          assets.lives = makeLivesIcon(assets.livesRaw, assets.livesMask || null)
        }
        assetsRef.current = assets
        if (prevBg) assetsRef.current.bg = prevBg
        const loadedPowers = Object.keys(assetsRef.current).filter((k) =>
          /^(bomb|slow|reverse|accuracy)_/.test(k)
        )
        if (loadedPowers.length < 8) {
          console.warn('Zuma power textures loaded:', loadedPowers.length, loadedPowers)
        }
        setReady(true)
      } catch (err) {
        console.error(err)
        if (!cancelled) setLoadErr('No se pudieron cargar las texturas de Zuma.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const canvas = canvasRef.current
    if (!canvas) return

    const relayoutInPlace = () => {
      const st = stateRef.current
      if (!st?.mapId) return false
      const data = levelsCacheRef.current[st.mapId]
      if (!data) return false
      const lay = layoutForCanvas(canvas.width, canvas.height)
      const ballR = BALL_R_BASE * lay.scale
      const frogPt = mapPt(data.frog, lay)
      const oldTotal0 = st.chains[0]?.total || 1
      const path0 = densifyPath(data.path, lay)
      const total0 = pathLen(path0)
      const ratio0 = total0 / oldTotal0
      st.chains[0].path = path0
      st.chains[0].total = total0
      for (const b of st.chains[0].balls) b.s *= ratio0
      if (data.path2?.length && st.chains[1]) {
        const oldTotal1 = st.chains[1].total || 1
        const path1 = densifyPath(data.path2, lay)
        const total1 = pathLen(path1)
        const ratio1 = total1 / oldTotal1
        st.chains[1].path = path1
        st.chains[1].total = total1
        for (const b of st.chains[1].balls) b.s *= ratio1
      }
      st.lay = lay
      st.ballR = ballR
      st.frog.x = frogPt.x
      st.frog.y = frogPt.y
      st.baseSpeed = (CHAIN_SPEED_BASE + (st.level - 1) * 0.06) * lay.scale
      st.speed = st.baseSpeed
      if (data._bgImg) st.bgImg = data._bgImg
      return true
    }

    const resize = () => {
      const wide = window.innerWidth >= 1024
      const availW = Math.max(280, window.innerWidth - (wide ? 16 : 8))
      const availH = Math.max(240, window.innerHeight - (wide ? 68 : 118))
      let w = availW
      let h = Math.round((w * LEVEL_H) / LEVEL_W)
      if (h > availH) {
        h = availH
        w = Math.round((h * LEVEL_W) / LEVEL_H)
      }
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const st = stateRef.current
      if (st && (st.status === 'playing' || st.status === 'paused') && relayoutInPlace()) {
        return
      }
      // En won/lost/loading/celebrating/transition no re-cargar a ciegas
      if (
        st &&
        (st.status === 'won' ||
          st.status === 'lost' ||
          st.status === 'loading' ||
          st.status === 'celebrating' ||
          st.status === 'transition')
      ) {
        return
      }
      loadMap(st?.mapIndex || 0, st?.level || 1, st?.score || 0)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [ready, loadMap])

  useEffect(() => {
    if (!ready) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const findMatches = (balls, startIdx) => {
      const color = balls[startIdx]?.color
      if (!color || color === 'white') return []
      let L = startIdx
      let R = startIdx
      while (L > 0 && balls[L - 1].color === color) L--
      while (R < balls.length - 1 && balls[R + 1].color === color) R++
      if (R - L + 1 < 3) return []
      const idxs = []
      for (let i = L; i <= R; i++) idxs.push(i)
      return idxs
    }

    const EXP_FW = 85
    const EXP_FH = 86
    const EXP_USE = 11

    const spawnBurst = (st, x, y, color) => {
      const sc = st.lay.scale
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = (1.5 + Math.random() * 3) * sc
        st.particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 12 + Math.random() * 10,
          color: color === 'white' ? 'yellow' : color,
          scale: 0.25 + Math.random() * 0.25,
        })
      }
      st.fx.push({ x, y, frame: 0, max: EXP_USE })
    }

    const applyPowerEffect = (st, power, atX, atY, chain) => {
      if (!power || power === 'white') return
      play('power')
      if (power === 'slow') {
        st.slowTimer = Math.max(st.slowTimer, 240)
        setUi((u) => ({ ...u, effect: 'Ralentizar' }))
      } else if (power === 'reverse') {
        st.reverseTimer = Math.max(st.reverseTimer, 200)
        setUi((u) => ({ ...u, effect: 'Invertir' }))
      } else if (power === 'accuracy') {
        st.accuracyTimer = Math.max(st.accuracyTimer || 0, 280)
        setUi((u) => ({ ...u, effect: 'Precisión' }))
      } else if (power === 'bomb' && chain) {
        const gap = st.ballR * 2
        const idxs = []
        for (let i = 0; i < chain.balls.length; i++) {
          const p = pointOnPath(chain.path, chain.balls[i].s)
          if (dist(p, { x: atX, y: atY }) < gap * 3.2) idxs.push(i)
        }
        if (idxs.length) removeBalls(st, chain, idxs, true)
      }
    }

    const removeBalls = (st, chain, idxs, fromBomb = false) => {
      if (!idxs.length) return
      const set = new Set(idxs)
      let cx = 0
      let cy = 0
      let n = 0
      let color = 'yellow'
      const powers = []
      for (const i of idxs) {
        const b = chain.balls[i]
        const p = pointOnPath(chain.path, b.s)
        cx += p.x
        cy += p.y
        n++
        color = b.color
        if (b.power && b.power !== 'white') powers.push({ power: b.power, x: p.x, y: p.y })
      }
      spawnBurst(st, cx / n, cy / n, color)

      if (!fromBomb) {
        st.combo = (st.comboTimer > 0 ? st.combo : 0) + 1
        st.comboTimer = 90
        const mult = 1 + Math.max(0, st.combo - 1) * 0.5
        const base = idxs.length * 10 + Math.max(0, idxs.length - 3) * 25
        st.score += Math.round(base * mult)
        if (st.combo >= 2) play('combo', st.combo)
        else play('match', idxs.length)
        setUi((u) => ({ ...u, score: st.score, combo: st.combo }))
      } else {
        st.score += idxs.length * 8
        setUi((u) => ({ ...u, score: st.score }))
      }

      chain.balls = chain.balls.filter((_, i) => !set.has(i))
      chain.balls.sort((a, b) => a.s - b.s)
      chain.pendingJoinCheck = true

      if (!fromBomb) {
        for (const pw of powers) applyPowerEffect(st, pw.power, pw.x, pw.y, chain)
      }
    }

    const updateChain = (st, chain) => {
      if (!chain.balls.length) return
      const gap = st.ballR * 2
      chain.balls.sort((a, b) => a.s - b.s)

      const groups = []
      let g = [chain.balls[0]]
      for (let i = 1; i < chain.balls.length; i++) {
        if (chain.balls[i].s - chain.balls[i - 1].s <= gap * 1.2) g.push(chain.balls[i])
        else {
          groups.push(g)
          g = [chain.balls[i]]
        }
      }
      groups.push(g)

      for (const b of groups[0]) b.s += st.speed

      const pullSpeed = Math.abs(st.speed) * 2.2
      for (let gi = 1; gi < groups.length; gi++) {
        const prev = groups[gi - 1]
        const cur = groups[gi]
        const meet = prev[prev.length - 1].s + gap
        const delta = cur[0].s - meet
        if (delta > 0.5) {
          const pull = Math.min(pullSpeed, delta)
          for (const b of cur) b.s -= pull
        }
      }

      chain.balls.sort((a, b) => a.s - b.s)
      for (let i = 1; i < chain.balls.length; i++) {
        const minS = chain.balls[i - 1].s + gap
        if (chain.balls[i].s < minS) chain.balls[i].s = minS
      }

      for (const b of chain.balls) b.rot = b.s / (st.ballR * 0.55)

      if (chain.pendingJoinCheck) {
        let closed = true
        for (let i = 1; i < chain.balls.length; i++) {
          if (chain.balls[i].s - chain.balls[i - 1].s > gap * 1.25) {
            closed = false
            break
          }
        }
        if (closed) {
          chain.pendingJoinCheck = false
          const seen = new Set()
          for (let i = 0; i < chain.balls.length; i++) {
            if (seen.has(i)) continue
            const m = findMatches(chain.balls, i)
            if (m.length) {
              m.forEach((j) => seen.add(j))
              removeBalls(st, chain, m)
              break
            }
          }
        }
      }
    }

    const insertShot = (st, shot) => {
      let bestChain = -1
      let best = -1
      let bestD = Infinity
      st.chains.forEach((chain, ci) => {
        for (let i = 0; i < chain.balls.length; i++) {
          const b = chain.balls[i]
          if (b.s < -st.ballR) continue
          const p = pointOnPath(chain.path, b.s)
          const d = dist(p, shot)
          if (d < bestD) {
            bestD = d
            best = i
            bestChain = ci
          }
        }
      })
      if (bestChain < 0 || bestD > st.ballR * 2.5) return false

      const chain = st.chains[bestChain]
      const gap = st.ballR * 2
      const target = chain.balls[best]
      const p = pointOnPath(chain.path, target.s)
      const ahead = { x: p.x + Math.cos(p.angle) * 4, y: p.y + Math.sin(p.angle) * 4 }
      const insertAfter = dist(shot, ahead) < dist(shot, p)
      const insertIdx = insertAfter ? best + 1 : best

      if (shot.power === 'bomb') {
        spawnBurst(st, shot.x, shot.y, shot.color)
        play('power')
        const idxs = []
        for (let i = 0; i < chain.balls.length; i++) {
          const bp = pointOnPath(chain.path, chain.balls[i].s)
          if (dist(bp, shot) < gap * 3.4) idxs.push(i)
        }
        if (idxs.length) removeBalls(st, chain, idxs, true)
        st.score += 50
        setUi((u) => ({ ...u, score: st.score, effect: 'Bomba' }))
        return true
      }

      for (let i = insertIdx; i < chain.balls.length; i++) {
        chain.balls[i].s += gap
      }

      let color = shot.color
      let power = shot.power
      if (power === 'white' || color === 'white') {
        const tempBalls = [
          ...chain.balls.slice(0, insertIdx),
          { color: 'white', s: 0 },
          ...chain.balls.slice(insertIdx),
        ]
        color = bestWildColor(tempBalls, insertIdx)
        power = null
      }

      const newBall = {
        id: chain.nextId++,
        color,
        power: power && power !== 'white' ? power : null,
        s: insertAfter ? target.s + gap : target.s,
        rot: 0,
      }
      chain.balls.splice(insertIdx, 0, newBall)
      chain.balls.sort((a, b) => a.s - b.s)

      for (let i = 1; i < chain.balls.length; i++) {
        const minS = chain.balls[i - 1].s + gap
        if (chain.balls[i].s < minS) chain.balls[i].s = minS
      }

      const idx = chain.balls.findIndex((b) => b.id === newBall.id)

      if (newBall.power === 'slow' || newBall.power === 'reverse' || newBall.power === 'accuracy') {
        // En el original el poder se activa al ELIMINAR la bola en un grupo, no al insertarla
      }

      const matches = findMatches(chain.balls, idx)
      if (matches.length) removeBalls(st, chain, matches)
      return true
    }

    const drawTexturedBall = (x, y, colorKey, rot = 0, scale = 1, power = null) => {
      const A = assetsRef.current
      const st = stateRef.current
      const size = (st?.ballR || BALL_R_BASE) * 2 * scale
      const isPower = power && power !== 'white'
      const isWild = power === 'white' || colorKey === 'white'

      let sheet = null
      if (isWild) {
        sheet = A?.white
      } else if (isPower) {
        const ck = COLOR_KEYS.includes(colorKey) ? colorKey : 'red'
        sheet = A?.[`${power}_${ck}`] || A?.[`${power}_red`]
      }
      if (!sheet) sheet = A?.[isWild ? 'white' : colorKey] || A?.red
      if (!sheet) return

      // Sombra redonda suave (no el PNG negro cuadrado)
      if (A?.shadow && A.shadow.width < 200) {
        ctx.save()
        ctx.globalAlpha = 0.45
        ctx.drawImage(A.shadow, x - size * 0.48 + 1.5, y - size * 0.42 + 2.5, size * 0.96, size * 0.96)
        ctx.restore()
      }

      const frames = Math.max(1, Math.floor(sheet.height / FRAME))
      const frame = isPower || frames <= 1 ? 0 : ((Math.floor(rot) % frames) + frames) % frames
      const sw = Math.min(FRAME, sheet.width)
      const sh = Math.min(FRAME, sheet.height - frame * FRAME || FRAME)

      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, size * 0.48, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(sheet, 0, frame * FRAME, sw, sh, x - size / 2, y - size / 2, size, size)
      ctx.restore()

      if (power === 'bomb' && A?.bombGlow) {
        const g = 0.35 + 0.25 * Math.sin((st?.tick || 0) * 0.2)
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = g
        ctx.beginPath()
        ctx.arc(x, y, size * 0.48, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(A.bombGlow, x - size / 2, y - size / 2, size, size)
        ctx.restore()
      }
    }

    const finishStatus = (st, status) => {
      const prevHs = readHighScore()
      if (status === 'lost') {
        const hs = writeHighScore(st.score)
        st.status = 'lost'
        play('lose')
        setUi((u) => ({
          ...u,
          status: 'lost',
          score: st.score,
          highScore: hs,
          combo: st.combo,
          newRecord: st.score > prevHs,
        }))
        return
      }
      // Victoria original: terremoto → mapa se rompe → sapo salta AL siguiente mapa
      play('win')
      const { ox, oy, w: bw, h: bh } = st.lay
      const bg = st.bgImg || assetsRef.current?.bg
      const tiles = shatterLevelBg(bg, ox, oy, bw, bh, 11, 8)
      const nextIdx = (st.mapIndex || 0) + 1
      const list = manifestRef.current
      const nextMeta = list.length ? list[((nextIdx % list.length) + list.length) % list.length] : null
      const nextData = nextMeta ? levelsCacheRef.current[nextMeta.id] : null
      const nextPad = frogPadOnMap(nextData, st.lay) || {
        x: st.frog.x,
        y: st.frog.y,
      }
      // Prefetch del siguiente mapa durante el temblor (solo cache, no cambia estado)
      if (nextMeta && !nextData?._bgImg) {
        const meta = nextMeta
        fetch(`${ASSET}/levels/${meta.id}.json`)
          .then((r) => r.json())
          .then(async (json) => {
            const bgImg = await loadImage(`${ASSET}/levels/${meta.bg || json.bg}`)
            levelsCacheRef.current[meta.id] = {
              ...json,
              id: json.id || meta.id,
              name: json.name || meta.name,
              bg: json.bg || meta.bg,
              _bgImg: bgImg,
            }
            const jt = jumpTravelRef.current
            if (jt && !jt.targetReady) {
              const pad = frogPadOnMap(levelsCacheRef.current[meta.id], stateRef.current?.lay)
              if (pad) {
                jt.toX = pad.x
                jt.toY = pad.y
                jt.targetReady = true
              }
            }
          })
          .catch(() => {})
      }
      st.status = 'celebrating'
      st.winAnim = {
        t: 0,
        max: WIN_CELEBRATE_FRAMES,
        tiles,
        bg,
        frogJump: false,
        autoNext: false,
        frogX: st.frog.x,
        frogY: st.frog.y,
        frogAngle: st.frog.angle,
        frogScale: 1,
        originX: st.frog.x,
        originY: st.frog.y,
        originAngle: st.frog.angle,
        targetX: nextPad.x,
        targetY: nextPad.y,
        nextMap: nextIdx,
        nextNum: (st.level || 1) + 1,
        keepScore: st.score,
        quakePlayed: false,
        jumpPlayed: false,
        mapSwapped: false,
      }
      st.score += 500 + st.level * 100
      const hs = writeHighScore(st.score)
      setUi((u) => ({
        ...u,
        status: 'celebrating',
        score: st.score,
        highScore: hs,
        combo: st.combo,
        newRecord: st.score > prevHs,
        effect: '¡ZUMA!',
      }))
    }

    const loop = () => {
      const st = stateRef.current
      const A = assetsRef.current
      if (!st || !A) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }
      const w = canvas.width
      const h = canvas.height
      st.tick++

      if (st.status === 'playing') {
        if (st.comboTimer > 0) {
          st.comboTimer--
          if (st.comboTimer <= 0 && st.combo) {
            st.combo = 0
            setUi((u) => ({ ...u, combo: 0 }))
          }
        }
        if (st.slowTimer > 0) st.slowTimer--
        if (st.reverseTimer > 0) st.reverseTimer--
        if (st.accuracyTimer > 0) st.accuracyTimer--
        if (st.slowTimer <= 0 && st.reverseTimer <= 0 && st.accuracyTimer <= 0) {
          if (st._effectShown) {
            st._effectShown = false
            setUi((u) => (u.effect ? { ...u, effect: '' } : u))
          }
        } else {
          st._effectShown = true
        }

        let mul = 1
        if (st.slowTimer > 0) mul *= 0.35
        if (st.reverseTimer > 0) mul *= -1
        st.speed = st.baseSpeed * mul

        for (const chain of st.chains) updateChain(st, chain)

        let nearHole = false
        outer: for (const chain of st.chains) {
          for (const b of chain.balls) {
            const remain = chain.total - b.s
            if (remain < st.ballR * 14 && remain > 0) nearHole = true
            if (b.s >= chain.total - 8) {
              // Una vida por “mordida”; empuja la cadena atrás (como el original)
              if ((st.lifeCooldown || 0) > 0) {
                // Durante cooldown, saca la bola del agujero sin quitar otra vida
                b.s = Math.max(0, chain.total - st.ballR * 10)
                break outer
              }
              st.lives -= 1
              st.lifeCooldown = 90
              st.shake = 16
              play('warn')
              // Quita la bola que entró y empuja el resto lejos del agujero
              const gap = st.ballR * 2
              const push = gap * 4.5
              chain.balls = chain.balls.filter((x) => x.id !== b.id)
              for (const bb of chain.balls) {
                bb.s = Math.max(bb.s - push, -gap * 2)
              }
              chain.pendingJoinCheck = true
              setUi((u) => ({ ...u, lives: Math.max(0, st.lives), score: st.score }))
              if (st.lives <= 0) {
                finishStatus(st, 'lost')
              }
              break outer
            }
          }
        }
        if (st.lifeCooldown > 0) st.lifeCooldown--
        if (nearHole) {
          st.dangerFlash = (st.dangerFlash || 0) + 1
          if (st.tick - (st.lastWarnTick || 0) > 90) {
            st.lastWarnTick = st.tick
            play('warn')
          }
        } else {
          st.dangerFlash = 0
        }

        const allClear = st.chains.every((c) => c.balls.length === 0)
        if (st.spawnGuard > 0) st.spawnGuard--
        if (allClear && st.status === 'playing' && st.spawnGuard <= 0) {
          finishStatus(st, 'won')
        }

        const shotSpeed = SHOT_SPEED * st.lay.scale * (st.accuracyTimer > 0 ? 1.35 : 1)
        for (const shot of st.shots) {
          // Precisión: leve corrección hacia la bola más cercana de la cadena
          if (st.accuracyTimer > 0) {
            let best = null
            let bestD = Infinity
            for (const chain of st.chains) {
              for (const b of chain.balls) {
                if (b.s < -st.ballR) continue
                const p = pointOnPath(chain.path, b.s)
                const d = dist(p, shot)
                if (d < bestD) {
                  bestD = d
                  best = p
                }
              }
            }
            if (best && bestD < st.ballR * 8) {
              const want = Math.atan2(best.y - shot.y, best.x - shot.x)
              let diff = want - shot.angle
              while (diff > Math.PI) diff -= Math.PI * 2
              while (diff < -Math.PI) diff += Math.PI * 2
              shot.angle += diff * 0.12
            }
          }
          shot.x += Math.cos(shot.angle) * shotSpeed
          shot.y += Math.sin(shot.angle) * shotSpeed
          shot.life -= 1
          shot.rot = (shot.rot || 0) + 1.2
        }
        const keep = []
        for (const shot of st.shots) {
          if (shot.x < -30 || shot.y < -30 || shot.x > w + 30 || shot.y > h + 30 || shot.life <= 0) {
            continue
          }
          if (insertShot(st, shot)) continue
          keep.push(shot)
        }
        st.shots = keep

        st.particles = st.particles
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
            vy: p.vy + 0.12 * st.lay.scale,
          }))
          .filter((p) => p.life > 0)
        st.fx = st.fx.map((f) => ({ ...f, frame: f.frame + 0.55 })).filter((f) => f.frame < f.max)
        if (st.shake > 0) st.shake *= 0.85
      }

      const sc = st.lay?.scale || 1

      // Celebración: terremoto → rompe → sapo SALTA HACIA el pad del siguiente mapa
      if (st.status === 'celebrating' && st.winAnim) {
        const wa = st.winAnim
        wa.t++
        // Fase terremoto (sapo en su pad)
        if (wa.t <= QUAKE_END) {
          st.shake = 8 + (QUAKE_END - wa.t) * 0.4
          wa.frogX = wa.originX
          wa.frogY = wa.originY
          wa.frogAngle = wa.originAngle
          wa.frogScale = 1
          if (!wa.quakePlayed && wa.t === 4) {
            wa.quakePlayed = true
            play('earthquake')
          }
        }
        // Agacharse
        if (wa.t > QUAKE_END && wa.t < JUMP_START) {
          st.shake *= 0.85
          const crouch = (wa.t - QUAKE_END) / (JUMP_START - QUAKE_END)
          wa.frogX = wa.originX
          wa.frogY = wa.originY + crouch * 6 * sc
          wa.frogAngle = wa.originAngle
          wa.frogScale = 1 - crouch * 0.12
        }
        // Losas vuelan (antes del viaje; durante el viaje las mueve jumpTravel)
        if (!jumpTravelRef.current) {
          for (const tile of wa.tiles) {
            if (wa.t < QUAKE_END * 0.35 + tile.delay) continue
            tile.active = true
            tile.x += tile.vx
            tile.y += tile.vy
            tile.vy += 0.22
            tile.rot += tile.vr
          }
        }
        // Inicia viaje continuo pad → pad
        if (wa.t === JUMP_START && !jumpTravelRef.current) {
          const list = manifestRef.current
          const meta = list[((wa.nextMap % list.length) + list.length) % list.length]
          const cached = meta ? levelsCacheRef.current[meta.id] : null
          const pad = frogPadOnMap(cached, st.lay)
          jumpTravelRef.current = {
            t: 0,
            max: JUMP_DUR,
            fromX: wa.originX,
            fromY: wa.originY,
            toX: pad?.x ?? wa.targetX,
            toY: pad?.y ?? wa.targetY,
            targetReady: !!pad,
            nextMap: wa.nextMap,
            nextNum: wa.nextNum,
            keepScore: wa.keepScore ?? st.score,
            tiles: wa.tiles,
            oldBg: wa.bg,
            mapSwapped: false,
            landed: false,
          }
          wa.frogJump = true
        }
      }

      // Salto continuo hacia el siguiente mapa (ref independiente del state)
      const jt = jumpTravelRef.current
      if (jt && !jt.landed) {
        jt.t++
        const u = Math.min(1, jt.t / jt.max)
        const peakLift = 140 * sc
        const prevX = jt.x ?? jt.fromX
        const prevY = jt.y ?? jt.fromY
        // Arco del pad actual → pad del siguiente mapa
        jt.x = jt.fromX + (jt.toX - jt.fromX) * u
        jt.y = jt.fromY + (jt.toY - jt.fromY) * u - Math.sin(u * Math.PI) * peakLift
        // Orientación según dirección del movimiento (hacia el siguiente pad)
        const vx = jt.x - prevX
        const vy = jt.y - prevY
        if (Math.hypot(vx, vy) > 0.2) {
          jt.angle = Math.atan2(vy, vx)
        } else if (u < 0.5) {
          jt.angle = -Math.PI / 2
        }
        jt.scale = 1 + Math.sin(u * Math.PI) * 0.22

        // Escombros siguen en el aire hacia el nuevo mapa
        if (jt.tiles) {
          for (const tile of jt.tiles) {
            if (!tile.active) continue
            tile.x += tile.vx
            tile.y += tile.vy
            tile.vy += 0.22
            tile.rot += tile.vr
          }
        }

        // A mitad del arco: revelar el siguiente mapa debajo
        if (!jt.mapSwapped && u >= JUMP_SWAP_U) {
          jt.mapSwapped = true
          Promise.resolve(
            loadMap(jt.nextMap, jt.nextNum, jt.keepScore, {
              midJump: true,
              fromWinJump: true,
            })
          ).then(() => {
            const st2 = stateRef.current
            const list = manifestRef.current
            const meta = list[((jt.nextMap % list.length) + list.length) % list.length]
            const cached = meta ? levelsCacheRef.current[meta.id] : null
            const pad = frogPadOnMap(cached, st2?.lay)
            if (pad) {
              jt.toX = pad.x
              jt.toY = pad.y
              jt.targetReady = true
            }
          })
        }

        // Actualiza winAnim si sigue vivo (para dibujar)
        if (st.winAnim) {
          st.winAnim.frogJump = true
          st.winAnim.frogX = jt.x
          st.winAnim.frogY = jt.y
          st.winAnim.frogAngle = jt.angle
          st.winAnim.frogScale = jt.scale
          st.winAnim.mapSwapped = jt.mapSwapped
        }

        // Aterriza en el pad del nuevo mapa
        if (u >= 1 && !jt.landed) {
          jt.landed = true
          const st2 = stateRef.current
          if (st2) {
            st2.hideFrog = false
            st2.frog.x = jt.toX
            st2.frog.y = jt.toY
            st2.frog.angle = -Math.PI / 2
            st2.status = 'playing'
            st2.winAnim = null
            st2.spawnGuard = 60
          }
          play('frogland')
          jumpTravelRef.current = null
          setUi((u) => ({ ...u, status: 'playing', effect: '' }))
        }
      }

      // Cortina solo si se usa nextLevel manual (no el salto automático)
      const tr = transitionRef.current
      if (tr) {
        tr.t++
        if (!tr.halfDone && tr.t >= tr.max / 2) {
          tr.halfDone = true
          loadMap(tr.nextMap, tr.nextNum, tr.keepScore, {
            fadeIn: true,
            fromWinJump: !!tr.fromWinJump,
          })
        }
        if (tr.t >= tr.max) {
          transitionRef.current = null
          setUi((u) => (u.status === 'transition' || u.status === 'loading' ? { ...u, status: 'playing' } : u))
        }
      }

      const shakeX = st.shake ? (Math.random() - 0.5) * st.shake : 0
      const shakeY = st.shake ? (Math.random() - 0.5) * st.shake : 0
      ctx.save()
      ctx.translate(shakeX, shakeY)

      ctx.fillStyle = '#071a12'
      ctx.fillRect(0, 0, w, h)
      const { ox, oy, w: bw, h: bh } = st.lay
      const bg = st.bgImg || A.bg
      const jtDraw = jumpTravelRef.current
      const wa = st.winAnim || null
      const mapBroken = (wa && wa.t >= QUAKE_END * 0.4) || (jtDraw && !jtDraw.mapSwapped)
      const showNewMap = jtDraw?.mapSwapped || (!jtDraw && !mapBroken)

      if (showNewMap && bg) {
        ctx.drawImage(bg, ox, oy, bw, bh)
      }

      // Escombros del mapa anterior (siguen en el salto)
      const debris = jtDraw?.tiles || wa?.tiles
      const debrisBg = jtDraw?.oldBg || wa?.bg
      if (debris?.length && debrisBg && (mapBroken || jtDraw)) {
        const fade = jtDraw?.mapSwapped
          ? Math.max(0, 1 - (jtDraw.t / jtDraw.max - JUMP_SWAP_U) / (1 - JUMP_SWAP_U))
          : 1
        for (const tile of debris) {
          ctx.save()
          ctx.globalAlpha = fade * (tile.active ? 0.95 : 1)
          if (tile.active) {
            ctx.translate(tile.x + tile.w / 2, tile.y + tile.h / 2)
            ctx.rotate(tile.rot)
            ctx.drawImage(
              debrisBg,
              tile.sx,
              tile.sy,
              tile.sw,
              tile.sh,
              -tile.w / 2,
              -tile.h / 2,
              tile.w,
              tile.h
            )
          } else if (!jtDraw?.mapSwapped) {
            ctx.drawImage(debrisBg, tile.sx, tile.sy, tile.sw, tile.sh, tile.x, tile.y, tile.w, tile.h)
          }
          ctx.restore()
        }
      } else if (!showNewMap && bg) {
        ctx.drawImage(bg, ox, oy, bw, bh)
      }

      // Cadenas / agujero del mapa actual (nuevo o viejo intacto)
      if (showNewMap || (!mapBroken && !jtDraw)) {
        for (const chain of st.chains) {
          for (const b of chain.balls) {
            if (b.s < -st.ballR) continue
            const p = pointOnPath(chain.path, b.s)
            drawTexturedBall(p.x, p.y, b.color, b.rot || 0, 1, b.power)
          }
          if (A.hole && chain.path.length && !jtDraw) {
            const end = chain.path[chain.path.length - 1]
            const hs = st.ballR * 2.4
            ctx.drawImage(A.hole, end.x - hs / 2, end.y - hs / 2, hs, hs)
          }
        }
      }

      const f = st.frog
      let landBoost = 1
      let landYOff = 0
      if (st.frogLandT > 0) {
        const total = 40
        const u = 1 - st.frogLandT / total
        landYOff = -(1 - u) * (1 - u) * 220 * sc
        landBoost = u < 0.85 ? 0.9 + u * 0.15 : 1 + Math.sin(((u - 0.85) / 0.15) * Math.PI) * 0.08
        st.frogLandT--
      }
      const flying = jtDraw && !jtDraw.landed
      const inWinPose = !flying && wa && st.status === 'celebrating'
      const frogSize =
        72 * sc * (flying ? jtDraw.scale || 1 : inWinPose ? wa.frogScale || 1 : landBoost)
      const mouthDist = frogSize * 0.36
      const backDist = frogSize * 0.22
      const frogDrawX = flying ? jtDraw.x : inWinPose ? wa.frogX : f.x
      const frogDrawY = flying ? jtDraw.y : inWinPose ? wa.frogY : f.y + landYOff
      const frogDrawAng = flying ? jtDraw.angle : inWinPose ? wa.frogAngle : f.angle
      const drawFrogBody = !st.hideFrog || flying || inWinPose

      if (drawFrogBody) {
        ctx.save()
        ctx.translate(frogDrawX, frogDrawY)
        ctx.rotate(frogDrawAng - Math.PI / 2)
        if (A.tongue && !flying && !wa?.frogJump) {
          const tw = 14 * sc
          const th = 26 * sc
          ctx.drawImage(A.tongue, -tw / 2, frogSize * 0.08, tw, th)
        }
        if (A.frog) {
          ctx.beginPath()
          ctx.arc(0, 0, frogSize * 0.5, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(A.frog, -frogSize / 2, -frogSize / 2, frogSize, frogSize)
        }
        ctx.restore()
      }

      // Bolas del sapo solo en juego normal / pre-salto
      if (!flying && !wa?.frogJump && st.status !== 'transition' && drawFrogBody) {
        drawTexturedBall(
          frogDrawX - Math.cos(frogDrawAng) * backDist,
          frogDrawY - Math.sin(frogDrawAng) * backDist,
          st.queued,
          st.tick * 0.25,
          0.52,
          st.queuedPower
        )
        drawTexturedBall(
          frogDrawX + Math.cos(frogDrawAng) * mouthDist,
          frogDrawY + Math.sin(frogDrawAng) * mouthDist,
          st.loaded,
          st.tick * 0.4,
          0.86,
          st.loadedPower
        )
      }

      // Flechitas de apuntado (siempre al jugar; más fuertes con poder Precisión)
      if (st.status === 'playing') {
        const boosted = st.accuracyTimer > 0
        const ang = f.angle
        const cos = Math.cos(ang)
        const sin = Math.sin(ang)
        const startX = f.x + cos * (mouthDist + st.ballR * 0.35)
        const startY = f.y + sin * (mouthDist + st.ballR * 0.35)
        const step = (boosted ? 16 : 22) * sc
        const maxDist = Math.hypot(w, h)

        let hitX = startX + cos * Math.min(maxDist * 0.5, 260 * sc)
        let hitY = startY + sin * Math.min(maxDist * 0.5, 260 * sc)
        let hitFound = false
        let bestT = Infinity
        for (const chain of st.chains) {
          for (const b of chain.balls) {
            if (b.s < -st.ballR) continue
            const p = pointOnPath(chain.path, b.s)
            const dx = p.x - startX
            const dy = p.y - startY
            const t = dx * cos + dy * sin
            if (t < st.ballR * 0.5) continue
            const px = startX + cos * t
            const py = startY + sin * t
            const lateral = Math.hypot(p.x - px, p.y - py)
            if (lateral < st.ballR * 1.25 && t < bestT) {
              bestT = t
              hitX = p.x
              hitY = p.y
              hitFound = true
            }
          }
        }
        const guideLen = Math.max(
          step * 3,
          hitFound ? bestT : Math.min(maxDist * 0.5, 260 * sc)
        )
        const pulse = boosted ? 0.7 + 0.3 * Math.sin(st.tick * 0.2) : 0.85

        ctx.save()
        // Flechitas (chevrons) — source-over para que se vean siempre
        for (let d = step; d < guideLen - 4; d += step) {
          const x = startX + cos * d
          const y = startY + sin * d
          const fade = boosted ? 0.55 + 0.45 * (d / guideLen) : 0.4 + 0.35 * (d / guideLen)
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(ang)
          ctx.globalAlpha = Math.min(1, fade * pulse)
          const aw = (boosted ? 9 : 7) * sc
          const ah = (boosted ? 6 : 4.5) * sc
          ctx.beginPath()
          ctx.moveTo(aw, 0)
          ctx.lineTo(-aw * 0.5, -ah)
          ctx.lineTo(-aw * 0.1, 0)
          ctx.lineTo(-aw * 0.5, ah)
          ctx.closePath()
          ctx.fillStyle = boosted ? '#fff3b0' : 'rgba(255, 236, 170, 0.95)'
          ctx.fill()
          ctx.strokeStyle = boosted ? '#ffb020' : 'rgba(40, 20, 0, 0.55)'
          ctx.lineWidth = Math.max(1, 1.2 * sc)
          ctx.stroke()
          ctx.restore()
        }

        // Retículo solo con poder Precisión (o si hay impacto claro boosteado)
        if (boosted) {
          ctx.globalCompositeOperation = 'lighter'
          if (A.aimGlow) {
            const gs = 12 * sc
            for (let d = step * 0.5; d < guideLen; d += step * 2) {
              ctx.globalAlpha = 0.4 * pulse
              ctx.drawImage(A.aimGlow, startX + cos * d - gs / 2, startY + sin * d - gs / 2, gs, gs)
            }
          }
          const rs = (hitFound ? 30 : 22) * sc
          ctx.globalAlpha = 0.85
          if (A.accuracyLight) {
            ctx.drawImage(A.accuracyLight, hitX - rs / 2, hitY - rs / 2, rs, rs)
          } else {
            ctx.strokeStyle = '#ffe9a0'
            ctx.lineWidth = 2 * sc
            ctx.beginPath()
            ctx.arc(hitX, hitY, rs * 0.35, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
        ctx.restore()
      }

      for (const shot of st.shots) {
        drawTexturedBall(shot.x, shot.y, shot.color, shot.rot || 0, 0.95, shot.power)
      }

      if (A.explosion) {
        for (const fx of st.fx) {
          const fi = Math.min(EXP_USE - 1, Math.floor(fx.frame))
          const t = fx.frame / EXP_USE
          const sz = 90 * st.lay.scale
          ctx.save()
          ctx.globalAlpha = Math.max(0.15, 1 - t * 0.5)
          ctx.globalCompositeOperation = 'lighter'
          ctx.drawImage(
            A.explosion,
            0,
            fi * EXP_FH,
            EXP_FW,
            EXP_FH,
            fx.x - sz / 2,
            fx.y - sz / 2,
            sz,
            sz
          )
          ctx.restore()
        }
      }

      for (const p of st.particles) {
        ctx.globalAlpha = Math.max(0, p.life / 22)
        drawTexturedBall(p.x, p.y, p.color, 0, p.scale || 0.3)
        ctx.globalAlpha = 1
      }

      if (st.dangerFlash > 0 && st.status === 'playing') {
        const pulse = 0.12 + 0.1 * Math.sin(st.dangerFlash * 0.25)
        ctx.fillStyle = `rgba(220, 40, 40, ${pulse})`
        ctx.fillRect(0, 0, w, h)
      }

      if (st.combo >= 2 && st.status === 'playing') {
        ctx.save()
        ctx.fillStyle = '#f0e6c8'
        ctx.font = `bold ${Math.round(22 * st.lay.scale)}px Georgia, serif`
        ctx.textAlign = 'center'
        ctx.shadowColor = '#d4af37'
        ctx.shadowBlur = 12
        ctx.fillText(`COMBO ×${st.combo}`, w / 2, 36 * st.lay.scale)
        ctx.restore()
      }

      // Animación de victoria: texto ¡ZUMA! durante el terremoto
      if (st.status === 'celebrating' && st.winAnim) {
        const wan = st.winAnim
        const t = Math.min(1, wan.t / 50)
        if (wan.t < JUMP_START + 20) {
          const pop = t < 0.2 ? t / 0.2 : 1
          const bounce = 1 + 0.15 * Math.sin(Math.min(1, t * 5) * Math.PI)
          ctx.save()
          ctx.translate(w / 2, h * 0.22)
          ctx.scale(bounce * pop, bounce * pop)
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = `bold ${Math.round(56 * sc)}px Georgia, "Palatino Linotype", serif`
          ctx.shadowColor = '#000'
          ctx.shadowBlur = 18
          ctx.fillStyle = '#ffe566'
          ctx.fillText('¡ZUMA!', 0, 0)
          ctx.lineWidth = 2.5
          ctx.strokeStyle = '#8a6500'
          ctx.strokeText('¡ZUMA!', 0, 0)
          ctx.restore()
        }
      }

      ctx.restore()

      // Cortina de transición al siguiente nivel
      {
        const tr = transitionRef.current
        if (tr) {
          const p = Math.min(1, tr.t / tr.max)
          const cover = p < 0.5 ? p * 2 : (1 - p) * 2
          const hw = (w / 2) * cover
          ctx.fillStyle = '#071a12'
          ctx.fillRect(0, 0, hw, h)
          ctx.fillRect(w - hw, 0, hw, h)
          if (p > 0.35 && p < 0.65) {
            ctx.fillStyle = '#f0e6c8'
            ctx.font = `bold ${Math.round(22 * sc)}px Georgia, serif`
            ctx.textAlign = 'center'
            ctx.fillText('Siguiente mapa…', w / 2, h / 2)
          }
        } else if (st.introFade > 0) {
          const cover = st.introFade / (TRANSITION_FRAMES / 2)
          const hw = (w / 2) * cover
          ctx.fillStyle = '#071a12'
          ctx.fillRect(0, 0, hw, h)
          ctx.fillRect(w - hw, 0, hw, h)
          st.introFade--
        }
      }

      // Contador de vidas: 3 sapitos (llenos / apagados) sin fondo verde
      const maxLives = 3
      const lifeN = Math.max(0, Math.min(maxLives, st.lives | 0))
      const lifeSize = Math.max(26, Math.round(28 * (st.lay?.scale || 1)))
      const lifeGap = Math.round(lifeSize * 1.15)
      const lifeY = 10
      const lifeRight = w - 12
      ctx.save()
      // Pastilla oscura para que se lean sobre el mapa
      const panelW = lifeGap * maxLives + 10
      const panelH = lifeSize + 10
      const px = lifeRight - panelW
      const py = lifeY - 4
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
      ctx.beginPath()
      const rr = 8
      ctx.moveTo(px + rr, py)
      ctx.arcTo(px + panelW, py, px + panelW, py + panelH, rr)
      ctx.arcTo(px + panelW, py + panelH, px, py + panelH, rr)
      ctx.arcTo(px, py + panelH, px, py, rr)
      ctx.arcTo(px, py, px + panelW, py, rr)
      ctx.closePath()
      ctx.fill()
      for (let i = 0; i < maxLives; i++) {
        const alive = i < lifeN
        const x = lifeRight - lifeSize - 6 - i * lifeGap
        const y = lifeY
        if (A.lives) {
          ctx.globalAlpha = alive ? 1 : 0.28
          ctx.drawImage(A.lives, x, y, lifeSize, lifeSize)
          ctx.globalAlpha = 1
        } else {
          ctx.fillStyle = alive ? '#5ecf4a' : 'rgba(80,80,80,0.5)'
          ctx.beginPath()
          ctx.arc(x + lifeSize / 2, y + lifeSize / 2, lifeSize * 0.38, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.restore()

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [ready, play, loadMap])

  const shoot = () => {
    const st = stateRef.current
    if (!st || st.status !== 'playing') return
    // Evita spam de disparos si ya hay proyectil en vuelo cercano
    if (st.shots.length >= 2) return
    sfxRef.current?.unlock()
    const mouthDist = 72 * st.lay.scale * 0.36
    st.shots.push({
      x: st.frog.x + Math.cos(st.frog.angle) * mouthDist,
      y: st.frog.y + Math.sin(st.frog.angle) * mouthDist,
      angle: st.frog.angle,
      color: st.loaded,
      power: st.loadedPower,
      life: 90,
      rot: 0,
    })
    play('shoot')
    // La de la espalda pasa a la boca; nueva siguiente según colores en tablero
    st.loaded = st.queued
    st.loadedPower = st.queuedPower
    const next = nextFrogBall(st)
    st.queued = next.color
    st.queuedPower = next.power
  }

  const swapBalls = () => {
    const st = stateRef.current
    if (!st || st.status !== 'playing') return
    const c = st.loaded
    const p = st.loadedPower
    st.loaded = st.queued
    st.loadedPower = st.queuedPower
    st.queued = c
    st.queuedPower = p
    play('swap')
  }

  const togglePause = () => {
    const st = stateRef.current
    if (!st) return
    if (st.status === 'playing') {
      st.status = 'paused'
      setUi((u) => ({ ...u, status: 'paused' }))
    } else if (st.status === 'paused') {
      st.status = 'playing'
      setUi((u) => ({ ...u, status: 'playing' }))
    }
  }

  const toggleMute = () => {
    const next = !mutedRef.current
    mutedRef.current = next
    setMuted(next)
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0')
    } catch {
      /* ignore */
    }
    if (!next) sfxRef.current?.unlock()
  }

  const touchRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startT: 0,
    moved: false,
    longPressTimer: null,
    didSwap: false,
  })

  const aimAtClient = (clientX, clientY) => {
    const st = stateRef.current
    const canvas = canvasRef.current
    if (!st || !canvas || st.status !== 'playing') return
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * canvas.width
    const y = ((clientY - rect.top) / rect.height) * canvas.height
    st.frog.angle = Math.atan2(y - st.frog.y, x - st.frog.x)
  }

  const clearLongPress = () => {
    const t = touchRef.current
    if (t.longPressTimer) {
      clearTimeout(t.longPressTimer)
      t.longPressTimer = null
    }
  }

  const onPointerDown = (e) => {
    if (ui.status !== 'playing') return
    sfxRef.current?.unlock()
    if (e.pointerType === 'mouse' && e.button === 2) {
      e.preventDefault()
      swapBalls()
      return
    }
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (e.isPrimary === false) {
      e.preventDefault()
      swapBalls()
      return
    }
    e.preventDefault()
    const canvas = canvasRef.current
    try {
      canvas?.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    aimAtClient(e.clientX, e.clientY)
    clearLongPress()
    const isTouch = e.pointerType === 'touch'
    touchRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startT: Date.now(),
      moved: false,
      longPressTimer: isTouch
        ? setTimeout(() => {
            if (!touchRef.current.active || touchRef.current.moved) return
            touchRef.current.didSwap = true
            swapBalls()
          }, 420)
        : null,
      didSwap: false,
    }
  }

  const onPointerMove = (e) => {
    const t = touchRef.current
    if (e.pointerType === 'mouse' && !t.active) {
      aimAtClient(e.clientX, e.clientY)
      return
    }
    if (!t.active || t.pointerId !== e.pointerId) return
    e.preventDefault()
    aimAtClient(e.clientX, e.clientY)
    const dx = e.clientX - t.startX
    const dy = e.clientY - t.startY
    if (dx * dx + dy * dy > 100) {
      t.moved = true
      clearLongPress()
    }
  }

  const onPointerUp = (e) => {
    const t = touchRef.current
    if (!t.active || (t.pointerId != null && t.pointerId !== e.pointerId)) return
    if (e.pointerType === 'mouse' && e.button === 2) {
      clearLongPress()
      touchRef.current.active = false
      touchRef.current.pointerId = null
      return
    }
    e.preventDefault()
    clearLongPress()
    aimAtClient(e.clientX, e.clientY)
    const canvas = canvasRef.current
    try {
      canvas?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    if (!t.didSwap) shoot()
    touchRef.current.active = false
    touchRef.current.pointerId = null
    touchRef.current.didSwap = false
  }

  const onPointerCancel = () => {
    clearLongPress()
    touchRef.current.active = false
    touchRef.current.pointerId = null
  }

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || ''
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space' || e.key === ' ') {
        if (ui.status !== 'playing') return
        e.preventDefault()
        swapBalls()
        return
      }
      if (e.code === 'KeyP' || e.key === 'Escape') {
        e.preventDefault()
        togglePause()
      }
      if (e.code === 'KeyM') {
        e.preventDefault()
        toggleMute()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const restart = () => {
    const st = stateRef.current
    loadMap(st?.mapIndex || 0, st?.level || 1, 0)
  }

  const nextLevel = () => {
    const st = stateRef.current
    if (!st) return
    if (transitionRef.current) return
    transitionRef.current = {
      t: 0,
      max: TRANSITION_FRAMES,
      halfDone: false,
      nextMap: (st.mapIndex || 0) + 1,
      nextNum: (st.level || 1) + 1,
      keepScore: st.score || 0,
    }
    st.status = 'transition'
    setUi((u) => ({ ...u, status: 'transition', effect: '' }))
  }

  if (loadErr) {
    return (
      <div className="rounded-2xl border border-red-400/40 bg-red-950/40 p-6 text-red-100 text-sm">
        {loadErr}
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[320px] text-[#f0e6c8]/80 text-sm gap-3">
        <span className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
        Cargando mapas de Zuma Deluxe…
      </div>
    )
  }

  const isNewRecord = ui.newRecord

  return (
    <div className="w-full flex-1 flex flex-col gap-1.5 min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 px-1">
        <div className="flex flex-col gap-0.5 text-sm text-[#f0e6c8]">
          <span className="font-semibold tracking-wide">
            Zuma Deluxe · Mapa {(ui.mapIndex % Math.max(1, ui.mapTotal)) + 1}/{ui.mapTotal || '—'}
          </span>
          <span className="opacity-80 text-xs sm:text-sm">
            {ui.mapName || '…'} · Nv.{ui.level} · {ui.score} pts · Récord {ui.highScore}
            {ui.combo >= 2 ? ` · Combo ×${ui.combo}` : ''}
            {ui.effect ? ` · ${ui.effect}` : ''} · Vidas {ui.lives}/3
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="min-h-10 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white hover:bg-white/20 active:scale-95"
            title="M = silenciar"
          >
            {muted ? 'Mudo' : 'Sonido'}
          </button>
          <button
            type="button"
            onClick={togglePause}
            className="min-h-10 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white hover:bg-white/20 active:scale-95"
            title="P / Esc = pausa"
          >
            {ui.status === 'paused' ? 'Seguir' : 'Pausa'}
          </button>
          <button
            type="button"
            onClick={swapBalls}
            className="min-h-10 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#d4af37]/20 text-[#f0e6c8] border border-[#d4af37]/40 hover:bg-[#d4af37]/30 active:scale-95"
          >
            Cambiar bola
          </button>
          <button
            type="button"
            onClick={restart}
            className="min-h-10 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white hover:bg-white/20 active:scale-95"
          >
            Reiniciar
          </button>
          {onSalir && (
            <button
              type="button"
              onClick={onSalir}
              className="min-h-10 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white hover:bg-white/20 active:scale-95"
            >
              Volver
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center">
        <div className="relative rounded-none sm:rounded-2xl overflow-hidden border-y sm:border border-[#d4af37]/30 shadow-[0_20px_60px_rgba(0,0,0,0.45)] bg-[#071a12] select-none">
          <canvas
            ref={canvasRef}
            className="block touch-none cursor-crosshair"
            style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onContextMenu={(e) => {
              e.preventDefault()
              swapBalls()
            }}
            tabIndex={0}
          />

          {ui.status === 'paused' && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="rounded-2xl bg-[#1a2e1a]/95 border border-[#d4af37]/50 px-8 py-6 text-center text-[#f0e6c8] max-w-sm w-full shadow-2xl">
                <p className="text-2xl font-bold mb-4">Pausa</p>
                <button
                  type="button"
                  onClick={togglePause}
                  className="px-4 py-2 rounded-full bg-[#d4af37] text-[#1a1a0a] font-bold text-sm hover:brightness-110"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {(ui.status === 'won' || ui.status === 'lost') && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4 animate-[zumaFadeIn_0.45s_ease-out]">
              <div className="rounded-2xl bg-[#1a2e1a]/95 border border-[#d4af37]/50 px-8 py-6 text-center text-[#f0e6c8] max-w-sm w-full shadow-2xl animate-[zumaPop_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
                <p className="text-2xl font-bold mb-1">
                  {ui.status === 'won' ? '¡Mapa superado!' : 'Se acabó'}
                </p>
                <p className="text-sm opacity-80 mb-1">{ui.mapName}</p>
                <p className="text-sm opacity-80 mb-1">{ui.score} puntos</p>
                <p className="text-sm mb-5 text-[#d4af37]">
                  {isNewRecord ? '¡Nuevo récord!' : `Récord: ${ui.highScore}`}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {ui.status === 'won' ? (
                    <button
                      type="button"
                      onClick={nextLevel}
                      className="px-4 py-2 rounded-full bg-[#d4af37] text-[#1a1a0a] font-bold text-sm hover:brightness-110 animate-pulse"
                    >
                      Siguiente mapa
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={restart}
                      className="px-4 py-2 rounded-full bg-[#d4af37] text-[#1a1a0a] font-bold text-sm hover:brightness-110"
                    >
                      Jugar de nuevo
                    </button>
                  )}
                  {onSalir && (
                    <button
                      type="button"
                      onClick={onSalir}
                      className="px-4 py-2 rounded-full bg-white/10 text-white font-bold text-sm hover:bg-white/20"
                    >
                      Menú de juegos
                    </button>
                  )}
                </div>
              </div>
              <style>{`
                @keyframes zumaFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zumaPop { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
              `}</style>
            </div>
          )}

          {ui.status === 'celebrating' && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
              <p className="px-4 py-1.5 rounded-full bg-black/50 text-[#ffe566] text-sm font-bold tracking-wide shadow-lg">
                ¡Al siguiente mapa!
              </p>
            </div>
          )}

          {(ui.status === 'transition' || ui.status === 'loading') && (
            <div className="absolute inset-0 pointer-events-none" aria-hidden />
          )}
        </div>
      </div>

      <p className="hidden lg:block text-[11px] text-[#f0e6c8]/55 px-1 shrink-0">
        {ui.mapTotal} mapas · Texturas originales · Bomba · Lento · Invertir · Precisión · Comodín blanco · Pausa (P) · Sonido (M)
      </p>
    </div>
  )
}
