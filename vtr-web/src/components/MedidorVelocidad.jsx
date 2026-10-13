import React, { useEffect, useRef, useState } from 'react'
import { Activity, RotateCcw } from 'lucide-react'

const FAST_TARGETS_URL =
  'https://us-central1-vtrclaroo-3c572.cloudfunctions.net/fastTargets?urlCount=8'

const formatMbps = (value) => {
  if (value == null || Number.isNaN(value)) return '—'
  if (value >= 100) return value.toFixed(0)
  if (value >= 10) return value.toFixed(1)
  return value.toFixed(2)
}

const mediana = (arr) => {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

const percentil = (arr, p) => {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  const idx = Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1))
  return s[idx]
}

async function resolverProveedor() {
  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    const isp = data.org || data.asn_org || null
    const ubicacion = [data.city, data.country_name || data.country].filter(Boolean).join(', ')
    return {
      isp: isp ? String(isp).trim() : null,
      ubicacion: ubicacion || null,
    }
  } catch {
    return null
  }
}

async function obtenerTargets() {
  const res = await fetch(FAST_TARGETS_URL, { cache: 'no-store' })
  const data = await res.json()
  if (!data?.ok || !Array.isArray(data.targets) || !data.targets.length) {
    throw new Error(data?.error || 'Sin targets Fast.com')
  }
  return data.targets
}

async function medirLatenciaDnsGoogle() {
  // Siempre mide contra DNS de Google (DoH: dns.google → 8.8.8.8)
  const tiempos = []
  for (let i = 0; i < 6; i += 1) {
    const t0 = performance.now()
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 5000)
      const url =
        `https://dns.google/resolve?name=google.com&type=A&edns_client_subnet=0.0.0.0/0&random_padding=${i}-${Math.random()}`
      const res = await fetch(url, { cache: 'no-store', mode: 'cors', signal: ctrl.signal })
      clearTimeout(timer)
      if (!res.ok) continue
      await res.json().catch(() => {})
      tiempos.push(performance.now() - t0)
    } catch {
      // ignorar muestra
    }
  }
  if (!tiempos.length) return null
  // Descarta la más lenta (outlier) y usa mediana
  const utiles = [...tiempos].sort((a, b) => a - b).slice(0, Math.max(1, tiempos.length - 1))
  return Math.round(mediana(utiles))
}

/**
 * Igual idea que Fast.com:
 * - varias conexiones en paralelo a Netflix OCA
 * - cada worker vuelve a descargar en bucle (el archivo es ~25MB)
 * - descarta rampa TCP
 * - reporta el pico sostenido (mejor ventana / percentil alto)
 */
async function medirDescargaFast(targets, onProgress, shouldCancel) {
  const DURACION_MS = 12000
  const RAMP_MS = 2500
  const CONEXIONES = Math.min(8, Math.max(4, targets.length))
  const urls = targets.slice(0, CONEXIONES)

  const estado = {
    bytes: 0,
    muestras: [], // { t, mbps } post-rampa
    lastAt: 0,
    lastBytes: 0,
    startedAt: performance.now(),
    stop: false,
  }

  const sample = () => {
    const now = performance.now()
    const elapsed = now - estado.startedAt
    if (elapsed < 200) return
    if (!estado.lastAt) {
      estado.lastAt = now
      estado.lastBytes = estado.bytes
      return
    }
    if (now - estado.lastAt < 200) return

    const dt = (now - estado.lastAt) / 1000
    const db = estado.bytes - estado.lastBytes
    estado.lastAt = now
    estado.lastBytes = estado.bytes
    if (dt <= 0) return

    const mbps = (db * 8) / (dt * 1_000_000)
    // Solo cuenta muestras tras la rampa (saturación real)
    if (elapsed >= RAMP_MS) {
      estado.muestras.push({ t: now, mbps })
    }
    // UI: muestra lo mejor visto hasta ahora (más cercano a Fast.com)
    const visibles = estado.muestras.map((m) => m.mbps)
    const ui = visibles.length
      ? Math.max(percentil(visibles, 85), mediana(visibles.slice(-5)))
      : (estado.bytes * 8) / ((elapsed / 1000) * 1_000_000)
    onProgress?.(Math.max(0, ui))
  }

  const descargarUnaVez = async (url, signal) => {
    const res = await fetch(url, { cache: 'no-store', mode: 'cors', signal })
    if (!res.ok) throw new Error('OCA HTTP ' + res.status)
    const reader = res.body?.getReader()
    if (!reader) {
      const buf = await res.arrayBuffer()
      estado.bytes += buf.byteLength
      sample()
      return
    }
    while (true) {
      if (estado.stop || shouldCancel?.()) {
        try { await reader.cancel() } catch { /* ignore */ }
        return
      }
      const { done, value } = await reader.read()
      if (done) break
      estado.bytes += value.byteLength
      sample()
    }
  }

  const controllers = []
  const worker = async (url) => {
    while (!estado.stop && !shouldCancel?.()) {
      const ctrl = new AbortController()
      controllers.push(ctrl)
      try {
        await descargarUnaVez(url, ctrl.signal)
      } catch {
        // reintenta con otra vuelta
        await new Promise((r) => setTimeout(r, 120))
      }
    }
  }

  const workers = urls.map((url) => worker(url))

  // Corre un tiempo fijo para saturar bien el enlace
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, DURACION_MS)
    const poll = setInterval(() => {
      if (shouldCancel?.()) {
        clearTimeout(timer)
        clearInterval(poll)
        resolve()
      }
    }, 200)
    // guarda cleanup en el timer callback
    setTimeout(() => clearInterval(poll), DURACION_MS + 50)
  })

  estado.stop = true
  controllers.forEach((c) => { try { c.abort() } catch { /* ignore */ } })
  await Promise.allSettled(workers)
  sample()

  if (estado.bytes < 500_000) {
    throw new Error('Descarga insuficiente')
  }

  const velocidades = estado.muestras.map((m) => m.mbps).filter((v) => v > 0)
  if (!velocidades.length) {
    const elapsed = (performance.now() - estado.startedAt) / 1000
    return (estado.bytes * 8) / (elapsed * 1_000_000)
  }

  // Mejor ventana móvil de ~2s (estilo Fast.com: capacidad sostenida alta)
  const ventana = []
  let mejor = 0
  for (const m of estado.muestras) {
    ventana.push(m)
    while (ventana.length && m.t - ventana[0].t > 2000) ventana.shift()
    if (ventana.length >= 3) {
      const avg = ventana.reduce((a, b) => a + b.mbps, 0) / ventana.length
      if (avg > mejor) mejor = avg
    }
  }

  const p90 = percentil(velocidades, 90)
  // Reporta el pico sostenido real, no el promedio flojo del arranque
  return Math.max(mejor, p90 * 0.95, mediana(velocidades))
}

