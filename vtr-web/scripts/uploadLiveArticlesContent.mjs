import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { articuloSomosClaveADoc } from '../src/asistente/conocimientoSomosClave.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const live = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/asistente/_liveArticles.json'), 'utf8'))

const docs = []
for (const a of live) {
  const d = articuloSomosClaveADoc({
    id: a.id,
    nombre: a.nombre || a.tituloCompleto,
    enlace: a.enlace,
    categoriaPath: a.categoria || 'actualizado',
    texto: a.contenido,
  })
  if (d) docs.push(d)
}

const admin = require(path.resolve(__dirname, '../../functions/node_modules/firebase-admin'))
if (!admin.apps.length) admin.initializeApp({ projectId: 'vtrclaroo-3c572' })
const db = admin.firestore()
let written = 0
for (let i = 0; i < docs.length; i += 200) {
  const batch = db.batch()
  for (const d of docs.slice(i, i + 200)) {
    const { id, ...rest } = d
    const payload = { id, ...rest }
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])
    batch.set(db.collection('conocimiento_portal').doc(id), payload, { merge: true })
    written++
  }
  await batch.commit()
}
console.log('subidos desde _liveArticles', written)
