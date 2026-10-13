import React, { useEffect, useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import ZumaDeluxe from './ZumaDeluxe.jsx'
import SnesEmulator, { SNES_GAMES } from './SnesEmulator.jsx'
import PurblePlace from './PurblePlace.jsx'
import BibliotecaJuegos from './BibliotecaJuegos.jsx'
import GeometryDash from './GeometryDash.jsx'

const JUEGOS = [
  {
    id: 'zuma-deluxe',
    nombre: 'Zuma Deluxe',
    tagline: 'Dispara, combina y detén la cadena antes del templo.',
    estado: 'listo',
    theme: 'zuma',
    categoria: 'pc',
    portada: '/juegos/zuma/levels/spiral.jpg',
    logo: 'https://cdn2.steamgriddb.com/logo_thumb/5e632913bf096e49880cf8b92d53c9ad.png',
    genero: 'Puzzle · Acción',
    logros: '12 de 12',
    puntos: 200,
    progreso: 100,
  },
  {
    id: 'geometry-dash',
    nombre: 'Geometry Dash',
    tagline: 'Salta, vuela y esquiva obstáculos al ritmo de la música en 22 niveles.',
    estado: 'listo',
    theme: 'geometrydash',
    categoria: 'pc',
    portada: '/juegos/covers/geometrydash.jpg',
    logo: '/juegos/covers/geometrydash-logo.png',
    genero: 'Ritmo · Plataformas',
    logros: '22 de 22',
    puntos: 250,
    progreso: 85,
  },
  {
    id: 'purble-place',
    nombre: 'Purble Place Original',
    tagline: 'Pairs, Comfy Cakes y Purble Shop al estilo Vista/7.',
    estado: 'listo',
    theme: 'purble',
    categoria: 'pc',
    portada: '/juegos/purble/hub/background.jpg',
    logo: 'https://thepurbleplace.com/wp-content/uploads/2026/08/ChatGPT-Image-Aug-3-2026-11_01_19-AM-1024x542.png',
    genero: 'Familiar · Minijuegos',
    logros: '7 de 10',
    puntos: 150,
    progreso: 70,
  },
  {
    id: SNES_GAMES.zamn.id,
    nombre: SNES_GAMES.zamn.nombre,
    tagline: SNES_GAMES.zamn.tagline,
    estado: 'listo',
    theme: 'zamn',
    categoria: 'snes',
    portada: '/juegos/covers/zamn.png',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/5/50/Zombies_Ate_My_Neighbors_Logo.png?utm_source=fr.wikipedia.org&utm_campaign=index&utm_content=original',
    genero: 'Acción · Arcade',
    logros: '5 de 8',
    puntos: 120,
    progreso: 62,
  },
  {
    id: SNES_GAMES.smw.id,
    nombre: SNES_GAMES.smw.nombre,
    tagline: SNES_GAMES.smw.tagline,
    estado: 'listo',
    theme: 'smw',
    categoria: 'snes',
    portada: '/juegos/covers/smw.png',
    logo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Super_Mario_World_game_logo.svg/3840px-Super_Mario_World_game_logo.svg.png?utm_source=ast.wikipedia.org&utm_campaign=index&utm_content=thumbnail',
    genero: 'Plataformas',
    logros: '9 de 9',
    puntos: 200,
    progreso: 100,
  },
  {
    id: SNES_GAMES.aladdin.id,
    nombre: SNES_GAMES.aladdin.nombre,
    tagline: SNES_GAMES.aladdin.tagline,
    estado: 'listo',
    theme: 'aladdin',
    categoria: 'snes',
    portada: '/juegos/covers/aladdin.png',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/6/69/Aladdin_Game_Logo.png?utm_source=fr.wikipedia.org&utm_campaign=index&utm_content=original',
    genero: 'Plataformas',
    logros: '3 de 8',
    puntos: 90,
    progreso: 38,
  },
]

/** Apps del sistema PS5 (fila inferior del home de PS5reborn). */
const PS5_APPS = [
  { id: 'explore', titulo: 'Explorar', icon: '/ps5/PS5Explore.png' },
  { id: 'store', titulo: 'Tienda', icon: '/ps5/PS5Store.png' },
  { id: 'plus', titulo: 'PS Plus', icon: '/ps5/PS5Plus.png' },
]

const MORE_GAMES = { id: 'more', titulo: 'Más juegos', icon: '/ps5/PS5MoreGames.png' }

const SNES_SHELL = {
  zamn: {
    bg: 'bg-[#07140e]',
    text: 'text-[#e8f5e9]',
    glow: 'radial-gradient(ellipse at 30% 0%, #1b4332 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, #33691e33 0%, transparent 45%)',
  },
  smw: {
    bg: 'bg-[#1a0508]',
    text: 'text-[#ffebee]',
    glow: 'radial-gradient(ellipse at 25% 0%, #b71c1c55 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, #1565c033 0%, transparent 45%)',
  },
  aladdin: {
    bg: 'bg-[#1a1205]',
    text: 'text-[#fff8e1]',
    glow: 'radial-gradient(ellipse at 30% 0%, #f9a82544 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, #e6510022 0%, transparent 45%)',
  },
}

/** Glifo del mando PlayStation (✕ ○ △ □). */
function PSGlyph({ kind = 'cross', size = 18, className = '' }) {
  const formas = {
    cross: 'M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5',
    circle: 'M18.2 12 A6.2 6.2 0 1 1 5.8 12 A6.2 6.2 0 1 1 18.2 12',
    triangle: 'M12 5.4 L19.2 18.2 H4.8 Z',
    square: 'M6.6 6.6 H17.4 V17.4 H6.6 Z',
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`ps5-glyph ps5-glyph--${kind} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={formas[kind] || formas.cross} />
    </svg>
  )
}

/** Tarjeta estilo PS5reborn: carátula 3:4 + overlay de cubierta + icono de plataforma. */
function PS5Tile({ juego, seleccionado, onSelect, onOpen, compact = false }) {
  if (compact) {
    return (
      <button
        type="button"
        className="ps5-library-card"
        onClick={() => onOpen()}
        aria-label={`${juego.nombre}. ${juego.genero || ''}`}
      >
        <div className="ps5-library-card-art">
          <img
            src={juego.portada}
            alt={juego.nombre}
            className="ps5-library-card-img"
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.opacity = '0.25'
            }}
          />
          <div className="ps5-library-card-sheen" />
        </div>
        <div className="ps5-library-card-info">
          <h3 className="ps5-library-card-name">{juego.nombre}</h3>
          <p className="ps5-library-card-desc">{juego.tagline}</p>
          <div className="ps5-library-card-meta">
            <span className="ps5-library-card-genre">{juego.genero}</span>
            {juego.estado === 'listo' && (
              <span className="ps5-library-card-ready">Listo</span>
            )}
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`ps5-tile${seleccionado ? ' is-sel' : ''}`}
      onClick={() => (seleccionado ? onOpen() : onSelect())}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      aria-label={`${juego.nombre}. ${juego.genero || ''}${seleccionado ? '. Entrar para jugar' : ''}`}
      aria-current={seleccionado ? 'true' : undefined}
    >
      <span className="ps5-tile-frame">
        <span className="ps5-tile-art">
          <img
            src={juego.portada}
            alt=""
            className="ps5-tile-img"
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.opacity = '0.25'
            }}
          />
          <span className="ps5-tile-sheen" />
        </span>
        <img src="/ps5/PS5CoverOverlay.png" alt="" className="ps5-tile-overlay" draggable={false} />
      </span>
    </button>
  )
}

/** Azulejo de app del sistema PS5: mismo estilo que las carátulas del tema, con icono. */
function PS5AppTile({ app, onClick }) {
  return (
    <button type="button" className="ps5-app" aria-label={app.titulo} title={app.titulo} onClick={onClick}>
      <span className="ps5-app-frame">
        <span className="ps5-app-art">
          <img src={app.icon} alt="" className="ps5-app-ico" draggable={false} />
        </span>
        <span className="ps5-app-flash" aria-hidden="true" />
      </span>
    </button>
  )
}

export default function JuegosPage() {
  const [activo, setActivo] = useState(null)
  const [sel, setSel] = useState(0)
  const [hora, setHora] = useState(() => new Date())
  const [bibliotecaAbierta, setBibliotecaAbierta] = useState(false)
  const snesGame = SNES_GAMES[activo]
  const juegoSel = JUEGOS[sel] || JUEGOS[0]
  const abrir = (juego) => juego && juego.estado === 'listo' && setActivo(juego.id)

  useEffect(() => {
    const t = setInterval(() => setHora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Navegación estilo PS5: ←/→ recorren los juegos, ✕ (Enter) abre.
  useEffect(() => {
    if (activo) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        setSel((s) => Math.min(JUEGOS.length - 1, s + 1))
      } else if (e.key === 'ArrowLeft') {
        setSel((s) => Math.max(0, s - 1))
      } else if (e.key === 'Enter') {
        const j = JUEGOS[sel]
        if (j && j.estado === 'listo') setActivo(j.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activo, sel])

  // Mantiene el juego enfocado visible, como el carrusel de PS5.
  useEffect(() => {
    if (activo) return
    const el = document.querySelector('.ps5-tile.is-sel')
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [sel, activo])

  if (activo === 'zuma-deluxe') {
    return (
      <div className="h-dvh max-h-dvh overflow-hidden bg-[#071a12] text-[#f0e6c8] flex flex-col">
        <div
          className="pointer-events-none fixed inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at 20% 10%, #1b4332 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, #d4af3722 0%, transparent 45%)',
          }}
        />
        <div className="relative z-10 flex-1 w-full min-h-0 px-0 sm:px-2 lg:px-3 py-1 sm:py-2 flex flex-col">
          <ZumaDeluxe onSalir={() => setActivo(null)} />
        </div>
      </div>
    )
  }

  if (activo === 'geometry-dash') {
    return (
      <div className="h-dvh max-h-dvh overflow-hidden bg-[#070b14] text-[#e0f2fe] flex flex-col">
        <GeometryDash onSalir={() => setActivo(null)} />
      </div>
    )
  }

  if (activo === 'purble-place') {
    return (
      <div className="h-dvh max-h-dvh overflow-hidden bg-[#f3e8ff] text-[#5b2c6f] flex flex-col">
        <div
          className="pointer-events-none fixed inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(ellipse at 15% 0%, #e8c4f8 0%, transparent 45%), radial-gradient(ellipse at 90% 100%, #a8d8ea88 0%, transparent 50%), linear-gradient(180deg, #fff5fb 0%, #eef2ff 100%)',
          }}
        />
        <div className="relative z-10 flex-1 w-full min-h-0 px-1 sm:px-2 lg:px-3 py-1 sm:py-1.5 flex flex-col">
          <PurblePlace onSalir={() => setActivo(null)} />
        </div>
      </div>
    )
  }

  if (snesGame) {
    const shell = SNES_SHELL[snesGame.id] || SNES_SHELL.zamn
    return (
      <div className={`h-dvh max-h-dvh overflow-hidden ${shell.bg} ${shell.text} flex flex-col`}>
        <div className="pointer-events-none fixed inset-0 opacity-50" style={{ background: shell.glow }} />
        <div className="relative z-10 flex-1 w-full min-h-0 px-0 sm:px-2 lg:px-4 py-1 sm:py-2 flex flex-col">
          <SnesEmulator
            onSalir={() => setActivo(null)}
            romFolder={snesGame.romFolder}
            romFile={snesGame.romFile}
            title={snesGame.title}
            regionLabel={snesGame.regionLabel}
            gameId={snesGame.gameId}
            accent={snesGame.accent}
          />
        </div>
      </div>
    )
  }

  if (bibliotecaAbierta) {
    return (
      <BibliotecaJuegos
        juegos={JUEGOS}
        hora={hora}
        onVolver={() => setBibliotecaAbierta(false)}
        onAbrirJuego={(juego) => {
          setBibliotecaAbierta(false)
          const idx = JUEGOS.findIndex((j) => j.id === juego.id)
          if (idx !== -1) setSel(idx)
          abrir(juego)
        }}
      />
    )
  }

const score = ((juegoSel.puntos || 0) * 10) / 200
  const pct = Math.min(100, Math.max(0, score * 10))
  const chips = []
  if (juegoSel.categoria) chips.push(juegoSel.categoria.toUpperCase())
  ;(juegoSel.genero || '').split(' · ').forEach((g) => {
    const t = (g || '').trim()
    if (t && chips.length < 3) chips.push(t)
  })

  return (
    <div className="ps5-root">
      {/* Fondo del tema: PS5Games.png (pantalla de inicio de PS5reborn) */}
      <div className="ps5-bg" aria-hidden="true">
        <img src="/ps5/PS5Games.png" alt="" className="ps5-bg-img" draggable={false} />
        <div className="ps5-bg-shade" />
        <img src="/ps5/PS5Overlay.png" alt="" className="ps5-bg-overlay" draggable={false} />
        <div className="ps5-bg-glow" />
      </div>

      <div className="ps5-shell">
        {/* Barra superior: logo + reloj (Segoe UI Light) + buscador + perfil */}
        <header className="ps5-top">
          <div className="ps5-wrap ps5-top-inner">
            <div className="ps5-brand">
              <img src="/ps5/PS5Logo.png" alt="PlayStation 5" className="ps5-logo" draggable={false} />
            </div>

            <div className="ps5-top-right">
              <span className="ps5-clock">
                {hora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="ps5-date">
                {hora.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <button
                type="button"
                className="ps5-icon-btn"
                aria-label="Buscar juegos"
                title="Buscar en la biblioteca de juegos"
                onClick={() => setBibliotecaAbierta(true)}
              >
                <Search size={16} />
              </button>
              <div className="ps5-profile">
                <img src="/ps5/Avatar.png" alt="" className="ps5-avatar" draggable={false} />
                <span className="ps5-pname">AdrianVc</span>
              </div>
              <a href="/" className="ps5-exit">
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Salir</span>
              </a>
            </div>
          </div>
        </header>

        <main className="ps5-wrap ps5-main">
          {/* Fila superior: apps del sistema PS5 + carátulas de los juegos (home de PS5reborn) */}
          <section className="ps5-strip" role="listbox" aria-label="Aplicaciones y juegos">
            {PS5_APPS.map((app) => (
              <PS5AppTile key={app.id} app={app} />
            ))}
            {JUEGOS.map((juego, idx) => (
              <PS5Tile
                key={juego.id}
                juego={juego}
                seleccionado={idx === sel}
                onSelect={() => setSel(idx)}
                onOpen={() => abrir(juego)}
              />
            ))}
            <PS5AppTile key={MORE_GAMES.id} app={MORE_GAMES} onClick={() => setBibliotecaAbierta(true)} />
          </section>

          {/* Juego seleccionado: izquierda = info; derecha = ficha de datos */}
          <section className="ps5-hero" aria-live="polite">
            <div className="ps5-hero-main">
              <div className="ps5-hero-tags">
                {chips.map((c, i) => (
                  <span key={i} className="ps5-chip">{c}</span>
                ))}
              </div>

              {juegoSel.logo ? (
                <img
                  src={juegoSel.logo}
                  alt={juegoSel.nombre}
                  className="ps5-hero-logo"
                  draggable={false}
                />
              ) : (
                <h1 className="ps5-hero-title">{juegoSel.nombre}</h1>
              )}
              <p className="ps5-hero-desc">{juegoSel.tagline}</p>

              <div className="ps5-rating">
                <span className="ps5-scale">{score.toFixed(1)}</span>
                <span className="ps5-stars" aria-hidden="true">
                  <span className="ps5-stars-on" style={{ width: `${pct}%` }}>★★★★★</span>
                  ★★★★★
                </span>
                <span className="ps5-rating-meta">Nota de la comunidad</span>
              </div>

              <div className="ps5-hero-buttons">
                <button
                  type="button"
                  className="ps5-play"
                  onClick={() => abrir(juegoSel)}
                  disabled={juegoSel.estado !== 'listo'}
                >
                  <span>{juegoSel.estado === 'listo' ? 'Jugar' : 'No disponible'}</span>
                  {juegoSel.estado === 'listo' && <b> {juegoSel.nombre}</b>}
                </button>
                {juegoSel.estado === 'listo' && (
                  <button type="button" className="ps5-opt" aria-label="Más opciones" onClick={() => abrir(juegoSel)}>
                    …
                  </button>
                )}
              </div>
            </div>

            <aside className="ps5-hero-side">
              <div className="ps5-facts">
                <div className="ps5-fact">
                  <span>Logros</span>
                  <b>
                    <img src="/ps5/PS5Trophy.png" alt="" draggable={false} className="ps5-fact-ico" />
                    {juegoSel.logros}
                  </b>
                </div>
                <div className="ps5-fact">
                  <span>Género</span>
                  <b>{juegoSel.genero}</b>
                </div>
                <div className="ps5-fact">
                  <span>Puntos</span>
                  <b>{juegoSel.puntos} pts</b>
                </div>
                <div className="ps5-fact">
                  <span>Progreso</span>
                  <b>{juegoSel.progreso}%</b>
                  <span className="ps5-progress" aria-hidden="true">
                    <span style={{ width: `${juegoSel.progreso}%` }} />
                  </span>
                </div>
              </div>
            </aside>
          </section>
        </main>

        {/* Barra inferior: pistas de control (degradado #091F51 → #0B1027 del tema) */}
        <footer className="ps5-bottom">
          <div className="ps5-wrap ps5-bottom-inner">
            <div className="ps5-hints">
              <span className="ps5-hint">
                <PSGlyph kind="cross" size={17} /> Iniciar
              </span>
              <span className="ps5-hint">
                <PSGlyph kind="circle" size={17} /> Atrás
              </span>
              <span className="ps5-hint hidden sm:inline-flex">
                <PSGlyph kind="triangle" size={17} /> Detalles
              </span>
              <span className="ps5-hint hidden md:inline-flex">
                <span className="ps5-options">OPTIONS</span> Más
              </span>
            </div>
            <img src="/ps5/PS5Logo.png" alt="" className="ps5-psbtn" draggable={false} />
          </div>
        </footer>
      </div>

      <style>{`
        @property --ps5-ang { syntax: "<angle>"; inherits: false; initial-value: 0deg; }

        .ps5-root {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
          font-family: "Segoe UI", "Segoe UI Variable", Tahoma, "Trebuchet MS", sans-serif;
          color: #ebebeb;
          background: #04060f;
        }

        /* Fondo del tema (PS5Games.png, pantalla de inicio) */
        .ps5-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .ps5-bg-img { width: 100%; height: 100%; object-fit: cover; }
        .ps5-bg-shade {
          position: absolute; inset: 0;
          background:
            linear-gradient(180deg, rgba(3, 6, 16, 0.55) 0%, rgba(3, 6, 16, 0.12) 30%, rgba(3, 6, 16, 0.2) 62%, rgba(3, 6, 16, 0.62) 100%);
        }
        /* Vestidura del tema: PS5Overlay.png (degradado negro, más oscuro abajo-izquierda) */
        .ps5-bg-overlay {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .ps5-bg-glow {
          position: absolute; inset: 0;
          background: radial-gradient(110% 80% at 50% 110%, rgba(9, 31, 81, 0.42) 0%, transparent 62%);
          mix-blend-mode: screen;
        }

        .ps5-shell {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .ps5-wrap {
          width: 100%;
          max-width: none;
          margin-inline: auto;
          padding-inline: 1.25rem;
        }
        @media (min-width: 640px) { .ps5-wrap { padding-inline: 2.5rem; } }
        @media (min-width: 1280px) { .ps5-wrap { padding-inline: 3.5rem; } }

        /* Barra superior estilo PS5 */
        .ps5-top { background: linear-gradient(180deg, rgba(9, 31, 81, 0.55) 0%, rgba(9, 31, 81, 0) 100%); }
        .ps5-top-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-top: 0.9rem;
          padding-bottom: 0.7rem;
        }

        .ps5-brand { display: inline-flex; align-items: center; gap: 0.75rem; }
        .ps5-logo {
          height: 2.6rem;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.6));
        }
        .ps5-top-right { display: inline-flex; align-items: center; gap: 0.85rem; }        .ps5-clock {
          font-family: "Segoe UI Light", "Segoe UI", sans-serif;
          font-size: clamp(1.05rem, 2.1vw, 1.6rem);
          font-weight: 300;
          color: #fff;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
        }
        .ps5-date {
          font-family: "Segoe UI Light", "Segoe UI", sans-serif;
          font-size: 0.7rem;
          color: rgba(215, 224, 245, 0.7);
          letter-spacing: 0.06em;
          text-transform: capitalize;
        }

        .ps5-icon-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.7rem;
          height: 2.7rem;
          border-radius: 999px;
          background: rgba(20, 24, 30, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #fff;
          cursor: pointer;
          backdrop-filter: blur(6px);
          transition: background 0.18s ease, color 0.18s ease;
        }
        .ps5-icon-btn:hover, .ps5-icon-btn:focus-visible {
          background: #eeeeee;
          color: #2e2e2e;
          border-color: transparent;
          outline: none;
        }

        .ps5-profile {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.28rem 0.95rem 0.28rem 0.3rem;
          border-radius: 999px;
          background: rgba(20, 24, 30, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(6px);
        }
        .ps5-avatar {
          width: 1.95rem;
          height: 1.95rem;
          border-radius: 999px;
          object-fit: cover;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.25);
        }
        .ps5-pname { font-size: 0.78rem; font-weight: 600; color: #eef3ff; }

        .ps5-exit {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.95rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #eef3ff;
          background: rgba(20, 24, 30, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(6px);
          text-decoration: none;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .ps5-exit:hover { background: #eeeeee; color: #2e2e2e; }

        /* Anillo giratorio de botones: degradado #252e33 → #737b91 (PS5Border del tema) */
        .ps5-icon-btn::before, .ps5-exit::before, .ps5-play::before, .ps5-opt::before {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          padding: 3px;
          background: conic-gradient(from var(--ps5-ang, 0deg),
            #737b91 0deg 24deg, #252e33 24deg 130deg, #737b91 130deg 154deg,
            #252e33 154deg 260deg, #737b91 260deg 284deg, #252e33 284deg 360deg);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
          opacity: 0;
          pointer-events: none;
        }
        .ps5-icon-btn:hover::before, .ps5-icon-btn:focus-visible::before,
        .ps5-exit:hover::before,
        .ps5-play:hover::before, .ps5-play:focus-visible::before,
        .ps5-opt:hover::before, .ps5-opt:focus-visible::before {
          opacity: 1;
          animation: ps5ring 5s linear infinite;
        }
        @keyframes ps5ring { to { --ps5-ang: 360deg; } }

        /* Main */
        .ps5-main { flex: 1; padding-top: 1.2rem; padding-bottom: 2rem; }

        /* Fila superior: apps del sistema PS5 + carátulas de los juegos (home de PS5reborn) */
        .ps5-strip {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          overflow-x: auto;
          padding: 2.6rem 0.2rem 1.5rem;
          scroll-snap-type: x proximity;
          scrollbar-width: none;
        }
        .ps5-strip::-webkit-scrollbar { display: none; }
        .ps5-strip .ps5-tile { width: clamp(6.6rem, 8.5vw, 8.9rem); }

        /* Azulejo de app del sistema PS5: mismo aspecto que las carátulas del tema, con icono */
        .ps5-app {
          position: relative;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          padding: 0;
          background: transparent;
          border: 0;
          cursor: pointer;
          border-radius: 1.25rem;
          scroll-snap-align: center;
          opacity: 0.78;
          transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.22, 0.8, 0.24, 1);
        }
        .ps5-app:hover { opacity: 1; transform: translateY(-7px); }
        .ps5-app-frame {
          position: relative;
          display: block;
          width: clamp(6.6rem, 8.5vw, 8.9rem);
          aspect-ratio: 1;
          border-radius: 1.25rem;
          padding: 3px;
          overflow: hidden;
          background: #10151d;
          box-shadow: 0 0 0 1px rgba(115, 123, 145, 0.3), 0 12px 30px rgba(0, 0, 0, 0.5);
          transition: box-shadow 0.3s ease;
        }
        .ps5-app:hover .ps5-app-frame,
        .ps5-app:focus-visible .ps5-app-frame {
          box-shadow: 0 0 0 1px rgba(115, 123, 145, 0.6), 0 20px 45px rgba(0, 0, 0, 0.6);
        }

        /* Anillo giratorio del tema detrás del azulejo: degradado gris #252e33 → #737b91 */
        .ps5-app-frame::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 320%;
          height: 320%;
          transform: translate(-50%, -50%);
          background: conic-gradient(from 0deg, #252e33, #737b91 12%, #252e33 33%, #737b91 45%, #252e33 66%, #737b91 78%, #252e33 100%);
          opacity: 0;
        }
        .ps5-app:hover .ps5-app-frame::before,
        .ps5-app:focus-visible .ps5-app-frame::before {
          opacity: 1;
          animation: ps5spin 4s linear infinite;
        }

        .ps5-app-art {
          position: absolute;
          inset: 3px;
          z-index: 1;
          display: grid;
          place-items: center;
          border-radius: 1.05rem;
          background: linear-gradient(to top right, rgba(34, 34, 34, 0.92), rgba(17, 17, 17, 0.92));
        }
        .ps5-app-ico {
          width: 52%;
          height: 52%;
          object-fit: contain;
          pointer-events: none;
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
        }

        /* Destello de cubierta del tema (PS5Cover): barrido diagonal blanco */
        .ps5-app-flash {
          position: absolute;
          inset: 3px;
          z-index: 3;
          border-radius: 1.05rem;
          overflow: hidden;
          pointer-events: none;
          opacity: 0;
        }
        .ps5-app-flash::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 32%, rgba(255, 255, 255, 0.42) 50%, transparent 68%);
          transform: translateX(-140%);
        }
        .ps5-app:hover .ps5-app-flash,
        .ps5-app:focus-visible .ps5-app-flash { opacity: 1; }
        .ps5-app:hover .ps5-app-flash::after,
        .ps5-app:focus-visible .ps5-app-flash::after { animation: ps5flash 5.2s ease-in-out 0.6s infinite; }

        /* Hero: izquierda (info del juego) + derecha (ficha de datos) */
        .ps5-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 2.4rem 3.4rem;
          align-items: end;
          margin-top: 10rem;
        }
        @media (max-width: 1024px) {
          .ps5-hero { grid-template-columns: 1fr; align-items: start; }
        }
        .ps5-hero-main {
          display: flex;
          flex-direction: column;
          gap: 1.05rem;
          max-width: 52rem;
        }

        /* Ficha de datos del juego seleccionado (estilo tarjeta oscura del tema) */
        .ps5-hero-side { display: flex; justify-content: flex-end; }
        .ps5-facts {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          width: 100%;
          max-width: 30rem;
        }
        .ps5-fact {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 0.9rem 1.05rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.9rem;
          background: rgba(20, 24, 30, 0.55);
          backdrop-filter: blur(6px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        .ps5-fact > span:first-child {
          font-size: 0.66rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(200, 212, 238, 0.55);
        }
        .ps5-fact > b { font-size: 1.05rem; font-weight: 600; color: #fff; letter-spacing: 0.01em; }
        .ps5-fact-ico { height: 1.1rem; width: auto; vertical-align: -0.15em; margin-right: 0.35rem; }
        .ps5-fact .ps5-progress { margin-top: 0.15rem; width: 100%; }

        .ps5-hero-tags { display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; }
        .ps5-chip {
          height: 2rem;
          display: inline-flex;
          align-items: center;
          padding: 0 0.9rem;
          border: 2px solid rgba(255, 255, 255, 0.92);
          border-radius: 4px;
          font-family: "Segoe UI Light", "Segoe UI", sans-serif;
          font-size: 0.92rem;
          letter-spacing: 0.03em;
          color: #fff;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
        }

        .ps5-hero-title {
          margin: 0;
          font-family: "Segoe UI Light", "Segoe UI", sans-serif;
          font-weight: 300;
          font-size: clamp(2.3rem, 4.6vw, 3.6rem);
          line-height: 1.03;
          letter-spacing: 0.01em;
          color: #fff;
          text-shadow: 0 12px 40px rgba(0, 0, 0, 0.65);
        }

        /* Logo del juego (imagen), como en el tema (máx 500×200); si no hay, se usa el nombre */
        .ps5-hero-logo {
          align-self: flex-start;
          max-width: min(500px, 78%);
          max-height: 200px;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 12px 40px rgba(0, 0, 0, 0.7));
        }

        .ps5-hero-desc {
          margin: 0;
          font-family: "Segoe UI Light", "Segoe UI", sans-serif;
          font-weight: 300;
          font-size: clamp(1.02rem, 1.55vw, 1.38rem);
          line-height: 1.45;
          color: rgba(238, 243, 255, 0.92);
          max-width: 42rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ps5-rating {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          align-self: flex-start;
          background: #14181e;
          border-radius: 6px;
          padding: 0.65rem 1.05rem;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 10px 28px rgba(0, 0, 0, 0.4);
        }
        .ps5-scale { font-size: 1.2rem; font-weight: 600; color: #fff; line-height: 1; }
        .ps5-stars {
          position: relative;
          font-size: 1.02rem;
          line-height: 1;
          color: rgba(255, 255, 255, 0.28);
          letter-spacing: 0.12em;
          white-space: nowrap;
        }
        .ps5-stars-on {
          position: absolute;
          inset: 0;
          overflow: hidden;
          white-space: nowrap;
          color: #fff;
          letter-spacing: 0.12em;
        }
        .ps5-rating-meta {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: rgba(200, 212, 238, 0.65);
        }

        .ps5-hero-buttons { display: flex; align-items: center; gap: 1.1rem; margin-top: 0.2rem; }

        .ps5-play {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          min-width: clamp(10rem, 24vw, 375px);
          height: clamp(3.4rem, 7vh, 4.5rem);
          padding: 0 2.3rem;
          border-radius: 999px;
          border: 0;
          font-family: "Segoe UI Semibold", "Segoe UI", sans-serif;
          font-size: clamp(1.05rem, 1.7vw, 1.4rem);
          font-weight: 600;
          color: #fff;
          background: rgba(128, 128, 128, 0.25);
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
        }
        .ps5-play:hover, .ps5-play:focus-visible {
          background: #eeeeee;
          color: #2e2e2e;
          transform: translateY(-2px);
          outline: none;
        }
        .ps5-play:disabled { opacity: 0.45; cursor: default; transform: none; }
        .ps5-play b { font-weight: 700; }

        .ps5-opt {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: clamp(3.4rem, 7vh, 4.5rem);
          aspect-ratio: 1;
          border-radius: 999px;
          border: 0;
          font-family: "Segoe UI Semibold", "Segoe UI", sans-serif;
          font-size: 1.7rem;
          font-weight: 600;
          line-height: 1;
          color: #fff;
          background: rgba(128, 128, 128, 0.25);
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .ps5-opt:hover, .ps5-opt:focus-visible { background: #eeeeee; color: #2e2e2e; outline: none; }

        .ps5-hero-stats {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.7rem;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: rgba(215, 224, 245, 0.82);
        }
        .ps5-hero-stats img { height: 1.2rem; width: auto; }
        .ps5-hero-dot { color: rgba(235, 235, 235, 0.35); }
        .ps5-progress {
          width: 5.4rem;
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.18);
          overflow: hidden;
        }
        .ps5-progress > span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #7db8ff, #4c9aff);
        }
        .ps5-hero-progress { display: inline-block; }

        /* Carátula del tema: cuadrada (168×168), esquinas redondeadas (radio ~25), overlay + icono plataforma, borde giratorio #252e33→#737b91 */
        .ps5-tile {
          flex: 0 0 auto;
          width: clamp(8.2rem, 11vw, 10.6rem);
          padding: 0;
          background: transparent;
          border: 0;
          cursor: pointer;
          border-radius: 1.25rem;
          scroll-snap-align: center;
          opacity: 0.78;
          transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.22, 0.8, 0.24, 1);
        }
        .ps5-tile:hover { opacity: 1; }
        .ps5-tile.is-sel { opacity: 1; transform: translateY(-7px); z-index: 2; }

        .ps5-tile-frame {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 1.25rem;
          padding: 3px;
          overflow: hidden;
          background: #10151d;
          box-shadow: 0 0 0 1px rgba(115, 123, 145, 0.3), 0 12px 30px rgba(0, 0, 0, 0.5);
          transition: box-shadow 0.3s ease;
        }
        .ps5-tile.is-sel .ps5-tile-frame {
          box-shadow: 0 0 0 1px rgba(115, 123, 145, 0.6), 0 20px 45px rgba(0, 0, 0, 0.6);
        }

        /* Anillo giratorio detrás de la carátula: degradado lineal gris del tema */
        .ps5-tile-frame::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 320%;
          height: 320%;
          transform: translate(-50%, -50%);
          background: conic-gradient(from 0deg, #252e33, #737b91 12%, #252e33 33%, #737b91 45%, #252e33 66%, #737b91 78%, #252e33 100%);
          opacity: 0;
        }
        .ps5-tile.is-sel .ps5-tile-frame::before {
          opacity: 1;
          animation: ps5spin 4s linear infinite;
        }
        @keyframes ps5spin { to { transform: translate(-50%, -50%) rotate(360deg); } }

        .ps5-tile-art {
          position: absolute;
          inset: 3px;
          z-index: 1;
          display: block;
          border-radius: 1.05rem;
          overflow: hidden;
          background: #14181e;
        }
        .ps5-tile-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .ps5-tile.is-sel .ps5-tile-img { transform: scale(1.05); }
        .ps5-tile-sheen {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 34%, rgba(0, 0, 0, 0.24) 100%);
        }

        /* Destello de carátula: barrido blanco diagonal (PS5Cover del tema) */
        .ps5-tile-art::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(115deg, transparent 32%, rgba(255, 255, 255, 0.42) 50%, transparent 68%);
          transform: translateX(-140%);
        }
        .ps5-tile.is-sel .ps5-tile-art::after { animation: ps5flash 5.2s ease-in-out 0.6s infinite; }
        @keyframes ps5flash {
          0% { transform: translateX(-140%); }
          6% { transform: translateX(140%); }
          100% { transform: translateX(140%); }
        }

        .ps5-tile-overlay {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: auto;
          z-index: 2;
          pointer-events: none;
          opacity: 0.95;
        }

        /* Barra inferior: degradado #091F51 → #0B1027 del tema */
        .ps5-bottom {
          position: relative;
          background: linear-gradient(90deg, #091F51 0%, rgba(11, 16, 39, 0.85) 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .ps5-bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-top: 0.8rem;
          padding-bottom: 0.8rem;
        }
        .ps5-hints { display: flex; align-items: center; flex-wrap: wrap; gap: 1.35rem; }
        .ps5-hint {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #d9ecff;
        }
        .ps5-options {
          display: inline-flex;
          align-items: center;
          padding: 0.08rem 0.4rem;
          border: 1px solid currentColor;
          border-radius: 3px;
          font-size: 0.5rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #d9ecff;
        }
        .ps5-psbtn { height: 2.1rem; width: auto; opacity: 0.95; }

        @media (max-width: 640px) { .ps5-psbtn { display: none; } }

        /* Biblioteca de juegos - grilla tipo carrusel */
        .ps5-library-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          padding: 2rem 0;
        }

        @media (min-width: 640px) {
          .ps5-library-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            padding: 2.5rem 0;
          }
        }

        @media (min-width: 1024px) {
          .ps5-library-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2.5rem;
            padding: 3rem 0;
          }
        }

        @media (min-width: 1280px) {
          .ps5-library-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 3rem;
          }
        }

        @media (min-width: 1536px) {
          .ps5-library-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 3.5rem;
          }
        }

        /* Tarjeta de biblioteca minimalista estilo PS Store */
        .ps5-library-card {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          background: transparent;
          border: none;
          border-radius: 0.75rem;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s ease;
        }

        .ps5-library-card:hover {
          transform: translateY(-4px);
        }

        .ps5-library-card-art {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: #14181e;
          border-radius: 0.75rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .ps5-library-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .ps5-library-card:hover .ps5-library-card-img {
          transform: scale(1.05);
        }

        .ps5-library-card-sheen {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 40%, rgba(0, 0, 0, 0.3) 100%);
        }

        .ps5-library-card-info {
          padding: 0.85rem 0.25rem 0;
          text-align: left;
        }

        .ps5-library-card-name {
          margin: 0 0 0.35rem 0;
          font-family: "Segoe UI Semibold", "Segoe UI", sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ps5-library-card-desc {
          margin: 0 0 0.5rem 0;
          font-size: 0.78rem;
          font-weight: 400;
          color: rgba(200, 212, 238, 0.65);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ps5-library-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .ps5-library-card-genre {
          font-size: 0.72rem;
          font-weight: 500;
          color: rgba(200, 212, 238, 0.55);
        }

        .ps5-library-card-ready {
          font-size: 0.7rem;
          font-weight: 700;
          color: #4ade80;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 640px) {
          .ps5-library-card-name {
            font-size: 0.85rem;
          }
          .ps5-library-card-desc {
            font-size: 0.72rem;
          }
        }
      `}</style>
    </div>
  )
}
