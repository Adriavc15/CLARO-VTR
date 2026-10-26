import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(ROOT, '..')
const HTML_PATH = path.join(REPO_ROOT, 'Somos Clave _ Portal Privado.html')
const IDS_FILE = path.join(__dirname, '_ids-to-fetch.json')

const html = fs.readFileSync(HTML_PATH, 'utf8')
const matches = html.match(/respuesta\.php\?q=([^"'\s)]+)/g) || []
const idsFromHtml = new Set()

matches.forEach(m => {
  const parts = m.split('/')
  const id = parts[parts.length - 1]
  if (/^\d+$/.test(id)) idsFromHtml.add(id)
})

const idsData = JSON.parse(fs.readFileSync(IDS_FILE, 'utf8'))
const idsFromFile = new Set(idsData.map(item => String(item.id)))

const onlyInHtml = [...idsFromHtml].filter(id => !idsFromFile.has(id))
const onlyInFile = [...idsFromFile].filter(id => !idsFromHtml.has(id))

console.log('IDs en HTML del portal:', idsFromHtml.size)
console.log('IDs en archivo _ids-to-fetch.json:', idsFromFile.size)
console.log('\nIDs solo en HTML (no en archivo):', onlyInHtml.length)
if (onlyInHtml.length > 0) {
  console.log(onlyInHtml.sort((a,b) => Number(a)-Number(b)).join(', '))
}
console.log('\nIDs solo en archivo (no en HTML):', onlyInFile.length)
if (onlyInFile.length > 0) {
  console.log(onlyInFile.sort((a,b) => Number(a)-Number(b)).join(', '))
}
