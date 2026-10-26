/**
 * Script para corregir registros de tipificaciones: normalizar nombres a mayúsculas
 * y completar el RUT/legajo del asesor basándose en la lista de asesores.
 *
 * Este script:
 * 1. Lee todos los registros de la colección 'tipificaciones_bloc'
 * 2. Normaliza nombres de asesor y supervisor a mayúsculas
 * 3. Busca el RUT del asesor en la lista de asesores conocidos (ASESORES_SEED + Firestore)
 * 4. Actualiza los documentos en Firestore
 *
 * Uso:
 *   node scripts/fix-tipificaciones-asesores-rut.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore'

// Configuración de Firebase (debe coincidir con App.tsx)
const firebaseConfig = {
  apiKey: "AIzaSyBTS2289cU0WwQQH9X6m2r0DdgqAgVAK0I",
  authDomain: "vtrclaroo-3c572.firebaseapp.com",
  projectId: "vtrclaroo-3c572",
  storageBucket: "vtrclaroo-3c572.firebasestorage.app",
  messagingSenderId: "417392161995",
  appId: "1:417392161995:web:3301a4bb068814a497974e",
  measurementId: "G-MJLB9JM182"
}

// Lista base de asesores (legajo -> nombre en mayúsculas)
const ASESORES_SEED = new Map([
  ['60004133-9', 'CASTILLO SIALER NANCY LEONOR'],
  ['60008902-1', 'EDUARDO ENMANUEL RIVERA MARTEL'],
  ['60007013-4', 'ADRIAN NILO VILLANTOY CUARESMA'],
  ['60003646-7', 'JOMAR JEREMY TRUJILLANO'],
  ['60008627-8', 'TANIA SUAREZ ORTEGA'],
  ['60008076-8', 'JESUS JUAN JOSE REYES'],
  ['60003675-0', 'RONALD LEONARDO GARCIA COVEÑAS'],
  ['60008913-7', 'JHORDAN AGUSTO PANDURO CORREA'],
  ['60005750-2', 'DE LA CRUZ ROCA JOSSELYN MERCEDES'],
  ['60005828-2', 'DIAZ REGALADO JUNNEYRI'],
  ['60006001-5', 'GAYTAN FERNANDEZ ESTHER MARIELA'],
  ['60008380-5', 'JOISY PEREZ RIVERA'],
  ['60004130-4', 'ROMERO RUELAS JORGE CRISTHOPER'],
  ['60005841-K', 'SANTI RODRIGUEZ GIANELLA DEL PILAR'],
  ['60008609-K', 'EDUARDO RAFAEL SALAZAR GONZALEZ'],
  ['60007882-8', 'SHIRLEY KARIM FERNANDEZ LEON'],
  ['60001265-7', 'JESUS ALEXANDER FARIÑA DURAN'],
  ['60004780-9', 'ZUÑIGA TEJADA LILIAN ELIANA'],
  ['60003848-6', 'COLÁN MORALES CESAR EDUARDO'],
  ['60006861-K', 'BLANCA ELENA CHUQUILLANQUI NIEBNUR DE BEATON'],
  ['60008628-6', 'CYNTHIA GEORGETTE LOZADA CUADROS'],
  ['60007895-K', 'CLAUDIA MILAGRITOS TORRES NAPURI'],
  ['60006124-0', 'LARREA RAMIREZ SUSANA ANDREA'],
  ['60009055-0', 'KARLA CONSUELO FLORES VILLAYZAN'],
  ['60007884-4', 'AXEL AAROM FRANCIA UTIA'],
  ['60006864-4', 'TOMAS MIGUEL LOAYZA SANTIAGO'],
  ['60006867-9', 'DIEGO ALEJANDRO SILVA ACOSTA'],
  ['60007883-6', 'CAROL UNGARO GALVEZ'],
  ['60005838-K', 'MONTES MORENO JEFFERSON PAUL'],
  ['60007874-7', 'ASTRID KASSANDRA RENGIFO FREITAS'],
  ['60008389-9', 'SAMANTHA MILAGROS TRESIERRA BALLENA'],
  ['60004595-4', 'WILLIAM FRANCISCO PALOMINO TALAVERA'],
  ['60005753-7', 'ARICA CARDOZA ELMER SAUL'],
  ['60007644-2', 'JUAN FRANCISCO ALBURQUEQUE CADENAS'],
  ['60007337-0', 'SHIOMARA LISBET MALDONADO ÑAÑEZ'],
  ['60008632-4', 'MIRTHA DEL VALLE CARRILLO'],
  ['60008600-6', 'NATHALY ESTEPHANIE CHAVEZ RUIZ'],
  ['60008608-1', 'JUAN ANTONY MORALES CHORRES'],
  ['60003768-4', 'NAMUCHE CORAL ADRIANA LUCIA'],
  ['60005255-1', 'ORELLANA GOMEZ LORENA VERONICA'],
  ['60008073-3', 'ALVARO FERNANDO HUAMANI'],
  ['60008901-3', 'LUIS ANGEL RIOS CASTILLO'],
  ['60008603-0', 'CLAUDIA CATHERINE ALEGRE CORTEZ'],
  ['60003977-6', 'HIDALGO TAPULLIMA JULITH MARGARITA'],
  ['60007881-K', 'ANA CRISTINA RICALDI LENGUA'],
  ['60006858-K', 'HAROL CASANA MORAES'],
  ['60006114-3', 'CABARCAS GERMAN LOAMMY ROSALINA'],
  ['60008371-6', 'JESICA FLORES NIEVES'],
  ['60008364-3', 'ERICK FRANK BENANCIO CASTILLO'],
  ['60008604-9', 'RUTH CASTILLO ESTRELLA'],
  ['60008630-8', 'ANA CLARIVEL PEÑA DIAZ'],
  ['60007873-9', 'JHORDAN AXEL ARMENDARIZ ALMANZA'],
  ['60006127-5', 'VELARDE BELLIDO MARIA HAIDALUZ'],
  ['60007880-1', 'NORMA EDITH MAGUIÑO LOZADA'],
  ['60008370-8', 'NADIA DOLORES GORDILLO GUERRERO'],
  ['60006111-9', 'PAREDES MARCELO VICTOR HUGO'],
  ['60006773-7', 'HUAMAN BRAVO TIRSO ANDERSON'],
  ['60006223-9', 'HUAMAN BACA LUIS DIEGO'],
  ['60006726-5', 'CADENAS MARTINEZ MARIA LUISA'],
  ['60008634-0', 'TORRES FRANCIS DENISSE'],
  ['60006134-8', 'LOPEZ BENITES EDUARDO ARTURO'],
  ['60006117-8', 'RUIZ RAMIREZ MIRIAN MAYTE'],
  ['60006730-3', 'ORTIZ GARCIA MILAGROS BRILLIT'],
  ['60008391-0', 'BETTY LISBETH VARGAS COPACONDORI'],
  ['60008613-8', 'JAVIER JOSE LUIS SALAZAR BUENO'],
  ['60008075-K', 'ADRIANA PELAEZ'],
  ['60008614-6', 'JONATHAN WISTON CORNEJO MUÑOZ'],
  ['60008605-7', 'MIREYA ALEXANDRA DE LA CRUZ COTRINA'],
])

// Mapa inverso: nombre en mayúsculas -> legajo
const NOMBRE_A_LEGAJO = new Map()
for (const [legajo, nombre] of ASESORES_SEED) {
  NOMBRE_A_LEGAJO.set(nombre.toUpperCase(), legajo)
}

/**
 * Busca el legajo de un asesor por su nombre
 * @param {string} nombre - Nombre del asesor
 * @returns {string|null} - Legajo del asesor o null si no se encuentra
 */
