import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.resolve(__dirname, '../../../Somos Clave _ Portal Privado.html')
const outJs = path.resolve(__dirname, 'somosClaveScraped.js')
const outJson = path.resolve(__dirname, 'somosClaveScraped.json')

const html = fs.readFileSync(htmlPath, 'utf8')

const stripTags = (s) =>
  String(s || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()

const truncate = (s, max = 16000) =>
  s && s.length > max ? s.slice(0, max) + '\n…[contenido truncado]' : (s || '')

const extractBody = (chunk) => {
  const item = chunk.match(
    /class="body__contents__item"[^>]*>\s*<div>([\s\S]*?)<\/div>\s*<\/span>/i
  )
  if (item) return stripTags(item[1])
  const contents = chunk.match(/class="body__contents"[^>]*>([\s\S]*?)<div class="body__rating"/i)
  if (contents) return stripTags(contents[1])
  const preview = chunk.match(/<\/span><\/div>\s*<p>([\s\S]*?)<\/p>\s*<small>/i)
  if (preview) return stripTags(preview[1])
  return ''
}

const docs = []
const popularMarker = html.search(/Lo m[aá]s consultado/i)
const ultimasEnd = popularMarker > 0 ? popularMarker : html.length

// 1) Últimas actualizaciones (solo hasta "Lo más consultado")
{
  const section = html.slice(0, ultimasEnd)
  const re = /<div class="inbenta-km__faq"[^>]*data-id="(\d+)"[^>]*data-category="([^"]*)"[^>]*>/gi
  const starts = []
  let m
  while ((m = re.exec(section)) !== null) {
    starts.push({ id: m[1], category: m[2], end: m.index + m[0].length, index: m.index })
  }
  for (let i = 0; i < starts.length; i++) {
    const cur = starts[i]
    const chunkEnd = i + 1 < starts.length ? starts[i + 1].index : section.length
    const chunk = section.slice(cur.end, chunkEnd)
    const titleMatch = chunk.match(/class="title__faq__text">([\s\S]*?)<\/span>/i)
    const title = stripTags(titleMatch ? titleMatch[1] : '')
    const body = extractBody(chunk)
    docs.push({
      id: cur.id,
      categoria: cur.category || 'actualizado',
      nombre: title.replace(/^\[[\d\-]+\]\s*/, '').trim() || `Artículo ${cur.id}`,
      tituloCompleto: title,
      enlace: `https://somosclave.cl/respuesta.php?q=${cur.category || 'actualizado'}/${cur.id}`,
      contenido: truncate(body),
      fuente: 'ultimas-actualizaciones',
      sinonimos: [],
    })
  }
}

// 2) Lo más consultado
{
  const section = popularMarker > 0 ? html.slice(popularMarker) : ''
  const re = /<div class="inbenta-km__faq">/gi
  const starts = []
  let m
  while ((m = re.exec(section)) !== null) {
    starts.push({ end: m.index + m[0].length, index: m.index })
  }
  for (let i = 0; i < starts.length; i++) {
    const cur = starts[i]
    const chunkEnd = i + 1 < starts.length ? starts[i + 1].index : Math.min(section.length, cur.end + 200000)
    const chunk = section.slice(cur.end, chunkEnd)
    const titleMatch = chunk.match(/class="title__faq__text">([\s\S]*?)<\/span>/i)
    const title = stripTags(titleMatch ? titleMatch[1] : '')
    if (!title) continue
    const body = extractBody(chunk)
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48)
    docs.push({
      id: `popular-${slug || i + 1}`,
      categoria: 'mas-consultado',
      nombre: title,
      tituloCompleto: title,
      enlace: `https://somosclave.cl/index.php#${encodeURIComponent(title)}`,
      contenido: truncate(body),
      fuente: 'mas-consultado',
      sinonimos: [title.toLowerCase()],
    })
  }
}

const byKey = new Map()
for (const d of docs) {
  const key = `${d.fuente}:${d.nombre.toLowerCase()}`
  const prev = byKey.get(key)
  if (!prev || (d.contenido || '').length > (prev.contenido || '').length) byKey.set(key, d)
}
const unique = [...byKey.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

fs.writeFileSync(outJson, JSON.stringify(unique, null, 2), 'utf8')
fs.writeFileSync(
  outJs,
  `// Auto-generado desde "Somos Clave _ Portal Privado.html" — regenerar con: node src/asistente/scrapeSomosClave.mjs\nexport const SOMOS_CLAVE_SCRAPED = ${JSON.stringify(unique)}\n`,
  'utf8'
)

console.log(
  JSON.stringify(
    {
      total: unique.length,
      withBody: unique.filter((d) => (d.contenido || '').length > 80).length,
      titles: unique.map((d) => `${d.fuente} | ${d.nombre.slice(0, 55)} | ${d.contenido.length}c`),
    },
    null,
    2
  )
)
