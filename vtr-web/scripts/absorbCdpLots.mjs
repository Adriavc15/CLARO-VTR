import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const partsDir = path.join(__dirname, '_sc_parts')
fs.mkdirSync(partsDir, { recursive: true })

// lote1 from CDP
const lote1 = JSON.parse(fs.readFileSync(path.join(__dirname, '_lote1.json'), 'utf8'))
fs.writeFileSync(path.join(partsDir, 'lote1.json'), JSON.stringify(lote1))

// CDP big response with lote2-6
const cdpPath = process.argv[2]
if (!cdpPath || !fs.existsSync(cdpPath)) {
  console.error('usage: node absorbCdpLots.mjs <cdp-response.json>')
  process.exit(1)
}
const cdp = JSON.parse(fs.readFileSync(cdpPath, 'utf8'))
const v = cdp.result?.value || cdp
for (const key of ['lote2', 'lote3', 'lote4', 'lote5', 'lote6']) {
  if (Array.isArray(v[key])) {
    fs.writeFileSync(path.join(partsDir, `${key}.json`), JSON.stringify(v[key]))
    console.log(key, v[key].length)
  }
}
console.log('lote1', lote1.length)
