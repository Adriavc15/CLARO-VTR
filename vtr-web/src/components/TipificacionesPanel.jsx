import React, { useMemo, useState, useEffect } from 'react'
import { ClipboardList, Download, Trash2, Search, Copy, ChevronDown, ChevronUp, RefreshCw, ShieldAlert } from 'lucide-react'
import {
  cargarTipificacionesLocal,
  sincronizarTipificaciones,
  eliminarTipificacion,
  exportarTipificacionesCsv,
  exportarTipificacionesExcel,
  TIPOS_TIPIFICACION,
  labelCampo,
  partesFechaHora,
  entradasCamposOrdenadas,
  urlCapturaTipificacion,
} from '../tipificacionesStore'
import { useMessengerAuth, entrarConGoogle } from '../messengerAuth'
import AvatarPerfilPicker from './AvatarPerfilPicker'
import BotonGoogle from './BotonGoogle'

const CAMPOS_ANCHO_COMPLETO = new Set([
  'inconveniente',
  'solucion',
  'observacion',
  'incidencia',
  'accion',
])

/** Columnas compactas en tabla; el resto en el detalle. */
const COLS_TABLA = ['asesor', 'rutCliente', 'incidencia', 'accion', 'capturaUrl']

function tituloPlantilla(item) {
  const primera = String(item.texto || '')
    .split('\n')
    .map((l) => l.trim())
    .find(Boolean)
  if (primera && primera.length < 80 && !primera.includes(':')) return primera
  return item.tipoLabel || item.tipo || 'Tipificación'
}

function FichaTipificacion({ item }) {
  const filas = entradasCamposOrdenadas(item.campos).filter(([k]) => k !== 'capturaUrl')
  const captura = urlCapturaTipificacion(item)
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 p-3 sm:p-4">
      <p className="text-sm font-bold tracking-wide text-gray-900 dark:text-gray-100 mb-3">
        {tituloPlantilla(item)}
      </p>
      {filas.length ? (
        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
          {filas.map(([k, v]) => {
            const anchoCompleto =
              CAMPOS_ANCHO_COMPLETO.has(k) || String(v).includes('\n') || String(v).length > 90
            return (
              <div key={k} className={anchoCompleto ? 'sm:col-span-2 lg:col-span-3' : undefined}>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {labelCampo(k)}
                </dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words mt-0.5">
                  {String(v)}
                </dd>
              </div>
            )
          })}
        </dl>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">—</p>
      )}
      {captura && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Captura
          </p>
          <a href={captura} target="_blank" rel="noopener noreferrer" className="inline-block">
            <img
              src={captura}
              alt="Captura tipificación"
              className="max-h-56 max-w-full rounded-lg border border-gray-200 dark:border-gray-600 object-contain bg-gray-50 dark:bg-gray-900"
            />
          </a>
        </div>
      )}
    </div>
  )
}

/**
 * Bloc personal tipo Excel: solo las tipificaciones del asesor.
 *
 * La identidad NO se toma del portal (`lectorEmail` viene de localStorage y se
 * puede editar a mano), sino de la sesión de Google. Las reglas de Firestore
 * exigen que el documento se llame exactamente como el correo de la sesión, así
 * que mostrar el bloc de otro_compañero ya no es posible ni desde la consola.
 */
