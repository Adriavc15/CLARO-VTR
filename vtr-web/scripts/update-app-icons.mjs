import fs from 'fs'

let s = fs.readFileSync('src/aplicacionesCatalogo.js', 'utf8')

const replacements = {
  'Página de las pruebas': '/app-icons/cdevirtual.png',
  Mailito: '/app-icons/apexmail.png',
  HUMAND: '/app-icons/humand.png',
  Omnia: '/app-icons/omnia.png',
  'Streaming OOT': '/app-icons/streaming.svg',
  'Videos de Ayuda': '/app-icons/gdrive.png',
  'REGISTRO CIVIL': '/app-icons/registrocivil.svg',
  ANDES: '/app-icons/andes.svg',
  'SOMOS CLAVE': '/app-icons/somosclave.svg',
  BLIP: '/app-icons/blip.png',
  'FRONT DE VENTA (ONE)': '/app-icons/fvc.svg',
  VSIGHT: '/app-icons/vsight-full.ico',
  'VIDEO LLAMADAS': '/app-icons/videollamadas.svg',
  'WEB DE RECLAMOS': '/app-icons/reclamos.svg',
  'Web Traslado con Cambio de Tecnología': '/app-icons/traslado.svg',
  'Web Botón rojo reanudación': '/app-icons/botonrojo.svg',
  'Web Nivel 1': '/app-icons/nivel1.svg',
  'Web Errores en proceso de Migración': '/app-icons/migracion.svg',
  'Consulta de Excepciones': '/app-icons/excepciones.svg',
  'Billing Compare Portal': '/app-icons/billing.svg',
  Billshock: '/app-icons/billshock.svg',
  'BLUE EXPRESS': '/app-icons/blueexpress.png',
  'SmartWiFi Portal': '/app-icons/cloudwifi.svg',
  'IMASTER NCE': '/app-icons/imaster.svg',
  SCP: '/app-icons/scp.svg',
}

for (const [nombre, logo] of Object.entries(replacements)) {
  const escaped = nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(nombre: '${escaped}',\\s*url: [^,]+,\\s*)logo: [^,]+`)
  if (!re.test(s)) {
    console.log('MISS', nombre)
    continue
  }
  s = s.replace(re, `$1logo: '${logo}'`)
  console.log('OK', nombre)
}

// quitar helper googleFavicon si ya no se usa
if (!s.includes('googleFavicon(')) {
  s = s.replace(/\nconst googleFavicon =[\s\S]*?\n\n/, '\n')
}

fs.writeFileSync('src/aplicacionesCatalogo.js', s)
console.log('done')
