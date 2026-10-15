import React, { useState } from 'react'
import { Users, Eye, UserPlus, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { UsuariosSection } from '../App.tsx'
import AdminAsesores from './AdminAsesores.jsx'
import AdminSupervisores from './AdminSupervisores.jsx'
import AdminAdminsAutorizados from './AdminAdminsAutorizados.jsx'

/**
 * Panel con pestañas «Usuarios» / «Lecturas» / «Asesores» / «Supervisores» / «Admins autorizados».
 * Agrupa en una sola sección del sidebar la gestión de personas y accesos.
 * Reutiliza los mismos componentes que antes vivían por separado.
 */
const TABS = [
  { id: 'usuarios', label: 'Usuarios', Icono: Users },
  { id: 'lecturas', label: 'Lecturas', Icono: Eye },
  { id: 'asesores', label: 'Asesores', Icono: UserPlus },
  { id: 'supervisores', label: 'Supervisores', Icono: ClipboardCheck },
  { id: 'admins', label: 'Admins autorizados', Icono: ShieldCheck },
]

export default function PersonasTabs({
  db = null,
  onToast,
  noticias = [],
  esSuperAdmin = false,
  correoSesion = '',
  tabInicial = 'usuarios',
}) {
  const [tab, setTab] = useState(tabInicial)

  const base = 'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap'

  return (
    <div className="space-y-5">
      <div className="inline-flex max-w-full overflow-x-auto rounded-full bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        {TABS.map(({ id, label, Icono }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`${base} ${
              tab === id
                ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <Icono size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'usuarios' ? (
        <UsuariosSection noticias={noticias} onToast={onToast} vista="usuarios" />
      ) : tab === 'lecturas' ? (
        <UsuariosSection noticias={noticias} onToast={onToast} vista="lecturas" />
      ) : tab === 'asesores' ? (
        <AdminAsesores db={db} onToast={onToast} />
      ) : tab === 'supervisores' ? (
        <AdminSupervisores db={db} onToast={onToast} />
      ) : (
        <AdminAdminsAutorizados
          db={db}
          onToast={onToast}
          esSuperAdmin={esSuperAdmin}
          correoSesion={correoSesion}
        />
      )}
    </div>
  )
}
