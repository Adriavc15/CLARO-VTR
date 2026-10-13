import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Pegado desde sesión logueada Somos Clave (Inbenta KM getContentById / getCategoryContents)
const live = JSON.parse(fs.readFileSync(path.join(__dirname, '_sc-live-titles.json'), 'utf8'))
const prev = JSON.parse(fs.readFileSync(path.join(__dirname, '_ids-to-fetch.json'), 'utf8'))

const catUi = {
  transversal: 'FACTURACIÓN',
  hogar: 'FACTURACIÓN',
  retencion: 'FACTURACIÓN',
  movil: 'MOVIL',
  empresa: 'INFORMATIVO PARA EL ASESOR',
}

const byId = new Map()
for (const p of prev) {
  byId.set(String(p.id), {
    id: String(p.id),
    nombre: p.nombre,
    enlace: `https://somosclave.cl/respuesta.php?q=${p.cat}/${p.id}`,
    categoriaPath: p.cat,
    ...(catUi[p.cat] ? { categoria: catUi[p.cat] } : {}),
  })
}

for (const item of live) {
  const prevItem = byId.get(item.id)
  const catPath = prevItem?.categoriaPath || item.categoriaPath || 'actualizado'
  byId.set(item.id, {
    id: item.id,
    nombre: item.nombre,
    enlace: `https://somosclave.cl/respuesta.php?q=${catPath}/${item.id}`,
    categoriaPath: catPath,
    ...(catUi[catPath] ? { categoria: catUi[catPath] } : prevItem?.categoria ? { categoria: prevItem.categoria } : {}),
    fuente: 'inbenta-km-live',
  })
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
  `// Auto-generado desde Somos Clave (sesión KM live)\nexport const IDS_CLAVE_SEED = ${JSON.stringify(seed, null, 2)}\n`
)

const admin = require(path.resolve(root, '../functions/node_modules/firebase-admin'))
if (!admin.apps.length) admin.initializeApp({ projectId: 'vtrclaroo-3c572' })
const db = admin.firestore()
const CHUNK = 400
let written = 0
for (let i = 0; i < ids.length; i += CHUNK) {
  const batch = db.batch()
  for (const item of ids.slice(i, i + CHUNK)) {
    const payload = {
      id: item.id,
      nombre: item.nombre,
      enlace: item.enlace,
      categoriaPath: item.categoriaPath || 'actualizado',
      actualizadoEn: new Date().toISOString(),
      fuente: item.fuente || 'inbenta-km-live',
    }
    if (item.categoria) payload.categoria = item.categoria
    batch.set(db.collection('ids_clave_vtr').doc(item.id), payload, { merge: true })
    written++
  }
  await batch.commit()
}

console.log('total', ids.length, 'subidos', written)
console.log('sin titulo', ids.filter((x) => /^Artículo/.test(x.nombre)).length)
console.log('ejemplos', ids.filter((x) => ['413', '1010', '1111', '1265', '1303'].includes(x.id)))
