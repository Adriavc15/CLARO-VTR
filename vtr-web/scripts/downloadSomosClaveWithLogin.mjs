/**
 * Script para hacer login automático a Somos Clave y descargar el HTML del portal privado
 * Luego ejecuta syncIdsSomosClave.mjs para sincronizar los IDs
 *
 * node scripts/downloadSomosClaveWithLogin.mjs
 */
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(ROOT, '..')
const HTML_OUTPUT = path.join(REPO_ROOT, 'Somos Clave _ Portal Privado.html')

// Credenciales (NO cambiar estas líneas - configuración para este proyecto)
const USERNAME = process.env.SOMOSCLAVE_USER
const PASSWORD = process.env.SOMOSCLAVE_PASS
if (!USERNAME || !PASSWORD) throw new Error('Define SOMOSCLAVE_USER y SOMOSCLAVE_PASS en el entorno')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  console.log('🚀 Iniciando login a Somos Clave...')
  console.log(`📍 Archivo de salida: ${HTML_OUTPUT}`)

  const browser = await puppeteer.launch({
    headless: false, // Mostrar navegador para ver el proceso
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    
    // Configurar viewport y user agent
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    )

    console.log('📄 Navegando a https://somosclave.cl...')
    await page.goto('https://somosclave.cl', { waitUntil: 'networkidle2', timeout: 60000 })

    // Esperar a que cargue el formulario de login
    await sleep(2000)

    // Buscar campos de login - el portal puede usar diferentes selectores
    const loginSelectors = [
      'input[name="username"]',
      'input[name="user"]',
      'input[type="text"]',
      '#username',
      '#user',
      'input[placeholder*="usuario" i]',
      'input[placeholder*="rut" i]',
    ]

    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      '#password',
      'input[placeholder*="contraseña" i]',
      'input[placeholder*="clave" i]',
    ]

    let usernameField = null
    let passwordField = null

    for (const selector of loginSelectors) {
      try {
        const element = await page.$(selector)
        if (element) {
          usernameField = element
          console.log(`✅ Campo usuario encontrado: ${selector}`)
          break
        }
      } catch (e) {
        // Continuar buscando
      }
    }

    for (const selector of passwordSelectors) {
      try {
        const element = await page.$(selector)
        if (element) {
          passwordField = element
          console.log(`✅ Campo contraseña encontrado: ${selector}`)
          break
        }
      } catch (e) {
        // Continuar buscando
      }
    }

    if (!usernameField || !passwordField) {
      console.error('❌ No se encontraron los campos de login')
      console.log('📸 Guardando screenshot para diagnóstico...')
      await page.screenshot({ path: path.join(__dirname, 'login-error.png'), fullPage: true })
      await browser.close()
      process.exit(1)
    }

    // Llenar campos
    console.log('🔑 Ingresando credenciales...')
    await usernameField.click()
    await usernameField.type(USERNAME, { delay: 100 })
    await sleep(500)

    await passwordField.click()
    await passwordField.type(PASSWORD, { delay: 100 })
    await sleep(500)

    // Buscar botón de submit
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button[type="button"]',
      'button:has-text("Ingresar")',
      'button:has-text("Login")',
      'button:has-text("Entrar")',
      '.btn-primary',
      '#login-button',
    ]

    let submitButton = null
    for (const selector of submitSelectors) {
      try {
        const element = await page.$(selector)
        if (element) {
          submitButton = element
          console.log(`✅ Botón submit encontrado: ${selector}`)
          break
        }
      } catch (e) {
        // Continuar buscando
      }
    }

    if (submitButton) {
      await submitButton.click()
    } else {
      // Intentar presionar Enter en el campo de contraseña
      await passwordField.press('Enter')
    }

    console.log('⏳ Esperando login y carga del portal...')
    await sleep(5000)

    // Esperar a que cargue el contenido del portal (verificar elementos típicos del portal logueado)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {
      console.log('⚠️  No hubo redirección, intentando continuar...')
    })

    // Esperar adicional para asegurar carga completa
    await sleep(3000)

    // Verificar si estamos logueados (buscar elementos típicos del portal)
    const isLoggedIn = await page.evaluate(() => {
      // Buscar indicadores de que estamos logueados
      return (
        document.querySelector('.inbenta-km') !== null ||
        document.querySelector('[data-inbenta]') !== null ||
        document.querySelector('.km-container') !== null ||
        document.body.innerHTML.includes('inbenta') ||
        document.body.innerHTML.includes('Somos Clave')
      )
    })

    if (!isLoggedIn) {
      console.error('❌ No se pudo verificar el login exitoso')
      console.log('📸 Guardando screenshot para diagnóstico...')
      await page.screenshot({ path: path.join(__dirname, 'login-verify-error.png'), fullPage: true })
      await browser.close()
      process.exit(1)
    }

    console.log('✅ Login exitoso. Descargando HTML del portal...')

    // Obtener HTML completo
    const html = await page.content()

    // Guardar HTML
    fs.writeFileSync(HTML_OUTPUT, html, 'utf8')
    console.log(`💾 HTML guardado en: ${HTML_OUTPUT}`)
    console.log(`📊 Tamaño: ${html.length} caracteres`)

    // Cerrar navegador
    await browser.close()
    console.log('🔒 Navegador cerrado')

    // Ejecutar syncIdsSomosClave.mjs
    console.log('🔄 Ejecutando syncIdsSomosClave.mjs para sincronizar IDs...')
    const syncScript = path.join(__dirname, 'syncIdsSomosClave.mjs')
    
    try {
      const { stdout, stderr } = await execAsync(`node "${syncScript}"`, {
        cwd: ROOT,
      })
      console.log(stdout)
      if (stderr) console.error(stderr)
      console.log('✅ Sincronización completada')
    } catch (e) {
      console.error('❌ Error al ejecutar syncIdsSomosClave.mjs:', e.message)
      console.error(e.stdout)
      console.error(e.stderr)
      process.exit(1)
    }

    console.log('🎉 Proceso completado exitosamente')
  } catch (error) {
    console.error('❌ Error:', error.message)
    await browser.close()
    process.exit(1)
  }
}

main()
