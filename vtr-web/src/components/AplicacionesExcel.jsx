import React, { useMemo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, Search, X, Link as LinkIcon, Copy, Check } from 'lucide-react'
import { APLICACIONES_EXCEL } from '../aplicacionesCatalogo'

function LogoApp({ src, nombre, size = 'md', url }) {
  const [stage, setStage] = useState(0) // 0=src, 1=favicon dominio, 2=placeholder
  const box =
    size === 'lg' ? 'w-20 h-20' : size === 'xl' ? 'w-28 h-28' : 'w-16 h-16 lg:w-20 lg:h-20'
  const img = size === 'xl' ? 'w-24 h-24' : 'w-14 h-14 lg:w-[4.5rem] lg:h-[4.5rem]'
  const icon = size === 'xl' ? 44 : size === 'lg' ? 34 : 30

  useEffect(() => {
    setStage(0)
  }, [src, url])

  const fallbackFromUrl = (() => {
    if (!url) return ''
    try {
      const host = new URL(url).hostname
      if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return ''
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`
    } catch {
      return ''
    }
  })()

  const finalSrc = stage === 0 ? src : stage === 1 ? fallbackFromUrl : ''

  if (!finalSrc || stage >= 2) {
    return (
      <span
        className={`${box} rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0`}
      >
        <LinkIcon size={icon} />
      </span>
    )
  }
  return (
    <span className={`${box} flex items-center justify-center shrink-0`}>
      <img
        src={finalSrc}
        alt={nombre}
        loading="lazy"
        className={`${img} object-contain drop-shadow-sm`}
        onError={() => setStage((s) => (s === 0 && fallbackFromUrl ? 1 : 2))}
      />
    </span>
  )
}

function AppModal({ app, onClose }) {
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!app) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [app, onClose])

  useEffect(() => {
    setCopiado(false)
  }, [app])

  if (!app) return null

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(app.url || '')
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden section-zoom">
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pt-8 pb-6 text-center bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/40 dark:to-gray-800">
          <div className="flex justify-center mb-4">
            <LogoApp src={app.logo} nombre={app.nombre} size="xl" url={app.url} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 mb-1">
            {app.seccion}
          </p>
          <h3 id="app-modal-title" className="text-xl font-bold text-gray-900 dark:text-gray-100 px-6">
            {app.nombre}
          </h3>
        </div>

        <div className="px-6 pt-5 pb-6 space-y-5 border-t border-gray-100 dark:border-gray-700/80">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mb-3">
              ¿PARA QUÉ SIRVE?
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap max-h-[42vh] overflow-y-auto pr-1">
              {app.paraQue}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-colors"
            >
              <ExternalLink size={18} />
              Abrir aplicación
            </a>
            <button
              type="button"
              onClick={copiar}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium text-sm"
            >
              {copiado ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
              {copiado ? 'Copiado' : 'Copiar link'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

/**
 * Apps circulares; al tocar se abre modal con descripción y Abrir.
 */
export default function AplicacionesExcel() {
  const [q, setQ] = useState('')
  const [filtroSeccion, setFiltroSeccion] = useState('Todas')
  const [seleccionada, setSeleccionada] = useState(null)

  const secciones = useMemo(() => APLICACIONES_EXCEL.map((s) => s.seccion), [])

  const grupos = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const lista = APLICACIONES_EXCEL.map((sec) => {
      if (filtroSeccion !== 'Todas' && sec.seccion !== filtroSeccion) return null
      const filas = sec.filas.filter((f) => {
        if (!needle) return true
        return `${f.nombre} ${f.url} ${f.paraQue} ${sec.seccion}`.toLowerCase().includes(needle)
      })
      if (!filas.length) return null
      return { seccion: sec.seccion, filas }
    }).filter(Boolean)

    // La sección más grande se muestra al final ocupando todo el ancho de la fila
    if (lista.length > 3 && filtroSeccion === 'Todas' && !needle) {
      let mayor = 0
      lista.forEach((g, i) => {
        if (g.filas.length > lista[mayor].filas.length) mayor = i
      })
      const [grande] = lista.splice(mayor, 1)
      lista.push({ ...grande, ancho: 'completo' })
    }
    return lista
  }, [q, filtroSeccion])

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Aplicaciones</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Toca una app para ver para qué sirve y abrirla
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar aplicación…"
              className="w-full pl-9 pr-3 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
            />
          </div>
          <select
            value={filtroSeccion}
            onChange={(e) => setFiltroSeccion(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          >
            <option value="Todas">Todas las secciones</option>
            {secciones.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!grupos.length ? (
        <div className="px-6 py-16 text-center text-sm text-gray-500">No hay aplicaciones para tu búsqueda.</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 items-start">
          {grupos.map((g) => {
            const completo = g.ancho === 'completo'
            return (
            <section
              key={g.seccion}
              className={`relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 pb-4 pt-7 lg:px-4 lg:pt-9 ${completo ? 'col-span-2 lg:col-span-3' : ''}`}
            >
              <p className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 max-w-[90%] truncate whitespace-nowrap rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-600 dark:text-gray-300">
                {g.seccion}
              </p>

              <div className={`grid gap-x-3 gap-y-4 justify-items-center ${completo ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {g.filas.map((f) => (
                  <button
                    key={`${g.seccion}-${f.nombre}`}
                    type="button"
                    onClick={() => setSeleccionada({ ...f, seccion: g.seccion })}
                    className="flex flex-col items-center gap-1.5 w-fit group cursor-pointer bg-transparent border-0 p-0"
                  >
                    <span className="transition-transform duration-300 group-hover:scale-110">
                      <LogoApp src={f.logo} nombre={f.nombre} url={f.url} />
                    </span>
                    <span className="text-[10px] lg:text-[11px] font-bold tracking-wide text-gray-900 dark:text-gray-100 leading-tight text-center max-w-24 lg:max-w-28">
                      {f.nombre}
                    </span>
                  </button>
                ))}
              </div>
            </section>
            )
          })}
        </div>
      )}

      <AppModal app={seleccionada} onClose={() => setSeleccionada(null)} />
    </div>
  )
}
