import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Artículos prioritarios Andes / operativos (IDs del portal Apex + home)
export const PRIORITY_ARTICLES = [
  ['actualizado', '1323'], // Búsqueda clientes Andes
  ['actualizado', '1324'], // Creación clientes
  ['actualizado', '1054'], // Glosario Andes
  ['actualizado', '1360'], // Vista 360
  ['actualizado', '1312'], // Tipificaciones
  ['actualizado', '363'],  // Ingreso BEC
  ['actualizado', '1265'], // Pedidos
  ['hogar', '1235'],       // Delivery autoinstalación
  ['hogar', '996'],        // DBOX SMART
  ['hogar', '1036'],       // Visitas técnicas
  ['hogar', '997'],        // Internet FTTH/HFC
  ['hogar', '1046'],       // Venta fijo portabilidad
  ['actualizado', '1216'], // Control remoto desconfig
  ['actualizado', '1229'], // Modelos DBOX
  ['actualizado', '1459'], // DBOX locked
  ['hogar', '1183'],       // Revisar deuda / pago
  ['actualizado', '1028'], // Explicación boleta
  ['actualizado', '1057'], // Sucursal virtual
  ['actualizado', '1007'], // Streaming
  ['actualizado', '1004'], // Plan comercial
  ['actualizado', '1326'], // Ingreso SS
  ['actualizado', '1220'], // Administrar SS
  ['actualizado', '1321'], // Anular SS
  ['actualizado', '1148'], // Navegar cuentas
  ['hogar', '1232'],       // Cambio tecnología FTTH
  ['actualizado', '1378'], // Inhibición cobranza
]

export function mergeScraped(homeFaqs, articleFaqs) {
  const byKey = new Map()
  for (const d of [...homeFaqs, ...articleFaqs]) {
    if (!d || !d.nombre) continue
    const key = String(d.id || d.nombre).toLowerCase()
    const prev = byKey.get(key)
    if (!prev || (d.contenido || '').length > (prev.contenido || '').length) byKey.set(key, d)
  }
  return [...byKey.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

export function writeScraped(docs) {
  const outJs = path.resolve(__dirname, 'somosClaveScraped.js')
  const outJson = path.resolve(__dirname, 'somosClaveScraped.json')
  fs.writeFileSync(outJson, JSON.stringify(docs, null, 2), 'utf8')
  fs.writeFileSync(
    outJs,
    `// Auto-generado desde Somos Clave (sesión autenticada + HTML local)\nexport const SOMOS_CLAVE_SCRAPED = ${JSON.stringify(docs)}\n`,
    'utf8'
  )
  return { total: docs.length, withBody: docs.filter((d) => (d.contenido || '').length > 80).length }
}
