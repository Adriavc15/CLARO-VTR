/**
 * Purble Place Original — texturas y reglas del pack Windows (Vista/7).
 * Assets: /juegos/purble (extraídos de Purble Place Original/*.cab)
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import LAYER_META from './purbleCakeLayers.json'

const A = '/juegos/purble'
/** Resolución nativa del pack Vista/7 (coords XML = píxeles) */
const BOARD_W = 800
const BOARD_H = 496
const COLORS = ['Purple', 'Yellow', 'Blue', 'Green', 'Red']
const STYLES = [1, 2, 3]

const HS = {
  pairs: 'vtr-purble-pairs-hs',
  cakes: 'vtr-purble-cakes-hs',
  shop: 'vtr-purble-shop-hs',
}

/** ComfyCakesVars.xml — slide×slides = segundos por pedido */
const CAKE_DIFF = {
  beginner: { cakes: 5, misses: 3, layers: 1, toppings: 2, slide: 4, slides: 5, label: 'Principiante' },
  intermediate: { cakes: 5, misses: 3, layers: 2, toppings: 3, slide: 4, slides: 4, label: 'Intermedio' },
  advanced: { cakes: 8, misses: 2, layers: 3, toppings: 3, slide: 4, slides: 6, label: 'Avanzado' },
}

const SHOP_DIFF = {
  beginner: { max: 10, label: 'Principiante', colors: ['Red', 'Purple', 'Yellow'] },
  intermediate: { max: 7, label: 'Intermedio', colors: ['Red', 'Purple', 'Yellow', 'Blue'] },
  advanced: { max: 13, label: 'Avanzado', colors: ['Red', 'Purple', 'Yellow', 'Blue', 'Green'] },
}

/** Columnas X relativas al estante (Cabinet.xml) */
const SHOP_COLS = {
  3: { Red: 55, Purple: 141, Yellow: 227 },
  4: { Red: 55, Purple: 109, Yellow: 168, Blue: 224 },
  5: { Red: 45, Purple: 93, Yellow: 141, Blue: 187, Green: 232 },
}

const SHOP_SHELF_Y = { Eyes: 125, Nose: 209, Mouth: 298 }
const SHOP_SHELF_X = 444
/** ShelfFeatures RedEyes1s.xml — registration del thumbnail del gabinete */
const SHELF_REG = { w: 79, h: 76, rx: 41, ry: 44 }
const SHELF_ITEMS_Y = { Eyes: 0, Nose: -2, Mouth: 0 }

const SHAPES = ['Round', 'Rectangle', 'Heart']
const BATTERS = ['Chocolate', 'Strawberry', 'Vanilla']
/** Chocolate del relleno se renderiza como Fudge (Layers.xml) */
const FILLS = ['Chocolate', 'Raspberry', 'Vanilla']
const ICINGS = ['Chocolate', 'Strawberry', 'Vanilla']
const DECORS = ['Gumdrop', 'Heart', 'Shamrock', 'Smiley']
/** Toque final: azúcar o glaze quemado (nunca null si toppings ≥ 3) */
const FINALS = ['Sugar', 'Burnt']

/** Frames reales por máquina (evitar 404 en filling_f6/f7) */
const MACHINE_FRAMES = { pan: 8, batter: 8, fill: 6, filling: 6, icing: 8, decor: 8, final: 1 }

function cakeTimerSecs(d) {
  return (d?.slide || 4) * (d?.slides || 5)
}

function readHs(key) {
  try {
    const n = Number(localStorage.getItem(key) || 0)
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function writeHs(key, score) {
  try {
    const prev = readHs(key)
    if (score > prev) localStorage.setItem(key, String(score))
    return Math.max(prev, score)
  } catch {
    return score
  }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function playSfx(name) {
  try {
    const map = {
      click: `${A}/audio/Purble_button_stereo.wav`,
      lose: `${A}/audio/Purbles_LoseGame.wav`,
      fail: `${A}/audio/Purbles_GeneralFailure.wav`,
      cakeBtn: `${A}/audio/ComfyCakes/Purbles_CakeButtons.wav`,
      cakeWin: `${A}/audio/ComfyCakes/Purbles_ComfyWin.wav`,
      boxed: `${A}/audio/ComfyCakes/Purbles_CakeBoxed.wav`,
      dump: `${A}/audio/ComfyCakes/Purbles_CakeDumped.wav`,
      convey: `${A}/audio/ComfyCakes/Purbles_Conveyor.wav`,
    }
    const src = map[name]
    if (!src) return
    const audio = new Audio(src)
    audio.volume = 0.45
    audio.play().catch(() => {})
  } catch {
    /* ignore */
  }
}

function partSrc(color, feature, style) {
  return `${A}/shop/parts/${color}${feature}${style}.png`
}

function headSrc(n = 1) {
  return `${A}/shop/heads/BeginnerHead${n}.png`
}

function layerMeta(name) {
  return LAYER_META[name] || { w: 80, h: 60, rx: 40, ry: 30, delta: -4 }
}

/**
 * Apila capas con Registration/Delta del Layers.xml original.
 * `size` ≈ ancho de referencia (100 = escala 1:1 en coords nativas).
 * El molde (Pan*) solo se muestra vacío; con masa usamos sombra de base.
 */
function CakeStack({ cake, size = 100, className = '' }) {
  if (!cake?.shape) return <div className={className} style={{ width: size * 0.7, height: size * 0.45 }} />

  const s = size / 100
  const batters = cake.batters || []
  const hasBatter = batters.length > 0
  const parts = []
  const add = (name) => {
    const m = layerMeta(name)
    parts.push({ name, src: `${A}/cakes/layers/${name}.png`, ...m })
  }

  if (!hasBatter) add(`Pan${cake.shape}`)
  batters.forEach((b, i) => {
    add(`Batter${b}${cake.shape}`)
    const fillLayer = cake.fills?.[i]
    if (fillLayer) {
      const fillName = fillLayer === 'Chocolate' || fillLayer === 'Fudge' ? 'Fudge' : fillLayer
      add(`Filling${fillName}${cake.shape}`)
    }
  })
  if (cake.icing) add(`Icing${cake.icing}${cake.shape}`)
  if (cake.decor) add(`Decoration${cake.decor}`)
  if (cake.final === 'Sugar') add(`FinalTouchSugar${cake.shape}`)
  if (cake.final === 'Burnt' && cake.icing) add(`FinalTouchBurntGlaze${cake.icing}${cake.shape}`)

  let attachY = 0
  const placed = []
  for (const L of parts) {
    const x = -L.rx * s
    const y = attachY - L.ry * s
    placed.push({
      ...L,
      x,
      y,
      zw: L.w * s,
      zh: L.h * s,
    })
    attachY += L.delta * s
  }

  const minX = Math.min(...placed.map((p) => p.x))
  const maxX = Math.max(...placed.map((p) => p.x + p.zw))
  const minY = Math.min(...placed.map((p) => p.y))
  const maxY = Math.max(...placed.map((p) => p.y + p.zh), 0)
  const padX = -minX
  const padY = -minY
  const boxW = maxX - minX
  const boxH = maxY - minY

  // Sombra elíptica bajo la primera masa (sustituye al molde sin verse rosa)
  const base = placed.find((p) => p.name.startsWith('Batter')) || placed[0]
  const shadow = hasBatter && base
    ? {
        left: base.x + padX + base.zw * 0.08,
        top: base.y + padY + base.zh * 0.78,
        width: base.zw * 0.84,
        height: Math.max(6, base.zh * 0.18),
      }
    : null

  return (
    <div className={`relative ${className}`} style={{ width: boxW, height: boxH }}>
      {shadow && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: shadow.left,
            top: shadow.top,
            width: shadow.width,
            height: shadow.height,
            borderRadius: '50%',
            background: 'rgba(40, 20, 30, 0.28)',
            filter: 'blur(1.5px)',
            zIndex: 0,
          }}
        />
      )}
      {placed.map((it, i) => (
        <img
          key={`${it.name}-${i}`}
          src={it.src}
          alt=""
          className="absolute pointer-events-none select-none"
          style={{
            left: it.x + padX,
            top: it.y + padY,
            width: it.zw,
            height: it.zh,
            zIndex: i + 1,
          }}
          draggable={false}
        />
      ))}
    </div>
  )
}

