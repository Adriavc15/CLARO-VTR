import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const txt = fs.readFileSync(path.join(root, 'src/asistente/idsClaveSeed.js'), 'utf8')
const seedIds = [...txt.matchAll(/"id":\s*"(\d+)"/g)].map((m) => m[1])
const j = JSON.parse(fs.readFileSync(path.join(root, 'public/somosclave-contenidos.json'), 'utf8'))
const withHtml = new Set(j.items.filter((i) => i.html && i.html.length > 200).map((i) => String(i.id)))
const allMissing = j.items
  .filter((i) => !withHtml.has(String(i.id)))
  .map((i) => {
    const enlace = i.enlace || ''
    const m = enlace.match(/respuesta\.php\?q=([^/]+)\/(\d+)/i)
    const q = m ? `${m[1]}/${m[2]}` : `${i.categoriaPath || 'actualizado'}/${i.id}`
    return {
      id: String(i.id),
      q,
      nombre: i.nombre,
      enlace: enlace || `https://somosclave.cl/respuesta.php?q=${q}`,
    }
  })

// Prioritize seed (Acceder UI) first
const seedSet = new Set(seedIds)
const prioritized = [
  ...allMissing.filter((x) => seedSet.has(x.id)),
  ...allMissing.filter((x) => !seedSet.has(x.id)),
]

fs.writeFileSync(path.join(root, 'scripts/_missing_ids.json'), JSON.stringify(prioritized), 'utf8')
console.log({
  seedTotal: seedIds.length,
  seedMissing: seedIds.filter((id) => !withHtml.has(id)).length,
  allMissing: allMissing.length,
  withHtml: withHtml.size,
})
