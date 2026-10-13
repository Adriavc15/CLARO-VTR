import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { articuloSomosClaveADoc } from '../src/asistente/conocimientoSomosClave.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const partsDir = path.join(__dirname, '_sc_content_parts')
fs.mkdirSync(partsDir, { recursive: true })

const files = process.argv.slice(2)
if (!files.length) {
  console.error('usage: node uploadScContentParts.mjs <cdp-or-json>...')
  process.exit(1)
}

const rawItems = []
for (const f of files) {
  const p = path.resolve(f)
  const data = JSON.parse(fs.readFileSync(p, 'utf8'))
  const v = data.result?.value ?? data
  const arr = Array.isArray(v) ? v : v.items || v.lote || v.docs || []
  if (Array.isArray(arr)) rawItems.push(...arr)
  else if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v)
      rawItems.push(...(parsed.items || parsed))
    } catch {
      /* ignore */
    }
  }
}

const docs = []
for (const item of rawItems) {
  const d = articuloSomosClaveADoc({
    id: item.id,
    nombre: item.nombre || item.title,
    enlace: item.enlace,
    categoriaPath: item.categoriaPath || item.cat,
    texto: item.texto || item.text || item.body,
    html: item.html,
  })
  if (d) docs.push(d)
}

const byId = new Map(docs.map((d) => [d.id, d]))
const unique = [...byId.values()]
console.log('docs validos', unique.length, 'de', rawItems.length)

const admin = require(path.resolve(__dirname, '../../functions/node_modules/firebase-admin'))
if (!admin.apps.length) admin.initializeApp({ projectId: 'vtrclaroo-3c572' })
const db = admin.firestore()

let written = 0
for (let i = 0; i < unique.length; i += 200) {
  const batch = db.batch()
  for (const d of unique.slice(i, i + 200)) {
    const { id, ...rest } = d
    // Firestore rejects undefined
    const payload = { id, ...rest }
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])
    batch.set(db.collection('conocimiento_portal').doc(id), payload, { merge: true })
    written++
  }
  await batch.commit()
}
console.log('subidos conocimiento_portal', written)