/** Layout original: attach + registration (BeginnerFeatures / sprite XML) */
const FACE_BASE_W = 127
const FACE_BASE_H = 172
const HEAD_OFF = { x: 2, y: 0 }
const FACE_ATTACH = {
  eyes: { ax: 67, ay: 57, rw: 115, rh: 60, rx: 57, ry: 30 },
  nose: { ax: 67, ay: 80, rw: 63, rh: 50, rx: 32, ry: 25 },
  mouth: { ax: 67, ay: 110, rw: 90, rh: 50, rx: 45, ry: 20 },
}
/** GreenNose1 es más grande (88×75, reg 44/37) */
const NOSE_OVERRIDE = {
  Green: { rw: 88, rh: 75, rx: 44, ry: 37 },
}

function PurbleAvatar({ face, head = 1, size = 140, mystery = false }) {
  const scale = size / FACE_BASE_W
  const boxW = FACE_BASE_W * scale
  const boxH = FACE_BASE_H * scale

  const partStyle = (key, color) => {
    let p = FACE_ATTACH[key]
    if (key === 'nose' && color && NOSE_OVERRIDE[color]) {
      p = { ...p, ...NOSE_OVERRIDE[color] }
    }
    return {
      position: 'absolute',
      left: (p.ax - p.rx) * scale,
      top: (p.ay - p.ry) * scale,
      width: p.rw * scale,
      height: p.rh * scale,
      objectFit: 'fill',
      pointerEvents: 'none',
      userSelect: 'none',
    }
  }

  return (
    <div className="relative shrink-0" style={{ width: boxW, height: boxH }}>
      <img
        src={headSrc(head)}
        alt=""
        className="absolute"
        style={{
          left: HEAD_OFF.x * scale,
          top: HEAD_OFF.y * scale,
          width: FACE_BASE_W * scale,
          height: FACE_BASE_H * scale,
          objectFit: 'fill',
          opacity: mystery ? 0.2 : 1,
          filter: mystery ? 'brightness(0.3)' : undefined,
        }}
        draggable={false}
      />
      {!mystery && face && (
        <>
          <img src={partSrc(face.eyesColor, 'Eyes', face.eyesStyle)} alt="" style={partStyle('eyes', face.eyesColor)} draggable={false} />
          <img src={partSrc(face.noseColor, 'Nose', face.noseStyle)} alt="" style={partStyle('nose', face.noseColor)} draggable={false} />
          <img src={partSrc(face.mouthColor, 'Mouth', face.mouthStyle)} alt="" style={partStyle('mouth', face.mouthColor)} draggable={false} />
        </>
      )}
      {mystery && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]">?</span>
        </div>
      )}
    </div>
  )
}

function randomFace(colors = COLORS) {
  const palette = colors?.length ? colors : COLORS
  return {
    eyesColor: pick(palette),
    eyesStyle: pick(STYLES),
    noseColor: pick(palette),
    noseStyle: pick(STYLES),
    mouthColor: pick(palette),
    mouthStyle: pick(STYLES),
  }
}

function shelfPartSrc(color, feature, style) {
  // Thumbnails del gabinete: BlueEyes1s.png / BlueNose1s.png / BlueMouth1s.png
  if (feature === 'Eyes') return `${A}/shop/shelf/${color}Eyes${style}s.png`
  if (feature === 'Nose') return `${A}/shop/shelf/${color}Nose${style}s.png`
  return `${A}/shop/shelf/${color}Mouth${style}s.png`
}

