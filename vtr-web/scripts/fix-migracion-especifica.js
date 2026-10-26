/**
 * Script para corregir un registro específico de migraciones que está en minúsculas.
 *
 * Registro con legajo 60005841-K, fecha 2026-10-23
 * Asesor: Santi Rodriguez Gianella Del Pilar → SANTI RODRIGUEZ GIANELLA DEL PILAR
 * Supervisor: Harold Tejada → HAROLD TEJADA
 *
 * Uso:
 *   node scripts/fix-migracion-especifica.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'

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
  console.log('🔧 Buscando registro específico de migración...')

  // Inicializar Firebase
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  // Buscar el registro por nombre de asesor
  const snap = await getDocs(collection(db, 'migraciones'))

  let encontrados = 0

  for (const docSnap of snap.docs) {
    const data = docSnap.data()
    const id = docSnap.id
    const legajoAsesor = String(data.legajoAsesor || '').trim()
    const fechaIngreso = String(data.fechaIngreso || '').trim()
    const asesor = String(data.asesor || '').trim()
    const supervisor = String(data.supervisor || '').trim()
    const rutCliente = String(data.rutCliente || '').trim()

    // Buscar registros con ese nombre de asesor (case insensitive)
    if (asesor.toLowerCase().includes('santi rodriguez')) {
      console.log(`✅ Registro encontrado: ${id}`)
      console.log(`   Fecha: ${fechaIngreso}`)
      console.log(`   RUT cliente: ${rutCliente}`)
      console.log(`   Asesor actual: "${asesor}"`)
      console.log(`   Supervisor actual: "${supervisor}"`)
      console.log(`   Legajo: ${legajoAsesor}`)

      const cambios = {}
      if (asesor.toUpperCase() !== asesor) {
        cambios.asesor = asesor.toUpperCase()
      }
      if (supervisor.toUpperCase() !== supervisor) {
        cambios.supervisor = supervisor.toUpperCase()
      }
      if (!legajoAsesor) {
        cambios.legajoAsesor = '60005841-K'
      }

      if (Object.keys(cambios).length > 0) {
        console.log('   Corrigiendo...')
        console.log('   Cambios:', cambios)

        try {
          await updateDoc(doc(db, 'migraciones', id), {
            ...cambios,
            actualizado: new Date().toISOString()
          })
          console.log('   ✅ Registro corregido exitosamente')
          encontrados++
        } catch (err) {
          console.error('   ❌ Error al corregir:', err.message)
        }
      } else {
        console.log('   ✓ Ya está correcto')
      }
    }
  }

  console.log(`\n📊 Total registros corregidos: ${encontrados}`)
}

main().catch((err) => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
