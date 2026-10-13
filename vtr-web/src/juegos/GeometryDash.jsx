import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Maximize2, Minimize2, Play, ChevronLeft, ChevronRight, Star, Zap, Skull, Music, RotateCcw } from 'lucide-react'

/* ─── Datos de niveles oficiales ─── */
const GD_LEVELS = [
  { id: 1,  name: 'Stereo Madness',        diff: 1,  stars: 1,  demon: false, color: '#4fc3f7' },
  { id: 2,  name: 'Back on Track',          diff: 1,  stars: 2,  demon: false, color: '#4fc3f7' },
  { id: 3,  name: 'Polargeist',             diff: 2,  stars: 3,  demon: false, color: '#66bb6a' },
  { id: 4,  name: 'Dry Out',                diff: 2,  stars: 4,  demon: false, color: '#66bb6a' },
  { id: 5,  name: 'Base After Base',         diff: 3,  stars: 5,  demon: false, color: '#ffa726' },
  { id: 6,  name: "Can't Let Go",           diff: 3,  stars: 6,  demon: false, color: '#ffa726' },
  { id: 7,  name: 'Jumper',                 diff: 4,  stars: 7,  demon: false, color: '#ef5350' },
  { id: 8,  name: 'Time Machine',           diff: 4,  stars: 8,  demon: false, color: '#ef5350' },
  { id: 9,  name: 'Cycles',                 diff: 4,  stars: 9,  demon: false, color: '#ef5350' },
  { id: 10, name: 'xStep',                  diff: 5,  stars: 10, demon: false, color: '#ab47bc' },
  { id: 11, name: 'Clutterfunk',            diff: 5,  stars: 11, demon: false, color: '#ab47bc' },
  { id: 12, name: 'Theory of Everything',   diff: 5,  stars: 12, demon: false, color: '#ab47bc' },
  { id: 13, name: 'Electroman Adventures',  diff: 5,  stars: 10, demon: false, color: '#ab47bc' },
  { id: 14, name: 'Clubstep',               diff: 6,  stars: 14, demon: true,  color: '#e53935' },
  { id: 15, name: 'Electrodynamix',         diff: 5,  stars: 12, demon: false, color: '#ab47bc' },
  { id: 16, name: 'Hexagon Force',          diff: 5,  stars: 12, demon: false, color: '#ab47bc' },
  { id: 17, name: 'Blast Processing',       diff: 4,  stars: 10, demon: false, color: '#ef5350' },
  { id: 18, name: 'Theory of Everything 2', diff: 6,  stars: 14, demon: true,  color: '#e53935' },
  { id: 19, name: 'Geometrical Dominator',  diff: 4,  stars: 10, demon: false, color: '#ef5350' },
  { id: 20, name: 'Deadlocked',             diff: 6,  stars: 15, demon: true,  color: '#e53935' },
  { id: 21, name: 'Fingerdash',             diff: 5,  stars: 12, demon: false, color: '#ab47bc' },
  { id: 22, name: 'Dash',                   diff: 5,  stars: 12, demon: false, color: '#ab47bc' },
]

const DIFF_NAMES = ['', 'Fácil', 'Normal', 'Difícil', 'Muy Difícil', 'Insano', 'Demon']
const DIFF_ICONS = ['', '😊', '😐', '😠', '😈', '💀', '👹']

