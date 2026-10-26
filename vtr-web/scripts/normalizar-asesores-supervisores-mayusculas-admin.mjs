import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function getServiceAccount() {
  const paths = [
    resolve(process.cwd(), 'serviceAccountKey.json'),
    resolve(process.cwd(), '../serviceAccountKey.json'),
    resolve(process.cwd(), '../../serviceAccountKey.json'),
  ]
  for (const p of paths) {
    try {
      const raw = readFileSync(p, 'utf8')
      return JSON.parse(raw)
    } catch {}
  }
  throw new Error('No se encontró serviceAccountKey.json')
}

const serviceAccount = getServiceAccount()
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

function limpiar(s = '') {
  return String(s || '').trim().replace(/\s+/g, ' ')
}

async function normalizarColeccion(nombreColeccion) {
  console.log(`\n=== Normalizando colección: ${nombreColeccion} ===`)
  const snap = await db.collection(nombreColeccion).get()
  let actualizados = 0
  let sinCambios = 0
  let errores = 0

  const batch = db.batch()
  let ops = 0

  for (const docSnap of snap.docs) {
    try {
      const data = docSnap.data() || {}
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
      batch.update(docSnap.ref, {
        nombre: nombreMayus,
        actualizado: new Date().toISOString(),
      })
      console.log(`OK: [${docSnap.id}] "${nombreOriginal}" -> "${nombreMayus}"`)
      actualizados++
      ops++
      if (ops >= 400) {
        await batch.commit()
        ops = 0
      }
    } catch (e) {
      console.error(`ERR en ${docSnap.id}:`, e?.message || e)
      errores++
    }
  }

  if (ops > 0) {
    await batch.commit()
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
