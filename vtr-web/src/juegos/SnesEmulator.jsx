/**
 * Emulador SNES genérico (EmulatorJS) + netplay.
 * Props: romFile (nombre .sfc), romFolder, title, regionLabel, gameId, accent
 */
import React, { useEffect, useId, useMemo, useRef, useState } from 'react'

const EJS_DATA = 'https://cdn.emulatorjs.org/stable/data/'
const NETPLAY_STORAGE_KEY = 'vtr-snes-netplay-server'
const EJS_TOOLBAR = 44

const DEFAULT_ICE = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.nextcloud.com:3478' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
]

const ACCENTS = {
  lime: {
    ejs: '#43a047',
    border: 'border-lime-500/30',
    cfgBorder: 'border-lime-500/25',
    btn: 'bg-lime-500/20 text-lime-100 hover:bg-lime-500/30 border-lime-400/30',
    save: 'bg-lime-500 text-[#06210f] hover:bg-lime-400',
    spin: 'border-lime-400',
    hint: 'text-[#c8e6c9]/55',
    load: 'text-lime-100/85',
    label: 'text-lime-200/60',
    body: 'text-[#e8f5e9]',
  },
  red: {
    ejs: '#e53935',
    border: 'border-red-400/35',
    cfgBorder: 'border-red-400/25',
    btn: 'bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-400/30',
    save: 'bg-red-500 text-white hover:bg-red-400',
    spin: 'border-red-400',
    hint: 'text-red-100/50',
    load: 'text-red-100/85',
    label: 'text-red-200/60',
    body: 'text-[#ffebee]',
  },
  amber: {
    ejs: '#f9a825',
    border: 'border-amber-400/35',
    cfgBorder: 'border-amber-400/25',
    btn: 'bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 border-amber-400/30',
    save: 'bg-amber-400 text-[#1a1200] hover:bg-amber-300',
    spin: 'border-amber-400',
    hint: 'text-amber-100/50',
    load: 'text-amber-100/85',
    label: 'text-amber-200/60',
    body: 'text-[#fff8e1]',
  },
}

function normalizeNetplayUrl(raw) {
  const s = String(raw || '').trim()
  if (!s) return ''
  try {
    const u = new URL(s.includes('://') ? s : `https://${s}`)
    let href = u.href
    if (!href.endsWith('/')) href += '/'
    return href
  } catch {
    return ''
  }
}

function readStoredNetplayUrl() {
  try {
    const modern = normalizeNetplayUrl(localStorage.getItem(NETPLAY_STORAGE_KEY) || '')
    if (modern) return modern
    return normalizeNetplayUrl(localStorage.getItem('vtr-zamn-netplay-server') || '')
  } catch {
    return ''
  }
}

function defaultNetplayUrl() {
  const fromEnv = normalizeNetplayUrl(import.meta.env.VITE_NETPLAY_SERVER || '')
  if (fromEnv) return fromEnv
  const stored = readStoredNetplayUrl()
  if (stored) return stored
  return 'https://vtr-netplay-417392161995.us-central1.run.app/'
}

function fitPlayerBox(availW, availH) {
  const maxW = Math.max(320, Math.floor(availW))
  const maxH = Math.max(240, Math.floor(availH))
  let w = maxW
  let screenH = Math.round((w * 3) / 4)
  let totalH = screenH + EJS_TOOLBAR
  if (totalH > maxH) {
    totalH = maxH
    screenH = Math.max(180, totalH - EJS_TOOLBAR)
    w = Math.round((screenH * 4) / 3)
  }
  return { w, h: screenH + EJS_TOOLBAR }
}

/** Silencia y destruye EmulatorJS para que no suene fuera del juego. */
function hardStopEmulator() {
  try {
    const emu = window.EJS_emulator
    if (emu) {
      try {
        emu.setVolume?.(0)
      } catch {
        /* */
      }
      try {
        emu.pause?.(true)
      } catch {
        /* */
      }
      try {
        emu.gameManager?.toggleMainLoop?.(0)
      } catch {
        /* */
      }
      try {
        emu.callEvent?.('exit')
      } catch {
        /* */
      }
      try {
        const mod = emu.Module
        try {
          mod?.exit?.()
        } catch {}
        try {
          mod?._emscripten_force_exit?.()
        } catch {}
        const ctxs = mod?.AL?.contexts
        if (Array.isArray(ctxs)) {
          ctxs.forEach((c) => {
            try {
              c?.audioCtx?.suspend?.()
              c?.audioCtx?.close?.()
            } catch {
              /* */
            }
          })
        }
      } catch {
        /* */
      }
    }
  } catch {
    /* */
  }
  try {
    delete window.EJS_emulator
    delete window.EJS_ready
  } catch {
    /* */
  }
}

