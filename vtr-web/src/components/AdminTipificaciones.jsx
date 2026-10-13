import React, { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Download, RefreshCw, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import {
  listarTipificacionesAdmin,
  exportarTipificacionesCsv,
  exportarTipificacionesExcel,
  TIPOS_TIPIFICACION,
  labelCampo,
  partesFechaHora,
  entradasCamposOrdenadas,
  urlCapturaTipificacion,
} from '../tipificacionesStore'

/** Columnas compactas en tabla (el resto va en el detalle expandido). */
const COLS_TABLA = ['asesor', 'rutCliente', 'incidencia', 'accion']

/**
 * Panel admin: tipificaciones guardadas por usuarios @apexamerica.com (con capturas).
 */
export default function AdminTipificaciones({ db = null, onToast }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('Todas')
  const [filtroEmail, setFiltroEmail] = useState('')
  const [q, setQ] = useState('')
  const [abiertos, setAbiertos] = useState({})
  const [soloConCaptura, setSoloConCaptura] = useState(false)

  const cargar = async () => {
    if (!db) {
      setItems([])
      onToast?.('Firestore no disponible')
      return
    }
    setLoading(true)
    try {
      const data = await listarTipificacionesAdmin(db, { dominio: 'apexamerica.com' })
      setItems(data)
    } catch (err) {
      console.error(err)
      onToast?.(
        err?.message || 'No se pudieron cargar las tipificaciones (¿reglas list = admin?).'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const emails = useMemo(() => {
    const set = new Set(items.map((t) => t.email).filter(Boolean))
    return [...set].sort()
  }, [items])

  const filtrados = useMemo(() => {
    let list = items
    if (filtroTipo !== 'Todas') list = list.filter((t) => t.tipo === filtroTipo)
    if (filtroEmail) list = list.filter((t) => t.email === filtroEmail)
    if (soloConCaptura) list = list.filter((t) => urlCapturaTipificacion(t))
    const needle = q.trim().toLowerCase()
    if (needle) {
      list = list.filter((t) => {
        const blob = `${t.email} ${t.tipoLabel} ${t.texto} ${JSON.stringify(t.campos)}`.toLowerCase()
        return blob.includes(needle)
      })
    }
    return list
  }, [items, filtroTipo, filtroEmail, soloConCaptura, q])

  const columnasVisibles = useMemo(() => {
    const present = new Set()
    for (const t of filtrados) {
      for (const k of COLS_TABLA) {
        const v = t.campos?.[k]
        if (v !== undefined && v !== null && String(v).trim() !== '') present.add(k)
      }
    }
    return COLS_TABLA.filter((k) => present.has(k))
  }, [filtrados])

  const stamp = new Date().toISOString().slice(0, 10)
  const archivoBase = `tipificaciones_apexamerica_${stamp}`
  const colSpanDetalle = 5 + columnasVisibles.length + 1

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ClipboardList className="text-emerald-600 shrink-0" size={22} />
              Tipificaciones Apex
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Registros de <strong>@apexamerica.com</strong> (Genesys + capturas).
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <button
              type="button"
              onClick={cargar}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => exportarTipificacionesExcel(filtrados, `${archivoBase}.xls`)}
              disabled={!filtrados.length}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full bg-emerald-600 text-white font-medium disabled:opacity-50"
            >
              <Download size={14} />
              Excel
            </button>
            <button
              type="button"
              onClick={() => exportarTipificacionesCsv(filtrados, `${archivoBase}.csv`)}
              disabled={!filtrados.length}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full bg-gray-800 text-white font-medium disabled:opacity-50 dark:bg-gray-700"
            >
              <Download size={14} />
              CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar…"
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
            />
          </div>
          <select
            value={filtroEmail}
            onChange={(e) => setFiltroEmail(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm min-w-0"
          >
            <option value="">Correos ({emails.length})</option>
            {emails.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          >
            <option value="Todas">Todas ({items.length})</option>
            {Object.entries(TIPOS_TIPIFICACION).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 px-1">
            <input
              type="checkbox"
              checked={soloConCaptura}
              onChange={(e) => setSoloConCaptura(e.target.checked)}
              className="rounded border-gray-300"
            />
            Solo con captura
          </label>
        </div>

        {loading && !items.length ? (
          <p className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">Cargando tipificaciones…</p>
        ) : !filtrados.length ? (
          <p className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
            No hay tipificaciones de @apexamerica.com{soloConCaptura ? ' con captura' : ''}.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-gray-50 dark:bg-gray-900/60 text-left text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="px-2.5 py-2 font-semibold w-[88px]">Fecha</th>
                  <th className="px-2.5 py-2 font-semibold w-[72px]">Hora</th>
                  <th className="px-2.5 py-2 font-semibold w-[28%]">Correo</th>
                  <th className="px-2.5 py-2 font-semibold w-[110px]">Tipo</th>
                  <th className="px-2.5 py-2 font-semibold w-[72px]">Captura</th>
                  {columnasVisibles.map((k) => (
                    <th key={k} className="px-2.5 py-2 font-semibold">
                      {labelCampo(k)}
                    </th>
                  ))}
                  <th className="px-2.5 py-2 font-semibold w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtrados.map((t) => {
                  const abierto = !!abiertos[t.id]
                  const { fecha, hora } = partesFechaHora(t.creado)
                  const cap = urlCapturaTipificacion(t)
                  const correoCorto = String(t.email || '').split('@')[0]
                  return (
                    <React.Fragment key={`${t.email}-${t.id}`}>
                      <tr className="align-top hover:bg-gray-50/80 dark:hover:bg-gray-900/40">
                        <td className="px-2.5 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs">
                          {fecha || '—'}
                        </td>
                        <td className="px-2.5 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                          {hora || '—'}
                        </td>
                        <td className="px-2.5 py-2 text-emerald-700 dark:text-emerald-300 font-medium">
                          <span className="block truncate" title={t.email}>
                            {correoCorto}
                          </span>
                        </td>
                        <td className="px-2.5 py-2">
                          <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 truncate max-w-full">
                            {t.tipoLabel || t.tipo}
                          </span>
                        </td>
                        <td className="px-2.5 py-2">
                          {cap ? (
                            <a
                              href={cap}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5"
                              title="Abrir captura"
                            >
                              <img
                                src={cap}
                                alt=""
                                className="h-9 w-12 object-cover rounded border border-gray-200 dark:border-gray-600"
                              />
                              <ExternalLink size={12} className="text-gray-400 dark:text-gray-500 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">—</span>
                          )}
                        </td>
                        {columnasVisibles.map((k) => {
                          const val = t.campos?.[k]
                          const texto =
                            val !== undefined && val !== null && String(val).trim() !== ''
                              ? String(val)
                              : '—'
                          return (
                            <td
                              key={k}
                              className="px-2.5 py-2 text-gray-800 dark:text-gray-100"
                              title={texto !== '—' ? texto : undefined}
                            >
                              <span className="line-clamp-2 break-words text-xs">{texto}</span>
                            </td>
                          )
                        })}
                        <td className="px-1 py-2">
                          <button
                            type="button"
                            onClick={() => setAbiertos((p) => ({ ...p, [t.id]: !p[t.id] }))}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                            title="Ver detalle"
                          >
                            {abierto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </td>
                      </tr>
                      {abierto && (
                        <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                          <td colSpan={colSpanDetalle} className="px-3 py-3">
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 p-3 sm:p-4 space-y-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                                {t.email} · {t.tipoLabel || t.tipo}
                              </p>
                              <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {entradasCamposOrdenadas(t.campos)
                                  .filter(([k]) => k !== 'capturaUrl')
                                  .map(([k, v]) => (
                                    <div key={k}>
                                      <dt className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                                        {labelCampo(k)}
                                      </dt>
                                      <dd className="text-sm whitespace-pre-wrap break-words">
                                        {String(v)}
                                      </dd>
                                    </div>
                                  ))}
                              </dl>
                              {cap && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                                    Captura
                                  </p>
                                  <a href={cap} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={cap}
                                      alt="Captura"
                                      className="max-h-56 max-w-full rounded-lg border border-gray-200 dark:border-gray-600 object-contain"
                                    />
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
