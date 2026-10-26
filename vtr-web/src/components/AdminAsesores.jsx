import React from 'react'
import { UserPlus } from 'lucide-react'
import AdminListaNombres from './AdminListaNombres'
import {
  suscribirAsesores,
  agregarAsesor,
  renombrarAsesor,
  eliminarAsesor,
  restaurarAsesoresBase,
  claveAsesor,
} from '../asesoresStore'

const store = {
  suscribir: suscribirAsesores,
  agregar: agregarAsesor,
  renombrar: renombrarAsesor,
  eliminar: eliminarAsesor,
  restaurarBase: restaurarAsesoresBase,
  claveNombre: claveAsesor,
}

/**
 * Panel admin: administra la lista de «Nombre y apellido del asesor» que se
 * muestra en el formulario de migraciones.
 */
export default function AdminAsesores(props) {
  return (
    <AdminListaNombres
      {...props}
      store={store}
      titulo="Asesores"
      plural="asesores"
      sustantivo="asesor"
      labelCampo="Nombre y apellido del asesor"
      placeholder="Ej. CASTILLO SIALER NANCY LEONOR"
      requerido="Ingresa el nombre y apellido del asesor"
      Icono={UserPlus}
      conLegajo
      labelLegajo="Legajo"
      placeholderLegajo="Ej. 60004133-9"
      descripcion={
        <>
          Asesores que aparecen en los formularios internos. Cada uno tiene su{' '}
          <strong>legajo</strong> (ID interno) y su nombre en <strong>MAYÚSCULAS</strong>; el selector muestra
          ambos. Agrega, edita o quita asesores y quedan disponibles de inmediato.
        </>
      }
    />
  )
}