/** Tablero 800×496 con escala uniforme letterbox (nunca se estira ni se corta) */
function AbsBoard({ bg, children, className = '' }) {
  const hostRef = useRef(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return undefined

    const measure = () => {
      let r = el.getBoundingClientRect()
      // Si el host aún no tiene alto (p. ej. flex mal cableado), usa el ancestro con tamaño
      if (r.height < 4 || r.width < 4) {
        let p = el.parentElement
        while (p && (p.clientHeight < 4 || p.clientWidth < 4)) p = p.parentElement
        if (p) {
          const pr = p.getBoundingClientRect()
          r = { width: Math.max(r.width, pr.width), height: Math.max(r.height, pr.height) }
        }
      }
      if (r.width < 4 || r.height < 4) {
        r = { width: window.innerWidth - 24, height: window.innerHeight - 96 }
      }
      const next = Math.max(0.15, Math.min(r.width / BOARD_W, r.height / BOARD_H))
      setScale((prev) => (Math.abs(prev - next) < 0.002 ? prev : next))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.parentElement) ro.observe(el.parentElement)
    window.addEventListener('resize', measure)
    const t = window.setTimeout(measure, 50)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.clearTimeout(t)
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className={`relative flex-1 min-h-0 w-full h-full flex items-center justify-center overflow-hidden ${className}`}
    >
      {scale > 0 && (
        <div
          className="relative shrink-0 overflow-hidden rounded-lg shadow-lg ring-1 ring-[#c9a8e8]/40 bg-[#2a1840]"
          style={{ width: BOARD_W * scale, height: BOARD_H * scale }}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width: BOARD_W,
              height: BOARD_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <img
              src={bg}
              alt=""
              className="absolute inset-0 w-full h-full select-none pointer-events-none object-fill"
              width={BOARD_W}
              height={BOARD_H}
              draggable={false}
            />
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

function Abs({ x, y, w, h, children, className = '', style, as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`absolute ${className}`}
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

function gradeFace(secret, guess) {
  const pairs = [
    ['eyesColor', 'eyesStyle'],
    ['noseColor', 'noseStyle'],
    ['mouthColor', 'mouthStyle'],
  ]
  let rcrf = 0
  let rcwf = 0
  pairs.forEach(([c, s]) => {
    if (secret[c] === guess[c] && secret[s] === guess[s]) rcrf++
    else if (secret[c] === guess[c]) rcwf++
  })
  return { rcrf, rcwf, exact: rcrf === 3 }
}

function randomOrder(diffKey) {
  const d = CAKE_DIFF[diffKey]
  const shape = pick(SHAPES)
  const batters = []
  for (let i = 0; i < d.layers; i++) batters.push(pick(BATTERS))
  const fills = []
  for (let i = 0; i < Math.max(0, d.layers - 1); i++) fills.push(pick(FILLS))
  const icing = d.toppings >= 1 ? pick(ICINGS) : null
  const decor = d.toppings >= 2 ? pick(DECORS) : null
  const fin = d.toppings >= 3 ? pick(FINALS) : null
  return { shape, batters, fills, icing, decor, final: fin }
}

function cakeEqual(a, b) {
  if (!a || !b) return false
  if (a.shape !== b.shape) return false
  if ((a.batters || []).join() !== (b.batters || []).join()) return false
  if ((a.fills || []).join() !== (b.fills || []).join()) return false
  if (a.icing !== b.icing) return false
  if (a.decor !== b.decor) return false
  if ((a.final || null) !== (b.final || null)) return false
  return true
}

/* ─── Hub: el JPG ya trae edificios + flecha; solo hotspots invisibles ─── */
function Hub({ onPick, onSalir }) {
  const spots = [
    { id: 'cakes', label: 'Comfy Cakes', x: 166, y: 145, w: 254, h: 256 },
    { id: 'shop', label: 'Purble Shop', x: 437, y: 135, w: 325, h: 250 },
  ]

  return (
    <div className="relative w-full flex-1 min-h-0 flex flex-col">
      <AbsBoard bg={`${A}/hub/background.jpg`}>
        {spots.map((s) => (
          <Abs
            key={s.id}
            as="button"
            type="button"
            x={s.x}
            y={s.y}
            w={s.w}
            h={s.h}
            aria-label={s.label}
            title={s.label}
            onClick={() => {
              playSfx('click')
              onPick(s.id)
            }}
            className="p-0 border-0 bg-transparent cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <span className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/10 transition" />
            <span className="absolute left-1/2 -translate-x-1/2 bottom-2 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/55 text-white whitespace-nowrap pointer-events-none">
              {s.label}
            </span>
          </Abs>
        ))}

        <Abs
          as="button"
          type="button"
          x={4}
          y={377}
          w={105}
          h={100}
          aria-label="Salir"
          title="Salir"
          onClick={onSalir}
          className="p-0 border-0 bg-transparent cursor-pointer hover:brightness-110 focus:outline-none"
        />
      </AbsBoard>

      <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <button
          type="button"
          onClick={() => {
            playSfx('click')
            onPick('pairs')
          }}
          className="pointer-events-auto px-4 py-1.5 rounded-full text-sm font-bold bg-white/95 border border-[#c9a8e8] text-[#5b2c6f] hover:bg-[#f3e8ff] shadow-md"
        >
          Jugar Purble Pairs
        </button>
      </div>
    </div>
  )
}

/* ─── Purble Pairs (cartas con texturas originales) ─── */
function PurblePairs({ onBack, onPueblo, onSalir }) {
  const icons = useMemo(() => {
    const list = []
    COLORS.forEach((c) => {
      STYLES.forEach((s) => {
        list.push({ id: `${c}Eyes${s}`, src: partSrc(c, 'Eyes', s) })
        list.push({ id: `${c}Nose${s}`, src: partSrc(c, 'Nose', s) })
      })
    })
    return list
  }, [])

  const [diff, setDiff] = useState(null)
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [lock, setLock] = useState(false)
  const [won, setWon] = useState(false)
  const [hs, setHs] = useState(() => readHs(HS.pairs))

  const start = (d) => {
    const n = d === 'beginner' ? 6 : d === 'intermediate' ? 10 : 15
    const pickIcons = shuffle(icons).slice(0, n)
    setCards(
      shuffle(
        pickIcons.flatMap((icon, i) => [
          { uid: `${i}a`, pair: i, icon },
          { uid: `${i}b`, pair: i, icon },
        ])
      )
    )
    setDiff(d)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setLock(false)
    setWon(false)
  }

  const flip = (uid) => {
    if (lock || won || flipped.includes(uid) || matched.includes(uid) || flipped.length >= 2) return
    const next = [...flipped, uid]
    setFlipped(next)
    if (next.length < 2) return
    setMoves((m) => m + 1)
    const [a, b] = next.map((id) => cards.find((c) => c.uid === id))
    if (a.pair === b.pair) {
      const nm = [...matched, a.uid, b.uid]
      setMatched(nm)
      setFlipped([])
      playSfx('click')
      if (nm.length === cards.length) {
        setWon(true)
        setHs(writeHs(HS.pairs, Math.max(10, 1000 - (moves + 1) * 8)))
        playSfx('cakeWin')
      }
    } else {
      setLock(true)
      playSfx('fail')
      setTimeout(() => {
        setFlipped([])
        setLock(false)
      }, 700)
    }
  }

  if (!diff) {
    return (
      <DiffScreen title="Purble Pairs" onBack={onBack} onPick={start} map={CAKE_DIFF} />
    )
  }

  const cols = diff === 'beginner' ? 4 : diff === 'intermediate' ? 5 : 6

  return (
    <GameShell
      title={`Pares · ${CAKE_DIFF[diff].label}`}
      stats={`Movimientos ${moves} · Récord ${hs}`}
      onBack={() => setDiff(null)}
      onRestart={() => start(diff)}
      onPueblo={onPueblo}
      onSalir={onSalir}
    >
      <div className="grid gap-2 flex-1 min-h-0 overflow-auto content-start p-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {cards.map((c) => {
          const open = flipped.includes(c.uid) || matched.includes(c.uid)
          return (
            <button
              key={c.uid}
              type="button"
              onClick={() => flip(c.uid)}
              className={`aspect-square rounded-xl border-2 flex items-center justify-center overflow-hidden ${
                matched.includes(c.uid)
                  ? 'border-emerald-400 bg-emerald-50'
                  : open
                    ? 'border-[#9b6bce] bg-white'
                    : 'border-[#7e57c2] bg-gradient-to-br from-[#b57edc] to-[#6a1b9a]'
              }`}
            >
              {open ? (
                <img src={c.icon.src} alt="" className="w-[80%] h-[80%] object-contain" draggable={false} />
              ) : (
                <span className="text-white font-black text-lg">?</span>
              )}
            </button>
          )
        })}
      </div>
      {won && (
        <Overlay
          title="¡Todas las parejas!"
          body={`${moves} movimientos · Récord ${hs}`}
          onPrimary={() => start(diff)}
          onSecondary={() => setDiff(null)}
        />
      )}
    </GameShell>
  )
}

/* ─── Comfy Cakes ─── */
/** Centros X de cada estación (Tool.X + ~46). box = centro plataforma estrella (655+81) */
const CAKE_STATIONS_ALL = [
  { id: 'pan', x: 118 },
  { id: 'batter', x: 218 },
  { id: 'fill', x: 318 },
  { id: 'icing', x: 418 },
  { id: 'decor', x: 527 },
  { id: 'final', x: 618 },
  { id: 'box', x: 700 },
]

/** Principiante omite relleno/final (como el original Vista). */
function cakeStationsFor(cfg) {
  if (!cfg) return CAKE_STATIONS_ALL
  return CAKE_STATIONS_ALL.filter((s) => {
    if (s.id === 'fill' && cfg.layers < 2) return false
    if (s.id === 'final' && cfg.toppings < 3) return false
    return true
  })
}

function ComfyCakes({ onBack, onPueblo, onSalir }) {
  const [diff, setDiff] = useState(null)
  const [order, setOrder] = useState(null)
  const [build, setBuild] = useState({ shape: null, batters: [], fills: [], icing: null, decor: null, final: null })
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [done, setDone] = useState(0)
  const [status, setStatus] = useState('playing')
  const [hs, setHs] = useState(() => readHs(HS.cakes))
  const [timeLeft, setTimeLeft] = useState(20)
  const [msg, setMsg] = useState('')
  const [station, setStation] = useState(0)
  const [busy, setBusy] = useState(false)
  const [beltOn, setBeltOn] = useState(false)
  const [dropKey, setDropKey] = useState(0)
  const [fx, setFx] = useState(null) // 'trash' | null
  const [packPhase, setPackPhase] = useState(null) // null | 'onto' | 'wrap' | 'ship'
  const [slidePress, setSlidePress] = useState(null) // null | 'left' | 'right'
  const [slidePressFrame, setSlidePressFrame] = useState(0)
  const [shipFlash, setShipFlash] = useState(false)
  const [activeMachine, setActiveMachine] = useState(null)
  const [machineFrame, setMachineFrame] = useState(0)
  const [redBlink, setRedBlink] = useState(false)
  const missLock = useRef(false)
  const slidePressTimers = useRef([])

  const cfg = diff ? CAKE_DIFF[diff] : null
  const stations = cakeStationsFor(cfg)
  const boxIdx = Math.max(0, stations.length - 1)
  const stationMeta = stations[Math.min(station, boxIdx)] || stations[0]
  const stationId = stationMeta?.id
  const cakeX = stationMeta?.x ?? 118
  const onBoxStation = stationId === 'box'
  const packing = packPhase != null
  const showCakeOnBelt = packPhase == null || packPhase === 'onto' || fx === 'trash'

  const emptyBuild = () => ({ shape: null, batters: [], fills: [], icing: null, decor: null, final: null })

  const clearSlidePressTimers = () => {
    slidePressTimers.current.forEach((t) => clearTimeout(t))
    slidePressTimers.current = []
  }

  const pulseSlide = (dir) => {
    clearSlidePressTimers()
    setSlidePress(dir)
    setSlidePressFrame(0)
    // Hundido más visible: 0 → 1 → 2 → idle (~280ms)
    slidePressTimers.current.push(setTimeout(() => setSlidePressFrame(1), 70))
    slidePressTimers.current.push(setTimeout(() => setSlidePressFrame(2), 140))
    slidePressTimers.current.push(
      setTimeout(() => {
        setSlidePress(null)
        setSlidePressFrame(0)
      }, 280)
    )
  }

  const start = (d) => {
    missLock.current = false
    clearSlidePressTimers()
    setDiff(d)
    setOrder(randomOrder(d))
    setBuild(emptyBuild())
    setScore(0)
    setMisses(0)
    setDone(0)
    setStatus('playing')
    setTimeLeft(cakeTimerSecs(CAKE_DIFF[d]))
    setMsg('')
    setStation(0)
    setBusy(false)
    setBeltOn(false)
    setFx(null)
    setPackPhase(null)
    setSlidePress(null)
    setShipFlash(false)
    setActiveMachine(null)
    setRedBlink(false)
  }

  useEffect(() => () => clearSlidePressTimers(), [])

  const missCake = (reason) => {
    if (missLock.current || status !== 'playing') return
    missLock.current = true
    playSfx('dump')
    setFx('trash')
    setRedBlink(true)
    setMsg(reason || 'Pedido perdido')
    setBusy(true)
    setTimeout(() => {
      setFx(null)
      setRedBlink(false)
      setBusy(false)
      setMisses((m) => {
        const limit = CAKE_DIFF[diff].misses
        if (m >= limit) {
          missLock.current = false
          return m
        }
        const nm = m + 1
        if (nm >= limit) {
          setStatus('lost')
          setMsg('')
          setHs(writeHs(HS.cakes, score))
          playSfx('lose')
          missLock.current = false
        } else {
          setOrder(randomOrder(diff))
          setBuild(emptyBuild())
          setStation(0)
          setTimeLeft(cakeTimerSecs(CAKE_DIFF[diff]))
          missLock.current = false
          setTimeout(() => setMsg(''), 800)
        }
        return nm
      })
    }, 650)
  }

  useEffect(() => {
    if (!diff || status !== 'playing' || busy || missLock.current) return undefined
    if (timeLeft <= 0) {
      missCake('Tiempo agotado')
      return undefined
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diff, status, busy, timeLeft])

  // Animación de frames de máquina activa
  useEffect(() => {
    if (!activeMachine) return undefined
    setMachineFrame(0)
    const max = MACHINE_FRAMES[activeMachine] || 8
    const id = setInterval(() => setMachineFrame((f) => (f + 1) % max), 70)
    const stop = setTimeout(() => setActiveMachine(null), Math.min(560, max * 70))
    return () => {
      clearInterval(id)
      clearTimeout(stop)
    }
  }, [activeMachine, dropKey])

  const runBelt = (nextStation, after) => {
    if (busy || status !== 'playing') return
    setBusy(true)
    setBeltOn(true)
    playSfx('convey')
    setStation(nextStation)
    setTimeout(() => {
      setBeltOn(false)
      setBusy(false)
      if (nextStation >= boxIdx) {
        setMsg('¡En la estrella! Empaqueta el pedido')
        setTimeout(() => setMsg(''), 1200)
      }
      after?.()
    }, 500)
  }

  const slideRight = () => {
    if (busy || status !== 'playing' || packing) return
    pulseSlide('right')
    if (station >= boxIdx) {
      deliver()
      return
    }
    runBelt(station + 1)
  }

  const slideLeft = () => {
    if (busy || status !== 'playing' || packing) return
    pulseSlide('left')
    if (station <= 0) {
      // descartar pastel vacío / incompleto
      if (build.shape || build.batters.length) missCake('Descartado')
      else playSfx('fail')
      return
    }
    runBelt(station - 1)
  }

  const pulseDrop = (machineId) => {
    setDropKey((k) => k + 1)
    if (machineId) setActiveMachine(machineId)
    playSfx('cakeBtn')
  }

  const requireStation = (id, hint) => {
    if (stationId !== id) {
      playSfx('fail')
      setMsg(hint)
      setTimeout(() => setMsg(''), 700)
      return false
    }
    return true
  }

  const setShape = (shape) => {
    if (busy || status !== 'playing') return
    if (!requireStation('pan', 'Mueve el pastel al molde')) return
    pulseDrop('pan')
    setBuild({ shape, batters: [], fills: [], icing: null, decor: null, final: null })
  }

  const addBatter = (b) => {
    if (busy || status !== 'playing' || !cfg) return
    if (!requireStation('batter', 'Mueve al dispensador de masa')) return
    if (!build.shape) {
      playSfx('fail')
      setMsg('Primero el molde')
      setTimeout(() => setMsg(''), 700)
      return
    }
    if (build.batters.length >= cfg.layers) {
      playSfx('fail')
      setMsg('Ya tiene todas las capas')
      setTimeout(() => setMsg(''), 700)
      return
    }
    // Entre capas hace falta relleno antes de la siguiente masa
    if (build.batters.length > 0 && (build.fills?.length || 0) < build.batters.length) {
      playSfx('fail')
      setMsg('Pon relleno antes de otra masa')
      setTimeout(() => setMsg(''), 700)
      return
    }
    pulseDrop('batter')
    setBuild((prev) => {
      const batters = [...prev.batters, b]
      return { ...prev, batters }
    })
  }

  const addFill = (f) => {
    if (busy || status !== 'playing' || !cfg) return
    if (cfg.layers < 2) {
      playSfx('fail')
      setMsg('Sin relleno en principiante')
      setTimeout(() => setMsg(''), 700)
      return
    }
    if (!requireStation('fill', 'Mueve al relleno')) return
    if (!build.shape || build.batters.length === 0) {
      playSfx('fail')
      setMsg('Primero la masa')
      setTimeout(() => setMsg(''), 700)
      return
    }
    const fills = build.fills || []
    if (fills.length >= build.batters.length) {
      playSfx('fail')
      setMsg('Necesitas otra capa de masa')
      setTimeout(() => setMsg(''), 700)
      return
    }
    if (fills.length >= cfg.layers - 1) {
      playSfx('fail')
      return
    }
    pulseDrop('fill')
    setBuild((prev) => ({ ...prev, fills: [...(prev.fills || []), f] }))
  }

  const setIcing = (b) => {
    if (busy || status !== 'playing' || !cfg || cfg.toppings < 1) return
    if (!requireStation('icing', 'Mueve a la crema')) return
    if (build.batters.length < cfg.layers) {
      playSfx('fail')
      setMsg('Faltan capas de masa')
      setTimeout(() => setMsg(''), 700)
      return
    }
    if (cfg.layers >= 2 && (build.fills || []).length < cfg.layers - 1) {
      playSfx('fail')
      setMsg('Falta relleno entre capas')
      setTimeout(() => setMsg(''), 700)
      return
    }
    pulseDrop('icing')
    setBuild((p) => ({ ...p, icing: b }))
  }

  const setDecor = (d) => {
    if (busy || status !== 'playing' || !cfg || cfg.toppings < 2) return
    if (!requireStation('decor', 'Mueve a decoración')) return
    if (!build.icing) {
      playSfx('fail')
      setMsg('Primero la crema')
      setTimeout(() => setMsg(''), 700)
      return
    }
    pulseDrop('decor')
    setBuild((p) => ({ ...p, decor: d }))
  }

  const setFinal = (v) => {
    if (busy || status !== 'playing' || !cfg || cfg.toppings < 3) return
    if (!requireStation('final', 'Mueve al toque final')) return
    if (!build.decor) {
      playSfx('fail')
      setMsg('Primero la decoración')
      setTimeout(() => setMsg(''), 700)
      return
    }
    pulseDrop('final')
    setBuild((p) => ({ ...p, final: v }))
  }

  const cakeReadyToShip = () => {
    if (!order || !cfg || !build.shape || build.batters.length < cfg.layers) return false
    if (cfg.layers >= 2 && (build.fills || []).length < cfg.layers - 1) return false
    if (cfg.toppings >= 1 && !build.icing) return false
    if (cfg.toppings >= 2 && !build.decor) return false
    if (cfg.toppings >= 3 && !build.final) return false
    return true
  }

  const finishPackSuccess = (ns, nd) => {
    setPackPhase(null)
    setShipFlash(false)
    setBusy(false)
    setDone(nd)
    if (nd >= cfg.cakes) {
      setStatus('won')
      setMsg('')
      setHs(writeHs(HS.cakes, ns))
      playSfx('cakeWin')
    } else {
      setOrder(randomOrder(diff))
      setBuild(emptyBuild())
      setStation(0)
      setTimeLeft(cakeTimerSecs(cfg))
      setTimeout(() => setMsg(''), 700)
    }
  }

  const deliver = () => {
    if (status !== 'playing' || !order || !cfg || busy || packing) return
    if (stationId !== 'box') {
      playSfx('fail')
      setMsg('Lleva el pastel a la estrella')
      setTimeout(() => setMsg(''), 700)
      return
    }
    if (!cakeReadyToShip()) {
      setMsg('El pedido aún no está completo')
      setTimeout(() => setMsg(''), 700)
      return
    }
    if (cakeEqual(build, order)) {
      playSfx('boxed')
      setBusy(true)
      const ns = score + 50 + timeLeft
      const nd = done + 1
      setScore(ns)
      setMsg('¡Pedido empaquetado!')
      // 1) pastel asienta en la estrella → 2) cae la caja → 3) vuela al panel de pedidos
      setPackPhase('onto')
      setTimeout(() => setPackPhase('wrap'), 380)
      setTimeout(() => {
        setPackPhase('ship')
        setShipFlash(true)
      }, 380 + 420)
      setTimeout(() => finishPackSuccess(ns, nd), 380 + 420 + 900)
    } else {
      missCake('Pastel incorrecto')
    }
  }

  if (!diff) return <DiffScreen title="Comfy Cakes" onBack={onBack} onPick={start} map={CAKE_DIFF} />

  const toolBtns = []
  const pushCol = (tx, ty, bh, items) => {
    items.forEach((it, i) => toolBtns.push({ ...it, x: tx, y: ty + i * bh, w: 54, h: bh }))
  }
  pushCol(
    72,
    298,
    38,
    SHAPES.map((s) => ({
      id: `pan-${s}`,
      src: `${A}/cakes/tools/CakePanTool${s}ButtonSprite.png`,
      onClick: () => setShape(s),
      active: build.shape === s,
      lit: stationId === 'pan',
    }))
  )
  pushCol(
    172,
    298,
    38,
    BATTERS.map((b) => ({
      id: `bat-${b}`,
      src: `${A}/cakes/tools/BatterTool${b === 'Vanilla' ? 'Lemon' : b}ButtonSprite.png`,
      onClick: () => addBatter(b),
      active: build.batters[build.batters.length - 1] === b,
      lit: stationId === 'batter',
    }))
  )
  pushCol(
    272,
    298,
    38,
    cfg.layers >= 2
      ? [
          { id: 'fill-choco', fill: 'Chocolate', src: `${A}/cakes/tools/FillingToolChocolateButtonSprite.png` },
          { id: 'fill-rasp', fill: 'Raspberry', src: `${A}/cakes/tools/FillingToolRaspberryButtonSprite.png` },
          { id: 'fill-van', fill: 'Vanilla', src: `${A}/cakes/tools/FillingToolVanillaCustardButtonSprite.png` },
        ].map((it) => ({
          id: it.id,
          src: it.src,
          active: build.fills?.[build.fills.length - 1] === it.fill,
          lit: stationId === 'fill',
          onClick: () => addFill(it.fill),
        }))
      : []
  )
  pushCol(
    372,
    298,
    38,
    ICINGS.map((b) => ({
      id: `ice-${b}`,
      src: `${A}/cakes/tools/IcingTool${b === 'Vanilla' ? 'Lemon' : b}ButtonSprite.png`,
      onClick: () => setIcing(b),
      active: build.icing === b,
      lit: stationId === 'icing',
    }))
  )
  // DecorationTool 481,337 — rejilla 2×2 (DecorationTool.xml)
  const decorCells = [
    { id: 'Heart', x: 0, y: 0 },
    { id: 'Smiley', x: 0, y: 34 },
    { id: 'Gumdrop', x: 39, y: 0 },
    { id: 'Shamrock', x: 39, y: 34 },
  ]
  for (const cell of decorCells) {
    toolBtns.push({
      id: `dec-${cell.id}`,
      src: `${A}/cakes/tools/DecorationTool${cell.id}ButtonSprite.png`,
      onClick: () => setDecor(cell.id),
      active: build.decor === cell.id,
      lit: stationId === 'decor',
      x: 481 + cell.x,
      y: 337 + cell.y,
      w: 54,
      h: 38,
    })
  }
  if (cfg.toppings >= 3) {
    pushCol(572, 301, 60, [
      {
        id: 'sugar',
        src: `${A}/cakes/tools/FinalTouchToolPowderedSugarButtonSprite.png`,
        onClick: () => setFinal('Sugar'),
        active: build.final === 'Sugar',
        lit: stationId === 'final',
      },
      {
        id: 'burnt',
        src: `${A}/cakes/tools/FinalTouchToolBurntGlazeButtonSprite.png`,
        onClick: () => setFinal('Burnt'),
        active: build.final === 'Burnt',
        lit: stationId === 'final',
      },
    ])
  }

  const machines = [
    { id: 'pan', src: `${A}/cakes/machines/pan.png`, frames: 'pan', x: 75, y: 0, w: 100, h: 155 },
    { id: 'batter', src: `${A}/cakes/machines/batter.png`, frames: 'batter', x: 172 + 46 - 85, y: 0, w: 170, h: 125 },
    ...(cfg.layers >= 2
      ? [
          { id: 'fill', src: `${A}/cakes/machines/filling.png`, frames: 'filling', x: 278, y: 56, w: 100, h: 110 },
          { id: 'fill-tubes', src: `${A}/cakes/machines/filling-tubes.png`, frames: null, x: 278, y: 0, w: 100, h: 76 },
        ]
      : []),
    { id: 'icing', src: `${A}/cakes/machines/icing.png`, frames: 'icing', x: 372 + 46 - 56, y: 0, w: 112, h: 161 },
    { id: 'decor', src: `${A}/cakes/machines/decor.png`, frames: 'decor', x: 481 + 46 - 55, y: 0, w: 110, h: 150 },
    ...(cfg.toppings >= 3
      ? [{ id: 'final', src: `${A}/cakes/machines/final.png`, frames: null, x: 592, y: 0, w: 95, h: 159 }]
      : []),
  ]

  const machineSrc = (m) => {
    if (activeMachine === m.id && m.frames) {
      return `${A}/cakes/machines/${m.frames}_f${machineFrame}.png`
    }
    return m.src
  }

  return (
    <GameShell
      title={`Comfy Cakes · ${cfg.label}`}
      stats={`${score} pts · ${done}/${cfg.cakes} · ✕${misses}/${cfg.misses} · ${timeLeft}s · E${station + 1}/${stations.length} · ★${hs}`}
      onBack={() => setDiff(null)}
      onRestart={() => start(diff)}
      onPueblo={onPueblo}
      onSalir={onSalir}
    >
      <style>{`
        @keyframes pp-cake-drop { from { transform: translateY(-70px) scale(0.85); opacity: 0.25; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes pp-trash { to { transform: translate(55px, 95px) rotate(28deg) scale(0.55); opacity: 0; } }
        @keyframes pp-box-drop { from { transform: translateY(-130px) scale(0.7); opacity: 0.15; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes pp-box-ship { to { transform: translate(28px, -148px) scale(0.38); opacity: 0.15; } }
        @keyframes pp-cake-onto { from { transform: translate(0, 0) scale(1); } to { transform: translate(36px, -8px) scale(0.92); } }
        @keyframes pp-belt { from { transform: translateX(0); } to { transform: translateX(-100px); } }
        @keyframes pp-pulse { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.35); } }
        @keyframes pp-red { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
        @keyframes pp-star-glow { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.45) saturate(1.2); } }
        @keyframes pp-ship-flash { 0%,100% { filter: brightness(1); } 40% { filter: brightness(1.5) drop-shadow(0 0 8px #7cff9a); } }
      `}</style>
      <AbsBoard bg={`${A}/cakes/background.png?v=44`}>
        {/* TV + pedido — CakeX=65 CakeY=108 (ComfyCakesGame.xml) */}
        <Abs x={0} y={0} w={141} h={156} className="pointer-events-none overflow-hidden">
          <img src={`${A}/cakes/ui/tv.png`} alt="" className="absolute inset-0 w-full h-full object-fill" draggable={false} />
          <div
            className="absolute"
            style={{ left: 65, top: 108, transform: 'translate(-50%, -78%)' }}
          >
            <CakeStack cake={order} size={72} />
          </div>
        </Abs>

        {/* Panel de pedidos — regalos enviados + guiones vacíos (como el original) */}
        <Abs x={695} y={19} w={94} h={53} className="pointer-events-none z-[4] overflow-hidden rounded-sm">
          {shipFlash || packPhase === 'ship' ? (
            <img
              src={`${A}/cakes/ui/shipping-b0.png?v=1`}
              alt=""
              className="absolute inset-0 w-full h-full object-fill"
              style={{ animation: 'pp-ship-flash 0.55s ease-in-out 2' }}
              draggable={false}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center gap-[2px] px-1"
              style={{ background: 'linear-gradient(180deg, #2a1848 0%, #12081f 100%)' }}
            >
              <img
                src={`${A}/cakes/ui/cake-box.png?v=5`}
                alt=""
                className="shrink-0 object-contain opacity-95"
                style={{ width: 14, height: 22 }}
                draggable={false}
              />
              {Array.from({ length: cfg.cakes }).map((_, i) =>
                i < done ? (
                  <img
                    key={`gift-${i}`}
                    src={`${A}/cakes/ui/cake-box.png?v=5`}
                    alt=""
                    className="shrink-0 object-contain"
                    style={{ width: Math.min(14, Math.floor(62 / cfg.cakes)), height: 24 }}
                    draggable={false}
                  />
                ) : (
                  <span
                    key={`slot-${i}`}
                    className="shrink-0 font-black leading-none select-none"
                    style={{ color: '#d4b0ea', fontSize: cfg.cakes > 6 ? 10 : 13, opacity: 0.9 }}
                  >
                    —
                  </span>
                )
              )}
            </div>
          )}
        </Abs>

        {/* Máquinas */}
        {machines.map((m) => (
          <Abs
            key={m.id}
            x={m.x}
            y={m.y}
            w={m.w}
            h={m.h}
            className="pointer-events-none"
            style={
              activeMachine === m.id || (m.id === 'fill-tubes' && activeMachine === 'fill')
                ? { animation: 'pp-pulse 0.28s ease-in-out 2' }
                : undefined
            }
          >
            <img src={machineSrc(m)} alt="" className="w-full h-full object-contain object-top" draggable={false} />
          </Abs>
        ))}

        {/* Cinta continua — canal limpio + strip sin sierra/diagonales; llega hasta la plataforma */}
        <Abs x={5} y={221} w={650} h={65} className="pointer-events-none z-[1] overflow-hidden">
          <img
            src={`${A}/cakes/ui/main-belt-strip.png?v=11`}
            alt=""
            className="absolute left-0 top-0 h-full"
            style={{
              width: 800,
              maxWidth: 'none',
              animation: beltOn ? 'pp-belt 0.5s linear' : undefined,
            }}
            draggable={false}
          />
        </Abs>

        {/* Tacho asentado en el suelo (contenido opaco del sprite XML) */}
        <Abs x={672} y={288} w={121} h={174} className="pointer-events-none z-[1]">
          <img src={`${A}/cakes/ui/trash-bin.png?v=5`} alt="" className="w-full h-full object-fill" draggable={false} />
        </Abs>

        {/* Cinta derecha / chute de envío 699,28 */}
        <Abs x={699} y={28} w={103} h={222} className="pointer-events-none z-[2]">
          <img src={`${A}/cakes/ui/right-belt.png?v=5`} alt="" className="w-full h-full object-fill" draggable={false} />
        </Abs>

        {/* ConveyorPlatform 655,221 — 162×75 (estrella de empaque) */}
        <Abs
          x={655}
          y={221}
          w={162}
          h={75}
          className="pointer-events-none z-[3]"
          style={
            onBoxStation || packing
              ? { animation: packing ? 'pp-star-glow 0.4s ease-in-out 3' : 'pp-star-glow 1.2s ease-in-out infinite' }
              : undefined
          }
        >
          <img src={`${A}/cakes/ui/conveyor-platform.png?v=7`} alt="" className="w-full h-full object-fill" draggable={false} />
        </Abs>

        {/* Regalo: cae sobre la estrella y luego vuela al panel de pedidos */}
        {(packPhase === 'wrap' || packPhase === 'ship') && (
          <Abs
            x={687}
            y={155}
            w={87}
            h={115}
            className="pointer-events-none z-[5]"
            style={{
              animation: packPhase === 'wrap' ? 'pp-box-drop 0.4s ease-out forwards' : 'pp-box-ship 0.9s ease-in forwards',
            }}
          >
            <img src={`${A}/cakes/ui/cake-box.png?v=5`} alt="" className="w-full h-full object-fill" draggable={false} />
          </Abs>
        )}

        {/* Luz roja — solo en fallo (idle invisible como el original) */}
        <Abs x={13} y={297} w={38} h={38} className="pointer-events-none" style={redBlink ? { animation: 'pp-red 0.35s ease-in-out 3' } : { opacity: 0 }}>
          <img src={`${A}/cakes/ui/red-light.png`} alt="" className="w-full h-full object-contain" draggable={false} />
        </Abs>

        {/* Pastel + papel — en empaque 'onto' se asienta sobre la estrella; luego desaparece al envolver */}
        {showCakeOnBelt && packPhase !== 'wrap' && packPhase !== 'ship' && (
          <Abs
            x={cakeX - 53}
            y={onBoxStation || packPhase === 'onto' ? 148 : 154}
            w={106}
            h={120}
            className="pointer-events-none z-[4]"
            style={{
              transition: packPhase === 'onto' ? 'none' : 'left 0.5s ease-in-out, top 0.5s ease-in-out',
              animation:
                fx === 'trash'
                  ? 'pp-trash 0.65s ease-in forwards'
                  : packPhase === 'onto'
                    ? 'pp-cake-onto 0.38s ease-out forwards'
                    : undefined,
            }}
          >
            {(build.shape || (build.batters?.length ?? 0) > 0) && (
              <img
                src={`${A}/cakes/ui/wax-paper.png`}
                alt=""
                className="absolute left-0 bottom-0 w-full object-contain"
                style={{ height: 46, opacity: onBoxStation || packPhase === 'onto' ? 0.8 : 0.92 }}
                draggable={false}
              />
            )}
            <div
              key={dropKey}
              className="absolute left-0 right-0 bottom-5 flex justify-center items-end"
              style={dropKey > 0 && !packPhase ? { animation: 'pp-cake-drop 0.35s ease-out' } : undefined}
            >
              <CakeStack cake={build} size={onBoxStation || packPhase === 'onto' ? 68 : 72} />
            </div>
          </Abs>
        )}

        {/* El tiempo ya va en la barra de stats; la barra CSS suelta ensuciaba la escena */}

        {toolBtns.map((it) => (
          <Abs
            key={it.id}
            as="button"
            type="button"
            x={it.x}
            y={it.y}
            w={it.w}
            h={it.h}
            onClick={it.onClick}
            title={it.id}
            className={`p-0 border-0 bg-transparent cursor-pointer ${
              it.active ? 'brightness-125 drop-shadow-[0_0_5px_rgba(255,220,80,0.95)]' : it.lit ? 'brightness-110' : 'hover:brightness-110'
            }`}
          >
            <img src={it.src} alt="" className="w-full h-full object-contain" draggable={false} />
          </Abs>
        ))}

        {/* SlideLeft/Right — ambos verdes como el original; press = sprite hundido + hundimiento CSS */}
        <Abs
          as="button"
          type="button"
          x={91}
          y={416}
          w={65}
          h={50}
          onClick={slideLeft}
          className="p-0 border-0 bg-transparent cursor-pointer z-[3]"
          title="Atrás / Descartar"
          style={slidePress === 'left' ? { transform: 'translateY(3px) scale(0.94)', transformOrigin: 'center bottom' } : undefined}
        >
          <img
            src={
              slidePress === 'left'
                ? `${A}/cakes/ui/slide-left-press${slidePressFrame}.png?v=2`
                : `${A}/cakes/ui/slide-left.png?v=5`
            }
            alt=""
            className="w-full h-full object-fill"
            draggable={false}
          />
        </Abs>
        <Abs
          as="button"
          type="button"
          x={161}
          y={416}
          w={66}
          h={50}
          onClick={slideRight}
          className="p-0 border-0 bg-transparent cursor-pointer z-[3]"
          title="Avanzar / Empaquetar"
          style={slidePress === 'right' ? { transform: 'translateY(3px) scale(0.94)', transformOrigin: 'center bottom' } : undefined}
        >
          <img
            src={
              slidePress === 'right'
                ? `${A}/cakes/ui/slide-right-press${slidePressFrame}.png?v=2`
                : `${A}/cakes/ui/slide-right.png?v=5`
            }
            alt=""
            className="w-full h-full object-fill"
            draggable={false}
          />
        </Abs>

        {/* Hit area estrella / caja — empaquetar pedido listo */}
        <Abs as="button" type="button" x={655} y={150} w={162} h={145} onClick={deliver} className="border-0 bg-transparent cursor-pointer z-[2]" title="Empaquetar pedido">
          <span className="sr-only">Empaquetar pedido en la estrella</span>
        </Abs>

        {msg && (
          <Abs x={250} y={40} w={300} h={36} className="flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-black/55 text-white">{msg}</span>
          </Abs>
        )}
      </AbsBoard>

      {(status === 'won' || status === 'lost') && (
        <Overlay
          title={status === 'won' ? '¡Turno completo!' : 'Cocina cerrada'}
          body={`${score} puntos · Récord ${hs}`}
          onPrimary={() => start(diff)}
          onSecondary={() => setDiff(null)}
        />
      )}
    </GameShell>
  )
}

/* ─── Purble Shop (BuildAPurbleGame.xml + Cabinet.xml) ─── */
function PurbleShop({ onBack, onPueblo, onSalir }) {
  const [diff, setDiff] = useState(null)
  const [secret, setSecret] = useState(null)
  const [guess, setGuess] = useState(null)
  const [tries, setTries] = useState([])
  const [status, setStatus] = useState('playing')
  const [points, setPoints] = useState(100)
  const [hs, setHs] = useState(() => readHs(HS.shop))
  const head = 1

  const cfg = diff ? SHOP_DIFF[diff] : null
  const colors = cfg?.colors || COLORS
  const cols = SHOP_COLS[colors.length] || SHOP_COLS[3]

  const start = (d) => {
    const palette = SHOP_DIFF[d].colors
    setDiff(d)
    setSecret(randomFace(palette))
    setGuess(randomFace(palette))
    setTries([])
    setStatus('playing')
    setPoints(100)
  }

  const pickPart = (feature, color, style) => {
    if (status !== 'playing') return
    playSfx('click')
    const key = feature === 'Eyes' ? 'eyes' : feature === 'Nose' ? 'nose' : 'mouth'
    setGuess((g) => ({
      ...g,
      [`${key}Color`]: color,
      [`${key}Style`]: style,
    }))
  }

  const submit = () => {
    if (status !== 'playing' || !secret || !guess || !cfg) return
    const g = gradeFace(secret, guess)
    const next = [...tries, { ...guess, ...g }]
    setTries(next)
    const gained = g.rcrf * 5 + g.rcwf * 3
    setPoints((p) => p + gained)
    playSfx('click')
    if (g.exact) {
      setStatus('won')
      setHs(writeHs(HS.shop, points + gained + (cfg.max - next.length) * 10))
      playSfx('cakeWin')
    } else if (next.length >= cfg.max) {
      setStatus('lost')
      playSfx('lose')
    }
  }

  if (!diff) return <DiffScreen title="Purble Shop" onBack={onBack} onPick={start} map={SHOP_DIFF} />

  const features = [
    { name: 'Eyes', key: 'eyes', y: SHOP_SHELF_Y.Eyes },
    { name: 'Nose', key: 'nose', y: SHOP_SHELF_Y.Nose },
    { name: 'Mouth', key: 'mouth', y: SHOP_SHELF_Y.Mouth },
  ]

  return (
    <GameShell
      title={`Purble Shop · ${cfg.label}`}
      stats={`Intentos ${tries.length}/${cfg.max} · Pts ${points} · Récord ${hs}`}
      onBack={() => setDiff(null)}
      onRestart={() => start(diff)}
      onPueblo={onPueblo}
      onSalir={onSalir}
    >
      <AbsBoard bg={`${A}/shop/background.png`}>
        {/* HiddenPurble 97,90 Scale 47 */}
        <Abs x={97} y={90} className="pointer-events-none">
          <PurbleAvatar face={secret} head={head} size={Math.round(127 * 0.47)} mystery={status === 'playing'} />
        </Abs>
        {status !== 'playing' && secret && (
          <Abs x={97} y={90} className="pointer-events-none">
            <PurbleAvatar face={secret} head={head} size={Math.round(127 * 0.47)} />
          </Abs>
        )}

        {tries.length > 0 && (
          <Abs x={252} y={85} w={155} h={80} className="flex items-center justify-center gap-3 pointer-events-none">
            <span className="inline-flex items-center gap-1 text-white font-black text-xl drop-shadow">
              <img src={`${A}/shop/green-check.png`} alt="" className="w-7 h-7" />
              {tries[tries.length - 1].rcrf}
            </span>
            <span className="inline-flex items-center gap-1 text-white font-black text-xl drop-shadow">
              <img src={`${A}/shop/checkbox.png`} alt="" className="w-7 h-7" />
              {tries[tries.length - 1].rcwf}
            </span>
          </Abs>
        )}

        {/* GuessPurble 123,190 Scale 100 — top-left exacto */}
        <Abs x={123} y={190} className="pointer-events-none">
          <PurbleAvatar face={guess} head={head} size={127} />
        </Abs>

        {/* GuessButton 310,300 — 88×78 */}
        <Abs
          as="button"
          type="button"
          x={310}
          y={300}
          w={88}
          h={78}
          onClick={submit}
          disabled={status !== 'playing'}
          className="p-0 border-0 bg-transparent cursor-pointer disabled:opacity-40 hover:brightness-110"
        >
          <img src={`${A}/shop/guess-btn.png`} alt="Probar" className="w-full h-full object-fill" draggable={false} />
        </Abs>

        {/* Gabinete: ItemList X + registration del thumbnail */}
        {features.map((feat) =>
          colors.map((color) => {
            const relX = cols[color] ?? 55
            const itemsY = SHELF_ITEMS_Y[feat.name] ?? 0
            const ax = SHOP_SHELF_X + relX - SHELF_REG.rx
            const ay = feat.y + itemsY - SHELF_REG.ry
            const activeColor = guess?.[`${feat.key}Color`]
            const activeStyle = guess?.[`${feat.key}Style`] || 1
            const style = activeColor === color ? activeStyle : 1
            const active = activeColor === color
            return (
              <Abs
                key={`${feat.name}-${color}`}
                as="button"
                type="button"
                x={ax}
                y={ay}
                w={SHELF_REG.w}
                h={SHELF_REG.h}
                onClick={() => {
                  const nextStyle = active ? (style % 3) + 1 : 1
                  pickPart(feat.name, color, nextStyle)
                }}
                className={`p-0 border-0 bg-transparent cursor-pointer ${
                  active ? 'brightness-125 drop-shadow-[0_0_8px_rgba(255,220,80,0.95)]' : 'hover:brightness-110'
                }`}
                title={`${color} ${feat.name}`}
              >
                <img
                  src={shelfPartSrc(color, feat.name, style)}
                  alt=""
                  className="w-full h-full object-fill"
                  draggable={false}
                />
              </Abs>
            )
          })
        )}

        {/* Historial HistorySlot 63+111*i, 388 */}
        {tries.slice(-6).map((t, i) => (
          <Abs key={i} x={63 + i * 111} y={388} w={90} h={90} className="flex flex-col items-center gap-0.5 pointer-events-none">
            <PurbleAvatar face={t} head={head} size={42} />
            <span className="inline-flex gap-0.5">
              {Array.from({ length: t.rcrf }).map((_, j) => (
                <img key={`a${j}`} src={`${A}/shop/green-check.png`} alt="" className="w-3.5 h-3.5" />
              ))}
              {Array.from({ length: t.rcwf }).map((_, j) => (
                <img key={`b${j}`} src={`${A}/shop/checkbox.png`} alt="" className="w-3.5 h-3.5" />
              ))}
              {t.rcrf + t.rcwf === 0 && <img src={`${A}/shop/red-x.png`} alt="" className="w-3.5 h-3.5" />}
            </span>
          </Abs>
        ))}
      </AbsBoard>

      {(status === 'won' || status === 'lost') && (
        <Overlay
          title={status === 'won' ? '¡Purble correcto!' : 'Sin más intentos'}
          body={status === 'won' ? `En ${tries.length} intentos` : 'Mira la respuesta detrás de la cortina'}
          onPrimary={() => start(diff)}
          onSecondary={() => setDiff(null)}
        />
      )}
    </GameShell>
  )
}

/* ─── Shell UI ─── */
function DiffScreen({ title, onBack, onPick, map }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 flex-1 min-h-0 px-4">
      <h2 className="text-2xl font-black text-[#5b2c6f]">{title}</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {Object.entries(map).map(([id, cfg]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              playSfx('click')
              onPick(id)
            }}
            className="min-w-[130px] px-5 py-3 rounded-2xl bg-white/90 border border-[#c9a8e8] text-[#5b2c6f] font-bold hover:bg-[#f3e8ff]"
          >
            {cfg.label}
          </button>
        ))}
      </div>
      <button type="button" onClick={onBack} className="text-sm text-[#6a4c93] underline">
        Volver al pueblo
      </button>
    </div>
  )
}

