/**
 * Supervisores disponibles para el formulario de migraciones.
 *
 * La lista se administra desde el panel de administración (sección
 * «Supervisores») y alimenta el selector «Supervisor» del formulario.
 * Se guarda en Firestore (colección 'supervisores', un documento por
 * supervisor) con respaldo en localStorage para trabajar sin conexión.
 */

import { crearListaNombres } from './listaNombresStore'

/** Lista base que se muestra mientras no haya una lista administrada. */
export const SUPERVISORES_SEED = [
  'Sol Gonzales',
  'Harold Tejada',
  'Enmanuel Mota',
  'Gean Mendoza',
  'Zarela Rojas',
  'Elisa Ripalda',
]

const store = crearListaNombres({
  coleccion: 'supervisores',
  lsKey: 'vtr-supervisores:local',
  seed: SUPERVISORES_SEED,
  etiqueta: 'nombre del supervisor',
})

export const normalizarSupervisor = store.normalizarNombre
export const claveSupervisor = store.claveNombre
export const listarSupervisoresLocal = store.listarLocal
export const listarSupervisores = store.listar
export const suscribirSupervisores = store.suscribir
export const agregarSupervisor = store.agregar
export const renombrarSupervisor = store.renombrar
export const eliminarSupervisor = store.eliminar
export const restaurarSupervisoresBase = store.restaurarBase
