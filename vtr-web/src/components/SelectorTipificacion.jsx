import React, { useMemo, useState } from 'react'
import { Search, Copy, CheckCircle2, AlertTriangle } from 'lucide-react'
import {
  RAZONES_CATALOGO,
  serviciosDeRazon,
  motivosDeServicio,
  descripcionMotivo,
  rutaTipificacion,
  buscarTipificaciones,
  existeMotivo,
  totalMotivos,
} from '../tipificacionesCatalogo'

const PLACEHOLDER =
  'w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'

/**
 * Selector de tipificación en cascada: RAZÓN > SERVICIO > MOTIVO.
 *
 * Controlled: recibe el `form` de la plantilla y su `update(key)` para que el
 * valor quede en `campos.razon / campos.servicioTipif / campos.motivo`, que el
 * store ya exporta como columnas del bloc.
 */
export default function SelectorTipificacion({
  form = {},
  update = () => {},
  conDetalle = true,
  inputClass = '',
  className = '',
}) {
  const [q, setQ] = useState('')
  const [copiado, setCopiado] = useState(false)

  const razon = form.razon || ''
  const servicio = form.servicioTipif || ''
  const motivo = form.motivo || ''

  const servicios = useMemo(() => serviciosDeRazon(razon), [razon])
  const motivos = useMemo(() => motivosDeServicio(razon, servicio), [razon, servicio])
  const ayuda = useMemo(() => descripcionMotivo(razon, servicio, motivo), [razon, servicio, motivo])
  const sugeridos = useMemo(
    () => (q.trim() ? buscarTipificaciones(q, 60) : []),
    [q]
  )

  const setRazon = (e) => {
    const value = e.target.value
    update('razon')(e)
    update('servicioTipif')({ target: { value: '' } })
    update('motivo')({ target: { value: '' } })
    if (!value) update('detalleRazon')({ target: { value: '' } })
  }
  const setServicio = (e) => {
    update('servicioTipif')(e)
    update('motivo')({ target: { value: '' } })
  }

  const elegirSugerido = (fila) => {
    update('razon')({ target: { value: fila.razon } })
    update('servicioTipif')({ target: { value: fila.servicio } })
    update('motivo')({ target: { value: fila.motivo } })
    setQ('')
  }

  const limpiar = () => {
    update('razon')({ target: { value: '' } })
    update('servicioTipif')({ target: { value: '' } })
    update('motivo')({ target: { value: '' } })
    update('detalleRazon')({ target: { value: '' } })
    setQ('')
  }

  const ruta = rutaTipificacion({ razon, servicio, motivo })
  const completa = existeMotivo(razon, servicio, motivo)
  const copiarruta = () => {
    if (!ruta) return
    navigator.clipboard
      .writeText(ruta)
      .then(() => {
        setCopiado(true)
        window.setTimeout(() => setCopiado(false), 1600)
      })
      .catch(() => window.alert('No se pudo copiar la ruta de tipificación'))
  }

  const sel = inputClass || PLACEHOLDER

  return (
    <div className={`rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 sm:p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          Tipificación (Razón / Servicio / Motivo)
        </p>
        <button
          type="button"
          onClick={limpiar}
          className="text-[11px] font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Limpiar
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
            Razón
          </label>
          <select value={razon} onChange={setRazon} className={sel}>
            <option value="">Selecciona…</option>
            {RAZONES_CATALOGO.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
            Servicio
          </label>
          <select
            value={servicio}
            onChange={setServicio}
            disabled={!razon}
            className={sel}
          >
            <option value="">{razon ? 'Selecciona…' : 'Elige una razón'}</option>
            {servicios.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
            Motivo
          </label>
          <select
            value={motivo}
            onChange={update('motivo')}
            disabled={!servicio}
            className={sel}
          >
            <option value="">{servicio ? 'Selecciona…' : 'Elige un servicio'}</option>
            {motivos.map((m) => (
              <option key={m.motivo} value={m.motivo}>
                {m.motivo.trim()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
          Buscar motivo ({totalMotivos()} disponibles)
        </label>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ej.: dbox no enciende, sin internet, baja, deuda…"
            className={`${sel} pl-9`}
          />
        </div>
        {sugeridos.length > 0 && (
          <ul className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
            {sugeridos.map((f) => (
              <li key={f.ruta}>
                <button
                  type="button"
                  onClick={() => elegirSugerido(f)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{f.motivo.trim()}</span>
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                    {f.razon} › {f.servicio}
                  </span>
                  {f.descripcion && (
                    <span className="block text-[11px] text-gray-400 dark:text-gray-500 truncate">
                      {f.descripcion}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {ruta && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {completa ? (
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          )}
          <span className="font-mono text-gray-700 dark:text-gray-300 break-all">{ruta}</span>
          {!completa && (
            <span className="text-amber-600 dark:text-amber-400">
              (combinación fuera del catálogo, se guardará igual)
            </span>
          )}
          <button
            type="button"
            onClick={copiarruta}
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
          >
            <Copy size={13} />
            {copiado ? 'Ruta copiada' : 'Copiar ruta'}
          </button>
        </div>
      )}

      {ayuda && (
        <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 italic">{ayuda}</p>
      )}

      {conDetalle && (
        <div className="mt-3">
          <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 block">
            Detalle de la razón (opcional)
          </label>
          <textarea
            rows={2}
            value={form.detalleRazon || ''}
            onChange={update('detalleRazon')}
            placeholder="Contexto corto del caso, ID de ticket, etc."
            className={sel}
          />
        </div>
      )}
    </div>
  )
}
