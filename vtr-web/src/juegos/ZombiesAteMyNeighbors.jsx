/**
 * Zombies Ate My Neighbors — versión web original (estilo top-down).
 * No ejecuta el .exe de Steam; implementación propia en canvas.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react'

const W = 640
const H = 480
const TILE = 40

const WEAPONS = [
  { id: 'water', name: 'Pistola de agua', dmg: 1, rate: 8, speed: 9, color: '#4fc3f7', spread: 0 },
  { id: 'soda', name: 'Soda ácida', dmg: 2, rate: 14, speed: 7, color: '#ff7043', spread: 0.08 },
  { id: 'bazooka', name: 'Bazuca', dmg: 5, rate: 28, speed: 6, color: '#ffd54f', spread: 0, splash: 48 },
]

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v))
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function rand(a, b) {
  return a + Math.random() * (b - a)
}

function buildMap(level) {
  const cols = Math.ceil(W / TILE)
  const rows = Math.ceil(H / TILE)
  const walls = []
  // Borde
  for (let c = 0; c < cols; c++) {
    walls.push({ x: c * TILE, y: 0, w: TILE, h: TILE })
    walls.push({ x: c * TILE, y: (rows - 1) * TILE, w: TILE, h: TILE })
  }
  for (let r = 1; r < rows - 1; r++) {
    walls.push({ x: 0, y: r * TILE, w: TILE, h: TILE })
    walls.push({ x: (cols - 1) * TILE, y: r * TILE, w: TILE, h: TILE })
  }
  // Obstáculos interiores según nivel
  const count = 6 + level * 2
  for (let i = 0; i < count; i++) {
    const c = 2 + Math.floor(Math.random() * (cols - 4))
    const r = 2 + Math.floor(Math.random() * (rows - 4))
    // Evitar centro spawn
    if (Math.abs(c - cols / 2) < 2 && Math.abs(r - rows / 2) < 2) continue
    walls.push({ x: c * TILE, y: r * TILE, w: TILE, h: TILE, decor: true })
  }
  return walls
}

function circleRect(cx, cy, cr, rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w)
  const ny = clamp(cy, rect.y, rect.y + rect.h)
  return Math.hypot(cx - nx, cy - ny) < cr
}

function resolveWalls(ent, walls, r) {
  for (const w of walls) {
    if (!circleRect(ent.x, ent.y, r, w)) continue
    const cx = w.x + w.w / 2
    const cy = w.y + w.h / 2
    const dx = ent.x - cx
    const dy = ent.y - cy
    if (Math.abs(dx) > Math.abs(dy)) {
      ent.x = dx > 0 ? w.x + w.w + r : w.x - r
    } else {
      ent.y = dy > 0 ? w.y + w.h + r : w.y - r
    }
  }
  ent.x = clamp(ent.x, r + 2, W - r - 2)
  ent.y = clamp(ent.y, r + 2, H - r - 2)
}

export default function ZombiesAteMyNeighbors({ onSalir }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const keysRef = useRef({})
  const aimRef = useRef({ x: W / 2, y: H / 2, shooting: false })
  const touchMoveRef = useRef({ active: false, id: null, x: 0, y: 0, ox: 0, oy: 0 })
  const touchAimRef = useRef({ active: false, id: null })
  const rafRef = useRef(0)
  const [ui, setUi] = useState({
    score: 0,
    rescued: 0,
    need: 3,
    lives: 3,
    level: 1,
    weapon: WEAPONS[0].name,
    status: 'playing',
  })

  const initGame = useCallback((level = 1, keepScore = 0) => {
    const walls = buildMap(level)
    const need = Math.min(3 + Math.floor(level / 2), 8)
    const neighbors = []
    for (let i = 0; i < need; i++) {
      neighbors.push({
        id: i + 1,
        x: rand(80, W - 80),
        y: rand(80, H - 80),
        rescued: false,
        panic: Math.random() * Math.PI * 2,
      })
    }
    stateRef.current = {
      walls,
      player: { x: W / 2, y: H / 2, r: 12, hp: 3, inv: 0, weapon: 0, cooldown: 0 },
      zombies: [],
      bullets: [],
      particles: [],
      neighbors,
      score: keepScore,
      rescued: 0,
      need,
      lives: 3,
      level,
      status: 'playing',
      spawnTimer: 40,
      tick: 0,
      shake: 0,
      message: '¡Rescata a los vecinos!',
      msgT: 90,
    }
    setUi({
      score: keepScore,
      rescued: 0,
      need,
      lives: 3,
      level,
      weapon: WEAPONS[0].name,
      status: 'playing',
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    const resize = () => {
      const maxW = Math.min(960, parent?.clientWidth || window.innerWidth - 16)
      const maxH = Math.floor(window.innerHeight * 0.78)
      let w = maxW
      let h = Math.round((w * H) / W)
      if (h > maxH) {
        h = maxH
        w = Math.round((h * W) / H)
      }
      canvas.width = W
      canvas.height = H
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    resize()
    window.addEventListener('resize', resize)
    initGame(1)
    return () => window.removeEventListener('resize', resize)
  }, [initGame])

  useEffect(() => {
    const down = (e) => {
      keysRef.current[e.code] = true
      const weaponKeys = ['KeyE', 'KeyQ', 'Digit1', 'Digit2', 'Digit3']
      if (!weaponKeys.includes(e.code)) return
      const st = stateRef.current
      if (!st || st.status !== 'playing') return
      if (e.code === 'KeyE') st.player.weapon = Math.min(2, st.player.weapon + 1)
      if (e.code === 'KeyQ') st.player.weapon = Math.max(0, st.player.weapon - 1)
      if (e.code === 'Digit1') st.player.weapon = 0
      if (e.code === 'Digit2') st.player.weapon = 1
      if (e.code === 'Digit3') st.player.weapon = 2
      setUi((u) => ({ ...u, weapon: WEAPONS[st.player.weapon].name }))
    }
    const up = (e) => {
      keysRef.current[e.code] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const spawnZombie = (st) => {
      const side = Math.floor(Math.random() * 4)
      let x = 60
      let y = 60
      if (side === 0) {
        x = rand(50, W - 50)
        y = 50
      } else if (side === 1) {
        x = rand(50, W - 50)
        y = H - 50
      } else if (side === 2) {
        x = 50
        y = rand(50, H - 50)
      } else {
        x = W - 50
        y = rand(50, H - 50)
      }
      const kinds = ['walker', 'walker', 'runner', 'tank']
      const kind = kinds[Math.min(kinds.length - 1, Math.floor(Math.random() * (1 + st.level * 0.4)))]
      const stats =
        kind === 'runner'
          ? { hp: 2, speed: 1.55, r: 11, color: '#a5d6a7' }
          : kind === 'tank'
            ? { hp: 6, speed: 0.7, r: 16, color: '#8d6e63' }
            : { hp: 3, speed: 1.05, r: 13, color: '#66bb6a' }
      st.zombies.push({
        x,
        y,
        ...stats,
        kind,
        hit: 0,
      })
    }

    const fire = (st) => {
      const p = st.player
      if (p.cooldown > 0) return
      const wpn = WEAPONS[p.weapon]
      p.cooldown = wpn.rate
      const ang = Math.atan2(aimRef.current.y - p.y, aimRef.current.x - p.x) + (Math.random() - 0.5) * wpn.spread
      st.bullets.push({
        x: p.x + Math.cos(ang) * 16,
        y: p.y + Math.sin(ang) * 16,
        vx: Math.cos(ang) * wpn.speed,
        vy: Math.sin(ang) * wpn.speed,
        dmg: wpn.dmg,
        color: wpn.color,
        life: 55,
        splash: wpn.splash || 0,
      })
    }

    const burst = (st, x, y, color, n = 8) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = rand(1, 3.5)
        st.particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 18 + Math.random() * 12,
          color,
        })
      }
    }

    const loop = () => {
      const st = stateRef.current
      if (!st) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }
      st.tick++

      if (st.status === 'playing') {
        const p = st.player
        const keys = keysRef.current
        let mx = 0
        let my = 0
        if (keys.KeyW || keys.ArrowUp) my -= 1
        if (keys.KeyS || keys.ArrowDown) my += 1
        if (keys.KeyA || keys.ArrowLeft) mx -= 1
        if (keys.KeyD || keys.ArrowRight) mx += 1
        const tm = touchMoveRef.current
        if (tm.active) {
          mx += tm.x
          my += tm.y
        }
        const len = Math.hypot(mx, my) || 1
        const speed = 2.35
        p.x += (mx / len) * speed
        p.y += (my / len) * speed
        resolveWalls(p, st.walls, p.r)

        if (p.cooldown > 0) p.cooldown--
        if (p.inv > 0) p.inv--
        if (aimRef.current.shooting || keys.Space) fire(st)

        // Spawn
        st.spawnTimer--
        const maxZ = 4 + st.level * 2
        if (st.spawnTimer <= 0 && st.zombies.length < maxZ) {
          spawnZombie(st)
          st.spawnTimer = Math.max(25, 70 - st.level * 4)
        }

        // Neighbors wander
        for (const n of st.neighbors) {
          if (n.rescued) continue
          n.panic += 0.04
          n.x += Math.cos(n.panic) * 0.35
          n.y += Math.sin(n.panic * 1.3) * 0.35
          resolveWalls(n, st.walls, 10)
          if (dist(n, p) < 22) {
            n.rescued = true
            st.rescued++
            st.score += 200
            burst(st, n.x, n.y, '#fff59d', 12)
            st.message = '¡Vecino a salvo!'
            st.msgT = 50
            setUi((u) => ({ ...u, rescued: st.rescued, score: st.score }))
          }
        }

        // Zombies AI
        for (const z of st.zombies) {
          if (z.hit > 0) z.hit--
          const ang = Math.atan2(p.y - z.y, p.x - z.x)
          z.x += Math.cos(ang) * z.speed
          z.y += Math.sin(ang) * z.speed
          resolveWalls(z, st.walls, z.r)
          if (dist(z, p) < p.r + z.r - 2 && p.inv <= 0) {
            p.inv = 45
            st.lives--
            st.shake = 10
            burst(st, p.x, p.y, '#ef5350', 10)
            setUi((u) => ({ ...u, lives: st.lives }))
            if (st.lives <= 0) {
              st.status = 'lost'
              setUi((u) => ({ ...u, status: 'lost', score: st.score }))
            }
          }
        }

        // Bullets
        const keepB = []
        for (const b of st.bullets) {
          b.x += b.vx
          b.y += b.vy
          b.life--
          let hitWall = false
          for (const w of st.walls) {
            if (circleRect(b.x, b.y, 4, w)) {
              hitWall = true
              break
            }
          }
          if (hitWall || b.life <= 0 || b.x < 0 || b.y < 0 || b.x > W || b.y > H) {
            if (b.splash) burst(st, b.x, b.y, b.color, 14)
            continue
          }
          let killed = false
          for (const z of st.zombies) {
            if (dist(b, z) < z.r + 4) {
              z.hp -= b.dmg
              z.hit = 6
              burst(st, b.x, b.y, b.color, 5)
              if (b.splash) {
                for (const z2 of st.zombies) {
                  if (dist(b, z2) < b.splash) {
                    z2.hp -= Math.ceil(b.dmg / 2)
                    z2.hit = 6
                  }
                }
                burst(st, b.x, b.y, '#ffcc80', 16)
              }
              killed = true
              break
            }
          }
          if (!killed) keepB.push(b)
        }
        st.bullets = keepB
        st.zombies = st.zombies.filter((z) => {
          if (z.hp > 0) return true
          st.score += z.kind === 'tank' ? 80 : z.kind === 'runner' ? 40 : 25
          burst(st, z.x, z.y, z.color, 10)
          setUi((u) => ({ ...u, score: st.score }))
          return false
        })

        st.particles = st.particles
          .map((pt) => ({ ...pt, x: pt.x + pt.vx, y: pt.y + pt.vy, life: pt.life - 1, vy: pt.vy + 0.08 }))
          .filter((pt) => pt.life > 0)

        if (st.msgT > 0) st.msgT--
        if (st.shake > 0) st.shake *= 0.85

        if (st.rescued >= st.need && st.status === 'playing') {
          st.status = 'won'
          st.score += 500 * st.level
          setUi((u) => ({ ...u, status: 'won', score: st.score }))
        }
      }

      // Draw
      const sx = st.shake ? (Math.random() - 0.5) * st.shake : 0
      const sy = st.shake ? (Math.random() - 0.5) * st.shake : 0
      ctx.save()
      ctx.translate(sx, sy)

      // Césped / noche suburbana
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#1b3a2a')
      g.addColorStop(1, '#0d2218')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      for (let y = 0; y < H; y += TILE) {
        for (let x = 0; x < W; x += TILE) {
          if ((x + y) % (TILE * 2) === 0) ctx.fillRect(x, y, TILE, TILE)
        }
      }

      // Walls / casas
      for (const w of st.walls) {
        if (w.decor) {
          ctx.fillStyle = '#5d4037'
          ctx.fillRect(w.x + 2, w.y + 2, w.w - 4, w.h - 4)
          ctx.fillStyle = '#8d6e63'
          ctx.fillRect(w.x + 6, w.y + 6, w.w - 12, 8)
        } else {
          ctx.fillStyle = '#263238'
          ctx.fillRect(w.x, w.y, w.w, w.h)
          ctx.strokeStyle = '#455a64'
          ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1)
        }
      }

      // Neighbors
      for (const n of st.neighbors) {
        if (n.rescued) continue
        ctx.beginPath()
        ctx.arc(n.x, n.y, 10, 0, Math.PI * 2)
        ctx.fillStyle = '#ffe082'
        ctx.fill()
        ctx.fillStyle = '#5d4037'
        ctx.fillRect(n.x - 5, n.y - 14, 10, 6)
        ctx.fillStyle = '#ef5350'
        ctx.beginPath()
        ctx.arc(n.x, n.y - 20 + Math.sin(st.tick / 8) * 2, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      // Zombies
      for (const z of st.zombies) {
        ctx.beginPath()
        ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2)
        ctx.fillStyle = z.hit > 0 ? '#fff' : z.color
        ctx.fill()
        ctx.fillStyle = '#1b5e20'
        ctx.beginPath()
        ctx.arc(z.x - 4, z.y - 2, 2.2, 0, Math.PI * 2)
        ctx.arc(z.x + 4, z.y - 2, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Bullets
      for (const b of st.bullets) {
        ctx.beginPath()
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = b.color
        ctx.fill()
      }

      // Player
      const p = st.player
      const ang = Math.atan2(aimRef.current.y - p.y, aimRef.current.x - p.x)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(ang)
      ctx.globalAlpha = p.inv > 0 && st.tick % 6 < 3 ? 0.4 : 1
      ctx.fillStyle = '#42a5f5'
      ctx.beginPath()
      ctx.arc(0, 0, p.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#90caf9'
      ctx.fillRect(6, -3, 14, 6)
      ctx.restore()

      for (const pt of st.particles) {
        ctx.globalAlpha = Math.max(0, pt.life / 25)
        ctx.fillStyle = pt.color
        ctx.fillRect(pt.x, pt.y, 3, 3)
        ctx.globalAlpha = 1
      }

      if (st.msgT > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)'
        ctx.fillRect(W / 2 - 120, 16, 240, 28)
        ctx.fillStyle = '#fffde7'
        ctx.font = 'bold 14px Trebuchet MS, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(st.message, W / 2, 35)
      }

      ctx.restore()

      // Touch sticks overlay hints (drawn in CSS mostly)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const toCanvas = (clientX, clientY) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    }
  }

  const onPointerDown = (e) => {
    if (ui.status !== 'playing') return
    e.preventDefault()
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const localX = e.clientX - rect.left
    const half = rect.width * 0.42

    // Mitad izquierda = stick movimiento; derecha = apuntar/disparar
    if (e.pointerType === 'touch' && localX < half) {
      touchMoveRef.current = {
        active: true,
        id: e.pointerId,
        x: 0,
        y: 0,
        ox: e.clientX,
        oy: e.clientY,
      }
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        /* */
      }
      return
    }

    const p = toCanvas(e.clientX, e.clientY)
    aimRef.current.x = p.x
    aimRef.current.y = p.y
    aimRef.current.shooting = true
    touchAimRef.current = { active: true, id: e.pointerId }
    try {
      canvas.setPointerCapture(e.pointerId)
    } catch {
      /* */
    }
  }

  const onPointerMove = (e) => {
    const tm = touchMoveRef.current
    if (tm.active && tm.id === e.pointerId) {
      const dx = (e.clientX - tm.ox) / 40
      const dy = (e.clientY - tm.oy) / 40
      const L = Math.hypot(dx, dy) || 1
      const cap = Math.min(1, L)
      tm.x = (dx / L) * cap
      tm.y = (dy / L) * cap
      return
    }
    if (e.pointerType === 'mouse' || (touchAimRef.current.active && touchAimRef.current.id === e.pointerId)) {
      const p = toCanvas(e.clientX, e.clientY)
      aimRef.current.x = p.x
      aimRef.current.y = p.y
    }
  }

  const onPointerUp = (e) => {
    const tm = touchMoveRef.current
    if (tm.active && tm.id === e.pointerId) {
      tm.active = false
      tm.x = 0
      tm.y = 0
      return
    }
    if (touchAimRef.current.active && touchAimRef.current.id === e.pointerId) {
      touchAimRef.current.active = false
      aimRef.current.shooting = false
    }
    if (e.pointerType === 'mouse') aimRef.current.shooting = false
  }

  const cycleWeapon = () => {
    const st = stateRef.current
    if (!st || st.status !== 'playing') return
    st.player.weapon = (st.player.weapon + 1) % WEAPONS.length
    setUi((u) => ({ ...u, weapon: WEAPONS[st.player.weapon].name }))
  }

  const nextLevel = () => {
    const st = stateRef.current
    initGame((st?.level || 1) + 1, st?.score || 0)
  }

  return (
    <div className="w-full flex-1 flex flex-col gap-2 min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex flex-col gap-0.5 text-sm text-[#e8f5e9]">
          <span className="font-semibold tracking-wide">Zombies Ate My Neighbors</span>
          <span className="opacity-80 text-xs sm:text-sm">
            Nv.{ui.level} · {ui.score} pts · ♥ {ui.lives} · Rescates {ui.rescued}/{ui.need} · {ui.weapon}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={cycleWeapon}
            className="min-h-11 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-lime-500/20 text-lime-100 border border-lime-400/40 active:scale-95"
          >
            Arma (Q/E)
          </button>
          <button
            type="button"
            onClick={() => initGame(ui.level, 0)}
            className="min-h-11 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white active:scale-95"
          >
            Reiniciar
          </button>
          {onSalir && (
            <button
              type="button"
              onClick={onSalir}
              className="min-h-11 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white active:scale-95"
            >
              Volver
            </button>
          )}
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-lime-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.45)] bg-[#0a1a12] mx-auto w-fit max-w-full select-none">
        <canvas
          ref={canvasRef}
          className="block touch-none cursor-crosshair max-w-full"
          style={{ touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Sticks hint mobile */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-between px-4 sm:hidden text-[10px] text-white/40">
          <span>← Mover</span>
          <span>Apuntar / Disparar →</span>
        </div>

        {(ui.status === 'won' || ui.status === 'lost') && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
            <div className="rounded-2xl bg-[#102418]/95 border border-lime-400/40 px-8 py-6 text-center text-[#e8f5e9] max-w-sm w-full">
              <p className="text-2xl font-bold mb-1">{ui.status === 'won' ? '¡Barrio a salvo!' : 'Te comieron…'}</p>
              <p className="text-sm opacity-80 mb-5">{ui.score} puntos</p>
              <div className="flex flex-wrap justify-center gap-2">
                {ui.status === 'won' ? (
                  <button
                    type="button"
                    onClick={nextLevel}
                    className="px-4 py-2 rounded-full bg-lime-400 text-[#102418] font-bold text-sm"
                  >
                    Siguiente noche
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => initGame(1, 0)}
                    className="px-4 py-2 rounded-full bg-lime-400 text-[#102418] font-bold text-sm"
                  >
                    Reintentar
                  </button>
                )}
                {onSalir && (
                  <button type="button" onClick={onSalir} className="px-4 py-2 rounded-full bg-white/10 font-bold text-sm">
                    Menú
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-[#c8e6c9]/55 px-1">
        Versión web original · WASD mover · Mouse apuntar/disparar · Táctil: stick izq. + dedo der. · Rescata a todos los
        vecinos.
      </p>
    </div>
  )
}
