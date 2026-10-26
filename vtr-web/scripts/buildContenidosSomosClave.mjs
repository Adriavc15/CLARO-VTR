/**
 * Regenera public/somosclave-contenidos.json con:
 * - html limpio desde páginas respuesta guardadas (si existen)
 * - copia de imágenes *_files → public/sc-assets/{id}/
 * - texto con saltos desde _liveArticles / _homeFaqs
 * - texto reestructurado desde el RAG plano
 *
 * node scripts/buildContenidosSomosClave.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const repo = path.resolve(root, '..')

const ragPath = path.resolve(repo, 'somosclave-contenidos-rag.json')
const outPath = path.join(root, 'public', 'somosclave-contenidos.json')
const assetsRoot = path.join(root, 'public', 'sc-assets')
const htmlsDir = path.join(repo, 'Somos Clave HTMLs')

const SECTION_RE =
  /\b(OBJETIVO|ALCANCE|CONSIDERACIONES IMPORTANTES(?: SOBRE [^¿.]{0,80})?|IMPORTANTES EN LA ATENCIÓN|MATRIZ DE ATENCIÓN[^¿.]{0,80}|VERIFICACIONES PREVIAS|GESTIÓN|REGISTRA|INFORMA|INDAGA|DEBES SABER|POLÍTICAS DE LA ATENCIÓN|INTRODUCCIÓN|PASO A PASO[^¿.]{0,60}|CALL CENTER VOZ Y NO VOZ|N1 COMERCIAL|SUCURSALES|SIN INTERNET|INTERNET DEGRADADO|OTROS INCONVENIENTES)\b/gi

const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'])

/** Siempre apunta imgs a /sc-assets/{id}/archivo (si hay id) */
function stripHtml(html, { assetBase = '' } = {}) {
  let out = String(html || '')
    // Remover scripts
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remover estilos inline pero mantener classes para diseño
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remover eventos onclick y on*
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')

  // Remover elementos de navegación y UI del portal
  const selectorsToRemove = [
    // Menú de navegación lateral
    /<ul class="collapsible collapsible-accordion"[^>]*>[\s\S]*?<\/ul>/gi,
    // He leído y comprendo
    /<label[^>]*>He leído y comprendo[\s\S]*?<\/label>/gi,
    /<div[^>]*>He leído y comprendo[\s\S]*?<\/div>/gi,
    // Menú de usuario
    /<div[^>]*class="user-menu"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="menu"[^>]*>[\s\S]*?<\/div>/gi,
    // Footer
    /<footer[^>]*>[\s\S]*?<\/footer>/gi,
    // Header/navbar
    /<header[^>]*>[\s\S]*?<\/header>/gi,
    /<div[^>]*class="navbar"[\s\S]*?<\/div>/gi,
    /<div[^>]*class="nav-wrapper"[\s\S]*?<\/div>/gi,
    // Breadcrumbs
    /<div[^>]*class="breadcrumb"[\s\S]*?<\/div>/gi,
    // Botones de acción de la UI
    /<button[^>]*>Cerrar sesión<\/button>/gi,
    /<button[^>]*>Cambiar a CLARO<\/button>/gi,
    // Iconos de materialize no deseados
    /<i class="material-icons">[^<]*<\/i>\s*(?:home|menu|arrow_drop_down|receipt|folder_special|add_circle_outline|record_voice_over|expand_more|expand_less)<\/i>/gi,
  ]

  for (const selector of selectorsToRemove) {
    out = out.replace(selector, '')
  }

  // Remover enlaces a localhost y enlaces vacíos de navegación
  out = out.replace(/href="http:\/\/localhost:[^"]*"/gi, 'href="#"')
  out = out.replace(/href="#!"?/gi, 'href="#"')

  if (assetBase) {
    out = out.replace(/src=(["'])(?:\.\/)?[^"']*_files\/([^"']+)\1/gi, `src=$1${assetBase}/$2$1`)
  } else {
    out = out.replace(/src=["'](?:\.\/)?[^"']*_files\/[^"']+["']/gi, 'src=""')
  }

  out = out.replace(/href="(?!https?:|mailto:|#)[^"]*"/gi, 'href="#"')
  return out
}

function htmlToStructuredText(html) {
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
    .replace(/add_circle_outline|record_voice_over|folder_special|expand_more|expand_less|receipt|dvr/gi, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function reestructurarTextoPlano(texto) {
  let t = String(texto || '').replace(/\s+/g, ' ').trim()
  if (!t) return ''
  t = t.replace(SECTION_RE, (m) => `\n\n## ${m.trim()}\n`)
  t = t.replace(/(¿[^?]{3,120}\?)/g, '\n\n### $1\n')
  t = t.replace(/\b(\d+)\.\s+/g, '\n$1. ')
  t = t.replace(/\s+[•·]\s+/g, '\n• ')
  t = t.replace(/\n{3,}/g, '\n\n').trim()
  return t
}

function copyAssetFolder(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return 0
  fs.mkdirSync(destDir, { recursive: true })
  let n = 0
  for (const name of fs.readdirSync(srcDir)) {
    const ext = path.extname(name).toLowerCase()
    if (!IMG_EXT.has(ext)) continue
    fs.copyFileSync(path.join(srcDir, name), path.join(destDir, name))
    n++
  }
  return n
}

function filesDirForHtml(htmlPath) {
  const base = path.basename(htmlPath, path.extname(htmlPath))
  const candidate = path.join(path.dirname(htmlPath), `${base}_files`)
  if (fs.existsSync(candidate)) return candidate
  const parent = path.dirname(htmlPath)
  if (!fs.existsSync(parent)) return null
  const found = fs.readdirSync(parent).find((n) => {
    const full = path.join(parent, n)
    try {
      return fs.statSync(full).isDirectory() && n.includes('_files') && n.includes(base.slice(0, 12))
    } catch {
      return false
    }
  })
  return found ? path.join(parent, found) : null
}

function extractFaqHtmlFromFile(filePath) {
  if (!fs.existsSync(filePath)) return null
  const html = fs.readFileSync(filePath, 'utf8')
  
  // Extraer ID del nombre del archivo primero
  const fileName = path.basename(filePath, '.html')
  const idMatch = fileName.match(/(\d+)$/)
  const idFromFileName = idMatch?.[1]
  
  // Extraer solo el contenido del FAQ (div con id="faq-content")
  const start = html.search(/id=["']faq-content["']/i)
  if (start < 0) return null
  
  // Buscar el final del contenido útil
  const endSelectors = [
    /Respuestas que otros encontraron útiles/i,
    /<div class="rating"/i,
    /<footer/i,
    /¿Te resultó útil\?/i,
  ]
  
  let endPos = -1
  for (const selector of endSelectors) {
    const match = html.match(selector)
    if (match && match.index > start) {
      endPos = match.index
      break
    }
  }
  
  let chunk = html.slice(start, endPos > start ? endPos : undefined)
  const gt = chunk.indexOf('>')
  if (gt >= 0) chunk = chunk.slice(gt + 1)
  
  const urlMatch =
    html.match(/saved from url=\([^)]*\)https?:\/\/[^/]+\/respuesta\.php\?q=([a-z0-9_-]+)\/(\d+)/i) ||
    html.match(/respuesta\.php\?q=([a-z0-9_-]+)\/(\d+)/i)
  const title = (html.match(/id=["']faq-title["'][^>]*>([\s\S]*?)<\/b>/i) || [])[1] || ''
  const id = idFromFileName || urlMatch?.[2]
  const categoriaPath = urlMatch?.[1] || 'actualizado'
  
  const filesDir = filesDirForHtml(filePath)
  let copied = 0
  // Siempre reescribir a /sc-assets/{id}/… para poder soltar PNGs después
  const assetBase = id ? `/sc-assets/${id}` : ''
  if (id) {
    fs.mkdirSync(path.join(assetsRoot, String(id)), { recursive: true })
    if (filesDir) copied = copyAssetFolder(filesDir, path.join(assetsRoot, String(id)))
  }
  
  // Limpiar el HTML pero mantener la estructura de desplegables
  const htmlClean = stripHtml(chunk, { assetBase })
  
  return {
    id,
    categoriaPath,
    nombre: title.replace(/<[^>]+>/g, '').trim(),
    html: htmlClean,
    texto: htmlToStructuredText(chunk),
    assetsCopied: copied,
    filesDir,
  }
}

const localHtmlFiles = [
  path.join(repo, 'Somos Clave _ Portal Privado traslado.html'),
  path.join(repo, 'Somos Clave _ Portal Privado cambio titular.html'),
  path.join(repo, 'Inconvenientes Internet FTTH - HFC.html'),
]

// Agregar todos los HTMLs del directorio Somos Clave HTMLs
if (fs.existsSync(htmlsDir)) {
  const htmlFiles = fs.readdirSync(htmlsDir).filter(f => f.endsWith('.html'))
  for (const f of htmlFiles) {
    localHtmlFiles.push(path.join(htmlsDir, f))
  }
  console.log(`HTMLs adicionales de directorio: ${htmlFiles.length}`)
}

const byId = new Map()

const rag = JSON.parse(fs.readFileSync(ragPath, 'utf8'))
for (const a of rag.items || rag) {
  const id = String(a.id)
  byId.set(id, {
    id,
    nombre: a.nombre,
    enlace: a.enlace,
    categoriaPath: a.categoriaPath || 'actualizado',
    texto: reestructurarTextoPlano(a.texto),
    html: '',
  })
}

for (const rel of ['src/asistente/_liveArticles.json', 'src/asistente/_homeFaqs.json']) {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) continue
  const arr = JSON.parse(fs.readFileSync(p, 'utf8'))
  for (const a of arr) {
    const id = String(a.id)
    const texto = String(a.contenido || a.texto || '').trim()
    if (!texto || texto.length < 40) continue
    const prev = byId.get(id) || {
      id,
      nombre: a.nombre || a.tituloCompleto,
      enlace: a.enlace,
      categoriaPath: a.categoria || 'actualizado',
      texto: '',
      html: '',
    }
    if (!prev.texto.includes('\n') || texto.length > prev.texto.length * 0.8) {
      prev.texto = texto.replace(/add_circle_outline|record_voice_over|folder_special/gi, '').trim()
      prev.nombre = a.nombre || a.tituloCompleto || prev.nombre
      prev.enlace = a.enlace || prev.enlace
    }
    byId.set(id, prev)
  }
}

fs.mkdirSync(assetsRoot, { recursive: true })
const assetReport = []
for (const file of localHtmlFiles) {
  const art = extractFaqHtmlFromFile(file)
  if (!art?.id || !art.html) continue
  const prev = byId.get(String(art.id)) || {
    id: String(art.id),
    nombre: art.nombre,
    enlace: `https://somosclave.cl/respuesta.php?q=${art.categoriaPath}/${art.id}`,
    categoriaPath: art.categoriaPath,
    texto: '',
    html: '',
  }
  // No pisar HTML vivo (descargado de Somos Clave) si ya tiene assets locales
  const hasLiveAssets =
    prev.html &&
    /src="\/sc-assets\//.test(prev.html) &&
    fs.existsSync(path.join(assetsRoot, String(art.id))) &&
    fs.readdirSync(path.join(assetsRoot, String(art.id))).some((n) => IMG_EXT.has(path.extname(n).toLowerCase()))
  if (!hasLiveAssets) {
    prev.html = art.html
    prev.texto = art.texto || prev.texto
  } else if (!prev.texto && art.texto) {
    prev.texto = art.texto
  }
  prev.nombre = art.nombre || prev.nombre
  prev.categoriaPath = art.categoriaPath || prev.categoriaPath
  byId.set(String(art.id), prev)
  assetReport.push({
    id: art.id,
    file: path.basename(file),
    filesDir: art.filesDir || '(no encontrada)',
    assetsCopied: art.assetsCopied,
  })
}

const items = [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id))
const withHtml = items.filter((i) => i.html).length
const withNl = items.filter((i) => i.texto.includes('\n')).length
const withImgSrc = items.filter((i) => /src="\/sc-assets\//.test(i.html)).length

fs.writeFileSync(outPath, JSON.stringify({ items }, null, 0), 'utf8')
console.log('OK', items.length, 'items →', outPath)
console.log({ withHtml, withNl, withImgSrc, bytes: fs.statSync(outPath).size })
console.log('assets:', assetReport)
