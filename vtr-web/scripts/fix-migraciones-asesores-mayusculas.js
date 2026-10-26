/**
 * Script para normalizar nombres de asesores a mayúsculas en registros de Migraciones.
 *
 * Este script:
 * 1. Lee todos los registros de la colección 'migraciones'
 * 2. Convierte los nombres de asesores a mayúsculas
 * 3. Actualiza los documentos en Firestore
 *
 * Uso:
 *   node scripts/fix-migraciones-asesores-mayusculas.js
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

async function main() {
  console.log('🔧 Iniciando normalización de nombres de asesores en Migraciones a mayúsculas...')

  // Inicializar Firebase
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  // Leer todos los registros
  console.log('📖 Leyendo registros de migraciones...')
  const snap = await getDocs(collection(db, 'migraciones'))
  const total = snap.size
  console.log(`   ${total} registros encontrados`)

  let corregidos = 0
  let errores = 0
  let sinCambios = 0

  for (const docSnap of snap.docs) {
    const data = docSnap.data()
    const id = docSnap.id
    const asesorActual = String(data.asesor || '').trim()
    const supervisorActual = String(data.supervisor || '').trim()

    const cambios = {}

    // Normalizar asesor a mayúsculas
    if (asesorActual) {
      const asesorMayusculas = asesorActual.toUpperCase().trim()
      if (asesorActual !== asesorMayusculas) {
        cambios.asesor = asesorMayusculas
      }
    }

    // Normalizar supervisor a mayúsculas
    if (supervisorActual) {
      const supervisorMayusculas = supervisorActual.toUpperCase().trim()
      if (supervisorActual !== supervisorMayusculas) {
        cambios.supervisor = supervisorMayusculas
      }
    }

    // Si hay cambios, actualizar
    if (Object.keys(cambios).length > 0) {
      console.log(`   ✏️  Corrigiendo registro ${id}:`)
      if (cambios.asesor) {
        console.log(`      Asesor: "${asesorActual}" → "${cambios.asesor}"`)
      }
      if (cambios.supervisor) {
        console.log(`      Supervisor: "${supervisorActual}" → "${cambios.supervisor}"`)
      }

      try {
        await updateDoc(doc(db, 'migraciones', id), {
          ...cambios,
          actualizado: new Date().toISOString()
        })
        corregidos++
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
  console.log(`   ✏️  Registros corregidos: ${corregidos}`)
  console.log(`   ✓ Registros ya en mayúsculas: ${sinCambios}`)
  console.log(`   ❌ Errores: ${errores}`)
}

main().catch((err) => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
