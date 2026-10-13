/**
 * Backfill puntual: marca como «Migración Cursada» los documentos de la
 * colección `migraciones` que NO tienen un estado válido (los antiguos).
 *
 * Uso:  node scripts/backfillEstadoCursada.mjs
 * Es idempotente: solo escribe en los documentos sin estado válido.
 * Respeta los que ya tienen «Migración No Cursada».
 */
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBTS2289cU0WwQQH9X6m2r0DdgqAgVAK0I',
  authDomain: 'vtrclaroo-3c572.firebaseapp.com',
  projectId: 'vtrclaroo-3c572',
  storageBucket: 'vtrclaroo-3c572.firebasestorage.app',
  messagingSenderId: '417392161995',
  appId: '1:417392161995:web:3301a4bb068814a497974e',
}

const COL = 'migraciones'
const ESTADOS_VALIDOS = ['Migración Cursada', 'Migración No Cursada']
const ESTADO_CURSADA = 'Migración Cursada'

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const snap = await getDocs(collection(db, COL))
const total = snap.size

const pendientes = []
snap.forEach((s) => {
  const data = s.data() || {}
  if (!ESTADOS_VALIDOS.includes(data.estado)) pendientes.push(s.id)
})

console.log(`Documentos totales: ${total}`)
console.log(`Sin estado válido:  ${pendientes.length}`)

const ahora = new Date().toISOString()
let escritos = 0
for (let i = 0; i < pendientes.length; i += 400) {
  const batch = writeBatch(db)
  for (const id of pendientes.slice(i, i + 400)) {
    batch.update(doc(db, COL, id), { estado: ESTADO_CURSADA, actualizado: ahora })
  }
  await batch.commit()
  escritos += pendientes.slice(i, i + 400).length
  console.log(`Actualizados: ${escritos}/${pendientes.length}`)
}

console.log('✅ Backfill completado.')
process.exit(0)
