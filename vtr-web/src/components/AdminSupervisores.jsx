import React from 'react'
import { ClipboardCheck } from 'lucide-react'
import AdminListaNombres from './AdminListaNombres'
import {
  suscribirSupervisores,
  agregarSupervisor,
  renombrarSupervisor,
  eliminarSupervisor,
  restaurarSupervisoresBase,
  claveSupervisor,
} from '../supervisoresStore'

const store = {
  suscribir: suscribirSupervisores,
  agregar: agregarSupervisor,
  renombrar: renombrarSupervisor,
  eliminar: eliminarSupervisor,
  restaurarBase: restaurarSupervisoresBase,
  claveNombre: claveSupervisor,
}

/**
 * Panel admin: administra la lista de «Supervisor» que se muestra en el
 * formulario de migraciones.
 */
export default function AdminSupervisores(props) {
  return (
    <AdminListaNombres
      {...props}
      store={store}
      titulo="Supervisores"
      plural="supervisores"
      sustantivo="supervisor"
      labelCampo="Nombre del supervisor"
      placeholder="Ej. Sol Gonzales"
      requerido="Ingresa el nombre del supervisor"
      Icono={ClipboardCheck}
      descripcion={
        <>
          Nombres que aparecen en el selector <strong>«Supervisor»</strong> del formulario de migraciones. Agrega,
          edita o quita supervisores y quedan disponibles de inmediato.
        </>
      }
    />
  )
}
