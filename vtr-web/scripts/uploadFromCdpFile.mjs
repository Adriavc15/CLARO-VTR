import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const cdpPath = process.argv[2]
const cdp = JSON.parse(fs.readFileSync(cdpPath, 'utf8'))
const raw = cdp.result?.value
const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
const items = parsed.items || parsed
if (!Array.isArray(items) || !items.length) {
  console.error('No items', typeof raw, parsed && Object.keys(parsed))
  process.exit(1)
}

const catUi = {
  transversal: 'FACTURACIÓN',
  hogar: 'FACTURACIÓN',
  retencion: 'FACTURACIÓN',
  movil: 'MOVIL',
  empresa: 'INFORMATIVO PARA EL ASESOR',
}

const byId = new Map()
for (const item of items) {
  const id = String(item.id)
  const catPath = item.categoriaPath || 'actualizado'
  const row = {
    id,
    nombre: String(item.nombre || '').replace(/\s+/g, ' ').trim(),
    enlace: item.enlace || `https://somosclave.cl/respuesta.php?q=${catPath}/${id}`,
    categoriaPath: catPath,
    fuente: 'inbenta-km-completo',
  }
  if (catUi[catPath]) row.categoria = catUi[catPath]
  if (row.nombre) byId.set(id, row)
}

const ids = [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id))
const seed = ids.map(({ id, nombre, enlace, categoria }) => {
  const o = { id, nombre, enlace }
  if (categoria) o.categoria = categoria
  return o
})

const root = path.resolve(__dirname, '..')
fs.writeFileSync(path.join(root, 'src/asistente/idsClaveExtraidos.json'), JSON.stringify(ids, null, 2))
fs.writeFileSync(
  path.join(root, 'src/asistente/idsClaveSeed.js'),
  `// Auto-generado desde Somos Clave KM completo (${ids.length} IDs)\nexport const IDS_CLAVE_SEED = ${JSON.stringify(seed, null, 2)}\n`
)
fs.writeFileSync(path.join(__dirname, '_sc-live-titles.json'), JSON.stringify(ids))

const admin = require(path.resolve(root, '../functions/node_modules/firebase-admin'))
if (!admin.apps.length) admin.initializeApp({ projectId: 'vtrclaroo-3c572' })
const db = admin.firestore()
let written = 0
for (let i = 0; i < ids.length; i += 400) {
  const batch = db.batch()
  for (const item of ids.slice(i, i + 400)) {
    const payload = {
      id: item.id,
      nombre: item.nombre,
      enlace: item.enlace,
      categoriaPath: item.categoriaPath || 'actualizado',
      actualizadoEn: new Date().toISOString(),
      fuente: 'inbenta-km-completo',
    }
    if (item.categoria) payload.categoria = item.categoria
    batch.set(db.collection('ids_clave_vtr').doc(item.id), payload, { merge: true })
    written++
  }
  await batch.commit()
}

console.log({ total: ids.length, written, sample: ids.slice(0, 3), last: ids.slice(-2) })
