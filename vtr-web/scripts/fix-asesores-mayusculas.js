/**
 * Script para normalizar nombres de asesores a mayúsculas en Firestore.
 *
 * Este script:
 * 1. Lee todos los asesores de la colección 'asesores'
 * 2. Convierte sus nombres a mayúsculas
 * 3. Actualiza los documentos en Firestore
 *
 * Uso:
 *   node scripts/fix-asesores-mayusculas.js
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
  console.log('🔧 Iniciando normalización de nombres de asesores a mayúsculas...')

  // Inicializar Firebase
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  // Leer todos los asesores
  console.log('📖 Leyendo asesores de Firestore...')
  const snap = await getDocs(collection(db, 'asesores'))
  const total = snap.size
  console.log(`   ${total} asesores encontrados`)

  let corregidos = 0
  let errores = 0
  let sinCambios = 0

  for (const docSnap of snap.docs) {
    const data = docSnap.data()
    const id = docSnap.id
    const nombreActual = String(data.nombre || '').trim()
    const legajo = String(data.legajo || '').trim()

    if (!nombreActual) {
      console.log(`   ⚠️  Asesor ${id} sin nombre, saltando...`)
      continue
    }

    const nombreMayusculas = nombreActual.toUpperCase().trim()

    // Si ya está en mayúsculas, saltar
    if (nombreActual === nombreMayusculas) {
      sinCambios++
      continue
    }

    console.log(`   ✏️  Corrigiendo asesor ${id}:`)
    console.log(`      Antes: "${nombreActual}"`)
    console.log(`      Después: "${nombreMayusculas}"`)

    try {
      await updateDoc(doc(db, 'asesores', id), {
        nombre: nombreMayusculas,
        actualizado: new Date().toISOString()
      })
      corregidos++
    } catch (err) {
      console.error(`   ❌ Error al actualizar asesor ${id}:`, err.message)
      errores++
    }
  }

  console.log('\n✅ Proceso completado:')
  console.log(`   📊 Total asesores: ${total}`)
  console.log(`   ✏️  Asesores corregidos: ${corregidos}`)
  console.log(`   ✓ Asesores ya en mayúsculas: ${sinCambios}`)
  console.log(`   ❌ Errores: ${errores}`)
}

main().catch((err) => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