async function medirSubidaFast(_targets, onProgress, shouldCancel) {
  // Los OCA de Netflix no permiten upload CORS desde otros orígenes.
  // Medimos carga contra Cloudflare (mismo método de saturación).
  const DURACION_MS = 10000
  const RAMP_MS = 2000
  const CONEXIONES = 4
  const CHUNK = 2_000_000

  const estado = {
    bytes: 0,
    muestras: [],
    lastAt: 0,
    lastBytes: 0,
    startedAt: performance.now(),
    stop: false,
  }

  const sample = () => {
    const now = performance.now()
    const elapsed = now - estado.startedAt
    if (elapsed < 200) return
    if (!estado.lastAt) {
      estado.lastAt = now
      estado.lastBytes = estado.bytes
      return
    }
    if (now - estado.lastAt < 200) return

    const dt = (now - estado.lastAt) / 1000
    const db = estado.bytes - estado.lastBytes
    estado.lastAt = now
    estado.lastBytes = estado.bytes
    if (dt <= 0) return

    const mbps = (db * 8) / (dt * 1_000_000)
    if (elapsed >= RAMP_MS) estado.muestras.push({ t: now, mbps })

    const visibles = estado.muestras.map((m) => m.mbps)
    const ui = visibles.length
      ? Math.max(percentil(visibles, 85), mediana(visibles.slice(-5)))
      : (estado.bytes * 8) / ((elapsed / 1000) * 1_000_000)
    onProgress?.(Math.max(0, ui))
  }

  const worker = async () => {
    while (!estado.stop && !shouldCancel?.()) {
      try {
        const body = new Uint8Array(CHUNK)
        const res = await fetch(`https://speed.cloudflare.com/__up?r=${Math.random()}`, {
          method: 'POST',
          body,
          cache: 'no-store',
          mode: 'cors',
        })
        if (!res.ok) {
          await new Promise((r) => setTimeout(r, 150))
          continue
        }
        await res.text().catch(() => {})
        estado.bytes += CHUNK
        sample()
      } catch {
        await new Promise((r) => setTimeout(r, 200))
      }
    }
  }

  const workers = Array.from({ length: CONEXIONES }, () => worker())

  await new Promise((resolve) => {
    const timer = setTimeout(resolve, DURACION_MS)
    const poll = setInterval(() => {
      if (shouldCancel?.()) {
        clearTimeout(timer)
        clearInterval(poll)
        resolve()
      }
    }, 200)
    setTimeout(() => clearInterval(poll), DURACION_MS + 50)
  })

  estado.stop = true
  await Promise.allSettled(workers)
  sample()

  if (estado.bytes < 200_000) return null

  const velocidades = estado.muestras.map((m) => m.mbps).filter((v) => v > 0)
  if (!velocidades.length) {
    const elapsed = (performance.now() - estado.startedAt) / 1000
    return (estado.bytes * 8) / (elapsed * 1_000_000)
  }

  const ventana = []
  let mejor = 0
  for (const m of estado.muestras) {
    ventana.push(m)
    while (ventana.length && m.t - ventana[0].t > 2000) ventana.shift()
    if (ventana.length >= 3) {
      const avg = ventana.reduce((a, b) => a + b.mbps, 0) / ventana.length
      if (avg > mejor) mejor = avg
    }
  }

  return Math.max(mejor, percentil(velocidades, 90) * 0.95, mediana(velocidades))
}

