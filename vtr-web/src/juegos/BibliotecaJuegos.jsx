import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Search,
  Star,
  Play,
  Filter,
  Gamepad2,
  Trophy,
  X,
  SlidersHorizontal,
  HardDrive,
  Sparkles,
  Layers,
  ChevronRight,
  Monitor,
  Flame,
} from 'lucide-react'

/** Glifo del mando PlayStation (✕ ○ △ □) */
function PSGlyph({ kind = 'cross', size = 16, className = '' }) {
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
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={formas[kind] || formas.cross} />
    </svg>
  )
}

export default function BibliotecaJuegos({ juegos, hora, onVolver, onAbrirJuego }) {
  const [tab, setTab] = useState('todos') // 'todos', 'instalados', 'snes', 'pc', 'favoritos'
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('recomendado') // 'recomendado', 'az', 'puntos', 'progreso'
  const [hoveredJuego, setHoveredJuego] = useState(juegos[0] || null)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [favoritos, setFavoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vtr-juegos-favs') || '[]')
    } catch {
      return []
    }
  })
  const searchInputRef = useRef(null)

  const toggleFavorito = (id, e) => {
    e?.stopPropagation()
    setFavoritos((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem('vtr-juegos-favs', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  // Filtrado de juegos
  const juegosFiltrados = useMemo(() => {
    let list = [...juegos]

    // Pestaña
    if (tab === 'instalados') {
      list = list.filter((j) => j.estado === 'listo')
    } else if (tab === 'snes') {
      list = list.filter((j) => j.categoria === 'snes')
    } else if (tab === 'pc') {
      list = list.filter((j) => j.categoria === 'pc')
    } else if (tab === 'favoritos') {
      list = list.filter((j) => favoritos.includes(j.id))
    }

    // Búsqueda por texto
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim()
      list = list.filter(
        (j) =>
          j.nombre.toLowerCase().includes(q) ||
          (j.tagline && j.tagline.toLowerCase().includes(q)) ||
          (j.genero && j.genero.toLowerCase().includes(q)) ||
          (j.categoria && j.categoria.toLowerCase().includes(q)),
      )
    }

    // Ordenamiento
    if (orden === 'az') {
      list.sort((a, b) => a.nombre.localeCompare(b.nombre))
    } else if (orden === 'puntos') {
      list.sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
    } else if (orden === 'progreso') {
      list.sort((a, b) => (b.progreso || 0) - (a.progreso || 0))
    }

    return list
  }, [juegos, tab, busqueda, orden, favoritos])

  // Navegación con teclado dentro de la biblioteca
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement === searchInputRef.current && e.key !== 'Escape') {
        return
      }

      if (e.key === 'Escape') {
        if (busqueda) {
          setBusqueda('')
        } else {
          onVolver()
        }
      } else if (e.key === 'ArrowRight') {
        setSelectedIdx((idx) => {
          const next = Math.min(juegosFiltrados.length - 1, idx + 1)
          if (juegosFiltrados[next]) setHoveredJuego(juegosFiltrados[next])
          return next
        })
      } else if (e.key === 'ArrowLeft') {
        setSelectedIdx((idx) => {
          const prev = Math.max(0, idx - 1)
          if (juegosFiltrados[prev]) setHoveredJuego(juegosFiltrados[prev])
          return prev
        })
      } else if (e.key === 'Enter') {
        const j = juegosFiltrados[selectedIdx]
        if (j) onAbrirJuego(j)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [juegosFiltrados, selectedIdx, busqueda, onVolver, onAbrirJuego])

  const spotlight = hoveredJuego || juegosFiltrados[0] || juegos[0]

  return (
    <div className="ps5-lib-root">
      {/* Fondo PlayStation con arte dinámico ambiental */}
      <div className="ps5-lib-bg-layer" aria-hidden="true">
        <img src="/ps5/PS5Games.png" alt="" className="ps5-lib-bg-img" draggable={false} />
        <div className="ps5-lib-bg-overlay-shade" />
        <img src="/ps5/PS5Overlay.png" alt="" className="ps5-lib-bg-overlay-grad" draggable={false} />
        {/* Halo dinámico de color según el juego seleccionado */}
        <div
          className="ps5-lib-ambient-glow"
          style={{
            background:
              spotlight?.theme === 'zamn'
                ? 'radial-gradient(ellipse at 75% 25%, rgba(67, 160, 71, 0.28) 0%, transparent 60%)'
                : spotlight?.theme === 'smw'
                ? 'radial-gradient(ellipse at 75% 25%, rgba(229, 57, 53, 0.26) 0%, transparent 60%)'
                : spotlight?.theme === 'aladdin'
                ? 'radial-gradient(ellipse at 75% 25%, rgba(249, 168, 37, 0.24) 0%, transparent 60%)'
                : spotlight?.theme === 'purble'
                ? 'radial-gradient(ellipse at 75% 25%, rgba(168, 85, 247, 0.28) 0%, transparent 60%)'
                : spotlight?.theme === 'geometrydash'
                ? 'radial-gradient(ellipse at 75% 25%, rgba(6, 182, 212, 0.35) 0%, transparent 60%)'
                : 'radial-gradient(ellipse at 75% 25%, rgba(16, 185, 129, 0.26) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="ps5-lib-container">
        {/* BARRA SUPERIOR PLAYSTATION 5 */}
        <header className="ps5-lib-header">
          <div className="ps5-lib-brand-box">
            <img src="/ps5/PS5Logo.png" alt="PlayStation 5" className="ps5-lib-logo" draggable={false} />
            <div className="ps5-lib-online-pill">
              <span className="ps5-lib-online-dot" />
              <span>PSN ONLINE</span>
            </div>
          </div>

          {/* Navegación por pestañas superiores estilo PS5 */}
          <nav className="ps5-lib-nav-tabs" aria-label="Filtro de biblioteca">
            <button
              type="button"
              className={`ps5-lib-tab-btn ${tab === 'todos' ? 'is-active' : ''}`}
              onClick={() => {
                setTab('todos')
                setSelectedIdx(0)
              }}
            >
              <Layers size={14} />
              <span>Tu colección</span>
              <span className="ps5-lib-badge-count">{juegos.length}</span>
            </button>

            <button
              type="button"
              className={`ps5-lib-tab-btn ${tab === 'instalados' ? 'is-active' : ''}`}
              onClick={() => {
                setTab('instalados')
                setSelectedIdx(0)
              }}
            >
              <Flame size={14} />
              <span>Instalados</span>
              <span className="ps5-lib-badge-count">{juegos.filter((j) => j.estado === 'listo').length}</span>
            </button>

            <button
              type="button"
              className={`ps5-lib-tab-btn ${tab === 'snes' ? 'is-active' : ''}`}
              onClick={() => {
                setTab('snes')
                setSelectedIdx(0)
              }}
            >
              <Gamepad2 size={14} />
              <span>Super Nintendo</span>
              <span className="ps5-lib-badge-count">{juegos.filter((j) => j.categoria === 'snes').length}</span>
            </button>

            <button
              type="button"
              className={`ps5-lib-tab-btn ${tab === 'pc' ? 'is-active' : ''}`}
              onClick={() => {
                setTab('pc')
                setSelectedIdx(0)
              }}
            >
              <Monitor size={14} />
              <span>PC / Clásicos</span>
              <span className="ps5-lib-badge-count">{juegos.filter((j) => j.categoria === 'pc').length}</span>
            </button>

            <button
              type="button"
              className={`ps5-lib-tab-btn ${tab === 'favoritos' ? 'is-active' : ''}`}
              onClick={() => {
                setTab('favoritos')
                setSelectedIdx(0)
              }}
            >
              <Star size={14} />
              <span>Favoritos</span>
              {favoritos.length > 0 && <span className="ps5-lib-badge-count">{favoritos.length}</span>}
            </button>
          </nav>

          {/* Área derecha: Reloj, Perfil y botón volver */}
          <div className="ps5-lib-top-right">
            <div className="ps5-lib-clock-box">
              <span className="ps5-lib-clock">
                {hora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="ps5-lib-date">
                {hora.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="ps5-lib-profile-pill">
              <img src="/ps5/Avatar.png" alt="Avatar" className="ps5-lib-avatar" draggable={false} />
              <div className="ps5-lib-user-meta">
                <span className="ps5-lib-username">AdrianVc</span>
                <span className="ps5-lib-level">
                  <Trophy size={11} className="text-yellow-400" /> Nivel 34
                </span>
              </div>
            </div>

            <button
              type="button"
              className="ps5-lib-back-btn"
              onClick={onVolver}
              title="Volver al menú de juegos (Esc)"
            >
              <PSGlyph kind="circle" size={15} />
              <span>Atrás</span>
            </button>
          </div>
        </header>

        {/* HERO SPOTLIGHT & CONTROL DECK */}
        <section className="ps5-lib-hero-deck">
          {/* Spotlight banner interactivo del juego activo */}
          {spotlight && (
            <div className="ps5-lib-spotlight-card">
              <div className="ps5-lib-spotlight-backdrop">
                <img
                  src={spotlight.portada}
                  alt={spotlight.nombre}
                  className="ps5-lib-spotlight-bg-img"
                  draggable={false}
                />
                <div className="ps5-lib-spotlight-gradient" />
              </div>

              <div className="ps5-lib-spotlight-content">
                <div className="ps5-lib-spotlight-meta-tags">
                  <span className="ps5-lib-pill-platform">
                    {spotlight.id === 'geometry-dash'
                      ? 'PC · RHYTHM PLATFORMER'
                      : spotlight.categoria === 'snes'
                      ? 'SNES · 16-BIT CLASSIC'
                      : 'PC · WINDOWS MASTERPIECE'}
                  </span>
                  <span className="ps5-lib-pill-genre">{spotlight.genero}</span>
                  <span className="ps5-lib-pill-status">
                    <span className="ps5-lib-status-dot" /> Listo para jugar
                  </span>
                </div>

                <div className="ps5-lib-spotlight-title-row">
                  {spotlight.logo ? (
                    <img
                      src={spotlight.logo}
                      alt={spotlight.nombre}
                      className="ps5-lib-spotlight-logo"
                      draggable={false}
                    />
                  ) : (
                    <h2 className="ps5-lib-spotlight-title">{spotlight.nombre}</h2>
                  )}
                </div>

                <p className="ps5-lib-spotlight-desc">{spotlight.tagline}</p>

                <div className="ps5-lib-spotlight-actions">
                  <button
                    type="button"
                    className="ps5-lib-spotlight-play-btn"
                    onClick={() => onAbrirJuego(spotlight)}
                  >
                    <PSGlyph kind="cross" size={17} />
                    <span>Jugar ahora</span>
                  </button>

                  <button
                    type="button"
                    className={`ps5-lib-spotlight-fav-btn ${favoritos.includes(spotlight.id) ? 'is-fav' : ''}`}
                    onClick={(e) => toggleFavorito(spotlight.id, e)}
                    title={favoritos.includes(spotlight.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  >
                    <Star size={16} fill={favoritos.includes(spotlight.id) ? '#facc15' : 'none'} />
                    <span>{favoritos.includes(spotlight.id) ? 'Favorito' : 'Marcar favorito'}</span>
                  </button>

                  <div className="ps5-lib-spotlight-stats">
                    <div className="ps5-lib-stat-item">
                      <img src="/ps5/PS5Trophy.png" alt="Trofeos" className="w-4 h-4 object-contain inline mr-1.5" />
                      <span>{spotlight.logros || 'Logros'}</span>
                    </div>
                    <div className="ps5-lib-stat-item">
                      <Sparkles size={14} className="text-cyan-400 mr-1.5" />
                      <span>{spotlight.puntos || 0} pts</span>
                    </div>
                    <div className="ps5-lib-stat-item">
                      <HardDrive size={14} className="text-gray-400 mr-1.5" />
                      <span>100% Emulado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BARRA DE HERRAMIENTAS: Búsqueda, Orden y Estadísticas de Almacenamiento */}
          <div className="ps5-lib-toolbar">
            <div className="ps5-lib-toolbar-left">
              <div className="ps5-lib-search-box">
                <Search size={16} className="ps5-lib-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar en tu biblioteca de juegos (Zuma, Mario, Aladdin...)"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value)
                    setSelectedIdx(0)
                  }}
                  className="ps5-lib-search-input"
                />
                {busqueda && (
                  <button
                    type="button"
                    className="ps5-lib-search-clear"
                    onClick={() => setBusqueda('')}
                    title="Limpiar búsqueda"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="ps5-lib-sort-box">
                <SlidersHorizontal size={14} className="text-slate-400" />
                <span className="ps5-lib-sort-label">Ordenar:</span>
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="ps5-lib-sort-select"
                >
                  <option value="recomendado">Recomendados</option>
                  <option value="az">Nombre (A - Z)</option>
                  <option value="puntos">Mayor puntuación</option>
                  <option value="progreso">Progreso de trofeos</option>
                </select>
              </div>
            </div>

            <div className="ps5-lib-toolbar-right">
              {/* Barra de almacenamiento PlayStation M.2 SSD */}
              <div className="ps5-lib-storage-meter">
                <div className="ps5-lib-storage-header">
                  <span className="ps5-lib-storage-title">
                    <HardDrive size={13} className="text-cyan-400 inline mr-1" />
                    Consola VTR SSD
                  </span>
                  <span className="ps5-lib-storage-free">{juegosFiltrados.length} juegos disponibles</span>
                </div>
                <div className="ps5-lib-storage-bar-track">
                  <div
                    className="ps5-lib-storage-bar-fill"
                    style={{ width: `${Math.min(100, juegosFiltrados.length * 20)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GRILLA DE JUEGOS PLAYSTATION 5 */}
        <main className="ps5-lib-main-grid-wrapper">
          {juegosFiltrados.length === 0 ? (
            <div className="ps5-lib-empty-state">
              <div className="ps5-lib-empty-icon">
                <Gamepad2 size={48} className="text-slate-600" />
              </div>
              <h3 className="ps5-lib-empty-title">No se encontraron juegos</h3>
              <p className="ps5-lib-empty-desc">
                No hay resultados para "{busqueda}". Intenta con otro término o restablece los filtros.
              </p>
              <button
                type="button"
                className="ps5-lib-empty-reset-btn"
                onClick={() => {
                  setBusqueda('')
                  setTab('todos')
                }}
              >
                Ver todos los juegos
              </button>
            </div>
          ) : (
            <div className="ps5-lib-grid">
              {juegosFiltrados.map((juego, idx) => {
                const isSelected = hoveredJuego?.id === juego.id
                const isFav = favoritos.includes(juego.id)

                return (
                  <article
                    key={juego.id}
                    className={`ps5-card ${isSelected ? 'is-focused' : ''}`}
                    onMouseEnter={() => {
                      setHoveredJuego(juego)
                      setSelectedIdx(idx)
                    }}
                    onClick={() => onAbrirJuego(juego)}
                  >
                    {/* Contenedor de la carátula con relieve y reflejos */}
                    <div className="ps5-card-media-wrapper">
                      <img
                        src={juego.portada}
                        alt={juego.nombre}
                        className="ps5-card-cover-img"
                        draggable={false}
                        onError={(e) => {
                          e.currentTarget.style.opacity = '0.3'
                        }}
                      />

                      {/* Capa de cubierta PlayStation original */}
                      <img
                        src="/ps5/PS5CoverOverlay.png"
                        alt=""
                        className="ps5-card-ps5-overlay"
                        draggable={false}
                      />

                      {/* Brillo dinámico de cristal */}
                      <div className="ps5-card-glass-sheen" />

                      {/* Insignia de plataforma superior */}
                      <div className="ps5-card-badge-platform">
                        {juego.id === 'geometry-dash' ? 'PC RHYTHM' : juego.categoria === 'snes' ? 'SNES' : 'PC DELUXE'}
                      </div>

                      {/* Botón de favorito en esquina */}
                      <button
                        type="button"
                        className={`ps5-card-fav-corner ${isFav ? 'is-fav' : ''}`}
                        onClick={(e) => toggleFavorito(juego.id, e)}
                        title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                        aria-label="Favorito"
                      >
                        <Star size={14} fill={isFav ? '#facc15' : 'none'} />
                      </button>

                      {/* Overlay interactivo en hover / focus */}
                      <div className="ps5-card-hover-overlay">
                        <div className="ps5-card-hover-action">
                          <div className="ps5-card-play-pill">
                            <PSGlyph kind="cross" size={15} />
                            <span>JUGAR</span>
                          </div>
                        </div>

                        <div className="ps5-card-hover-trophy-badge">
                          <img src="/ps5/PS5Trophy.png" alt="" className="w-3.5 h-3.5 object-contain mr-1" />
                          <span>{juego.logros || 'Trofeos'}</span>
                        </div>
                      </div>

                      {/* Barra de progreso de logros en el borde inferior */}
                      <div className="ps5-card-progress-track">
                        <div
                          className="ps5-card-progress-fill"
                          style={{ width: `${juego.progreso || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Ficha descriptiva debajo de la carátula */}
                    <div className="ps5-card-info">
                      <div className="ps5-card-header-line">
                        <h3 className="ps5-card-title">{juego.nombre}</h3>
                        <span className="ps5-card-pts">{juego.puntos} pts</span>
                      </div>

                      <p className="ps5-card-tagline">{juego.tagline}</p>

                      <div className="ps5-card-footer-meta">
                        <span className="ps5-card-genre">{juego.genero}</span>
                        <span className="ps5-card-status-badge">
                          <span className="ps5-card-status-dot" />
                          LISTO
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </main>

        {/* PIE DE PÁGINA CON PISTAS DEL MANDO PLAYSTATION 5 */}
        <footer className="ps5-lib-footer">
          <div className="ps5-lib-hints">
            <span className="ps5-lib-hint-item">
              <PSGlyph kind="cross" size={16} /> <b>Iniciar juego</b>
            </span>
            <span className="ps5-lib-hint-item">
              <PSGlyph kind="circle" size={16} /> <b>Volver al carrusel</b>
            </span>
            <span className="ps5-lib-hint-item hidden sm:inline-flex">
              <PSGlyph kind="triangle" size={16} /> <b>Buscar</b>
            </span>
            <span className="ps5-lib-hint-item hidden md:inline-flex">
              <PSGlyph kind="square" size={16} /> <b>Marcar favorito</b>
            </span>
          </div>

          <div className="ps5-lib-footer-center">
            <img src="/ps5/PS5Logo.png" alt="PS5" className="ps5-lib-footer-logo" draggable={false} />
            <span className="ps5-lib-footer-text">PlayStation 5 Games Portal</span>
          </div>
        </footer>
      </div>

      {/* ESTILOS DE LUJO PLAYSTATION 5 PARA LA BIBLIOTECA */}
      <style>{`
        .ps5-lib-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background-color: #04060f;
          color: #ebebeb;
          font-family: "Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
          box-sizing: border-box;
        }

        /* Capas de fondo ambiental */
        .ps5-lib-bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .ps5-lib-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.65) saturate(1.2);
        }
        .ps5-lib-bg-overlay-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(3, 6, 16, 0.72) 0%, rgba(3, 6, 16, 0.45) 30%, rgba(3, 6, 16, 0.75) 75%, rgba(3, 6, 16, 0.95) 100%);
        }
        .ps5-lib-bg-overlay-grad {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          mix-blend-mode: multiply;
          opacity: 0.8;
        }
        .ps5-lib-ambient-glow {
          position: absolute;
          inset: 0;
          mix-blend-mode: screen;
          transition: background 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        /* Contenedor principal */
        .ps5-lib-container {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          max-width: 1720px;
          margin: 0 auto;
          padding: 1.25rem 1.75rem 2rem;
        }
        @media (min-width: 1024px) {
          .ps5-lib-container {
            padding: 1.5rem 3.5rem 2.5rem;
          }
        }

        /* Cabecera superior */
        .ps5-lib-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .ps5-lib-brand-box {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .ps5-lib-logo {
          height: 2.3rem;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.7));
        }
        .ps5-lib-online-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.2rem 0.65rem;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.35);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #34d399;
        }
        .ps5-lib-online-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #34d399;
          box-shadow: 0 0 8px #34d399;
        }

        /* Pestañas estilo PlayStation */
        .ps5-lib-nav-tabs {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(15, 23, 42, 0.65);
          padding: 0.3rem 0.4rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          overflow-x: auto;
        }
        .ps5-lib-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 1rem;
          border-radius: 999px;
          background: transparent;
          border: none;
          color: rgba(226, 232, 240, 0.75);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ps5-lib-tab-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }
        .ps5-lib-tab-btn.is-active {
          color: #fff;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.85) 0%, rgba(29, 78, 216, 0.95) 100%);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
        }
        .ps5-lib-badge-count {
          padding: 0.1rem 0.45rem;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.35);
          font-size: 0.7rem;
          font-weight: 700;
          color: #e2e8f0;
        }

        /* Lado derecho cabecera */
        .ps5-lib-top-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .ps5-lib-clock-box {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.1;
        }
        .ps5-lib-clock {
          font-family: "Segoe UI Light", "Segoe UI", sans-serif;
          font-size: 1.35rem;
          font-weight: 300;
          color: #fff;
          letter-spacing: 0.02em;
        }
        .ps5-lib-date {
          font-size: 0.68rem;
          color: rgba(203, 213, 225, 0.65);
          text-transform: capitalize;
        }
        .ps5-lib-profile-pill {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.25rem 0.85rem 0.25rem 0.3rem;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
        }
        .ps5-lib-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          object-fit: cover;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.25);
        }
        .ps5-lib-user-meta {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .ps5-lib-username {
          font-size: 0.78rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }
        .ps5-lib-level {
          font-size: 0.65rem;
          color: rgba(226, 232, 240, 0.75);
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .ps5-lib-back-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 1.1rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        .ps5-lib-back-btn:hover {
          background: #fff;
          color: #0f172a;
          transform: translateY(-1px);
        }

        /* HERO SPOTLIGHT & CONTROL DECK */
        .ps5-lib-hero-deck {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding-top: 1.5rem;
        }

        .ps5-lib-spotlight-card {
          position: relative;
          width: 100%;
          min-height: 220px;
          border-radius: 1.25rem;
          overflow: hidden;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
        }
        .ps5-lib-spotlight-backdrop {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .ps5-lib-spotlight-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.4) saturate(1.15) blur(1px);
          transform: scale(1.02);
        }
        .ps5-lib-spotlight-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(3, 7, 18, 0.96) 0%, rgba(3, 7, 18, 0.82) 45%, rgba(3, 7, 18, 0.35) 100%);
        }
        .ps5-lib-spotlight-content {
          position: relative;
          z-index: 2;
          padding: 2rem 2.5rem;
          max-width: 780px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ps5-lib-spotlight-meta-tags {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .ps5-lib-pill-platform {
          padding: 0.2rem 0.65rem;
          border-radius: 4px;
          background: rgba(37, 99, 235, 0.3);
          border: 1px solid rgba(59, 130, 246, 0.5);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #93c5fd;
        }
        .ps5-lib-pill-genre {
          padding: 0.2rem 0.65rem;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 0.72rem;
          font-weight: 600;
          color: #e2e8f0;
        }
        .ps5-lib-pill-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #4ade80;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .ps5-lib-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #4ade80;
          box-shadow: 0 0 8px #4ade80;
        }

        .ps5-lib-spotlight-title-row {
          display: flex;
          align-items: center;
          min-height: 48px;
        }
        .ps5-lib-spotlight-logo {
          max-height: 58px;
          max-width: 280px;
          object-fit: contain;
          filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.8));
        }
        .ps5-lib-spotlight-title {
          font-size: clamp(1.6rem, 3.2vw, 2.3rem);
          font-weight: 800;
          color: #fff;
          margin: 0;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 16px rgba(0, 0, 0, 0.7);
        }
        .ps5-lib-spotlight-desc {
          margin: 0;
          font-size: 0.95rem;
          color: rgba(226, 232, 240, 0.85);
          line-height: 1.5;
          max-width: 620px;
        }

        .ps5-lib-spotlight-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .ps5-lib-spotlight-play-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.65rem 1.6rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          border: 1px solid rgba(147, 197, 253, 0.4);
          color: #fff;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ps5-lib-spotlight-play-btn:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37, 99, 235, 0.7);
        }
        .ps5-lib-spotlight-fav-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.65rem 1.1rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #e2e8f0;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(6px);
          transition: all 0.2s ease;
        }
        .ps5-lib-spotlight-fav-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
        }
        .ps5-lib-spotlight-fav-btn.is-fav {
          border-color: rgba(250, 204, 21, 0.4);
          color: #fef08a;
          background: rgba(250, 204, 21, 0.12);
        }

        .ps5-lib-spotlight-stats {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-left: auto;
          padding-left: 1rem;
        }
        .ps5-lib-stat-item {
          display: flex;
          align-items: center;
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.8);
        }

        /* TOOLBAR: Búsqueda, orden y medidor de SSD */
        .ps5-lib-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
          padding: 1rem 1.25rem;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(14px);
        }
        .ps5-lib-toolbar-left {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          flex: 1;
        }
        .ps5-lib-search-box {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 260px;
          max-width: 520px;
        }
        .ps5-lib-search-icon {
          position: absolute;
          left: 1rem;
          color: rgba(203, 213, 225, 0.5);
          pointer-events: none;
        }
        .ps5-lib-search-input {
          width: 100%;
          padding: 0.6rem 2.4rem 0.6rem 2.7rem;
          border-radius: 999px;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #fff;
          font-size: 0.85rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .ps5-lib-search-input:focus {
          background: rgba(30, 41, 59, 0.95);
          border-color: #3b82f6;
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.35);
        }
        .ps5-lib-search-clear {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: rgba(203, 213, 225, 0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.2rem;
        }
        .ps5-lib-search-clear:hover {
          color: #fff;
        }

        .ps5-lib-sort-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ps5-lib-sort-label {
          font-size: 0.78rem;
          color: rgba(203, 213, 225, 0.6);
          font-weight: 600;
        }
        .ps5-lib-sort-select {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e2e8f0;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0.45rem 0.85rem;
          border-radius: 0.5rem;
          outline: none;
          cursor: pointer;
        }

        .ps5-lib-toolbar-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .ps5-lib-storage-meter {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 190px;
        }
        .ps5-lib-storage-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
        }
        .ps5-lib-storage-title {
          color: #cbd5e1;
          font-weight: 600;
        }
        .ps5-lib-storage-free {
          color: rgba(203, 213, 225, 0.6);
        }
        .ps5-lib-storage-bar-track {
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }
        .ps5-lib-storage-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%);
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
        }

        /* MAIN GRID */
        .ps5-lib-main-grid-wrapper {
          padding-top: 1.5rem;
          flex: 1;
        }

        .ps5-lib-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .ps5-lib-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.75rem;
          }
        }
        @media (min-width: 1024px) {
          .ps5-lib-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
          }
        }
        @media (min-width: 1280px) {
          .ps5-lib-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 2.25rem;
          }
        }

        /* CARD DE JUEGO ESTILO PLAYSTATION 5 */
        .ps5-card {
          position: relative;
          display: flex;
          flex-direction: column;
          background: transparent;
          border-radius: 1rem;
          cursor: pointer;
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
        }
        .ps5-card:hover, .ps5-card.is-focused {
          transform: translateY(-8px) scale(1.02);
        }

        .ps5-card-media-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          border-radius: 1rem;
          overflow: hidden;
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
          transition: border-color 0.28s ease, box-shadow 0.28s ease;
        }
        .ps5-card:hover .ps5-card-media-wrapper,
        .ps5-card.is-focused .ps5-card-media-wrapper {
          border-color: rgba(96, 165, 250, 0.75);
          box-shadow: 0 16px 36px rgba(37, 99, 235, 0.35), 0 0 20px rgba(96, 165, 250, 0.3);
        }

        .ps5-card-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ps5-card:hover .ps5-card-cover-img,
        .ps5-card.is-focused .ps5-card-cover-img {
          transform: scale(1.06);
        }

        .ps5-card-ps5-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          opacity: 0.85;
        }

        .ps5-card-glass-sheen {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, transparent 40%, rgba(0, 0, 0, 0.5) 100%);
          pointer-events: none;
        }

        .ps5-card-badge-platform {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          z-index: 3;
          padding: 0.15rem 0.55rem;
          border-radius: 4px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #93c5fd;
          backdrop-filter: blur(8px);
        }

        .ps5-card-fav-corner {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          z-index: 3;
          width: 1.8rem;
          height: 1.8rem;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        .ps5-card-fav-corner:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #facc15;
          transform: scale(1.1);
        }
        .ps5-card-fav-corner.is-fav {
          color: #facc15;
          border-color: rgba(250, 204, 21, 0.4);
          background: rgba(250, 204, 21, 0.15);
        }

        /* Hover overlay */
        .ps5-card-hover-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(3, 7, 18, 0.88) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.25rem 1rem;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .ps5-card:hover .ps5-card-hover-overlay,
        .ps5-card.is-focused .ps5-card-hover-overlay {
          opacity: 1;
        }

        .ps5-card-hover-action {
          display: flex;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        .ps5-card-play-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 1.1rem;
          border-radius: 999px;
          background: #fff;
          color: #0f172a;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.4);
          transform: translateY(6px);
          transition: transform 0.22s ease;
        }
        .ps5-card:hover .ps5-card-play-pill,
        .ps5-card.is-focused .ps5-card-play-pill {
          transform: translateY(0);
        }

        .ps5-card-hover-trophy-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: rgba(226, 232, 240, 0.9);
        }

        .ps5-card-progress-track {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.15);
        }
        .ps5-card-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
          box-shadow: 0 0 6px #60a5fa;
        }

        /* Detalle debajo de carátula */
        .ps5-card-info {
          padding: 0.75rem 0.25rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .ps5-card-header-line {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .ps5-card-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ps5-card-pts {
          font-size: 0.72rem;
          font-weight: 700;
          color: #60a5fa;
        }

        .ps5-card-tagline {
          margin: 0;
          font-size: 0.78rem;
          color: rgba(203, 213, 225, 0.65);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ps5-card-footer-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.2rem;
        }
        .ps5-card-genre {
          font-size: 0.7rem;
          font-weight: 600;
          color: rgba(148, 163, 184, 0.8);
        }
        .ps5-card-status-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #4ade80;
        }
        .ps5-card-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: #4ade80;
        }

        /* Estado vacío */
        .ps5-lib-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
          text-align: center;
          background: rgba(15, 23, 42, 0.45);
          border-radius: 1.25rem;
          border: 1px dashed rgba(255, 255, 255, 0.12);
        }
        .ps5-lib-empty-icon {
          margin-bottom: 1rem;
        }
        .ps5-lib-empty-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.5rem;
        }
        .ps5-lib-empty-desc {
          font-size: 0.85rem;
          color: rgba(203, 213, 225, 0.7);
          max-width: 420px;
          margin: 0 0 1.25rem;
        }
        .ps5-lib-empty-reset-btn {
          padding: 0.55rem 1.25rem;
          border-radius: 999px;
          background: #2563eb;
          border: none;
          color: #fff;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
        }

        /* Pie de página PlayStation */
        .ps5-lib-footer {
          margin-top: auto;
          padding-top: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .ps5-lib-hints {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.25rem;
        }
        .ps5-lib-hint-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.78rem;
          color: rgba(226, 232, 240, 0.85);
        }
        .ps5-lib-hint-item b {
          font-weight: 600;
        }

        .ps5-lib-footer-center {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .ps5-lib-footer-logo {
          height: 1.4rem;
          width: auto;
          opacity: 0.8;
        }
        .ps5-lib-footer-text {
          font-size: 0.75rem;
          color: rgba(203, 213, 225, 0.5);
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  )
}
