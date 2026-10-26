/**
 * Escanea todas las categorías de Somos Clave para encontrar más IDs
 * usando Puppeteer con login
 *
 * node scripts/scanAllCategories.mjs
 */
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const IDS_FILE = path.join(__dirname, '_ids-to-fetch.json')

const USERNAME = process.env.SOMOSCLAVE_USER
const PASSWORD = process.env.SOMOSCLAVE_PASS
if (!USERNAME || !PASSWORD) throw new Error('Define SOMOSCLAVE_USER y SOMOSCLAVE_PASS en el entorno')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
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

    // Buscar enlaces a categorías
    const categoryLinks = await page.evaluate(() => {
      const links = []
      document.querySelectorAll('a').forEach(a => {
        const href = a.href
        if (href && href.includes('somosclave.cl') && (href.includes('categoria') || href.includes('category') || href.includes('q='))) {
          links.push(href)
        }
      })
      return [...new Set(links)]
    })

    console.log(`Enlaces encontrados: ${categoryLinks.length}`)
    categoryLinks.slice(0, 10).forEach(link => console.log('  -', link))

    // Extraer todos los IDs de la página principal
    const allIds = await page.evaluate(() => {
      const ids = new Set()
      document.querySelectorAll('a').forEach(a => {
        const match = a.href.match(/respuesta\.php\?q=([^\/]+)\/(\d+)/)
        if (match) {
          ids.add(match[2])
        }
      })
      return [...ids]
    })

    console.log(`\nIDs en página principal: ${allIds.length}`)
    console.log('IDs:', allIds.sort((a,b) => Number(a)-Number(b)).join(', '))

    // Navegar por las categorías encontradas
    const allIdsFromCategories = new Set(allIds)
    for (const link of categoryLinks.slice(0, 5)) {
      console.log(`\nNavegando a: ${link}`)
      try {
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 30000 })
        await sleep(2000)

        const ids = await page.evaluate(() => {
          const ids = new Set()
          document.querySelectorAll('a').forEach(a => {
            const match = a.href.match(/respuesta\.php\?q=([^\/]+)\/(\d+)/)
            if (match) {
              ids.add(match[2])
            }
          })
          return [...ids]
        })

        console.log(`  IDs encontradas: ${ids.length}`)
        ids.forEach(id => allIdsFromCategories.add(id))
      } catch (e) {
        console.log(`  Error: ${e.message}`)
      }
    }

    const finalIds = [...allIdsFromCategories].sort((a,b) => Number(a)-Number(b))
    console.log(`\n=== TOTAL ÚNICAS: ${finalIds.length} ===`)
    console.log(finalIds.join(', '))

    // Comparar con archivo existente
    const existingData = JSON.parse(fs.readFileSync(IDS_FILE, 'utf8'))
    const existingIds = new Set(existingData.map(item => String(item.id)))
    const newIds = finalIds.filter(id => !existingIds.has(id))

    console.log(`\nIDs nuevas (no en archivo): ${newIds.length}`)
    if (newIds.length > 0) {
      console.log(newIds.join(', '))
    }

    await browser.close()
  } catch (error) {
    console.error('❌ Error:', error.message)
    await browser.close()
    process.exit(1)
  }
}

main()
