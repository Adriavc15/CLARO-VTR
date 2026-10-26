import React, { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, Users, X } from 'lucide-react'

/**
 * Panel admin genérico para administrar una lista de nombres (asesores,
 * supervisores, etc.). Recibe el `store` creado con crearListaNombres.
 *
 * Props:
 * - store: { suscribir, agregar, renombrar, eliminar, restaurarBase, claveNombre }
 * - titulo, plural, sustantivo (singular)
 * - labelCampo, placeholder, requerido
 * - descripcion (string o JSX)
 * - Icono (componente lucide)
 * - conLegajo: muestra y permite editar el legajo de cada elemento
 * - labelLegajo, placeholderLegajo
 */
export default function AdminListaNombres({
  db = null,
  onToast,
  store,
  titulo,
  plural,
  sustantivo,
  labelCampo,
  placeholder,
  requerido,
  descripcion,
  Icono = Users,
  conLegajo = false,
  labelLegajo = 'RUT asesor',
  placeholderLegajo = 'Ej. 60004133-9',
}) {
  const [lista, setLista] = useState([])
  const [nombre, setNombre] = useState('')
  const [legajo, setLegajo] = useState('')
  const [filtro, setFiltro] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [restaurando, setRestaurando] = useState(false)
  const [editandoId, setEditandoId] = useState('')
  const [editandoNombre, setEditandoNombre] = useState('')
  const [editandoLegajo, setEditandoLegajo] = useState('')
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)

  const Sust = sustantivo.charAt(0).toUpperCase() + sustantivo.slice(1)
  const toast = (m) => onToast?.(m)

  useEffect(() => {
    const unsub = store.suscribir(db, setLista)
    return () => unsub && unsub()
  }, [db, store])

  const filtrados = useMemo(() => {
    const t = store.claveNombre(filtro)
    if (!t) return lista
    return lista.filter((a) =>
      store.claveNombre(`${a.nombre} ${a.legajo || ''}`).includes(t)
    )
  }, [lista, filtro, store])

  const handleAgregar = async (e) => {
    e.preventDefault()
    const limpio = nombre.trim()
    if (!limpio) {
      toast(requerido)
      return
    }
    setGuardando(true)
    try {
      const res = await store.agregar(db, limpio, conLegajo ? legajo.trim() : '')
      if (res.duplicado) {
        toast(`Ese ${sustantivo} ya está en la lista`)
      } else {
        toast(res.cloud ? `${Sust} agregado ✅` : `${Sust} guardado en este equipo (sin nube)`)
        setNombre('')
        setLegajo('')
      }
    } catch (err) {
      toast(err?.message || `No se pudo agregar el ${sustantivo}`)
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (item) => {
    if (!window.confirm(`¿Quitar a "${item.nombre}" de la lista de ${plural}?`)) return
    try {
      await store.eliminar(db, item.id)
      toast(`${Sust} eliminado`)
    } catch (err) {
      toast(err?.message || 'No se pudo eliminar')
    }
  }

  const iniciarEdicion = (item) => {
    setEditandoId(item.id)
    setEditandoNombre(item.nombre)
    setEditandoLegajo(item.legajo || '')
  }

  const cancelarEdicion = () => {
    setEditandoId('')
    setEditandoNombre('')
    setEditandoLegajo('')
  }

  const handleGuardarEdicion = async (item) => {
    const limpio = editandoNombre.trim()
    if (!limpio) {
      toast(requerido)
      return
    }
    const mismoNombre = store.claveNombre(limpio) === store.claveNombre(item.nombre)
    const mismoLegajo = (editandoLegajo || '').trim() === (item.legajo || '')
    if (mismoNombre && mismoLegajo) {
      cancelarEdicion()
      return
    }
    setGuardandoEdicion(true)
    try {
      const res = await store.renombrar(db, item.id, limpio, conLegajo ? editandoLegajo.trim() : undefined)
      if (res.duplicado) {
        toast(`Ya existe otro ${sustantivo} con ese nombre`)
      } else {
        toast(res.cloud ? `${Sust} actualizado ✅` : `${Sust} actualizado en este equipo (sin nube)`)
        cancelarEdicion()
      }
    } catch (err) {
      toast(err?.message || `No se pudo actualizar el ${sustantivo}`)
    } finally {
      setGuardandoEdicion(false)
    }
  }

  const handleRestaurar = async () => {
    if (!window.confirm(`¿Restaurar la lista base de ${plural}? Se reemplazará la lista actual por los nombres originales.`)) return
    setRestaurando(true)
    try {
      await store.restaurarBase(db)
      toast('Lista base restaurada')
    } catch (err) {
      toast(err?.message || 'No se pudo restaurar la lista')
    } finally {
      setRestaurando(false)
    }
  }

  const inputBase =
    'w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500'

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icono size={20} className="text-teal-600" />
              {titulo}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">{descripcion}</p>
          </div>
          <button
            type="button"
            onClick={handleRestaurar}
            disabled={restaurando}
            className="px-4 py-2 rounded-full text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {restaurando ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Restaurar lista base
          </button>
        </div>

        <form
          onSubmit={handleAgregar}
          className={`grid grid-cols-1 gap-3 items-end ${
            conLegajo ? 'sm:grid-cols-[150px_1fr_auto]' : 'sm:grid-cols-[1fr_auto]'
          }`}
        >
          {conLegajo && (
            <label className="block">
              <span className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                {labelLegajo}
              </span>
              <input
                value={legajo}
                onChange={(e) => setLegajo(e.target.value)}
                placeholder={placeholderLegajo}
                className={inputBase}
              />
            </label>
          )}
          <label className="block">
            <span className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
              {labelCampo} <span className="text-red-500">*</span>
            </span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={placeholder}
              className={inputBase}
            />
          </label>
          <button
            type="submit"
            disabled={guardando}
            className="h-[42px] px-5 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Agregar {sustantivo}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={18} className="text-teal-600" />
            {titulo} ({filtrados.length}/{lista.length})
          </h3>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder={`Filtrar ${sustantivo}…`}
              className="rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 pl-8 pr-3 py-1.5 text-xs w-56"
            />
          </div>
        </div>

        {!lista.length ? (
          <p className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
            No hay {plural} en la lista. Agrega el primero arriba.
          </p>
        ) : (
          <ul className="space-y-2 max-h-[520px] overflow-y-auto">
            {filtrados.map((a) => {
              const enEdicion = editandoId === a.id
              return (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-2.5"
                >
                  {enEdicion ? (
                    <>
                      {conLegajo && (
                        <input
                          type="text"
                          value={editandoLegajo}
                          onChange={(e) => setEditandoLegajo(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleGuardarEdicion(a)
                            }
                            if (e.key === 'Escape') cancelarEdicion()
                          }}
                          placeholder={placeholderLegajo}
                          className="w-32 shrink-0 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      )}
                      <input
                        type="text"
                        value={editandoNombre}
                        onChange={(e) => setEditandoNombre(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleGuardarEdicion(a)
                          }
                          if (e.key === 'Escape') cancelarEdicion()
                        }}
                        autoFocus
                        className="flex-1 min-w-0 rounded-lg border border-emerald-400 dark:border-emerald-500 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleGuardarEdicion(a)}
                          disabled={guardandoEdicion}
                          className="p-2 rounded-full text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30 cursor-pointer disabled:opacity-50"
                          title="Guardar cambio"
                        >
                          {guardandoEdicion ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={cancelarEdicion}
                          disabled={guardandoEdicion}
                          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50"
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="min-w-0 flex items-center gap-2">
                        {conLegajo && a.legajo && (
                          <span className="shrink-0 rounded-md bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 text-[11px] font-bold text-teal-700 dark:text-teal-300 tabular-nums">
                            {a.legajo}
                          </span>
                        )}
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 min-w-0 truncate">{a.nombre}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => iniciarEdicion(a)}
                          className="p-2 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer"
                          title="Editar nombre"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(a)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                          title="Quitar de la lista"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              )
            })}
            {!filtrados.length && (
              <li className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                Ningún {sustantivo} coincide con «{filtro}».
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
