/**
 * Extrae catálogo de IDs desde "Somos Clave _ Portal Privado.html"
 * Uso: node src/asistente/extraerIdsSomosClave.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { extraerIdsDesdeHtml } from './idsClaveLive.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.resolve(__dirname, '../../../Somos Clave _ Portal Privado.html')
const outJs = path.resolve(__dirname, 'idsClaveSeed.js')
const outJson = path.resolve(__dirname, 'idsClaveExtraidos.json')

if (!fs.existsSync(htmlPath)) {
  console.error('No existe:', htmlPath)
  console.error('Guarda el HTML logueado de Somos Clave con ese nombre o sube el archivo desde el admin.')
  process.exit(1)
}

const html = fs.readFileSync(htmlPath, 'utf8')
const ids = extraerIdsDesdeHtml(html)
console.log('IDs extraídos:', ids.length)

const seed = ids.map(({ id, nombre, enlace, categoria }) => {
  const o = { id, nombre, enlace }
  if (categoria) o.categoria = categoria
  return o
})

fs.writeFileSync(outJson, JSON.stringify(ids, null, 2))
fs.writeFileSync(
  outJs,
  `// Auto-generado / seed IDs Clave VTR\n// Regenerar: node src/asistente/extraerIdsSomosClave.mjs\nexport const IDS_CLAVE_SEED = ${JSON.stringify(seed, null, 2)}\n`
)
console.log('OK →', outJs)