const MedidorVelocidad = () => {
  const [estado, setEstado] = useState('idle')
  const [fase, setFase] = useState('')
  const [download, setDownload] = useState(null)
  const [upload, setUpload] = useState(null)
  const [latencia, setLatencia] = useState(null)
  const [proveedor, setProveedor] = useState(null)
  const [ubicacion, setUbicacion] = useState(null)
  const cancelRef = useRef(false)

  const correr = async () => {
    cancelRef.current = false
    setEstado('midiendo')
    setDownload(null)
    setUpload(null)
    setLatencia(null)
    setProveedor(null)
    setUbicacion(null)

    try {
      setFase('Detectando proveedor…')
      const [targets, info] = await Promise.all([
        obtenerTargets(),
        resolverProveedor(),
      ])
      if (cancelRef.current) return

      if (info?.isp) setProveedor(info.isp)
      if (info?.ubicacion) setUbicacion(info.ubicacion)

      setFase('Latencia DNS Google (8.8.8.8)…')
      const ping = await medirLatenciaDnsGoogle()
      if (cancelRef.current) return
      setLatencia(ping)

      setFase('Descarga (Netflix / Fast.com)…')
      const dl = await medirDescargaFast(
        targets,
        (v) => { if (!cancelRef.current) setDownload(v) },
        () => cancelRef.current,
      )
      if (cancelRef.current) return
      setDownload(dl)

      setFase('Carga…')
      const ul = await medirSubidaFast(
        targets,
        (v) => { if (!cancelRef.current) setUpload(v) },
        () => cancelRef.current,
      )
      if (cancelRef.current) return
      setUpload(ul)

      setFase('')
      setEstado('listo')
    } catch (err) {
      console.error('MedidorVelocidad', err)
      if (!cancelRef.current) {
        setEstado('error')
        setFase('')
      }
    }
  }

  useEffect(() => {
    correr()
    return () => { cancelRef.current = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const midiendo = estado === 'midiendo'

  return (
    <div className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-[#141414] dark:to-[#0a0a0a] px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col items-center text-center">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-white/45">
          Tu velocidad de internet es de
        </p>

        <div className="mt-3 flex items-end justify-center gap-2 min-h-[4.5rem]">
          <span
            className={`font-bold tabular-nums leading-none text-gray-900 dark:text-white transition-all ${
              midiendo ? 'text-5xl sm:text-6xl opacity-90' : 'text-6xl sm:text-7xl'
            }`}
          >
            {download == null ? (midiendo ? '…' : '—') : formatMbps(download)}
          </span>
          <span className="pb-1.5 text-base sm:text-lg font-semibold text-gray-500 dark:text-white/50">
            Mbps
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-white/45 min-h-[1rem]">
          {estado === 'error'
            ? 'No se pudo medir. Revisa tu conexión e inténtalo de nuevo.'
            : midiendo
              ? fase || 'Midiendo…'
              : 'Método Fast.com · servidores Netflix'}
        </p>

        {(proveedor || ubicacion) && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 max-w-md w-full">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/40">
              Proveedor
            </p>
            <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">
              {proveedor || '—'}
            </p>
            {ubicacion && (
              <p className="text-[11px] text-gray-500 dark:text-white/45 mt-0.5">{ubicacion}</p>
            )}
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md">
          <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 px-2 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/40">DNS Google</p>
            <p className="mt-0.5 text-sm sm:text-base font-bold text-gray-900 dark:text-white tabular-nums">
              {latencia == null ? '—' : `${latencia}`}
              <span className="ml-0.5 text-[10px] font-semibold text-gray-400">ms</span>
            </p>
            <p className="text-[9px] text-gray-400 dark:text-white/35 mt-0.5">8.8.8.8</p>
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 px-2 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/40">Descarga</p>
            <p className="mt-0.5 text-sm sm:text-base font-bold text-gray-900 dark:text-white tabular-nums">
              {download == null ? '—' : formatMbps(download)}
              <span className="ml-0.5 text-[10px] font-semibold text-gray-400">Mbps</span>
            </p>
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 px-2 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-white/40">Carga</p>
            <p className="mt-0.5 text-sm sm:text-base font-bold text-gray-900 dark:text-white tabular-nums">
              {upload == null ? '—' : formatMbps(upload)}
              <span className="ml-0.5 text-[10px] font-semibold text-gray-400">Mbps</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={correr}
          disabled={midiendo}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white dark:!bg-[#f5f5f0] dark:!text-gray-900 text-xs sm:text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
        >
          {midiendo ? (
            <>
              <Activity size={15} className="animate-pulse" />
              Midiendo…
            </>
          ) : (
            <>
              <RotateCcw size={15} />
              Volver a medir
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default MedidorVelocidad