export default function SnesEmulator({
  onSalir,
  romFolder,
  romFile,
  title,
  regionLabel = 'ROM',
  gameId,
  accent = 'lime',
}) {
  const theme = ACCENTS[accent] || ACCENTS.lime
  const uid = useId().replace(/:/g, '')
  const playerId = `snes-ejs-${uid}`
  const loaderKey = `snes-${romFolder}`
  const romUrl = `/juegos/${romFolder}/` + encodeURIComponent(romFile)
  const frameRef = useRef(null)
  const [box, setBox] = useState({ w: 960, h: 720 })
  const [phase, setPhase] = useState('boot')
  const [error, setError] = useState(null)
  const [netplayUrl, setNetplayUrl] = useState(() => defaultNetplayUrl())
  const [netplayDraft, setNetplayDraft] = useState(() => defaultNetplayUrl())
  const [showNetplayCfg, setShowNetplayCfg] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  const netplayEnabled = useMemo(() => Boolean(normalizeNetplayUrl(netplayUrl)), [netplayUrl])

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const apply = () => {
      const r = el.getBoundingClientRect()
      setBox(fitPlayerBox(r.width, r.height))
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    window.addEventListener('resize', apply)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', apply)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let scriptEl = null

    const start = async () => {
      try {
        const res = await fetch(romUrl, { method: 'HEAD' })
        if (!res.ok) throw new Error(`ROM no encontrada: ${romFile}`)

        if (cancelled) return
        setPhase('loading')

        const server = normalizeNetplayUrl(netplayUrl)

        // Parche WebGL para drivers integrados (low-power)
        try {
          const getCtx = HTMLCanvasElement.prototype.getContext
          if (getCtx && !HTMLCanvasElement.prototype._ejsCtxPatched) {
            HTMLCanvasElement.prototype._ejsCtxPatched = true
            HTMLCanvasElement.prototype.getContext = function (type, attrs) {
              if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
                attrs = attrs || {}
                attrs.powerPreference = attrs.powerPreference || 'low-power'
                attrs.antialias = false
                attrs.stencil = false
                attrs.preserveDrawingBuffer = false
                attrs.depth = false
                attrs.alpha = true
                attrs.failIfMajorPerformanceCaveat = false
                return getCtx.call(this, type, attrs)
              }
              return getCtx.call(this, type, attrs)
            }
          }
        } catch {}

        window.EJS_player = `#${playerId}`
        window.EJS_gameUrl = `${romUrl}?v=1`
        window.EJS_core = 'snes'
        window.EJS_pathtodata = EJS_DATA
        window.EJS_startOnLoaded = false
        window.EJS_color = theme.ejs
        window.EJS_backgroundColor = '#000000'
        window.EJS_gameName = title
        window.EJS_gameID = gameId
        window.EJS_volume = 0.35
        window.EJS_antialias = false
        window.EJS_powerPreference = 'low-power'
        try {
          window.EJS_threads = false
        } catch {}
        try {
          window.EJS_threadCount = 1
        } catch {}
        try {
          window.EJS_multithreaded = false
        } catch {}
        try {
          window.EJS_disableAutoFrameSkip = false
        } catch {}
        try {
          window.EJS_audioBufferSize = 1024
        } catch {}
        try {
          window.EJS_rewindEnabled = false
        } catch {}
        window.EJS_defaultOptions = {
          vsync: 'disabled',
          'video-renderer': 'webgl',
          'render-mode': 'webgl2',
          'aspect-ratio': 'auto',
          'pixel-art': true,
          'show-fps': false,
          'show-time': false,
          'show-frameskip': false,
          'frame-skip': 0,
          'fast-forward-speed': 1,
          'rewind-enabled': false,
          'audio-latency': 'low',
          'save-state-slot': 0,
          'threaded-cores': 1,
          'cache-bitmap': true,
        }
        window.EJS_Buttons = {
          playPause: true,
          restart: true,
          mute: true,
          settings: true,
          fullscreen: true,
          saveState: true,
          loadState: true,
          gamepad: true,
          volume: true,
          netplay: true,
        }

        if (server) {
          window.EJS_netplayServer = server
          window.EJS_netplayICEServers = DEFAULT_ICE
        } else {
          delete window.EJS_netplayServer
          delete window.EJS_netplayICEServers
        }

        window.EJS_ready = () => {
          if (cancelled) return
          setPhase('ready')
          requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'))
            try {
              const emu = window.EJS_emulator
              const cur = emu?.preGetSetting?.('vsync')
              if (cur !== 'disabled') {
                try {
                  emu?.frontend?.changeSettingOption?.('vsync', 'disabled')
                } catch {}
                try {
                  emu?.gameManager?.setVSync?.(false)
                } catch {}
                try { emu?.setVSync?.(false) } catch {}
                try { emu?.frontend?.setVSync?.(false) } catch {}
              }
              try {
                emu?.frontend?.changeSettingOption?.('video-renderer', 'webgl')
                emu?.frontend?.changeSettingOption?.('render-mode', 'webgl2')
                emu?.frontend?.changeSettingOption?.('pixel-art', true)
                emu?.frontend?.changeSettingOption?.('vsync', 'disabled')
                try { emu?.gameManager?.setVSync?.(false) } catch {}
                try { emu?.setVSync?.(false) } catch {}
                try { emu?.frontend?.setVSync?.(false) } catch {}
              } catch {}
            } catch {
              /* */
            }
          })
        }

        document.querySelectorAll(`script[data-ejs-loader="${loaderKey}"]`).forEach((s) => s.remove())

        scriptEl = document.createElement('script')
        scriptEl.src = `${EJS_DATA}loader.js`
        scriptEl.async = true
        scriptEl.dataset.ejsLoader = loaderKey
        scriptEl.onerror = () => {
          if (!cancelled) {
            setError('Falló la carga de EmulatorJS (revisa conexión / CDN).')
            setPhase('error')
          }
        }
        document.body.appendChild(scriptEl)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setError(err.message || 'Error al iniciar')
          setPhase('error')
        }
      }
    }

    start()

    return () => {
      cancelled = true
      hardStopEmulator()
      const node = document.getElementById(playerId)
      if (node) node.innerHTML = ''
      if (scriptEl?.parentNode) scriptEl.parentNode.removeChild(scriptEl)
      delete window.EJS_netplayServer
      delete window.EJS_netplayICEServers
      try {
        const getCtx = HTMLCanvasElement.prototype.getContext
        if (getCtx && HTMLCanvasElement.prototype._ejsCtxPatched) {
          // No lo restauramos agresivamente para evitar romper otros elementos
        }
      } catch {}
    }
  }, [playerId, netplayUrl, reloadToken, romUrl, romFile, title, gameId, theme.ejs, loaderKey])

  const applyNetplayServer = () => {
    const next = normalizeNetplayUrl(netplayDraft)
    try {
      if (next) localStorage.setItem(NETPLAY_STORAGE_KEY, next)
      else localStorage.removeItem(NETPLAY_STORAGE_KEY)
    } catch {
      /* */
    }
    setNetplayUrl(next)
    setNetplayDraft(next)
    setShowNetplayCfg(false)
    setPhase('boot')
    setError(null)
    setReloadToken((n) => n + 1)
  }

  return (
    <div className={`w-full flex-1 flex flex-col gap-1.5 min-h-0 ${theme.body}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 px-1">
        <div className="flex flex-col gap-0.5 text-sm">
          <span className="font-semibold tracking-wide">{title}</span>
          <span className="opacity-70 text-xs sm:text-sm hidden sm:inline">
            Super Nintendo · {regionLabel}
            {netplayEnabled ? ' · Multijugador en red' : ''}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setNetplayDraft(netplayUrl)
              setShowNetplayCfg((v) => !v)
            }}
            className={`min-h-10 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold active:scale-95 border ${theme.btn}`}
          >
            {netplayEnabled ? 'Netplay' : 'Activar netplay'}
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

      {showNetplayCfg && (
        <div className={`rounded-xl border ${theme.cfgBorder} bg-black/50 p-3 sm:p-4 space-y-2 w-full shrink-0`}>
          <p className="text-xs opacity-80 leading-relaxed">
            Servidor de señalización. En el emulador usa el icono del globo 🌐 para crear o unirte a una
            sala (mismo juego + mismo sitio).
          </p>
          <label className={`block text-[11px] uppercase tracking-wider ${theme.label}`}>
            URL del servidor netplay
          </label>
          <input
            type="url"
            value={netplayDraft}
            onChange={(e) => setNetplayDraft(e.target.value)}
            placeholder="https://tu-servidor.run.app/"
            className="w-full min-h-11 rounded-lg bg-white/5 border border-white/15 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40"
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={applyNetplayServer}
              className={`min-h-10 px-4 rounded-full text-xs font-bold ${theme.save}`}
            >
              Guardar y reiniciar emulador
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(NETPLAY_STORAGE_KEY)
                } catch {
                  /* */
                }
                setNetplayDraft('')
                setNetplayUrl('')
                setShowNetplayCfg(false)
                setPhase('boot')
                setError(null)
                setReloadToken((n) => n + 1)
              }}
              className="min-h-10 px-4 rounded-full text-xs font-bold bg-white/10 text-white hover:bg-white/20"
            >
              Desactivar
            </button>
          </div>
        </div>
      )}

      <div
        ref={frameRef}
        className={`relative flex-1 min-h-0 w-full flex items-center justify-center bg-black/40 rounded-none sm:rounded-2xl border-y sm:border ${theme.border}`}
      >
        {phase === 'error' ? (
          <div className="p-6 text-center text-red-200 text-sm">{error}</div>
        ) : (
          <>
            {phase !== 'ready' && (
              <div
                className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/90 text-sm pointer-events-none ${theme.load}`}
              >
                <span className={`w-10 h-10 border-2 ${theme.spin} border-t-transparent rounded-full animate-spin`} />
                {phase === 'boot' ? 'Preparando…' : 'Cargando emulador + ROM…'}
              </div>
            )}
            <div
              className="relative shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden bg-black"
              style={{
                width: box.w,
                height: box.h,
                maxWidth: '100%',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                willChange: 'transform,width,height',
                imageRendering: 'pixelated',
                msInterpolationMode: 'nearest-neighbor',
              }}
            >
              <div
                id={playerId}
                style={{
                  width: '100%',
                  height: '100%',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              />
            </div>
          </>
        )}
      </div>

      <p className={`hidden lg:block text-[11px] px-1 shrink-0 ${theme.hint}`}>
        Pulsa ▶ para iniciar (sin audio hasta entonces) · Netplay: 🌐 · VSync off por defecto.
      </p>
    </div>
  )
}

/** Catálogo SNES del portal */
export const SNES_GAMES = {
  zamn: {
    id: 'zamn',
    romFolder: 'zamn',
    romFile: 'Zombies Ate My Neighbors (USA).sfc',
    title: 'Zombies Ate My Neighbors',
    regionLabel: 'ROM USA',
    gameId: 199311,
    accent: 'lime',
    nombre: 'Zombies Ate My Neighbors',
    tagline: 'ROM USA · multijugador en red',
    theme: 'zamn',
  },
  smw: {
    id: 'smw',
    romFolder: 'smw',
    romFile: 'Super Mario World (USA).sfc',
    title: 'Super Mario World',
    regionLabel: 'ROM USA',
    gameId: 199011,
    accent: 'red',
    nombre: 'Super Mario World',
    tagline: 'ROM USA · SNES clásico',
    theme: 'smw',
  },
  aladdin: {
    id: 'aladdin',
    romFolder: 'aladdin',
    romFile: 'Aladdin (Spain).sfc',
    title: 'Aladdin',
    regionLabel: 'ROM Spain',
    gameId: 199401,
    accent: 'amber',
    nombre: 'Aladdin',
    tagline: 'ROM Spain · SNES',
    theme: 'aladdin',
  },
}