export default function TipificacionesPanel({
  firebaseApp = null,
  refreshKey = 0,
  db = null,
  avatarUrl = '',
  avataresUsados = [],
  onCambiarFoto,
  onElegirAvatar,
  onToast,
}) {
  const [items, setItems] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('Todas')
  const [q, setQ] = useState('')
  const [abiertos, setAbiertos] = useState({})
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [authError, setAuthError] = useState('')
  const [entrando, setEntrando] = useState(false)

  const { auth, user, email: correoSesion, verificado, cargando: cargandoAuth } = useMessengerAuth(firebaseApp)

  // Sesión utilizable: correo del dominio confirmado por Google. No basta con
  // que `user` exista, porque un dominio ajeno o sin verificar no puede leer
  // ni escribir su propio bloc (las reglas lo rechazan).
  const correoApex = useMemo(
    () => (verificado && correoSesion ? correoSesion : ''),
    [verificado, correoSesion]
  )
  const sesionInvalida = !cargandoAuth && !!user && !correoApex

  const entrar = async () => {
    setAuthError('')
    setEntrando(true)
    try {
      await entrarConGoogle(auth, db)
      // Si el login volvió por redirect no hay usuario todavía: `onAuthStateChanged`
      // repinta el panel en cuanto la sesión quede activa.
    } catch (err) {
      setAuthError(err?.message || 'No se pudo iniciar sesión con Google')
    } finally {
      setEntrando(false)
    }
  }

  const recargar = async () => {
    if (!correoApex) {
      setItems([])
      return
    }
    setItems(cargarTipificacionesLocal(correoApex))
    setSyncing(true)
    setSyncMsg('')
    try {
      const data = await sincronizarTipificaciones(correoApex, db)
      setItems(data)
      setSyncMsg(db ? 'Bloc sincronizado' : 'Guardado en este equipo')
    } catch (err) {
      setSyncMsg('Mostrando copia local')
      console.warn(err)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    recargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correoApex, refreshKey, db])

  const filtrados = useMemo(() => {
    let list = items
    if (filtroTipo !== 'Todas') {
      list = list.filter((t) => t.tipo === filtroTipo)
    }
    const needle = q.trim().toLowerCase()
    if (needle) {
      list = list.filter((t) => {
        const blob = `${t.tipoLabel} ${t.texto} ${JSON.stringify(t.campos)}`.toLowerCase()
        return blob.includes(needle)
      })
    }
    return list
  }, [items, filtroTipo, q])

  const columnasVisibles = useMemo(() => {
    const present = new Set()
    for (const t of filtrados) {
      for (const k of COLS_TABLA) {
        if (k === 'capturaUrl') {
          if (urlCapturaTipificacion(t)) present.add(k)
          continue
        }
        const v = t.campos?.[k]
        if (v !== undefined && v !== null && String(v).trim() !== '') present.add(k)
      }
    }
    return COLS_TABLA.filter((k) => present.has(k))
  }, [filtrados])

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta tipificación de tu bloc personal?')) return
    const next = await eliminarTipificacion(correoApex, id, db)
    setItems(next)
  }

  const copiar = (texto) => {
    navigator.clipboard
      .writeText(texto || '')
      .then(() => window.alert('Tipificación copiada'))
      .catch(() => window.alert('No se pudo copiar'))
  }

  const toggle = (id) => setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }))

  if (!correoApex) {
    return (
      <div className="w-full flex-1 min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center text-center">
        <ClipboardList className="text-emerald-600 dark:text-emerald-400 mb-3" size={32} />
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          {sesionInvalida ? 'Esa cuenta no puede ver tipificaciones' : 'Mi bloc de tipificaciones'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
          {sesionInvalida ? (
            <>
              Iniciaste sesión como <span className="font-semibold">{correoSesion || 'otra cuenta'}</span>, pero
              hace falta una cuenta de Google con <span className="font-semibold">correo corporativo verificado</span>{' '}
              que esté registrada en el portal.
            </>
          ) : cargandoAuth ? (
            'Comprobando tu sesión…'
          ) : (
            <>
              Tu bloc es privado. Inicia sesión con tu cuenta de Google{' '}
              <span className="font-semibold">corporativa</span> y solo verás las tipificaciones asociadas a ese
              correo, no las de ningún compañero.
            </>
          )}
        </p>
        {authError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400 inline-flex items-center gap-1.5">
            <ShieldAlert size={15} className="shrink-0" />
            {authError}
          </p>
        )}
        <div className="mt-6 w-64 max-w-full">
          <BotonGoogle onClick={entrar} entrando={entrando} disabled={sesionInvalida} />
        </div>
      </div>
    )
  }

  const stamp = new Date().toISOString().slice(0, 10)
  const archivoBase = `tipificaciones_${correoApex.split('@')[0]}_${stamp}`
  const inicial = String(correoApex).charAt(0).toUpperCase()
  const colSpanDetalle = 3 + columnasVisibles.length + 1

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-5 space-y-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <AvatarPerfilPicker
            avatarUrl={avatarUrl}
            avataresUsados={avataresUsados}
            onCambiarFoto={onCambiarFoto}
            onElegirAvatar={onElegirAvatar}
            onToast={onToast}
            size="sm"
            menuAlign="left"
            fallback={<span className="text-sm font-bold leading-none">{inicial}</span>}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Mi bloc de tipificaciones
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all">
              Personal de{' '}
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">{correoApex}</span>
              <span className="hidden sm:inline"> · sesión de Google, solo tú puedes abrirlo</span>
            </p>
            {(syncing || syncMsg) && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                {syncing && <RefreshCw size={12} className="animate-spin shrink-0" />}
                {syncing ? 'Sincronizando…' : syncMsg}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <button
            type="button"
            onClick={recargar}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 font-medium"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => exportarTipificacionesExcel(filtrados, `${archivoBase}.xls`)}
            disabled={!filtrados.length}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 font-medium"
          >
            <Download size={14} />
            Excel
          </button>
          <button
            type="button"
            onClick={() => exportarTipificacionesCsv(filtrados, `${archivoBase}.csv`)}
            disabled={!filtrados.length}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 font-medium dark:bg-gray-700"
          >
            <Download size={14} />
            CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
        <div className="relative min-w-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar RUT, incidencia…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-emerald-500"
        >
          <option value="Todas">Todas ({items.length})</option>
          {Object.entries(TIPOS_TIPIFICACION).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {!filtrados.length ? (
        <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
          Aún no hay tipificaciones en tu bloc. Completa una plantilla y pulsa <strong>Enviar</strong>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-left text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-2.5 py-2 font-semibold w-[88px]">Fecha</th>
                <th className="px-2.5 py-2 font-semibold w-[72px]">Hora</th>
                <th className="px-2.5 py-2 font-semibold w-[120px]">Tipo</th>
                {columnasVisibles.map((k) => (
                  <th key={k} className={`px-2.5 py-2 font-semibold ${k === 'capturaUrl' ? 'w-[72px]' : ''}`}>
                    {labelCampo(k)}
                  </th>
                ))}
                <th className="px-2.5 py-2 font-semibold w-[96px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtrados.map((t) => {
                const abierto = !!abiertos[t.id]
                const { fecha, hora } = partesFechaHora(t.creado)
                return (
                  <React.Fragment key={t.id}>
                    <tr className="align-top hover:bg-gray-50/80 dark:hover:bg-gray-900/40">
                      <td className="px-2.5 py-2 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                        {fecha || '—'}
                      </td>
                      <td className="px-2.5 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {hora || '—'}
                      </td>
                      <td className="px-2.5 py-2">
                        <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 truncate max-w-full">
                          {t.tipoLabel || t.tipo}
                        </span>
                      </td>
                      {columnasVisibles.map((k) => {
                        if (k === 'capturaUrl') {
                          const cap = urlCapturaTipificacion(t)
                          return (
                            <td key={k} className="px-2.5 py-2">
                              {cap ? (
                                <a
                                  href={cap}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block"
                                  title="Ver captura"
                                >
                                  <img
                                    src={cap}
                                    alt=""
                                    className="h-9 w-12 object-cover rounded border border-gray-200 dark:border-gray-600"
                                  />
                                </a>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">—</span>
                              )}
                            </td>
                          )
                        }
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
                      <td className="px-1.5 py-2">
                        <div className="flex gap-0.5">
                          <button
                            type="button"
                            title={abierto ? 'Ocultar' : 'Ver detalle'}
                            onClick={() => toggle(t.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            {abierto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                          <button
                            type="button"
                            title="Copiar"
                            onClick={() => copiar(t.texto)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={() => eliminar(t.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {abierto && (
                      <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                        <td colSpan={colSpanDetalle} className="px-3 py-3">
                          <FichaTipificacion item={t} />
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
  )
}
