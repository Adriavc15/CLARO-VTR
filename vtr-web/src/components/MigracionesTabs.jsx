import React, { useState } from 'react'
import AdminMigraciones from './AdminMigraciones.jsx'
import RegistrosNoAceptaFibra from './RegistrosNoAceptaFibra.jsx'

/**
 * Panel con pestañas «Migraciones» / «No acepta fibra».
 * Se usa igual en el admin (todos los registros) y en "Mis registros" (solo los del usuario).
 */
export default function MigracionesTabs({ db = null, onToast, esUsuario = false }) {
  const [tab, setTab] = useState('migraciones')

  const base = 'px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer'

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        <button
          type="button"
          onClick={() => setTab('migraciones')}
          className={`${base} ${
            tab === 'migraciones'
              ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'
          }`}
        >
          Migraciones
        </button>
        <button
          type="button"
          onClick={() => setTab('noacepta')}
          className={`${base} ${
            tab === 'noacepta'
              ? 'bg-white dark:bg-gray-700 text-[#b26a00] dark:text-amber-300 shadow'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'
          }`}
        >
          No acepta fibra
        </button>
      </div>

      {tab === 'migraciones' ? (
        <AdminMigraciones db={db} onToast={onToast} esUsuario={esUsuario} />
      ) : (
        <RegistrosNoAceptaFibra db={db} onToast={onToast} esUsuario={esUsuario} />
      )}
    </div>
  )
}