function buscarLegajoPorNombre(nombre) {
  if (!nombre) return null
  const nombreUpper = String(nombre).trim().toUpperCase()
  
  // Buscar coincidencia exacta
  if (NOMBRE_A_LEGAJO.has(nombreUpper)) {
    return NOMBRE_A_LEGAJO.get(nombreUpper)
  }
  
  // Buscar coincidencia parcial (el nombre contiene el nombre del asesor)
  for (const [nombreAsesor, legajo] of NOMBRE_A_LEGAJO) {
    if (nombreUpper.includes(nombreAsesor) || nombreAsesor.includes(nombreUpper)) {
      return legajo
    }
  }
  
  return null
}

/**
 * Normaliza un texto a mayúsculas
 * @param {string} texto - Texto a normalizar
 * @returns {string} - Texto en mayúsculas
 */
function normalizarMayusculas(texto) {
  if (!texto) return ''
  return String(texto).trim().toUpperCase()
}

async function main() {
  console.log('🔧 Iniciando corrección de tipificaciones...')
  console.log('   1. Normalizar nombres a mayúsculas')
  console.log('   2. Completar RUT/legajo del asesor\n')

  // Inicializar Firebase
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  // Cargar asesores desde Firestore (colección 'asesores')
  console.log('📥 Cargando asesores desde Firestore...')
  try {
    const asesoresSnap = await getDocs(collection(db, 'asesores'))
    for (const docSnap of asesoresSnap.docs) {
      const data = docSnap.data()
      const legajo = String(data.legajo || '').trim().toUpperCase()
      const nombre = String(data.nombre || '').trim().toUpperCase()
      if (legajo && nombre) {
        ASESORES_SEED.set(legajo, nombre)
        NOMBRE_A_LEGAJO.set(nombre, legajo)
      }
    }
    console.log(`   ✓ ${ASESORES_SEED.size} asesores cargados (seed + Firestore)`)
  } catch (err) {
    console.log(`   ⚠️  Error al cargar asesores de Firestore: ${err.message}`)
    console.log(`   ✓ Usando solo ${ASESORES_SEED.size} asesores del seed`)
  }

  // Leer todos los registros de no_acepta_fibra
  console.log('\n📖 Leyendo registros de no_acepta_fibra...')
  const snap = await getDocs(collection(db, 'no_acepta_fibra'))
  const total = snap.size
  console.log(`   ${total} registros encontrados`)

  let corregidosNombres = 0
  let corregidosRut = 0
  let sinCambios = 0
  let errores = 0
  let sinAsesor = 0

  for (const docSnap of snap.docs) {
    const data = docSnap.data()
    const id = docSnap.id
    // En no_acepta_fibra los campos están en el root, no en un objeto 'campos'
    const campos = data

    const cambios = {}
    let tuvoCambio = false

    // 1. Normalizar nombre del asesor a mayúsculas
    if (campos.asesor) {
      const asesorActual = String(campos.asesor).trim()
      const asesorNormalizado = normalizarMayusculas(asesorActual)
      if (asesorActual !== asesorNormalizado) {
        cambios.asesor = asesorNormalizado
        console.log(`   ✏️  ${id}: Asesor "${asesorActual}" → "${asesorNormalizado}"`)
        corregidosNombres++
        tuvoCambio = true
      }
    } else {
      sinAsesor++
    }

    // 2. Normalizar supervisor a mayúsculas
    if (campos.supervisor) {
      const supervisorActual = String(campos.supervisor).trim()
      const supervisorNormalizado = normalizarMayusculas(supervisorActual)
      if (supervisorActual !== supervisorNormalizado) {
        cambios.supervisor = supervisorNormalizado
        console.log(`   ✏️  ${id}: Supervisor "${supervisorActual}" → "${supervisorNormalizado}"`)
        corregidosNombres++
        tuvoCambio = true
      }
    }

    // 3. Normalizar rutAsesor a mayúsculas (si existe)
    if (campos.rutAsesor) {
      const rutActual = String(campos.rutAsesor).trim()
      const rutNormalizado = normalizarMayusculas(rutActual)
      if (rutActual !== rutNormalizado) {
        cambios.rutAsesor = rutNormalizado
        tuvoCambio = true
      }
    }

    // 4. Si hay nombre de asesor pero no hay rutAsesor, buscar el legajo
    if (campos.asesor && !campos.rutAsesor) {
      const legajo = buscarLegajoPorNombre(campos.asesor)
      if (legajo) {
        cambios.rutAsesor = legajo
        console.log(`   ✏️  ${id}: Agregando RUT asesor: ${legajo} (asesor: "${campos.asesor}")`)
        corregidosRut++
        tuvoCambio = true
      } else {
        console.log(`   ⚠️  ${id}: No se encontró legajo para asesor "${campos.asesor}"`)
      }
    }

    // Si hay cambios, actualizar
    if (tuvoCambio) {
      try {
        await updateDoc(doc(db, 'no_acepta_fibra', id), {
          ...cambios,
          actualizado: new Date().toISOString()
        })
      } catch (err) {
        console.error(`   ❌ Error al actualizar registro ${id}:`, err.message)
        errores++
      }
    } else {
      sinCambios++
    }
  }

  console.log('\n✅ Proceso completado:')
  console.log(`   📊 Total registros: ${total}`)
  console.log(`   ✏️  Nombres corregidos (mayúsculas): ${corregidosNombres}`)
  console.log(`   🆔 RUT/legajo completados: ${corregidosRut}`)
  console.log(`   ✓ Sin cambios: ${sinCambios}`)
  console.log(`   ⚠️  Sin asesor: ${sinAsesor}`)
  console.log(`   ❌ Errores: ${errores}`)
}

main().catch((err) => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})