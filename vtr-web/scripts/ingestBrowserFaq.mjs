/**
 * Procesa HTML extraído del navegador (faq-content) + descarga imgs CDN Inbenta
 * → public/sc-assets/{id}/ + actualiza somosclave-contenidos.json
 *
 * node scripts/ingestBrowserFaq.mjs <id> <htmlFile.json|html>
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ASSETS = path.join(ROOT, 'public', 'sc-assets')
const OUT_JSON = path.join(ROOT, 'public', 'somosclave-contenidos.json')

const id = process.argv[2]
const srcPath = process.argv[3]
if (!id || !srcPath) {
  console.error('Uso: node scripts/ingestBrowserFaq.mjs <id> <archivo>')
  process.exit(1)
}

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

function loadHtml(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  if (filePath.endsWith('.json')) {
    const j = JSON.parse(raw)
    // CDP wrapper: { result: { result: { value: { html, title } } } } or flat
    const v =
      j?.result?.result?.value ||
      j?.result?.value ||
      j?.value ||
      j
    return { html: v.html || v.HTML || '', title: v.title || v.TITLE || '' }
  }
  return { html: raw, title: '' }
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

async function main() {
  const { html: rawHtml, title } = loadHtml(srcPath)
  if (!rawHtml || rawHtml.length < 100) throw new Error('HTML vacío')

  const destDir = path.join(ASSETS, id)
  fs.mkdirSync(destDir, { recursive: true })

  const urls = [...new Set([...rawHtml.matchAll(/src=["'](https?:\/\/[^"']+)["']/gi)].map((m) => m[1]))]
  console.log(`ID ${id}: html=${rawHtml.length} imgs=${urls.length} title=${title}`)

  const map = new Map()
  const used = new Set()
  let ok = 0
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    let name = fileNameFromUrl(url, i + 1)
    if (used.has(name)) name = `${path.parse(name).name}_${i}${path.extname(name)}`
    used.add(name)
    const dest = path.join(destDir, name)
    try {
      if (!fs.existsSync(dest) || fs.statSync(dest).size < 40) {
        const n = await downloadImage(url, dest)
        console.log(`  ✓ ${name} (${n} bytes)`)
        await sleep(60)
      } else {
        console.log(`  · ${name} (cached)`)
      }
      map.set(url, `/sc-assets/${id}/${name}`)
      ok++
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message}`)
    }
  }

  let html = stripScripts(rawHtml)
  // unwrap holder-faq if present
  const holder = html.match(/<div class="holder-faq"[^>]*>([\s\S]*)<\/div>\s*$/i)
  if (holder) html = holder[1]
  for (const [remote, local] of map) {
    const esc = remote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    html = html.replace(new RegExp(esc, 'g'), local)
  }
  html = html.replace(/href="(?!https?:|mailto:|#)[^"]*"/gi, 'href="#"')

  const catalog = fs.existsSync(OUT_JSON)
    ? JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'))
    : { items: [] }
  const items = catalog.items || catalog
  const list = Array.isArray(items) ? items : []
  let item = list.find((x) => String(x.id) === String(id))
  if (!item) {
    item = {
      id: String(id),
      nombre: title || `Artículo ${id}`,
      enlace: `https://somosclave.cl/respuesta.php?q=actualizado/${id}`,
      categoriaPath: 'actualizado',
      texto: '',
      html: '',
    }
    list.push(item)
  }
  item.html = html
  item.texto = htmlToText(rawHtml)
  if (title) item.nombre = title

  list.sort((a, b) => Number(a.id) - Number(b.id))
  fs.writeFileSync(OUT_JSON, JSON.stringify({ items: list }, null, 0), 'utf8')
  console.log(`OK imgs ${ok}/${urls.length} · collapsible ${(html.match(/collapsible-header/g) || []).length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
