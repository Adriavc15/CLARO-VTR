import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { buscarTipificaciones, totalMotivos } from '../tipificacionesCatalogo'

const INPUT =
  'w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'

/**
 * Buscador de tipificaciones (RAZÓN > SERVICIO > MOTIVO) de la Plantilla General.
 * Al elegir un caso, `onElegir(fila)` recibe la fila del catálogo
 * ({ razon, servicio, motivo, descripcion, ruta }).
 */
export default function BuscadorTipificacion({ onElegir = () => {}, autoFocus = false, className = '' }) {
  const [q, setQ] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(0)
  const cajaRef = useRef(null)

  const sugeridos = useMemo(() => {
    const texto = q.trim()
    if (!texto) return []
    return buscarTipificaciones(texto, 400).slice(0, 12)
  }, [q])

  useEffect(() => {
    const onClickFuera = (e) => {
      if (cajaRef.current && !cajaRef.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', onClickFuera)
    return () => document.removeEventListener('mousedown', onClickFuera)
  }, [])

  useEffect(() => setActivo(0), [q])

  const elegir = (fila) => {
    onElegir(fila)
    setQ('')
    setAbierto(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setAbierto(false)
      return
    }
    if (!sugeridos.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAbierto(true)
      setActivo((n) => (n + 1) % sugeridos.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAbierto(true)
      setActivo((n) => (n - 1 + sugeridos.length) % sugeridos.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (sugeridos[activo]) elegir(sugeridos[activo])
    }
  }

  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Tipificación · busca Razón / Servicio / Motivo
      </label>
      <div className="relative" ref={cajaRef}>
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={q}
          autoComplete="off"
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value)
            setAbierto(true)
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={onKeyDown}
          placeholder={`Escribe y elige entre ${totalMotivos()} motivos: sin internet, pixeleo, baja, deuda…`}
          className={`${INPUT} pl-9`}
          aria-label="Buscar tipificación"
          role="combobox"
          aria-expanded={abierto}
        />
        {abierto && q.trim() && (
          <ul className="absolute z-30 mt-1 max-h-96 w-full divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
            {sugeridos.length === 0 && (
              <li className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                Sin coincidencias para “{q.trim()}”.
              </li>
            )}
            {sugeridos.map((f, i) => (
              <li key={f.ruta}>
                <button
                  type="button"
                  title={f.ruta}
                  onMouseEnter={() => setActivo(i)}
                  onClick={() => elegir(f)}
                  className={`flex w-full flex-col gap-1 px-3 py-2.5 text-left transition ${
                    i === activo ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                  }`}
                >
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {f.nombreAmigable}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      {f.razon}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        f.destino === 'solucion'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                      }`}
                    >
                      {f.destino === 'solucion' ? 'Solución' : 'Inconveniente'}
                    </span>
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Servicio:{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {f.servicioAmigable}
                    </span>
                  </span>
                  {f.descripcion && (
                    <span className="text-xs leading-snug text-gray-600 dark:text-gray-300">
                      {f.descripcion}
                    </span>
                  )}
                  {f.uso && (
                    <span className="text-[11px] italic leading-snug text-gray-400 dark:text-gray-500">
                      {f.uso}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
