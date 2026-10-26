/**
 * Script para corregir registros de Ventas Isla que tienen legajo pero no nombre de asesor.
 *
 * Este script:
 * 1. Lee todos los registros de la colección 'no_venta_islas_movil'
 * 2. Para registros con legajoAsesor pero sin asesor (o asesor vacío), recupera el nombre de ASESORES_SEED
 * 3. Actualiza el registro en Firestore con el nombre correcto
 *
 * Uso:
 *   node scripts/fix-asesores-nombres-ventas-isla.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore'

// Importar la lista base de asesores
const ASESORES_SEED = [
  { legajo: '60004133-9', nombre: 'CASTILLO SIALER NANCY LEONOR' },
  { legajo: '60008902-1', nombre: 'EDUARDO ENMANUEL RIVERA MARTEL' },
  { legajo: '60007013-4', nombre: 'ADRIAN NILO VILLANTOY CUARESMA' },
  { legajo: '60003646-7', nombre: 'JOMAR JEREMY TRUJILLANO' },
  { legajo: '60008627-8', nombre: 'TANIA SUAREZ ORTEGA' },
  { legajo: '60008076-8', nombre: 'JESUS JUAN JOSE REYES' },
  { legajo: '60003675-0', nombre: 'RONALD LEONARDO GARCIA COVEÑAS' },
  { legajo: '60008913-7', nombre: 'JHORDAN AGUSTO PANDURO CORREA' },
  { legajo: '60005750-2', nombre: 'DE LA CRUZ ROCA JOSSELYN MERCEDES' },
  { legajo: '60005828-2', nombre: 'DIAZ REGALADO JUNNEYRI' },
  { legajo: '60006001-5', nombre: 'GAYTAN FERNANDEZ ESTHER MARIELA' },
  { legajo: '60008380-5', nombre: 'JOISY PEREZ RIVERA' },
  { legajo: '60004130-4', nombre: 'ROMERO RUELAS JORGE CRISTHOPER' },
  { legajo: '60005841-K', nombre: 'SANTI RODRIGUEZ GIANELLA DEL PILAR' },
  { legajo: '60008609-K', nombre: 'EDUARDO RAFAEL SALAZAR GONZALEZ' },
  { legajo: '60007882-8', nombre: 'SHIRLEY KARIM FERNANDEZ LEON' },
  { legajo: '60001265-7', nombre: 'JESUS ALEXANDER FARIÑA DURAN' },
  { legajo: '60004780-9', nombre: 'ZUÑIGA TEJADA LILIAN ELIANA' },
  { legajo: '60003848-6', nombre: 'COLÁN MORALES CESAR EDUARDO' },
  { legajo: '60006861-K', nombre: 'BLANCA ELENA CHUQUILLANQUI NIEBNUR DE BEATON' },
  { legajo: '60008628-6', nombre: 'CYNTHIA GEORGETTE LOZADA CUADROS' },
  { legajo: '60007895-K', nombre: 'CLAUDIA MILAGRITOS TORRES NAPURI' },
  { legajo: '60006124-0', nombre: 'LARREA RAMIREZ SUSANA ANDREA' },
  { legajo: '60009055-0', nombre: 'KARLA CONSUELO FLORES VILLAYZAN' },
  { legajo: '60007884-4', nombre: 'AXEL AAROM FRANCIA UTIA' },
  { legajo: '60006864-4', nombre: 'TOMAS MIGUEL LOAYZA SANTIAGO' },
  { legajo: '60006867-9', nombre: 'DIEGO ALEJANDRO SILVA ACOSTA' },
  { legajo: '60007883-6', nombre: 'CAROL UNGARO GALVEZ' },
  { legajo: '60005838-K', nombre: 'MONTES MORENO JEFFERSON PAUL' },
  { legajo: '60007874-7', nombre: 'ASTRID KASSANDRA RENGIFO FREITAS' },
  { legajo: '60008389-9', nombre: 'SAMANTHA MILAGROS TRESIERRA BALLENA' },
  { legajo: '60004595-4', nombre: 'WILLIAM FRANCISCO PALOMINO TALAVERA' },
  { legajo: '60005753-7', nombre: 'ARICA CARDOZA ELMER SAUL' },
  { legajo: '60007644-2', nombre: 'JUAN FRANCISCO ALBURQUEQUE CADENAS' },
  { legajo: '60007337-0', nombre: 'SHIOMARA LISBET MALDONADO ÑAÑEZ' },
  { legajo: '60008632-4', nombre: 'MIRTHA DEL VALLE CARRILLO' },
  { legajo: '60008600-6', nombre: 'NATHALY ESTEPHANIE CHAVEZ RUIZ' },
  { legajo: '60008608-1', nombre: 'JUAN ANTONY MORALES CHORRES' },
  { legajo: '60003768-4', nombre: 'NAMUCHE CORAL ADRIANA LUCIA' },
  { legajo: '60005255-1', nombre: 'ORELLANA GOMEZ LORENA VERONICA' },
  { legajo: '60008073-3', nombre: 'ALVARO FERNANDO HUAMANI' },
  { legajo: '60008901-3', nombre: 'LUIS ANGEL RIOS CASTILLO' },
  { legajo: '60008603-0', nombre: 'CLAUDIA CATHERINE ALEGRE CORTEZ' },
  { legajo: '60003977-6', nombre: 'HIDALGO TAPULLIMA JULITH MARGARITA' },
  { legajo: '60007881-K', nombre: 'ANA CRISTINA RICALDI LENGUA' },
  { legajo: '60006858-K', nombre: 'HAROL CASANA MORAES' },
  { legajo: '60006114-3', nombre: 'CABARCAS GERMAN LOAMMY ROSALINA' },
  { legajo: '60008371-6', nombre: 'JESICA FLORES NIEVES' },
  { legajo: '60008364-3', nombre: 'ERICK FRANK BENANCIO CASTILLO' },
  { legajo: '60008604-9', nombre: 'RUTH CASTILLO ESTRELLA' },
  { legajo: '60008630-8', nombre: 'ANA CLARIVEL PEÑA DIAZ' },
  { legajo: '60007873-9', nombre: 'JHORDAN AXEL ARMENDARIZ ALMANZA' },
  { legajo: '60006127-5', nombre: 'VELARDE BELLIDO MARIA HAIDALUZ' },
  { legajo: '60007880-1', nombre: 'NORMA EDITH MAGUIÑO LOZADA' },
  { legajo: '60008370-8', nombre: 'NADIA DOLORES GORDILLO GUERRERO' },
  { legajo: '60006111-9', nombre: 'PAREDES MARCELO VICTOR HUGO' },
  { legajo: '60006773-7', nombre: 'HUAMAN BRAVO TIRSO ANDERSON' },
  { legajo: '60006223-9', nombre: 'HUAMAN BACA LUIS DIEGO' },
  { legajo: '60006726-5', nombre: 'CADENAS MARTINEZ MARIA LUISA' },
  { legajo: '60008634-0', nombre: 'TORRES FRANCIS DENISSE' },
  { legajo: '60006134-8', nombre: 'LOPEZ BENITES EDUARDO ARTURO' },
  { legajo: '60006117-8', nombre: 'RUIZ RAMIREZ MIRIAN MAYTE' },
  { legajo: '60006730-3', nombre: 'ORTIZ GARCIA MILAGROS BRILLIT' },
  { legajo: '60008391-0', nombre: 'BETTY LISBETH VARGAS COPACONDORI' },
  { legajo: '60008613-8', nombre: 'JAVIER JOSE LUIS SALAZAR BUENO' },
  { legajo: '60008075-K', nombre: 'ADRIANA PELAEZ' },
  { legajo: '60008614-6', nombre: 'JONATHAN WISTON CORNEJO MUÑOZ' },
  { legajo: '60008605-7', nombre: 'MIREYA ALEXANDRA DE LA CRUZ COTRINA' },
]

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

async function main() {
  console.log('🔧 Iniciando corrección de nombres de asesores en Ventas Isla...')

  // Inicializar Firebase
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  // Leer todos los registros
  console.log('📖 Leyendo registros de no_venta_islas_movil...')
  const snap = await getDocs(collection(db, 'no_venta_islas_movil'))
  const total = snap.size
  console.log(`   ${total} registros encontrados`)

  let corregidos = 0
  let errores = 0

  for (const docSnap of snap.docs) {
    const data = docSnap.data()
    const id = docSnap.id
    const legajoAsesor = String(data.legajoAsesor || '').trim()
    const asesor = String(data.asesor || '').trim()

    // Si tiene legajo pero no tiene nombre (o nombre vacío)
    if (legajoAsesor && !asesor) {
      // Buscar el nombre en la lista base
      const asesorBase = ASESORES_SEED.find(
        (a) => String(a.legajo || '').trim() === legajoAsesor
      )

      if (asesorBase) {
        const nombreCorrecto = String(asesorBase.nombre || '').trim()
        console.log(`   ✏️  Corrigiendo registro ${id}: legajo=${legajoAsesor} → nombre=${nombreCorrecto}`)

        try {
          await updateDoc(doc(db, 'no_venta_islas_movil', id), {
            asesor: nombreCorrecto,
            actualizado: new Date().toISOString()
          })
          corregidos++
        } catch (err) {
          console.error(`   ❌ Error al actualizar registro ${id}:`, err.message)
          errores++
        }
      } else {
        console.log(`   ⚠️  No se encontró nombre para legajo ${legajoAsesor} en registro ${id}`)
      }
    }
  }

  console.log('\n✅ Proceso completado:')
  console.log(`   📊 Total registros: ${total}`)
  console.log(`   ✏️  Registros corregidos: ${corregidos}`)
  console.log(`   ❌ Errores: ${errores}`)
}

main().catch((err) => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
