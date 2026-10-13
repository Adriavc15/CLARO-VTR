/**
 * Bulk download Somos Clave FAQs using browser-extracted session + Inbenta token.
 * Or: process a folder of extracted FAQ JSON dumps.
 *
 * Prefer: node scripts/bulkDownloadSomosClave.mjs --from-list
 * Uses cookies.txt + inbenta token if present.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ASSETS = path.join(ROOT, 'public', 'sc-assets')
const OUT_JSON = path.join(ROOT, 'public', 'somosclave-contenidos.json')
const STATE = path.join(__dirname, '_bulk_state.json')
const DUMP_DIR = path.join(__dirname, '_faq_dumps')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function stripScripts(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}

function htmlToText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, '\n')
    .replace(/<\/td>/gi, ' | ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/add_circle_outline|record_voice_over|folder_special|expand_more|expand_less/gi, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function fileNameFromUrl(url, idx) {
  try {
    const u = new URL(url)
    let base = path.basename(u.pathname) || `img_${idx}`
    base = decodeURIComponent(base).replace(/[^\w.\-()]+/g, '_')
    if (!path.extname(base)) base += '.png'
    return base.slice(0, 120)
  } catch {
    return `img_${idx}.png`
  }
}

async function downloadImage(url, dest) {
  const res = await fetch(url, {
    headers: {
      Referer: 'https://somosclave.cl/',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
  })
  if (!res.ok) throw new Error(String(res.status))
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 40) throw new Error('tiny')
  fs.writeFileSync(dest, buf)
  return buf.length
}

export async function ingestOne({ id, title, html, enlace, categoriaPath }) {
  if (!html || html.length < 80) throw new Error('html vacío')
  const destDir = path.join(ASSETS, String(id))
  fs.mkdirSync(destDir, { recursive: true })

  const urls = [...new Set([...html.matchAll(/src=["'](https?:\/\/[^"']+)["']/gi)].map((m) => m[1]))]
  const map = new Map()
  const used = new Set()
  let imgsOk = 0
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    let name = fileNameFromUrl(url, i + 1)
    if (used.has(name)) name = `${path.parse(name).name}_${i}${path.extname(name)}`
    used.add(name)
    const dest = path.join(destDir, name)
    try {
      if (!fs.existsSync(dest) || fs.statSync(dest).size < 40) {
        await downloadImage(url, dest)
        await sleep(40)
      }
      map.set(url, `/sc-assets/${id}/${name}`)
      imgsOk++
    } catch {
      /* skip */
    }
  }

  let outHtml = stripScripts(html)
  for (const [remote, local] of map) {
    const esc = remote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    outHtml = outHtml.replace(new RegExp(esc, 'g'), local)
  }
  outHtml = outHtml.replace(/href="(?!https?:|mailto:|#)[^"]*"/gi, 'href="#"')

  const catalog = fs.existsSync(OUT_JSON)
    ? JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'))
    : { items: [] }
  const list = catalog.items || []
  let item = list.find((x) => String(x.id) === String(id))
  if (!item) {
    item = {
      id: String(id),
      nombre: title || `Artículo ${id}`,
      enlace: enlace || `https://somosclave.cl/respuesta.php?q=${categoriaPath || 'actualizado'}/${id}`,
      categoriaPath: categoriaPath || 'actualizado',
      texto: '',
      html: '',
    }
    list.push(item)
  }
  item.html = outHtml
  item.texto = htmlToText(html)
  if (title) item.nombre = title
  if (enlace) item.enlace = enlace
  if (categoriaPath) item.categoriaPath = categoriaPath

  list.sort((a, b) => Number(a.id) - Number(b.id))
  fs.writeFileSync(OUT_JSON, JSON.stringify({ items: list }, null, 0), 'utf8')
  return {
    id,
    imgs: imgsOk,
    imgsFound: urls.length,
    htmlLen: outHtml.length,
    collapsible: (outHtml.match(/collapsible-header/g) || []).length,
  }
}

/** Process all JSON dumps in scripts/_faq_dumps/{id}.json */
async function fromDumps() {
  fs.mkdirSync(DUMP_DIR, { recursive: true })
  const files = fs.readdirSync(DUMP_DIR).filter((f) => f.endsWith('.json'))
  console.log('dumps', files.length)
  for (const f of files) {
    const id = path.basename(f, '.json')
    const data = JSON.parse(fs.readFileSync(path.join(DUMP_DIR, f), 'utf8'))
    try {
      const r = await ingestOne({ id, ...data })
      console.log('OK', id, r)
    } catch (e) {
      console.log('FAIL', id, e.message)
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2]
  if (mode === '--from-dumps') fromDumps()
  else console.log('Uso: node scripts/bulkDownloadSomosClave.mjs --from-dumps')
}
