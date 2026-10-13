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
      placeholder="Ej. Juan Francisco Alburqueque Cadenas"
      requerido="Ingresa el nombre y apellido del asesor"
      Icono={UserPlus}
      descripcion={
        <>
          Nombres que aparecen en el selector <strong>«Nombre y apellido del asesor»</strong> del formulario de
          migraciones. Agrega, edita o quita asesores y quedan disponibles de inmediato.
        </>
      }
    />
  )
}
