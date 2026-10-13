import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { IDS_CLAVE_SEED } from '../src/asistente/idsClaveSeed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const partsDir = path.join(__dirname, '_sc_parts')
const files = fs.existsSync(partsDir) ? fs.readdirSync(partsDir).filter((f) => f.endsWith('.json')) : []
const byId = new Map()

for (const item of IDS_CLAVE_SEED) {
  const m = String(item.enlace || '').match(/q=([a-z0-9_-]+)\/(\d+)/i)
  byId.set(String(item.id), {
    id: String(item.id),
    nombre: item.nombre,
    enlace: item.enlace,
    categoriaPath: m ? m[1] : 'actualizado',
    ...(item.categoria ? { categoria: item.categoria } : {}),
  })
}

for (const f of files) {
  const arr = JSON.parse(fs.readFileSync(path.join(partsDir, f), 'utf8'))
  for (const item of arr) {
    byId.set(String(item.id), {
      id: String(item.id),
      nombre: item.nombre,
      enlace: item.enlace || `https://somosclave.cl/respuesta.php?q=${item.categoriaPath || 'actualizado'}/${item.id}`,
      categoriaPath: item.categoriaPath || 'actualizado',
      fuente: 'inbenta-km-paginado',
    })
  }
}

const catUi = {
  transversal: 'FACTURACIÓN',
  hogar: 'FACTURACIÓN',
  retencion: 'FACTURACIÓN',
  movil: 'MOVIL',
  empresa: 'INFORMATIVO PARA EL ASESOR',
}

const ids = [...byId.values()]
  .map((item) => {
    const cat = catUi[item.categoriaPath]
    return cat ? { ...item, categoria: item.categoria || cat } : item
  })
  .sort((a, b) => Number(a.id) - Number(b.id))

const seed = ids.map(({ id, nombre, enlace, categoria }) => {
  const o = { id, nombre, enlace }
  if (categoria) o.categoria = categoria
  return o
})

const root = path.resolve(__dirname, '..')
fs.writeFileSync(path.join(root, 'src/asistente/idsClaveExtraidos.json'), JSON.stringify(ids, null, 2))
fs.writeFileSync(
  path.join(root, 'src/asistente/idsClaveSeed.js'),
  `// Auto-generado desde Somos Clave KM (paginado completo)\nexport const IDS_CLAVE_SEED = ${JSON.stringify(seed, null, 2)}\n`
)

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
      fuente: item.fuente || 'inbenta-km-paginado',
    }
    if (item.categoria) payload.categoria = item.categoria
    batch.set(db.collection('ids_clave_vtr').doc(item.id), payload, { merge: true })
    written++
  }
  await batch.commit()
}
console.log({ total: ids.length, written, parts: files.length })
