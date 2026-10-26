import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Copy,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { PLANES_GRUPOS, PLANES_SEED, STREAM_OPTIONS, STREAM_PACKS, vacioPlan } from '../asistente/planesSeed'
import {
  cargarPlanes,
  eliminarPlan,
  guardarPlan,
  sincronizarPlanes,
} from '../asistente/planesLive'

/* ─── helpers de estilo ─────────────────────────────────────────────────── */
const inputClass =
  'w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition'

const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1'

/* ─── mapa de etiquetas de packs ────────────────────────────────────────── */
const PACK_LABELS = [
  { key: 'basico',    label: 'Básico (TV Inicia)',  color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
  { key: 'disney',   label: 'Disney+',             color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { key: 'netflix',  label: 'Netflix',             color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  { key: 'premiumI', label: 'Premium I',           color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  { key: 'premiumII',label: 'Premium II',          color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  { key: 'full',     label: 'Full',                color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
]

/* ─── componente principal ──────────────────────────────────────────────── */
export default function AdminPlanes({ db, onToast }) {
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [confirmSync, setConfirmSync] = useState(false)
  const [grupoFiltro, setGrupoFiltro] = useState('1p-internet')
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState(() => vacioPlan('1p-internet'))
  const [editandoId, setEditandoId] = useState('')
  const [formAbierto, setFormAbierto] = useState(true)
  const [ordenDir, setOrdenDir] = useState('asc') // 'asc' | 'desc'

  const toast = (m) => onToast?.(m)

  /* ── carga ── */
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

  useEffect(() => { refrescar() }, [db]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── filtrado y ordenado ── */
  const filtrados = useMemo(() => {
    const t = busqueda.trim().toLowerCase()
    const base = lista
      .filter((p) => p.grupo === grupoFiltro)
      .filter((p) => !t || `${p.comercial} ${p.andes} ${p.normal} ${p.promo}`.toLowerCase().includes(t))
      .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    return ordenDir === 'desc' ? base.reverse() : base
  }, [lista, grupoFiltro, busqueda, ordenDir])

  /* ── helpers de form ── */
  const setCampo = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  const toggleStream = (src) =>
    setForm((prev) => {
      const has = prev.streams.includes(src)
      return { ...prev, streams: has ? prev.streams.filter((s) => s !== src) : [...prev.streams, src] }
    })

  const nuevo = () => {
    setEditandoId('')
    setForm(vacioPlan(grupoFiltro))
    setFormAbierto(true)
  }

  const cargarEnForm = (item) => {
    setEditandoId(item.id)
    setForm({ ...vacioPlan(item.grupo), ...item, streams: [...(item.streams || [])] })
    setFormAbierto(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const duplicar = (item) => {
    const copia = { ...vacioPlan(item.grupo), ...item, streams: [...(item.streams || [])], id: '', comercial: `${item.comercial} (copia)` }
    setEditandoId('')
    setForm(copia)
    setFormAbierto(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGrupoForm = (grupoId) => {
    const g = PLANES_GRUPOS.find((x) => x.id === grupoId) || PLANES_GRUPOS[0]
    setForm((prev) => ({ ...prev, grupo: g.id, tag: g.tag }))
  }

  /* ── guardar ── */
  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.comercial.trim()) { toast('El nombre comercial es obligatorio'); return }
    setGuardando(true)
    try {
      const payload = { ...form }
      if (editandoId) payload.id = editandoId
      const saved = await guardarPlan(db, payload)
      toast(editandoId ? `✓ Plan actualizado: ${saved.comercial}` : `✓ Plan creado: ${saved.comercial}`)
      setEditandoId(saved.id)
      setForm(saved)
      await refrescar()
    } catch (err) {
      toast(err?.message || 'No se pudo guardar el plan')
    } finally {
      setGuardando(false)
    }
  }

  /* ── eliminar ── */
  const handleEliminar = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.comercial}"?\nEsta acción no se puede deshacer.`)) return
    try {
      await eliminarPlan(db, item.id)
      toast(`Eliminado: ${item.comercial}`)
      if (editandoId === item.id) nuevo()
      await refrescar()
    } catch (e) {
      toast(e?.message || 'No se pudo eliminar')
    }
  }

  /* ── publicar catálogo inicial ── */
  const handleSyncSeed = async () => {
    setSyncing(true)
    setConfirmSync(false)
    try {
      const res = await sincronizarPlanes(db, PLANES_SEED)
      toast(`✓ Catálogo publicado: ${res.total} planes cargados`)
      await refrescar()
    } catch (e) {
      toast(e?.message || 'Error al publicar el catálogo')
    } finally {
      setSyncing(false)
    }
  }

  const esCable = form.grupo === 'cable'
  const grupoActual = PLANES_GRUPOS.find((g) => g.id === grupoFiltro)

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-5">

      {/* ── encabezado de sección ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard size={22} className="text-teal-600" />
            Planes comerciales
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Edita nombres, códigos Andes, precios y streaming. Los cambios se reflejan en la sección <strong>Planes</strong> del portal.
          </p>
        </div>

        {/* Publicar catálogo — botón con confirmación inline */}
        <div className="flex items-center gap-2">
          {confirmSync ? (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-2xl px-4 py-2">
              <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                Cargará {PLANES_SEED.length} planes (sin borrar extras). ¿Confirmar?
              </span>
              <button
                type="button"
                onClick={handleSyncSeed}
                disabled={syncing}
                className="ml-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer disabled:opacity-60"
              >
                {syncing ? <Loader2 size={13} className="animate-spin inline" /> : 'Sí, publicar'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmSync(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmSync(true)}
              disabled={syncing}
              className="px-4 py-2 rounded-full text-sm font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Upload size={15} />
              Publicar catálogo inicial
            </button>
          )}
        </div>
      </div>

      {/* ── formulario ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* cabecera colapsable del form */}
        <button
          type="button"
          onClick={() => setFormAbierto((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {editandoId ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                <Pencil size={11} /> Editando plan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                <Plus size={11} /> Nuevo plan
              </span>
            )}
            {form.comercial && (
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-xs">
                {form.comercial}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editandoId && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nuevo() }}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
              >
                <X size={13} /> Cancelar
              </button>
            )}
            {formAbierto ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
        </button>

        {formAbierto && (
          <form onSubmit={handleGuardar} className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">

            {/* fila 1: grupo + orden + red */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div className="col-span-2 sm:col-span-3">
                <label className={labelClass}>Grupo</label>
                <select value={form.grupo} onChange={(e) => handleGrupoForm(e.target.value)} className={inputClass}>
                  {PLANES_GRUPOS.map((g) => (
                    <option key={g.id} value={g.id}>{g.tag} · {g.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-1">
                <label className={labelClass}>Orden</label>
                <input
                  type="number"
                  value={form.orden}
                  onChange={(e) => setCampo('orden', Number(e.target.value))}
                  className={inputClass}
                  min={0}
                />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <label className={labelClass}>Red</label>
                <select value={form.red || ''} onChange={(e) => setCampo('red', e.target.value)} className={inputClass}>
                  <option value="">Sin red</option>
                  <option value="HFC">HFC (Internet 500)</option>
                  <option value="FTTH">Fibra Óptica (FTTH)</option>
                </select>
              </div>
            </div>

            {/* fila 2: nombres */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Nombre comercial <span className="text-red-500 normal-case font-normal">*</span>
                </label>
                <input
                  value={form.comercial}
                  onChange={(e) => setCampo('comercial', e.target.value)}
                  placeholder="Ej: Fibra 600 Megas"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Nombre en Andes</label>
                <input
                  value={form.andes}
                  onChange={(e) => setCampo('andes', e.target.value)}
                  placeholder="Ej: Fibra Hogar Residencial 0226F"
                  className={inputClass}
                />
              </div>
            </div>

            {/* fila 3: precios + nota */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Precio normal</label>
                <input
                  value={form.normal}
                  onChange={(e) => setCampo('normal', e.target.value)}
                  placeholder="$21.990"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Precio promo</label>
                <input
                  value={form.promo}
                  onChange={(e) => setCampo('promo', e.target.value)}
                  placeholder="$14.990"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Nota / aviso</label>
                <input
                  value={form.nota}
                  onChange={(e) => setCampo('nota', e.target.value)}
                  placeholder="Ej: Validar en Andes antes de copiar."
                  className={inputClass}
                  title="Se muestra en la ficha del plan"
                />
              </div>
            </div>

            {/* campos cable */}
            {esCable && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600">
                <div>
                  <label className={labelClass}>Canales</label>
                  <input value={form.canales} onChange={(e) => setCampo('canales', e.target.value)} placeholder="74 canales" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>HD</label>
                  <input value={form.hd} onChange={(e) => setCampo('hd', e.target.value)} placeholder="57 HD" className={inputClass} />
                </div>
                <div className="col-span-2 flex items-end">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer pb-2">
                    <input type="checkbox" checked={form.incluyeExtras} onChange={(e) => setCampo('incluyeExtras', e.target.checked)} className="rounded" />
                    Incluye extras de cable
                  </label>
                </div>
              </div>
            )}

            {/* streaming */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
              {/* cabecera streaming */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-600">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Streaming incluido
                </span>
                {form.streams.length > 0 && (
                  <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                    {form.streams.length} seleccionada{form.streams.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* packs rápidos */}
              <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 self-center mr-1">Packs:</span>
                {PACK_LABELS.map(({ key, label, color }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCampo('streams', STREAM_PACKS[key])}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all hover:scale-105 ${color}`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCampo('streams', [])}
                  className="px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:scale-105 transition-all"
                >
                  Ninguno
                </button>
              </div>

              {/* iconos individuales */}
              <div className="px-4 py-3 flex flex-wrap gap-2">
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
                      className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                        on
                          ? 'bg-white dark:bg-gray-600 shadow-md scale-110'
                          : 'opacity-35 hover:opacity-70 hover:scale-105'
                      }`}
                    >
                      <img src={s.src} alt={s.name} className="h-9 w-9 object-contain" />
                    </button>
                  )
                })}
              </div>

              {/* resumen */}
              {form.streams.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {form.streams.map((src) => {
                    const nombre = STREAM_OPTIONS.find((s) => s.src === src)?.name || ''
                    return (
                      <span key={src} className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                        <img src={src} alt={nombre} className="h-3 w-3 object-contain" />
                        {nombre}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* acciones */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={guardando}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-60 transition-all"
              >
                {guardando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {editandoId ? 'Guardar cambios' : 'Crear plan'}
              </button>
              <button
                type="button"
                onClick={nuevo}
                className="px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-sm font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus size={15} />
                Limpiar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── lista de planes ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">

        {/* tabs de grupos */}
        <div className="px-4 pt-4 flex flex-wrap gap-1.5 border-b border-gray-100 dark:border-gray-700 pb-3">
          {PLANES_GRUPOS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setGrupoFiltro(g.id)
                if (!editandoId) setForm(vacioPlan(g.id))
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${
                grupoFiltro === g.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="opacity-60 mr-1">{g.tag}</span>
              {g.label}
            </button>
          ))}
        </div>

        {/* barra de búsqueda y conteo */}
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-bold text-gray-900 dark:text-white">{filtrados.length}</span>
            {filtrados.length === 1 ? 'plan' : 'planes'}
            {grupoActual && (
              <span className="text-gray-400 dark:text-gray-500">· {grupoActual.tag} {grupoActual.label}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar plan…"
                className="rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 pl-7 pr-3 py-1.5 text-xs w-44 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
              {busqueda && (
                <button type="button" onClick={() => setBusqueda('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOrdenDir((d) => d === 'asc' ? 'desc' : 'asc')}
              title={`Orden: ${ordenDir === 'asc' ? 'ascendente' : 'descendente'}`}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
            >
              {ordenDir === 'asc' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            <button
              type="button"
              onClick={refrescar}
              title="Refrescar lista"
              className="p-1.5 rounded-full text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
            >
              {cargando ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            </button>
          </div>
        </div>

        {/* lista */}
        <ul className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[560px] overflow-y-auto">
          {filtrados.map((item) => {
            const activo = editandoId === item.id
            const tienePromo = item.promo && item.promo !== item.normal

            return (
              <li
                key={item.id}
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                  activo
                    ? 'bg-teal-50/70 dark:bg-teal-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                }`}
              >
                {/* número de orden */}
                <span className="shrink-0 w-6 h-6 mt-0.5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  {item.orden || '·'}
                </span>

                {/* info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.comercial}</p>
                    {item.red && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        item.red === 'FTTH'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                      }`}>
                        {item.red}
                      </span>
                    )}
                  </div>

                  {item.andes && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{item.andes}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {item.normal && (
                      <span className={`text-xs font-bold ${tienePromo ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.normal}
                      </span>
                    )}
                    {tienePromo && (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{item.promo} <span className="font-normal text-[10px]">promo</span></span>
                    )}
                    {item.canales && <span className="text-[10px] text-gray-400">{item.canales}</span>}
                    {item.hd && <span className="text-[10px] text-gray-400">{item.hd}</span>}
                  </div>

                  {(item.streams || []).length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {item.streams.map((src) => {
                        const nombre = STREAM_OPTIONS.find((s) => s.src === src)?.name || ''
                        return (
                          <span key={src} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-600 rounded-full px-2 py-0.5">
                            <img src={src} alt={nombre} className="h-3.5 w-3.5 object-contain" />
                            <span className="text-[10px] text-gray-600 dark:text-gray-200">{nombre}</span>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {item.nota && (
                    <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400 italic truncate">⚠ {item.nota}</p>
                  )}
                </div>

                {/* acciones */}
                <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                  <button
                    type="button"
                    onClick={() => cargarEnForm(item)}
                    title="Editar"
                    className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                      activo
                        ? 'bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300'
                        : 'text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                    }`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicar(item)}
                    title="Duplicar"
                    className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(item)}
                    title="Eliminar"
                    className="p-1.5 rounded-full text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            )
          })}

          {!cargando && filtrados.length === 0 && (
            <li className="flex flex-col items-center gap-2 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              <CreditCard size={28} className="opacity-30" />
              {busqueda
                ? `Sin resultados para "${busqueda}"`
                : 'No hay planes en este grupo. Publica el catálogo inicial o crea uno nuevo.'}
            </li>
          )}

          {cargando && (
            <li className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" /> Cargando planes…
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
