import React, { useEffect, useState } from 'react'
import { Brain, Check, Loader2, RefreshCw, X, Pencil } from 'lucide-react'
import {
  listarCandidatosPendientes,
  metricasAprendizaje,
  aprobarCandidato,
  rechazarCandidato,
  actualizarCandidatoBorrador,
  UMBRAL_CONFIANZA,
} from '../asistente/aprendizajeContinuo'

/**
 * Candidatos de baja confianza → aprobar / editar / rechazar.
 * `embedded`: se usa dentro de Conocimiento IA (sin título de página).
 */
export default function AdminAprendizajeContinuo({ db, onToast, embedded, onCambio }) {
  const [lista, setLista] = useState([])
  const [metricas, setMetricas] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [editId, setEditId] = useState(null)
  const [borrador, setBorrador] = useState({ preguntaCanon: '', respuesta: '' })
  const [busyId, setBusyId] = useState(null)

  const toast = (m) => onToast?.(m)

  const refrescar = async () => {
    if (!db) return
    setCargando(true)
    try {
      const [cands, met] = await Promise.all([listarCandidatosPendientes(db, 50), metricasAprendizaje(db)])
      setLista(cands)
      setMetricas(met)
    } catch (e) {
      toast(e?.message || 'No se pudo cargar el aprendizaje')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    refrescar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const abrirEditar = (c) => {
    setEditId(c.id)
    setBorrador({
      preguntaCanon: c.preguntaCanon || '',
      respuesta: c.respuesta_propuesta || '',
    })
  }

  const guardarBorrador = async (c) => {
    setBusyId(c.id)
    try {
      await actualizarCandidatoBorrador(db, c.id, {
        preguntaCanon: borrador.preguntaCanon,
        respuesta_propuesta: borrador.respuesta,
      })
      toast('Borrador guardado')
      setEditId(null)
      await refrescar()
    } catch (e) {
      toast(e?.message || 'No se pudo guardar')
    } finally {
      setBusyId(null)
    }
  }

  const onAprobar = async (c) => {
    const resp = editId === c.id ? borrador.respuesta : c.respuesta_propuesta
    const titulo = editId === c.id ? borrador.preguntaCanon : c.preguntaCanon
    if (!String(resp || '').trim()) {
      toast('Escribe/edita una respuesta antes de aprobar (no se publica vacío)')
      abrirEditar(c)
      return
    }
    if (!window.confirm('¿Aprobar e incorporar a la base oficial de la IA?')) return
    setBusyId(c.id)
    try {
      const res = await aprobarCandidato(db, c, { titulo, respuesta: resp })
      toast(`Aprobado → entra al corpus (${res.conocimientoId})`)
      setEditId(null)
      await refrescar()
      onCambio?.()
    } catch (e) {
      toast(e?.message || 'No se pudo aprobar')
    } finally {
      setBusyId(null)
    }
  }

  const onRechazar = async (c) => {
    if (!window.confirm('¿Rechazar este candidato?')) return
    setBusyId(c.id)
    try {
      await rechazarCandidato(db, c.id, 'rechazado_por_admin')
      toast('Rechazado')
      await refrescar()
      onCambio?.()
    } catch (e) {
      toast(e?.message || 'No se pudo rechazar')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain size={20} className="text-violet-600" />
              {embedded ? 'Lo que el chat no supo' : 'Aprendizaje continuo'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              {embedded
                ? `Preguntas con confianza menor a ${UMBRAL_CONFIANZA}. Si las apruebas, entran al mismo corpus que los procedimientos. Precios y planes no se publican solos.`
                : `Se registran preguntas y se detectan las de baja confianza (< ${UMBRAL_CONFIANZA}). Solo entran a la base oficial si tú las apruebas. Precios y planes no se inventan solos.`}
            </p>
          </div>
          <button
            type="button"
            onClick={refrescar}
            disabled={cargando}
            className="px-4 py-2 rounded-full text-sm font-bold bg-violet-700 hover:bg-violet-600 text-white flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {cargando ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Actualizar
          </button>
        </div>

        {metricas && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
            {[
              ['Preguntas (muestra)', metricas.preguntasRecibidas],
              ['Respondidas', metricas.respondidas],
              ['Sin / baja confianza', metricas.sinRespuesta],
              ['Pendientes revisión', metricas.pendientesRevision],
              ['Aprobados', metricas.conocimientoAprobado],
              ['Rechazados', metricas.rechazados],
            ].map(([label, val]) => (
              <div key={label} className="rounded-xl bg-gray-50 dark:bg-gray-900/60 px-3 py-2 border border-gray-100 dark:border-gray-700">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{val ?? '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          Candidatos pendientes ({lista.length})
        </h3>
        {cargando && !lista.length ? (
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Cargando…
          </p>
        ) : !lista.length ? (
          <p className="text-sm text-gray-400">No hay candidatos pendientes. Cuando el chat no sepa, aparecerán aquí.</p>
        ) : (
          <ul className="space-y-4">
            {lista.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/80 dark:bg-gray-900/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                      {c.categoria_detectada || 'general'} · freq {c.frecuencia || 1} · conf{' '}
                      {typeof c.confidence_last === 'number' ? c.confidence_last.toFixed(2) : '—'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {c.preguntaCanon}
                    </p>
                  </div>
                </div>
                {Array.isArray(c.variantes) && c.variantes.length > 1 && (
                  <p className="text-xs text-gray-500 mb-2">
                    Variantes: {c.variantes.slice(0, 8).join(' · ')}
                    {c.variantes.length > 8 ? '…' : ''}
                  </p>
                )}

                {editId === c.id ? (
                  <div className="space-y-2 mb-3">
                    <input
                      value={borrador.preguntaCanon}
                      onChange={(e) => setBorrador((b) => ({ ...b, preguntaCanon: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                      placeholder="Pregunta canónica"
                    />
                    <textarea
                      value={borrador.respuesta}
                      onChange={(e) => setBorrador((b) => ({ ...b, respuesta: e.target.value }))}
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                      placeholder="Respuesta validada (obligatoria para aprobar)"
                    />
                    <button
                      type="button"
                      onClick={() => guardarBorrador(c)}
                      className="text-xs font-bold text-violet-700 hover:underline"
                    >
                      Guardar borrador
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                    {c.respuesta_propuesta || (
                      <span className="italic text-amber-600">Sin respuesta propuesta — edítala antes de aprobar.</span>
                    )}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === c.id}
                    onClick={() => onAprobar(c)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 disabled:opacity-60"
                  >
                    {busyId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() => (editId === c.id ? setEditId(null) : abrirEditar(c))}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 flex items-center gap-1"
                  >
                    <Pencil size={12} />
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={busyId === c.id}
                    onClick={() => onRechazar(c)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-600/90 hover:bg-red-500 text-white flex items-center gap-1 disabled:opacity-60"
                  >
                    <X size={12} />
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