/* ─── Cara de dificultad estilo GD ─── */
function DiffFace({ diff, demon, size = 38 }) {
  const bgColors = {
    1: '#4fc3f7', 2: '#66bb6a', 3: '#ffa726',
    4: '#ef5350', 5: '#ab47bc', 6: '#e53935',
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: `radial-gradient(circle at 38% 35%, ${bgColors[diff] || '#888'}cc, ${bgColors[diff] || '#888'}55)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.55, lineHeight: 1,
        boxShadow: `0 0 ${size * 0.4}px ${bgColors[diff] || '#888'}66`,
        border: demon ? '2px solid #ff1744' : '2px solid rgba(255,255,255,0.2)',
      }}
    >
      {DIFF_ICONS[diff] || '?'}
    </div>
  )
}

/* ─── Estrellas de dificultad ─── */
function Stars({ count, max = 10 }) {
  return (
    <span className="gd-stars-row">
      {Array.from({ length: Math.min(count, max) }, (_, i) => (
        <Star key={i} size={11} fill="#fdd835" color="#fdd835" strokeWidth={0} />
      ))}
    </span>
  )
}

export default function GeometryDash({ onSalir }) {
  const [view, setView] = useState('menu')         // 'menu' | 'playing'
  const [selectedIdx, setSelectedIdx] = useState(0) // índice en GD_LEVELS
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)
  const iframeRef = useRef(null)
  const scrollRef = useRef(null)

  const level = GD_LEVELS[selectedIdx]

  /* ─── Scroll al nivel seleccionado ─── */
  useEffect(() => {
    if (view !== 'menu' || !scrollRef.current) return
    const card = scrollRef.current.children[selectedIdx]
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [selectedIdx, view])

  /* ─── Keyboard nav en el menú ─── */
  useEffect(() => {
    if (view !== 'menu') return
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx((i) => Math.min(GD_LEVELS.length - 1, i + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx((i) => Math.max(0, i - 1))
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setView('playing')
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onSalir()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, onSalir])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }, [])

  const prev = () => setSelectedIdx((i) => Math.max(0, i - 1))
  const next = () => setSelectedIdx((i) => Math.min(GD_LEVELS.length - 1, i + 1))
  const playLevel = () => setView('playing')
  const backToMenu = () => setView('menu')

  /* ═══════════════════════════════════════
     Vista: PLAYING (iframe a pantalla completa)
     ═══════════════════════════════════════ */
  if (view === 'playing') {
    return (
      <div ref={containerRef} className="gd-playing-root">
        {/* Mini barra flotante */}
        <div className="gd-playing-bar">
          <button type="button" className="gd-bar-btn" onClick={backToMenu} title="Volver al selector de niveles">
            <ArrowLeft size={16} />
          </button>
          <span className="gd-bar-title">{level.name}</span>
          <button type="button" className="gd-bar-btn" onClick={() => {
            if (iframeRef.current) iframeRef.current.src = iframeRef.current.src
          }} title="Reiniciar">
            <RotateCcw size={14} />
          </button>
          <button type="button" className="gd-bar-btn" onClick={toggleFullscreen} title="Pantalla completa">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

        <iframe
          ref={iframeRef}
          src={`/juegos/geometry-dash/index.html?level=${level.id}&embedded=1`}
          title={`Geometry Dash - ${level.name}`}
          className="gd-playing-iframe"
          allow="autoplay; fullscreen; gamepad; keyboard"
        />

        <style>{playingCSS}</style>
      </div>
    )
  }

  /* ═══════════════════════════════════════
     Vista: MENÚ / SELECTOR DE NIVELES
     ═══════════════════════════════════════ */
  return (
    <div ref={containerRef} className="gd-menu-root">
      {/* Fondo animado GD */}
      <div className="gd-menu-bg" aria-hidden="true">
        <div className="gd-menu-bg-grid" />
        <div className="gd-menu-bg-glow" style={{ background: `radial-gradient(ellipse at 50% 80%, ${level.color}33 0%, transparent 60%)` }} />
      </div>

      {/* Header */}
      <header className="gd-menu-header">
        <button type="button" className="gd-back-btn" onClick={onSalir}>
          <ArrowLeft size={16} />
          <span>Volver</span>
        </button>
        <div className="gd-menu-logo">
          <img src="/juegos/covers/geometrydash-logo.png" alt="Geometry Dash" className="gd-logo-img" />
        </div>
        <button type="button" className="gd-fs-btn" onClick={toggleFullscreen}>
          <Maximize2 size={15} />
        </button>
      </header>

      {/* Panel central con el nivel seleccionado */}
      <div className="gd-menu-center">
        <div className="gd-level-showcase" style={{ '--gd-accent': level.color }}>
          <DiffFace diff={level.diff} demon={level.demon} size={64} />
          <h2 className="gd-level-name">{level.name}</h2>
          <div className="gd-level-info">
            <span className="gd-diff-badge" style={{ borderColor: `${level.color}88` }}>
              {level.demon ? '👹 Demon' : DIFF_NAMES[level.diff]}
            </span>
            <Stars count={level.stars} />
          </div>
          <p className="gd-level-num">Nivel {level.id} de {GD_LEVELS.length}</p>
        </div>

        {/* Botón PLAY gigante */}
        <button type="button" className="gd-play-btn" onClick={playLevel}>
          <Play size={28} fill="currentColor" />
          <span>JUGAR</span>
        </button>
      </div>

      {/* Carrusel de niveles estilo GD */}
      <div className="gd-carousel-wrap">
        <button type="button" className="gd-carousel-arrow gd-arrow-left" onClick={prev} disabled={selectedIdx === 0}>
          <ChevronLeft size={24} />
        </button>

        <div className="gd-carousel" ref={scrollRef}>
          {GD_LEVELS.map((lvl, idx) => (
            <button
              key={lvl.id}
              type="button"
              className={`gd-card${idx === selectedIdx ? ' is-active' : ''}`}
              onClick={() => setSelectedIdx(idx)}
              style={{ '--card-color': lvl.color }}
            >
              <div className="gd-card-face">
                <DiffFace diff={lvl.diff} demon={lvl.demon} size={30} />
              </div>
              <span className="gd-card-id">{lvl.id}</span>
              <span className="gd-card-name">{lvl.name}</span>
            </button>
          ))}
        </div>

        <button type="button" className="gd-carousel-arrow gd-arrow-right" onClick={next} disabled={selectedIdx === GD_LEVELS.length - 1}>
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Footer con controles */}
      <footer className="gd-menu-footer">
        <span>🎮 <kbd>←</kbd> <kbd>→</kbd> Navegar · <kbd>Enter</kbd> Jugar · <kbd>Esc</kbd> Salir</span>
        <span>RobTop Games · Web Port · 22 niveles oficiales</span>
      </footer>

      <style>{menuCSS}</style>
    </div>
  )
}

/* ═══════════════════════════════════════
   CSS: Menú / Selector de Niveles
   ═══════════════════════════════════════ */
const menuCSS = `
  .gd-menu-root {
    position: relative;
    width: 100%;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #050a18;
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    color: #e8f4ff;
  }

  /* ── Fondo animado ── */
  .gd-menu-bg {
    position: absolute; inset: 0; z-index: 0; pointer-events: none;
  }
  .gd-menu-bg-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: gd-grid-scroll 8s linear infinite;
  }
  @keyframes gd-grid-scroll {
    to { background-position: 60px 60px; }
  }
  .gd-menu-bg-glow {
    position: absolute; inset: 0;
    transition: background 0.5s ease;
  }

  /* ── Header ── */
  .gd-menu-header {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1.2rem;
  }
  .gd-back-btn, .gd-fs-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.45rem 0.85rem;
    border-radius: 999px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    color: #b0d4f1;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
  }
  .gd-back-btn:hover, .gd-fs-btn:hover {
    background: rgba(255,255,255,0.14);
    color: #fff;
  }
  .gd-menu-logo { display: flex; align-items: center; }
  .gd-logo-img {
    height: 2.2rem;
    object-fit: contain;
    filter: drop-shadow(0 4px 16px rgba(34,211,238,0.35));
  }

  /* ── Centro: nivel seleccionado ── */
  .gd-menu-center {
    position: relative; z-index: 10;
    flex: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 1.5rem;
    padding: 0 1rem;
  }
  .gd-level-showcase {
    display: flex; flex-direction: column;
    align-items: center; gap: 0.65rem;
    animation: gd-fade-in 0.35s ease-out;
  }
  @keyframes gd-fade-in {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .gd-level-name {
    font-size: clamp(1.5rem, 4vw, 2.4rem);
    font-weight: 800;
    text-align: center;
    text-shadow: 0 2px 20px rgba(0,0,0,0.6);
    margin: 0;
  }
  .gd-level-info {
    display: flex; align-items: center; gap: 0.7rem;
  }
  .gd-diff-badge {
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    letter-spacing: 0.02em;
  }
  .gd-stars-row {
    display: inline-flex; align-items: center; gap: 1px;
  }
  .gd-level-num {
    font-size: 0.72rem;
    color: rgba(200,220,255,0.5);
    margin: 0;
  }

  /* ── Botón JUGAR ── */
  .gd-play-btn {
    display: inline-flex; align-items: center; gap: 0.6rem;
    padding: 0.85rem 2.4rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #22d3ee, #06b6d4, #0891b2);
    color: #fff;
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 30px rgba(34,211,238,0.35), 0 0 0 2px rgba(34,211,238,0.15);
    transition: all 0.25s ease;
    text-transform: uppercase;
  }
  .gd-play-btn:hover {
    transform: scale(1.06);
    box-shadow: 0 8px 40px rgba(34,211,238,0.5), 0 0 0 3px rgba(34,211,238,0.3);
  }
  .gd-play-btn:active {
    transform: scale(0.97);
  }

  /* ── Carrusel de niveles ── */
  .gd-carousel-wrap {
    position: relative; z-index: 10;
    display: flex; align-items: center;
    padding: 0.5rem 0.4rem 0.75rem;
    gap: 0.3rem;
  }
  .gd-carousel-arrow {
    flex: 0 0 auto;
    width: 2.2rem; height: 2.2rem;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: #8ecae6;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .gd-carousel-arrow:hover:not(:disabled) {
    background: rgba(255,255,255,0.14);
    color: #fff;
  }
  .gd-carousel-arrow:disabled {
    opacity: 0.2;
    cursor: default;
  }
  .gd-carousel {
    flex: 1;
    display: flex;
    gap: 0.55rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding: 0.4rem 0.3rem;
    scrollbar-width: none;
  }
  .gd-carousel::-webkit-scrollbar { display: none; }

  /* ── Tarjeta de nivel ── */
  .gd-card {
    flex: 0 0 auto;
    width: 5.5rem;
    display: flex; flex-direction: column;
    align-items: center; gap: 0.3rem;
    padding: 0.55rem 0.3rem 0.45rem;
    border-radius: 0.85rem;
    background: rgba(255,255,255,0.04);
    border: 2px solid transparent;
    cursor: pointer;
    scroll-snap-align: center;
    transition: all 0.25s ease;
  }
  .gd-card:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.1);
    transform: translateY(-3px);
  }
  .gd-card.is-active {
    background: rgba(var(--card-r, 34), var(--card-g, 211), var(--card-b, 238), 0.12);
    border-color: var(--card-color, #22d3ee);
    box-shadow: 0 4px 20px color-mix(in srgb, var(--card-color, #22d3ee) 30%, transparent);
    transform: translateY(-5px) scale(1.04);
  }
  .gd-card-face { position: relative; }
  .gd-card-id {
    font-size: 0.65rem;
    font-weight: 700;
    color: rgba(200,220,255,0.45);
  }
  .gd-card-name {
    font-size: 0.58rem;
    font-weight: 600;
    color: rgba(200,220,255,0.7);
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .gd-card.is-active .gd-card-name {
    color: #fff;
  }

  /* ── Footer ── */
  .gd-menu-footer {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.5rem 1.2rem;
    font-size: 0.65rem;
    color: rgba(160,190,220,0.45);
  }
  .gd-menu-footer kbd {
    display: inline-block;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    background: rgba(255,255,255,0.08);
    font-size: 0.6rem;
    font-family: inherit;
    color: rgba(200,220,255,0.6);
    border: 1px solid rgba(255,255,255,0.1);
  }

  @media (max-width: 640px) {
    .gd-card { width: 4.2rem; }
    .gd-card-name { display: none; }
    .gd-play-btn { padding: 0.7rem 1.6rem; font-size: 0.95rem; }
    .gd-level-name { font-size: 1.3rem; }
    .gd-menu-footer { flex-direction: column; gap: 0.2rem; text-align: center; }
  }
`

/* ═══════════════════════════════════════
   CSS: Vista de juego (iframe)
   ═══════════════════════════════════════ */
const playingCSS = `
  .gd-playing-root {
    position: relative;
    width: 100%;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: #000;
    overflow: hidden;
  }

  /* ── Barra flotante mínima (se oculta al hacer hover fuera) ── */
  .gd-playing-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    z-index: 20;
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background: linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  .gd-playing-root:hover .gd-playing-bar,
  .gd-playing-bar:focus-within {
    opacity: 1;
    pointer-events: auto;
  }
  .gd-bar-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 2rem; height: 2rem;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    color: #b0d4f1;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .gd-bar-btn:hover {
    background: rgba(255,255,255,0.2);
    color: #fff;
  }
  .gd-bar-title {
    flex: 1;
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.7);
    text-shadow: 0 1px 4px rgba(0,0,0,0.6);
  }

  .gd-playing-iframe {
    flex: 1;
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }
`
