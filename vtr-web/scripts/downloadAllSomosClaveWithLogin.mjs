/**
 * Descarga TODAS las IDs de Somos Clave usando Puppeteer con login
 * Navega a cada página individual y extrae el contenido
 *
 * node scripts/downloadAllSomosClaveWithLogin.mjs
 */
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(ROOT, '..')
const ASSETS = path.join(ROOT, 'public', 'sc-assets')
const OUT_JSON = path.join(ROOT, 'public', 'somosclave-contenidos.json')
const IDS_FILE = path.join(__dirname, '_ids-to-fetch.json')
const HTML_DIR = path.join(REPO_ROOT, 'Somos Clave HTMLs')

const USERNAME = process.env.SOMOSCLAVE_USER
const PASSWORD = process.env.SOMOSCLAVE_PASS
if (!USERNAME || !PASSWORD) throw new Error('Define SOMOSCLAVE_USER y SOMOSCLAVE_PASS en el entorno')

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

function collectImageUrls(html) {
  const urls = new Set()
  for (const m of String(html).matchAll(/(?:src|data-src)=["']([^"']+)["']/gi)) {
    const u = m[1].trim()
    if (/^https?:\/\//i.test(u) && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(u)) urls.add(u)
    else if (/^https?:\/\//i.test(u) && /\/(image|media|upload|asset|static)/i.test(u)) urls.add(u)
  }
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

function rewriteHtmlImages(html, id, urlToLocal) {
  let out = stripScripts(html)
  for (const [remote, local] of urlToLocal) {
    const esc = remote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    out = out.replace(new RegExp(esc, 'g'), local)
  }
  out = out.replace(/href="(?!https?:|mailto:|#)[^"]*"/gi, 'href="#"')
  return out
}

function loadCatalog() {
  const byId = new Map()
  if (fs.existsSync(OUT_JSON)) {
    const j = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'))
    for (const a of j.items || []) byId.set(String(a.id), a)
  }
  return byId
}

async function downloadImage(url, destPath, page) {
  try {
    const buffer = await page.evaluate(async (url) => {
      const res = await fetch(url)
      const buf = await res.arrayBuffer()
      return Array.from(new Uint8Array(buf))
    }, url)
    if (buffer.length < 40) throw new Error('too small')
    fs.writeFileSync(destPath, Buffer.from(buffer))
    return buffer.length
  } catch (e) {
    throw new Error(e.message)
  }
}

async function main() {
  const idsData = JSON.parse(fs.readFileSync(IDS_FILE, 'utf8'))
  let TARGET_IDS = idsData.map(item => ({ id: String(item.id), cat: item.cat || 'actualizado', nombre: item.nombre }))
  
  // Si se pasan IDs como argumentos, descargar solo esas
  const argIds = process.argv.slice(2).filter(x => /^\d+$/.test(x))
  if (argIds.length > 0) {
    TARGET_IDS = TARGET_IDS.filter(item => argIds.includes(item.id))
  }
  
  console.log(`Total IDs a descargar: ${TARGET_IDS.length}`)
  
  // Crear directorio para HTMLs
  fs.mkdirSync(HTML_DIR, { recursive: true })

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    )

    console.log('🚀 Iniciando login a Somos Clave...')
    await page.goto('https://somosclave.cl', { waitUntil: 'networkidle2', timeout: 60000 })
    await sleep(2000)

    // Login
    const usernameField = await page.$('input[type="text"]') || await page.$('input[name="username"]')
    const passwordField = await page.$('input[type="password"]') || await page.$('input[name="password"]')

    if (!usernameField || !passwordField) {
      console.error('❌ No se encontraron campos de login')
      await browser.close()
      process.exit(1)
    }

    await usernameField.click()
    await usernameField.type(USERNAME, { delay: 100 })
    await sleep(500)

    await passwordField.click()
    await passwordField.type(PASSWORD, { delay: 100 })
    await sleep(500)

    await passwordField.press('Enter')
    console.log('⏳ Esperando login...')
    await sleep(5000)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await sleep(3000)

    console.log('✅ Login exitoso')
    const byId = loadCatalog()
    const report = []

    for (let i = 0; i < TARGET_IDS.length; i++) {
      const { id, cat, nombre } = TARGET_IDS[i]
      const url = `https://somosclave.cl/respuesta.php?q=${cat}/${id}`
      process.stdout.write(`[${i + 1}/${TARGET_IDS.length}] ${id} ${nombre.slice(0, 30)}… `)

      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
        await sleep(2000)

        const html = await page.content()
        const title = await page.evaluate(() => {
          const el = document.querySelector('h1, .faq-title, #faq-title, b')
          return el ? el.textContent.trim() : ''
        })

        // Extraer el HTML completo de la página, no solo el contenido
        // Esto incluye desplegables, scripts, estilos, etc.
        const contentHtml = await page.evaluate(() => {
          // Extraer todo el body para mantener la estructura completa
          return document.body.innerHTML
        })

        if (!contentHtml || contentHtml.length < 100) {
          console.log('SKIP (sin contenido)')
          report.push({ id, ok: false, error: 'sin contenido' })
          continue
        }

        console.log(`OK (${contentHtml.length} chars)`)

        // Guardar HTML completo de la página
        const htmlPath = path.join(HTML_DIR, `Somos Clave _ ${id}.html`)
        fs.writeFileSync(htmlPath, html, 'utf8')

        const destDir = path.join(ASSETS, id)
        fs.mkdirSync(destDir, { recursive: true })
        const urls = collectImageUrls(contentHtml)
        const urlToLocal = new Map()
        let downloaded = 0
        const usedNames = new Set()

        for (let j = 0; j < urls.length; j++) {
          const urlImg = urls[j]
          let name = fileNameFromUrl(urlImg, j + 1)
          if (usedNames.has(name)) name = `${path.parse(name).name}_${j}${path.extname(name)}`
          usedNames.add(name)
          const dest = path.join(destDir, name)
          try {
            if (!fs.existsSync(dest)) {
              await downloadImage(urlImg, dest, page)
              downloaded++
              await sleep(100)
            }
            urlToLocal.set(urlImg, `/sc-assets/${id}/${name}`)
          } catch (e) {
            // skip image errors
          }
        }

        const htmlClean = rewriteHtmlImages(contentHtml, id, urlToLocal)
        const texto = htmlToText(contentHtml)
        const prev = byId.get(id) || {
          id,
          nombre: title || nombre,
          enlace: url,
          categoriaPath: cat,
          texto: '',
          html: '',
        }
        prev.html = htmlClean
        prev.texto = texto || prev.texto
        if (title) prev.nombre = title
        byId.set(id, prev)

        report.push({
          id,
          ok: true,
          title: title,
          htmlLen: htmlClean.length,
          imgsFound: urls.length,
          imgsDownloaded: downloaded,
        })

        await sleep(300)
      } catch (e) {
        console.log('FAIL', e.message)
        report.push({ id, ok: false, error: e.message })
      }
    }

    const items = [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id))
    fs.writeFileSync(OUT_JSON, JSON.stringify({ items }, null, 0), 'utf8')
    console.log('\n=== RESUMEN ===')
    const okCount = report.filter(r => r.ok).length
    console.log(`Exitosos: ${okCount}/${TARGET_IDS.length}`)
    console.log(`JSON → ${OUT_JSON}`)
    console.log(
      'withHtml',
      items.filter((i) => i.html).length,
      'withAssetsSrc',
      items.filter((i) => /src="\/sc-assets\//.test(i.html || '')).length
    )

    await browser.close()
  } catch (error) {
    console.error('❌ Error:', error.message)
    await browser.close()
    process.exit(1)
  }
}

main()
