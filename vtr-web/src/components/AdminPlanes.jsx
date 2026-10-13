import React, { useEffect, useMemo, useState } from 'react'
import { CreditCard, Loader2, Pencil, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react'
import { PLANES_GRUPOS, PLANES_SEED, STREAM_OPTIONS, STREAM_PACKS, vacioPlan } from '../asistente/planesSeed'
import {
  cargarPlanes,
  eliminarPlan,
  guardarPlan,
  sincronizarPlanes,
} from '../asistente/planesLive'

const inputClass =
  'w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100'

export default function AdminPlanes({ db, onToast }) {
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [grupoFiltro, setGrupoFiltro] = useState('1p-internet')
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState(() => vacioPlan('1p-internet'))
  const [editandoId, setEditandoId] = useState('')

  const toast = (m) => onToast?.(m)

  const refrescar = async () => {
    setCargando(true)
    try {
      const docs = await cargarPlanes(db)
      setLista(docs)
    } catch (e) {
      toast(e?.message || 'No se pudieron cargar los planes')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    refrescar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const filtrados = useMemo(() => {
    const t = busqueda.trim().toLowerCase()
    return lista
      .filter((p) => p.grupo === grupoFiltro)
      .filter((p) => {
        if (!t) return true
        return `${p.comercial} ${p.andes} ${p.normal} ${p.promo}`.toLowerCase().includes(t)
      })
      .sort((a, b) => (a.orden || 0) - (b.orden || 0))
  }, [lista, grupoFiltro, busqueda])

  const setCampo = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  const toggleStream = (src) => {
    setForm((prev) => {
      const has = prev.streams.includes(src)
      return { ...prev, streams: has ? prev.streams.filter((s) => s !== src) : [...prev.streams, src] }
    })
  }

  const nuevo = () => {
    setEditandoId('')
    setForm(vacioPlan(grupoFiltro))
  }

  const cargarEnForm = (item) => {
    setEditandoId(item.id)
    setForm({ ...vacioPlan(item.grupo), ...item, streams: [...(item.streams || [])] })
  }

  const handleGrupoForm = (grupoId) => {
    const g = PLANES_GRUPOS.find((x) => x.id === grupoId) || PLANES_GRUPOS[0]
    setForm((prev) => ({ ...prev, grupo: g.id, tag: g.tag }))
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.comercial.trim()) {
      toast('El nombre comercial es obligatorio')
      return
    }
    setGuardando(true)
    try {
      const payload = { ...form }
      if (editandoId) payload.id = editandoId
      const saved = await guardarPlan(db, payload)
      toast(`Guardado: ${saved.comercial}`)
      setEditandoId(saved.id)
      setForm(saved)
      await refrescar()
    } catch (err) {
      toast(err?.message || 'No se pudo guardar el plan')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (item) => {
    if (!window.confirm(`¿Eliminar “${item.comercial}”?`)) return
    try {
      await eliminarPlan(db, item.id)
      toast(`Eliminado ${item.comercial}`)
      if (editandoId === item.id) nuevo()
      await refrescar()
    } catch (e) {
      toast(e?.message || 'No se pudo eliminar')
    }
  }

  const handleSyncSeed = async () => {
    if (syncing) return
    if (!window.confirm(`Esto carga ${PLANES_SEED.length} planes del catálogo actual a Firestore (no borra extras). ¿Continuar?`)) return
    setSyncing(true)
    try {
      const res = await sincronizarPlanes(db, PLANES_SEED)
      toast(`Catálogo publicado: ${res.total} planes`)
      await refrescar()
    } catch (e) {
      toast(e?.message || 'Error al publicar el catálogo')
    } finally {
      setSyncing(false)
    }
  }

  const esCable = form.grupo === 'cable'

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard size={20} className="text-teal-600" />
              Planes comerciales
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              Edita nombres, códigos Andes, precios, streaming y planes Cable. Los cambios se ven en la sección{' '}
              <strong>Planes</strong> del portal.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSyncSeed}
            disabled={syncing}
            className="px-4 py-2 rounded-full text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 cursor-pointer disabled:opacity-60 shadow"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Publicar catálogo inicial
          </button>
        </div>

        <form onSubmit={handleGuardar} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {editandoId ? 'Editando plan' : 'Nuevo plan'}
            </p>
            {editandoId && (
              <button type="button" onClick={nuevo} className="text-xs font-bold text-gray-500 flex items-center gap-1 cursor-pointer">
                <X size={14} /> Cancelar edición
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Grupo</label>
              <select
                value={form.grupo}
                onChange={(e) => handleGrupoForm(e.target.value)}
                className={inputClass}
              >
                {PLANES_GRUPOS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.tag} · {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Orden</label>
              <input
                type="number"
                value={form.orden}
                onChange={(e) => setCampo('orden', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Nombre comercial</label>
              <input
                value={form.comercial}
                onChange={(e) => setCampo('comercial', e.target.value)}
                placeholder="Fibra 600 Megas"
                required
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Nombre en Andes</label>
              <input
                value={form.andes}
                onChange={(e) => setCampo('andes', e.target.value)}
                placeholder="Fibra Hogar Residencial 0226F"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Precio normal</label>
              <input value={form.normal} onChange={(e) => setCampo('normal', e.target.value)} placeholder="$21.990" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Precio promo</label>
              <input value={form.promo} onChange={(e) => setCampo('promo', e.target.value)} placeholder="$14.990" className={inputClass} />
            </div>
            {esCable && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Canales</label>
                  <input value={form.canales} onChange={(e) => setCampo('canales', e.target.value)} placeholder="74 canales" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">HD</label>
                  <input value={form.hd} onChange={(e) => setCampo('hd', e.target.value)} placeholder="57 HD" className={inputClass} />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 mt-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.incluyeExtras}
                    onChange={(e) => setCampo('incluyeExtras', e.target.checked)}
                  />
                  Incluye extras de cable
                </label>
              </>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Streaming incluido</p>
              <button type="button" title="Pack Disney+" onClick={() => setCampo('streams', STREAM_PACKS.disney)} className="p-0 bg-transparent border-0 cursor-pointer">
                <img src="/stream/disney.png" alt="Disney+" className="h-6 w-6 object-contain" />
              </button>
              <button type="button" title="Pack Netflix" onClick={() => setCampo('streams', STREAM_PACKS.netflix)} className="p-0 bg-transparent border-0 cursor-pointer">
                <img src="/stream/netflix.png" alt="Netflix" className="h-6 w-6 object-contain" />
              </button>
              <button type="button" onClick={() => setCampo('streams', STREAM_PACKS.premiumI)} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 cursor-pointer">Premium I</button>
              <button type="button" onClick={() => setCampo('streams', STREAM_PACKS.premiumII)} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 cursor-pointer">Premium II</button>
              <button type="button" onClick={() => setCampo('streams', STREAM_PACKS.full)} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 cursor-pointer">Full</button>
              <button type="button" onClick={() => setCampo('streams', [])} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 cursor-pointer">Ninguno</button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {STREAM_OPTIONS.map((s) => {
                const on = form.streams.includes(s.src)
                return (
                  <button
                    type="button"
                    key={s.src}
                    title={s.name}
                    aria-label={s.name}
                    aria-pressed={on}
                    onClick={() => toggleStream(s.src)}
                    className="p-0 bg-transparent border-0 cursor-pointer"
                  >
                    <img
                      src={s.src}
                      alt={s.name}
                      className={`h-9 w-9 object-contain transition ${
                        on ? 'opacity-100 scale-110 drop-shadow-md' : 'opacity-40 hover:opacity-80'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
            >
              {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editandoId ? 'Guardar cambios' : 'Crear plan'}
            </button>
            <button
              type="button"
              onClick={nuevo}
              className="px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              Nuevo
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-4">
          {PLANES_GRUPOS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setGrupoFiltro(g.id)
                if (!editandoId) setForm(vacioPlan(g.id))
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap ${
                grupoFiltro === g.id
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              {g.tag} · {g.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {filtrados.length} plan{filtrados.length === 1 ? '' : 'es'}
          </h3>
          <div className="flex items-center gap-2">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar…"
              className="rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs w-44"
            />
            <button type="button" onClick={refrescar} className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1 cursor-pointer">
              {cargando ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Refrescar
            </button>
          </div>
        </div>

        <ul className="space-y-2 max-h-[520px] overflow-y-auto">
          {filtrados.map((item) => (
            <li
              key={item.id}
              className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                editandoId === item.id
                  ? 'border-teal-400 dark:border-teal-600 bg-teal-50/60 dark:bg-teal-900/20'
                  : 'border-gray-100 dark:border-gray-700'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.comercial}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{item.andes || 'Sin nombre Andes'}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Normal {item.normal || '—'}
                  {item.promo && item.promo !== item.normal ? ` · Promo ${item.promo}` : ''}
                  {item.canales ? ` · ${item.canales}` : ''}
                  {item.hd ? ` · ${item.hd}` : ''}
                </p>
                {(item.streams || []).length > 0 && (
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {item.streams.map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt={STREAM_OPTIONS.find((s) => s.src === src)?.name || ''}
                        title={STREAM_OPTIONS.find((s) => s.src === src)?.name || ''}
                        className="h-6 w-6 object-contain"
                      />
                    ))}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => cargarEnForm(item)}
                  className="p-2 rounded-full text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 cursor-pointer"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleEliminar(item)}
                  className="p-2 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
          {!cargando && filtrados.length === 0 && (
            <li className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
              No hay planes en este grupo. Publica el catálogo inicial o crea uno nuevo.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
