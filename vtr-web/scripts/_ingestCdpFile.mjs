/**
 * Procesa un archivo de respuesta CDP (Runtime.evaluate con array de FAQs)
 * node scripts/_ingestCdpFile.mjs <cdp-response.json>
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { ingestOne } = await import(pathToFileURL(path.join(__dirname, 'bulkDownloadSomosClave.mjs')).href)

const file = process.argv[2]
if (!file) {
  console.error('Uso: node scripts/_ingestCdpFile.mjs <cdp.json>')
  process.exit(1)
}

const j = JSON.parse(fs.readFileSync(file, 'utf8'))
const arr =
  j?.result?.result?.value ||
  j?.result?.value ||
  j?.value ||
  j

if (!Array.isArray(arr)) {
  console.error('No hay array en CDP response')
  process.exit(1)
}

let ok = 0
let fail = 0
for (const row of arr) {
  if (!row?.ok || !row.html || row.html.length < 200) {
    fail++
    console.log('SKIP', row?.id, row?.err || 'sin html')
    continue
  }
  try {
    const r = await ingestOne({
      id: row.id,
      title: row.title,
      html: row.html,
      enlace: row.enlace,
      categoriaPath: row.categoriaPath,
    })
    ok++
    console.log('OK', row.id, `html=${r.htmlLen} imgs=${r.imgs}/${r.imgsFound} coll=${r.collapsible}`)
  } catch (e) {
    fail++
    console.log('FAIL', row.id, e.message)
  }
}
console.log(JSON.stringify({ ok, fail, total: arr.length }))
