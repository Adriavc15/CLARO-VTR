import React, { useEffect, useState } from 'react'
import { Database, Loader2, RefreshCw, Save, Trash2, Upload, Link2 } from 'lucide-react'
import {
  cargarIdsClave,
  sincronizarIdsClave,
  guardarIdClave,
  eliminarIdClave,
  extraerIdsDesdeHtml,
  IDS_CLAVE_SEED,
} from '../asistente/idsClaveLive'

export default function AdminIdsClave({ db, onToast }) {
  const [lista, setLista] = useState([])
  const [cargando, setCargando] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('')
  const [filtro, setFiltro] = useState('')

  const toast = (m) => onToast?.(m)

  const refrescar = async () => {
    setCargando(true)
    try {
      const docs = await cargarIdsClave(db)
      setLista(docs)
    } catch (e) {
      toast(e?.message || 'No se pudo cargar IDs')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    refrescar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const handleSyncSeed = async () => {
    if (syncing) return
    setSyncing(true)
    try {
      const res = await sincronizarIdsClave(db, IDS_CLAVE_SEED)
      toast(`IDs sincronizados (seed local): ${res.total}`)
      await refrescar()
    } catch (e) {
      toast(e?.message || 'Error al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  const handleHtmlFile = async (file) => {
    if (!file) return
    setSyncing(true)
    try {
      const html = await file.text()
      const extraidos = extraerIdsDesdeHtml(html)
      if (!extraidos.length) {
        toast('No se encontraron IDs en ese HTML. ¿Es el portal logueado de Somos Clave?')
        return
      }
      const res = await sincronizarIdsClave(db, extraidos)
      toast(`Importados desde HTML: ${res.total} IDs de Somos Clave`)
      await refrescar()
    } catch (e) {
      toast(e?.message || 'Error al importar HTML')
    } finally {
      setSyncing(false)
    }
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    try {
      await guardarIdClave(db, { id, nombre, categoria: categoria || undefined, fuente: 'admin' })
      toast(`Guardado ID ${id}`)
      setId('')
      setNombre('')
      setCategoria('')
      await refrescar()
    } catch (err) {
      toast(err?.message || 'No se pudo guardar')
    }
  }

  const handleEliminar = async (docId) => {
    if (!window.confirm(`¿Eliminar ID ${docId}?`)) return
    try {
      await eliminarIdClave(db, docId)
      toast(`Eliminado ${docId}`)
      await refrescar()
    } catch (e) {
      toast(e?.message || 'No se pudo eliminar')
    }
  }

  const filtrados = lista.filter((item) => {
    const t = filtro.trim().toLowerCase()
    if (!t) return true
    return (
      item.id.includes(t) ||
      item.nombre.toLowerCase().includes(t) ||
      String(item.categoria || '')
        .toLowerCase()
        .includes(t)
    )
  })

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Database size={20} className="text-teal-600" />
              IDs Clave / Somos Clave
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              Catálogo que usa la sección <strong>IDs Clave VTR</strong> del portal. Sincroniza el seed, importa un HTML
              guardado de{' '}
              <a href="https://somosclave.cl/index.php" target="_blank" rel="noreferrer" className="text-teal-600 underline">
                somosclave.cl
              </a>{' '}
              (logueado) o agrega IDs a mano.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSyncSeed}
              disabled={syncing}
              className="px-4 py-2 rounded-full text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 cursor-pointer disabled:opacity-60 shadow"
            >
              {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Sincronizar seed → Firestore
            </button>
            <label className="px-4 py-2 rounded-full text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow">
              <Upload size={16} />
              Importar HTML Somos Clave
              <input
                type="file"
                accept=".html,.htm,text/html"
                className="hidden"
                onChange={(e) => handleHtmlFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleGuardar} className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">ID</label>
            <input
              value={id}
              onChange={(e) => setId(e.target.value.replace(/\D/g, ''))}
              placeholder="1303"
              required
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="INCONVENIENTE CON EL PAGO"
              required
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Categoría</label>
            <input
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="FACTURACIÓN"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="lg:col-span-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Save size={16} />
            Guardar / actualizar ID
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Catálogo ({filtrados.length}/{lista.length})
          </h3>
          <div className="flex items-center gap-2">
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Filtrar…"
              className="rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs w-40"
            />
            <button type="button" onClick={refrescar} className="text-xs font-bold text-teal-700 flex items-center gap-1 cursor-pointer">
              {cargando ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Refrescar
            </button>
          </div>
        </div>

        <ul className="space-y-2 max-h-[480px] overflow-y-auto">
          {filtrados.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  <span className="text-teal-600">{item.id}</span> · {item.nombre}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {item.categoria || 'Sin categoría'} · {item.enlace}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={item.enlace}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                  title="Abrir en Somos Clave"
                >
                  <Link2 size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => handleEliminar(item.id)}
                  className="p-2 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