function GameShell({ title, stats, onBack, onRestart, onPueblo, onSalir, children }) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-h-0 relative">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 shrink-0 px-0.5">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[#5b2c6f] text-sm sm:text-base leading-tight truncate">{title}</p>
          <p className="text-[11px] sm:text-xs text-[#6a4c93]/80 leading-tight truncate">{stats}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <button type="button" onClick={onRestart} className="min-h-8 px-2.5 rounded-full text-xs font-bold bg-white/80 border border-[#c9a8e8] text-[#5b2c6f]">
            Reiniciar
          </button>
          <button type="button" onClick={onBack} className="min-h-8 px-2.5 rounded-full text-xs font-bold bg-white/80 border border-[#c9a8e8] text-[#5b2c6f]">
            Atrás
          </button>
          {onPueblo && (
            <button type="button" onClick={onPueblo} className="min-h-8 px-2.5 rounded-full text-xs font-bold bg-white/80 border border-[#c9a8e8] text-[#5b2c6f]">
              Pueblo
            </button>
          )}
          {onSalir && (
            <button type="button" onClick={onSalir} className="min-h-8 px-2.5 rounded-full text-xs font-bold bg-white/80 border border-[#c9a8e8] text-[#5b2c6f]">
              Volver
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  )
}

function Overlay({ title, body, onPrimary, onSecondary }) {
  return (
    <div className="absolute inset-0 z-30 bg-[#3d2a5a]/45 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="rounded-2xl bg-white/95 border border-[#c9a8e8] px-8 py-6 text-center text-[#5b2c6f] max-w-sm w-full shadow-2xl">
        <p className="text-2xl font-black mb-2">{title}</p>
        <p className="text-sm opacity-80 mb-5">{body}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onPrimary} className="px-4 py-2 rounded-full bg-[#9b6bce] text-white font-bold text-sm">
            Otra vez
          </button>
          <button type="button" onClick={onSecondary} className="px-4 py-2 rounded-full bg-[#f3e8ff] border border-[#c9a8e8] font-bold text-sm">
            Dificultad
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PurblePlace({ onSalir }) {
  const [view, setView] = useState('hub')
  const goHub = () => setView('hub')
  const gameNav = { onPueblo: goHub, onSalir }

  return (
    <div className="w-full flex-1 flex flex-col gap-1 min-h-0">
      {view === 'hub' && (
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 px-0.5">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-black text-[#5b2c6f] tracking-tight leading-tight truncate">
              Purble Place Original
            </h1>
            <p className="text-[11px] sm:text-xs text-[#6a4c93]/75 leading-tight">
              Texturas y reglas del pack Windows Vista / 7
            </p>
          </div>
          {onSalir && (
            <button
              type="button"
              onClick={onSalir}
              className="min-h-8 px-2.5 rounded-full text-xs font-bold bg-white/80 text-[#5b2c6f] border border-[#c9a8e8] shrink-0"
            >
              Volver
            </button>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {view === 'hub' && <Hub onPick={setView} onSalir={onSalir} />}
        {view === 'pairs' && <PurblePairs onBack={goHub} {...gameNav} />}
        {view === 'cakes' && <ComfyCakes onBack={goHub} {...gameNav} />}
        {view === 'shop' && <PurbleShop onBack={goHub} {...gameNav} />}
      </div>
    </div>
  )
}
