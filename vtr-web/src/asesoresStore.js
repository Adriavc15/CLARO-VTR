/**
 * Asesores disponibles para el formulario de migraciones.
 *
 * La lista se administra desde el panel de administración (sección «Asesores»)
 * y alimenta el selector «Nombre y apellido del asesor» del formulario.
 * Se guarda en Firestore (colección 'asesores', un documento por asesor) con
 * respaldo en localStorage para trabajar sin conexión.
 */

import { crearListaNombres } from './listaNombresStore'

/** Lista base que se muestra mientras no haya una lista administrada. */
export const ASESORES_SEED = [
  'Juan Francisco Alburqueque Cadenas',
  'Jhordan Axel Armendariz Almanza',
  'Carol Ungaro Galvez',
  'Milady Merina Ayaucan De La Cruz',
  'Romero Ruelas Jorge Cristhoper',
  'Alison Maristel Correa Aspajo',
  'Claudia Milagritos Torres Napuri',
  'Axel Aarom Francia Utia',
  'Astrid Kassandra Rengifo Freitas',
  'Orellana Gomez Lorena Veronica',
  'Gaytan Fernandez Esther Mariela',
  'De La Cruz Roca Josselyn Mercedes',
  'Arica Cardoza Elmer Saul',
  'Huaman Baca Luis Diego',
  'Paredes Marcelo Victor Hugo',
  'Zuñiga Tejada Lilian Eliana',
  'Hidalgo Tapullima Julith Margarita',
  'Colán Morales Cesar Eduardo',
  'Cabarcas German Loammy Rosalina',
  'Larrea Ramirez Susana Andrea',
  'Montes Moreno Jefferson Paul',
  'Diaz Regalado Junneyri',
  'Blanca Elena Chuquillanqui Niebnur De Beaton',
  'Diego Alejandro Silva Acosta',
  'Namuche Coral Adriana Lucia',
  'Santi Rodriguez Gianella Del Pilar',
  'Lopez Benites Eduardo Arturo',
  'Tomas Miguel Loayza Santiago',
  'Los Santos Castañeda Ana Paula',
  'Harol Casana Moraes',
  'Ortiz Garcia Milagros Brillit',
  'Cadenas Martinez Maria Luisa',
  'Ana Cristina Ricaldi Lengua',
  'Norma Edith Maguiño Lozada',
  'Shirley Karim Fernandez Leon',
  'Castillo Sialer Nancy Leonor',
  'Huaman Bravo Tirso Anderson',
  'Ruiz Ramirez Mirian Mayte',
  'Velarde Bellido Maria Haidaluz',
  'Shiomara Lisbet Maldonado Ñañez',
  'Adrian Nilo Villantoy Cuaresma',
  'Alvaro fernando Huamani',
  'Adriana Pelaez',
  'Jesus juan jose Reyes',
  'Jomar Jeremy Trujillano',
  'William Francisco Palomino',
  'Keymi Andrea Agui Ramos',
  'Erick Frank Benancio Castillo',
  'Gladys Corina Briceño Chavez',
  'Nadia Dolores Gordillo Guerrero',
  'Jesica Flores Nieves',
  'Joisy Perez Rivera',
  'Samantha Milagros Tresierra Ballena',
  'Betty Lisbeth Vargas Copacondori',
  'Nathaly Estephanie Chavez Ruiz',
  'Claudia Catherine Alegre Cortez',
  'Ruth Castillo Estrella',
  'Jesus Alexander Fariña Duran',
  'Tania Suarez Ortega',
  'Juan Antony Morales Chorres',
  'Jonathan Wiston Cornejo Muñoz',
  'Torres Francis Denisse',
  'Mireya Alexandra De La Cruz Cotrina',
  'Eduardo Rafael Salazar Gonzalez',
  'Javier Jose Luis Salazar Bueno',
  'Cynthia Georgette Lozada Cuadros',
  'Ana Clarivel Peña Diaz',
  'Mirtha Del Valle Carrillo',
]

const store = crearListaNombres({
  coleccion: 'asesores',
  lsKey: 'vtr-asesores:local',
  seed: ASESORES_SEED,
  etiqueta: 'nombre y apellido del asesor',
})

export const normalizarAsesor = store.normalizarNombre
export const claveAsesor = store.claveNombre
export const listarAsesoresLocal = store.listarLocal
export const listarAsesores = store.listar
export const suscribirAsesores = store.suscribir
export const agregarAsesor = store.agregar
export const renombrarAsesor = store.renombrar
export const eliminarAsesor = store.eliminar
export const restaurarAsesoresBase = store.restaurarBase
