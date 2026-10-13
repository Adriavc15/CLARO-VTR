/**
 * Descarga HTML + imágenes de artículos Somos Clave vía Inbenta KM API
 * y los integra en public/somosclave-contenidos.json + public/sc-assets/{id}/
 *
 * node scripts/downloadSomosClavePages.mjs
 * node scripts/downloadSomosClavePages.mjs 1058 997 1346
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const REPO = path.resolve(ROOT, '..')
const ASSETS = path.join(ROOT, 'public', 'sc-assets')
const OUT_JSON = path.join(ROOT, 'public', 'somosclave-contenidos.json')
const RAG = path.join(REPO, 'somosclave-contenidos-rag.json')

const KM_JS = fs.readFileSync(path.join(__dirname, '_inbenta_knowledge.js'), 'utf8')
const API_KEY = [...KM_JS.matchAll(/'api_key':\s*'([^']+)'/g)].map((m) => m[1]).pop()
const DOMAIN_KEY = [...KM_JS.matchAll(/'domain_key':\s*'([^']+)'/g)].map((m) => m[1]).pop()
if (!API_KEY || !DOMAIN_KEY) throw new Error('Faltan api_key/domain_key en _inbenta_knowledge.js')

const DEFAULT_IDS = ['1058', '997', '1346']
const argIds = process.argv.slice(2).filter((x) => /^\d+$/.test(x))
const TARGET_IDS = argIds.length ? argIds : DEFAULT_IDS

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function stripScripts(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
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

async function authInbenta() {
  const res = await fetch('https://api.inbenta.io/v1/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-inbenta-key': API_KEY,
      Origin: 'https://somosclave.cl',
      Referer: 'https://somosclave.cl/',
    },
    body: JSON.stringify({ domain_key: DOMAIN_KEY }),
  })
  if (!res.ok) throw new Error(`Auth Inbenta: ${res.status} ${await res.text()}`)
  const data = await res.json()
  const accessToken = data.accessToken
  const knowledgeBase = (data.apis?.knowledge || '').replace(/\/$/, '')
  if (!accessToken || !knowledgeBase) throw new Error('Auth incompleto')
  console.log('Auth OK', knowledgeBase)
  return { accessToken, knowledgeBase }
}

async function fetchContent(knowledgeBase, accessToken, id) {
  const res = await fetch(`${knowledgeBase}/v1/contents/${id}`, {
    headers: {
      Authorization: accessToken,
      'x-inbenta-key': API_KEY,
      'X-INBENTA-ENV': 'production',
      Origin: 'https://somosclave.cl',
      Referer: 'https://somosclave.cl/',
    },
  })
  if (!res.ok) {
    return { ok: false, error: `${res.status} ${(await res.text()).slice(0, 180)}` }
  }
  const data = await res.json()
  const faq = data?.results?.[0] || data?.data?.results?.[0] || data
  const attrs = faq?.attributes || {}
  const html = attrs.ANSWER_TEXT || attrs.ANSWER || attrs.BODY || ''
  const title = attrs.TITLE || faq?.title || ''
  return { ok: !!html, html, title, raw: data }
}

function collectImageUrls(html) {
  const urls = new Set()
  for (const m of String(html).matchAll(/(?:src|data-src)=["']([^"']+)["']/gi)) {
    const u = m[1].trim()
    if (/^https?:\/\//i.test(u) && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(u)) urls.add(u)
    else if (/^https?:\/\//i.test(u) && /\/(image|media|upload|asset|static)/i.test(u)) urls.add(u)
  }
  // also bare https in style backgrounds
  for (const m of String(html).matchAll(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi)) {
    urls.add(m[2])
  }
  return [...urls]
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

async function downloadImage(url, destPath) {
  const res = await fetch(url, {
    headers: {
      Referer: 'https://somosclave.cl/',
      Origin: 'https://somosclave.cl',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 40) throw new Error('too small')
  fs.writeFileSync(destPath, buf)
  return buf.length
}

function rewriteHtmlImages(html, id, urlToLocal) {
  let out = stripScripts(html)
  for (const [remote, local] of urlToLocal) {
    const esc = remote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    out = out.replace(new RegExp(esc, 'g'), local)
  }
  // relative leftovers → sc-assets
  out = out.replace(/src=(["'])(?:\.\/)?[^"']+_files\/([^"']+)\1/gi, `src=$1/sc-assets/${id}/$2$1`)
  out = out.replace(/href="(?!https?:|mailto:|#)[^"]*"/gi, 'href="#"')
  return out
}

function loadCatalog() {
  const byId = new Map()
  if (fs.existsSync(OUT_JSON)) {
    const j = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'))
    for (const a of j.items || []) byId.set(String(a.id), a)
  }
  if (fs.existsSync(RAG)) {
    const rag = JSON.parse(fs.readFileSync(RAG, 'utf8'))
    for (const a of rag.items || rag) {
      const id = String(a.id)
      if (!byId.has(id)) {
        byId.set(id, {
          id,
          nombre: a.nombre,
          enlace: a.enlace,
          categoriaPath: a.categoriaPath || 'actualizado',
          texto: a.texto || '',
          html: '',
        })
      }
    }
  }
  return byId
}

async function main() {
  const { accessToken, knowledgeBase } = await authInbenta()
  const byId = loadCatalog()
  const report = []

  for (const id of TARGET_IDS) {
    process.stdout.write(`\n[${id}] fetching… `)
    const row = await fetchContent(knowledgeBase, accessToken, id)
    if (!row.ok) {
      console.log('FAIL', row.error)
      report.push({ id, ok: false, error: row.error })
      await sleep(200)
      continue
    }
    console.log(`HTML ${row.html.length} chars · ${row.title || ''}`)

    const destDir = path.join(ASSETS, id)
    fs.mkdirSync(destDir, { recursive: true })
    const urls = collectImageUrls(row.html)
    console.log(`  images found: ${urls.length}`)
    const urlToLocal = new Map()
    let downloaded = 0
    const usedNames = new Set()

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      let name = fileNameFromUrl(url, i + 1)
      if (usedNames.has(name)) name = `${path.parse(name).name}_${i}${path.extname(name)}`
      usedNames.add(name)
      const dest = path.join(destDir, name)
      try {
        if (!fs.existsSync(dest)) {
          await downloadImage(url, dest)
          downloaded++
          await sleep(80)
        }
        urlToLocal.set(url, `/sc-assets/${id}/${name}`)
      } catch (e) {
        console.log(`  skip img ${name}: ${e.message}`)
      }
    }

    const html = rewriteHtmlImages(row.html, id, urlToLocal)
    const texto = htmlToText(row.html)
    const prev = byId.get(id) || {
      id,
      nombre: row.title || `Artículo ${id}`,
      enlace: `https://somosclave.cl/respuesta.php?q=actualizado/${id}`,
      categoriaPath: 'actualizado',
      texto: '',
      html: '',
    }
    prev.html = html
    prev.texto = texto || prev.texto
    if (row.title) prev.nombre = row.title
    byId.set(id, prev)

    report.push({
      id,
      ok: true,
      title: row.title,
      htmlLen: html.length,
      imgsFound: urls.length,
      imgsDownloaded: downloaded,
      collapsible: (html.match(/collapsible-header/g) || []).length,
    })
    await sleep(250)
  }

  const items = [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id))
  fs.writeFileSync(OUT_JSON, JSON.stringify({ items }, null, 0), 'utf8')
  console.log('\n=== RESUMEN ===')
  console.table(report)
  console.log('JSON →', OUT_JSON)
  console.log(
    'withHtml',
    items.filter((i) => i.html).length,
    'withAssetsSrc',
    items.filter((i) => /src="\/sc-assets\//.test(i.html || '')).length
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
