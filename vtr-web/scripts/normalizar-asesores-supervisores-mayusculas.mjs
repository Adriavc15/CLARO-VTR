import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBt6lwIgwGbm6fygktUc9amFnj5_e2DkWg",
  authDomain: "vtr-portal.firebaseapp.com",
  projectId: "vtr-portal",
  storageBucket: "vtr-portal.firebasestorage.app",
  messagingSenderId: "777795409652",
  appId: "1:777795409652:web:8bd5b6f2e0c06d2ab3a921"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

function limpiar(s = '') {
  return String(s || '').trim().replace(/\s+/g, ' ')
}

async function normalizarColeccion(nombreColeccion) {
  console.log(`\n=== Normalizando colección: ${nombreColeccion} ===`)
  const snap = await getDocs(collection(db, nombreColeccion))
  let actualizados = 0
  let sinCambios = 0
  let errores = 0

  for (const d of snap.docs) {
    try {
      const data = d.data() || {}
      const nombreOriginal = limpiar(data.nombre)
      if (!nombreOriginal) {
        sinCambios++
        continue
      }
      const nombreMayus = nombreOriginal.toUpperCase()
      if (nombreMayus === nombreOriginal && data.nombre === nombreOriginal) {
        sinCambios++
        continue
      }
      await setDoc(
        doc(db, nombreColeccion, d.id),
        {
          ...data,
          nombre: nombreMayus,
          actualizado: new Date().toISOString(),
        },
        { merge: true }
      )
      console.log(`OK: [${d.id}] "${nombreOriginal}" -> "${nombreMayus}"`)
      actualizados++
    } catch (e) {
      console.error(`ERR en ${d.id}:`, e?.message || e)
      errores++
    }
  }

  console.log(`\nResumen ${nombreColeccion}: actualizados=${actualizados} sinCambios=${sinCambios} errores=${errores}`)
}

async function run() {
  try {
    await normalizarColeccion('asesores')
    await normalizarColeccion('supervisores')
    console.log('\n¡Migración completada!')
    process.exit(0)
  } catch (e) {
    console.error('Error general:', e)
    process.exit(1)
  }
}

run()
