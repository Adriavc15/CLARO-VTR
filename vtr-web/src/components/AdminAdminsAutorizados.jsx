import React, { useState, useEffect } from 'react'
import { ShieldCheck, UserPlus, Trash2, AlertCircle, KeyRound, Loader2, Mail } from 'lucide-react'
import {
  suscribirAdmins,
  agregarAdminAutorizado,
  eliminarAdminAutorizado,
  esAdminRegistradoOn,
  DOMINIOS_ADMIN,
  DOMINIOS_ADMIN_TEXTO,
  ADMIN_PRINCIPAL,
} from '../adminsAutorizados'

/**
 * Panel admin: registro de administradores con acceso al panel.
 * Solo los correos de los dominios corporativos habilitados (@apexamerica.com
 * o @clarovtr.cl) agregados aquí pueden entrar con el botón "Iniciar sesión con
 * Google". Pueden gestionar el registro (agregar/quitar) los administradores
 * que ya están registrados y el administrador principal.
 */
export default function AdminAdminsAutorizados({ db, onToast, esSuperAdmin = false, correoSesion = '' }) {
  const [admins, setAdmins] = useState([])
  const [cargando, setCargando] = useState(true)
  const [nuevoEmail, setNuevoEmail] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = suscribirAdmins(db, (lista) => {
      setAdmins(lista)
      setCargando(false)
    })
    return () => unsub()
  }, [db])

  // Pueden gestionar: el administrador principal o quien ya está registrado
  const puedeGestionar = esSuperAdmin || esAdminRegistradoOn(admins, correoSesion)

  const agregar = async (e) => {
    e.preventDefault()
    setError('')
    if (!puedeGestionar) {
      setError(`Solo los administradores registrados (y ${ADMIN_PRINCIPAL}) pueden agregar administradores.`)
      return
    }
    const email = nuevoEmail.trim()
    if (!email) {
      setError('Ingresa el correo del administrador para agregarlo.')
      return
    }
    setGuardando(true)
    try {
      const lista = await agregarAdminAutorizado(db, email, correoSesion)
      setAdmins(lista)
      setNuevoEmail('')
      onToast('Administrador agregado al registro.')
    } catch (err) {
      const msg = err?.message || 'No se pudo agregar el administrador.'
      setError(msg)
      onToast(msg)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (email) => {
    if (!puedeGestionar) return
    setError('')
    try {
      const lista = await eliminarAdminAutorizado(db, email)
      setAdmins(lista)
      onToast('Administrador quitado del registro.')
    } catch (err) {
      onToast(err?.message || 'No se pudo quitar el administrador.')
    }
  }

  const inputStyle =
    'flex-1 min-w-0 pl-9 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-5 space-y-4">
        <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600 shrink-0" size={22} />
            Registro de administradores
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Solo los correos <strong>{DOMINIOS_ADMIN_TEXTO}</strong> agregados aquí pueden entrar al panel con el botón
            “Iniciar sesión con Google”. Quien tenga el dominio pero <strong>no esté en esta lista</strong> no podrá
            acceder.
          </p>
        </div>

        {/* Quién administra el registro */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3">
          <KeyRound size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 dark:text-emerald-200">
            Pueden agregar o quitar administradores quienes <strong>ya estén en este registro</strong> y también{' '}
            <strong>{ADMIN_PRINCIPAL}</strong>.
            {puedeGestionar
              ? ` Tu sesión (${correoSesion || 'sin correo'}) está autorizada para gestionar este registro.`
              : ` Tu sesión (${correoSesion || 'sin correo'}) solo tiene lectura de esta lista.`}
          </p>
        </div>

        {/* Alta de administrador */}
        <form onSubmit={agregar} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
              disabled={!puedeGestionar}
              placeholder={`correo@${DOMINIOS_ADMIN[0]}`}
              autoComplete="off"
              className={`${inputStyle} disabled:opacity-60`}
            />
          </div>
          <button
            type="submit"
            disabled={!puedeGestionar || guardando}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {guardando ? 'Agregando…' : 'Agregar administrador'}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-xs font-medium text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Lista de administradores */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Administradores autorizados {admins.length > 0 && `(${admins.length})`}
          </p>

          {cargando ? (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 py-6">
              <Loader2 size={14} className="animate-spin" />
              Cargando registro…
            </div>
          ) : admins.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 px-4 py-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Aún no hay administradores en el registro. Agrega el primero para poder entrar con Google.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {admins.map((email) => (
                <li
                  key={email}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-sm text-gray-800 dark:text-gray-100 truncate">{email}</span>
                  </div>
                  {puedeGestionar && (
                    <button
                      type="button"
                      onClick={() => eliminar(email)}
                      title="Quitar del registro"
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
