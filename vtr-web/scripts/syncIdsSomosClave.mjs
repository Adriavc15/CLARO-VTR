/**
 * Extrae IDs/títulos/enlaces de Somos Clave (HTML local + dumps) y sube a Firestore.
 * Uso: node scripts/syncIdsSomosClave.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const repoRoot = path.resolve(root, '..')

const { extraerIdsDesdeHtml, normalizarIdClave, COL_IDS_CLAVE } = await import(
  pathToFileURL(path.join(root, 'src/asistente/idsClaveLive.js')).href
)

const htmlPath = path.join(repoRoot, 'Somos Clave _ Portal Privado.html')
const dumpPath = path.join(root, 'src/asistente/somosClaveDump.json')
const homeFaqsPath = path.join(root, 'src/asistente/_homeFaqs.json')
const livePath = path.join(root, 'src/asistente/_liveArticles.json')
const idsToFetchPath = path.join(__dirname, '_ids-to-fetch.json')
const outSeed = path.join(root, 'src/asistente/idsClaveSeed.js')
const outJson = path.join(root, 'src/asistente/idsClaveExtraidos.json')

const catUi = (pathCat, existing) => {
  if (existing && existing !== 'General') return existing
  const c = String(pathCat || 'actualizado').toLowerCase()
  const map = {
    actualizado: null,
    transversal: 'FACTURACIÓN',
    hogar: 'FACTURACIÓN',
    retencion: 'FACTURACIÓN',
    movil: 'MOVIL',
    empresa: 'INFORMATIVO PARA EL ASESOR',
  }
  return map[c] ?? null
}

const byId = new Map()

const upsert = (raw, prioridad = 0) => {
  const item = normalizarIdClave(raw)
  if (!item) return
  const prev = byId.get(item.id)
  const nombreDebil = !item.nombre || /^Artículo\s+\d+$/i.test(item.nombre)
  if (!prev) {
    byId.set(item.id, { ...item, _prio: prioridad })
    return
  }
  const prevDebil = !prev.nombre || /^Artículo\s+\d+$/i.test(prev.nombre)
  const betterName = !nombreDebil && (prevDebil || prioridad >= (prev._prio || 0))
  byId.set(item.id, {
    ...prev,
    ...item,
    nombre: betterName ? item.nombre : prev.nombre,
    enlace: item.enlace || prev.enlace,
    categoria: item.categoria || prev.categoria,
    categoriaPath: item.categoriaPath || prev.categoriaPath,
    fuente: item.fuente || prev.fuente,
    _prio: Math.max(prioridad, prev._prio || 0),
  })
}

// 1) Dump curado del portal (60 IDs del catálogo intranet)
if (fs.existsSync(dumpPath)) {
  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'))
  for (const a of dump.articles || []) {
    const q = String(a.q || '').split('/')
    const catPath = q[0] || 'actualizado'
    upsert(
      {
        id: a.id,
        nombre: a.nombre,
        enlace: a.enlace,
        categoriaPath: catPath,
        categoria: catUi(catPath, a.categoria),
        fuente: 'dump-portal',
      },
      3
    )
  }
}

// 2) Home FAQs / live API
for (const p of [homeFaqsPath, livePath]) {
  if (!fs.existsSync(p)) continue
  const arr = JSON.parse(fs.readFileSync(p, 'utf8'))
  if (!Array.isArray(arr)) continue
  for (const a of arr) {
    if (!/^\d+$/.test(String(a.id || ''))) continue
    upsert(
      {
        id: a.id,
        nombre: a.nombre || a.tituloCompleto,
        enlace: a.enlace,
        categoriaPath: a.categoria || a.categoriaPath || 'actualizado',
        categoria: catUi(a.categoria || a.categoriaPath, null),
        fuente: a.fuente || 'local-json',
      },
      2
    )
  }
}

// 2.5) IDs desde _ids-to-fetch.json
if (fs.existsSync(idsToFetchPath)) {
  const idsToFetch = JSON.parse(fs.readFileSync(idsToFetchPath, 'utf8'))
  for (const a of idsToFetch) {
    if (!/^\d+$/.test(String(a.id || ''))) continue
    upsert(
      {
        id: a.id,
        nombre: a.nombre || `Artículo ${a.id}`,
        enlace: `https://somosclave.cl/respuesta.php?q=${a.cat || 'actualizado'}/${a.id}`,
        categoriaPath: a.cat || 'actualizado',
        categoria: catUi(a.cat, null),
        fuente: 'ids-to-fetch',
      },
      1
    )
  }
  console.log('Desde _ids-to-fetch.json:', idsToFetch.length)
}

// 3) HTML guardado de https://somosclave.cl (logueado)
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8')
  const fromHtml = extraerIdsDesdeHtml(html)
  for (const item of fromHtml) {
    upsert({ ...item, fuente: item.fuente || 'html-somosclave' }, 1)
  }
  console.log('Desde HTML:', fromHtml.length)
} else {
  console.warn('HTML no encontrado:', htmlPath)
}

const ids = [...byId.values()]
  .map(({ _prio, ...rest }) => rest)
  .sort((a, b) => Number(a.id) - Number(b.id))

console.log('Total únicos:', ids.length)
console.log('Con título real:', ids.filter((x) => !/^Artículo\s+\d+$/i.test(x.nombre)).length)

const seed = ids.map(({ id, nombre, enlace, categoria }) => {
  const o = { id, nombre, enlace }
  if (categoria) o.categoria = categoria
  return o
})

fs.writeFileSync(outJson, JSON.stringify(ids, null, 2))
fs.writeFileSync(
  outSeed,
  `// Auto-generado desde Somos Clave (HTML + dumps)\n// Regenerar: node scripts/syncIdsSomosClave.mjs\nexport const IDS_CLAVE_SEED = ${JSON.stringify(seed, null, 2)}\n`
)
console.log('Seed →', outSeed)

// Subir a Firestore con Admin SDK
import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
if (!admin.getApps().length) {
  admin.initializeApp({ projectId: 'vtrclaroo-3c572' })
}
const db = getFirestore()
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
      fuente: item.fuente || 'sync-script',
    }
    if (item.categoria) payload.categoria = item.categoria
    batch.set(db.collection(COL_IDS_CLAVE).doc(item.id), payload, { merge: true })
    written++
  }
  await batch.commit()
}
console.log(`Firestore ${COL_IDS_CLAVE}: ${written} docs subidos`)
