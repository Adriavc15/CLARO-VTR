/**
 * Importador/analizador del plan comercial en Excel (ClaroVTR Hogar).
 *
 * Lee un .xlsx sin dependencias externas (ZIP + XML con `node:zlib`) y:
 *   1. vuelca las hojas del libro,
 *   2. extrae la tabla de planes de cada proveedor (Claro / VTR),
 *   3. la contrasta con el catálogo que usa la web (`planesSeed.js` y
 *      `planesClaro.js`) y reporta altas, precios distintos y faltantes.
 *
 * Uso:
 *   node scripts/importarPlanesXlsx.mjs
 *   node scripts/importarPlanesXlsx.mjs "..\ClaroVTR_Planes_Hogar_Octubre_2026 (2).xlsx"
 *   node scripts/importarPlanesXlsx.mjs --json planes.json
 */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

import { PLANES_SEED } from '../src/asistente/planesSeed.js'
import { PLANES_CLARO } from '../src/asistente/planesClaro.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(__dirname, '..', '..')

const args = process.argv.slice(2)
const flagJson = args.find((a) => a.startsWith('--json='))?.slice(7)
const flagJsonSep = args.includes('--json') ? args[args.indexOf('--json') + 1] : null
const rutaJson = flagJsonSep || flagJson || null
const posicional = args.find((a) => !a.startsWith('--') && a !== rutaJson)

/** Libro por defecto: el Excel de planes que está en la raíz del repo. */
function libroPorDefecto() {
  if (!fs.existsSync(RAIZ)) return null
  const candidatos = fs
    .readdirSync(RAIZ)
    .filter((f) => f.toLowerCase().endsWith('.xlsx'))
    .sort((a, b) => (a.match(/(\d{4})/) || [0])[0] - (b.match(/(\d{4})/) || [0])[0])
  return candidatos.length ? path.join(RAIZ, candidatos[candidatos.length - 1]) : null
}

const rutaXlsx = path.resolve(posicional || libroPorDefecto() || '')
if (!posicional && !libroPorDefecto()) {
  console.error('No se encontró ningún .xlsx en la raíz del repo. Pasa la ruta como argumento.')
  process.exit(1)
}
if (!fs.existsSync(rutaXlsx)) {
  console.error(`No existe el archivo: ${rutaXlsx}`)
  process.exit(1)
}

/* ------------------------------------------------------------------ *
 * ZIP mínimo (solo lectura, sin dependencias)
 * ------------------------------------------------------------------ */

function leerZip(buf) {
  let eocd = -1
  const desde = Math.max(0, buf.length - 22 - 0xffff)
  for (let i = buf.length - 22; i >= desde; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('El archivo no es un ZIP válido (no se encontró el directorio central).')

  const entradas = buf.readUInt16LE(eocd + 10)
  let off = buf.readUInt32LE(eocd + 16)
  const archivos = new Map()

  for (let i = 0; i < entradas; i += 1) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('Directorio central del ZIP corrupto.')
    const metodo = buf.readUInt16LE(off + 10)
    const tamComprimido = buf.readUInt32LE(off + 20)
    const lenNombre = buf.readUInt16LE(off + 28)
    const lenExtra = buf.readUInt16LE(off + 30)
    const lenComentario = buf.readUInt16LE(off + 32)
    const offsetLocal = buf.readUInt32LE(off + 42)
    const nombre = buf.toString('utf8', off + 46, off + 46 + lenNombre)
    off += 46 + lenNombre + lenExtra + lenComentario

    const lenNombreLocal = buf.readUInt16LE(offsetLocal + 26)
    const lenExtraLocal = buf.readUInt16LE(offsetLocal + 28)
    const inicio = offsetLocal + 30 + lenNombreLocal + lenExtraLocal
    const datos = buf.subarray(inicio, inicio + tamComprimido)
    archivos.set(nombre, metodo === 0 ? datos : zlib.inflateRawSync(datos))
  }
  return archivos
}

/* ------------------------------------------------------------------ *
 * XML mínimo
 * ------------------------------------------------------------------ */

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

const desescapar = (s) =>
  String(s).replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/gi, (m, ent) => {
    if (ent[0] === '#') {
      const code = ent[1] === 'x' || ent[1] === 'X' ? parseInt(ent.slice(2), 16) : parseInt(ent.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : m
    }
    return ENTIDADES[ent.toLowerCase()] ?? m
  })

/** Texto de un nodo XML: concatena todos los `<t>` (cubre `<si>` con `<r>`). */
const textoDe = (xml) =>
  desescapar(
    [...String(xml).matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join('')
  )

const atributos = (tag) => {
  const out = {}
  for (const m of tag.matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"/g)) out[m[1]] = desescapar(m[2])
  return out
}

/** "B12" → índice de columna (0-based). */
const colIndex = (ref) => {
  const letras = String(ref).match(/^[A-Z]+/)?.[0] || 'A'
  let n = 0
  for (const ch of letras) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}

/* ------------------------------------------------------------------ *
 * Lectura del libro
 * ------------------------------------------------------------------ */

function leerLibro(ruta) {
  const zip = leerZip(fs.readFileSync(ruta))

  const compartidas = []
  if (zip.has('xl/sharedStrings.xml')) {
    const xml = zip.get('xl/sharedStrings.xml').toString('utf8')
    for (const m of xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)) compartidas.push(textoDe(m[1]))
  }

  const relaciones = new Map()
  if (zip.has('xl/_rels/workbook.xml.rels')) {
    const xml = zip.get('xl/_rels/workbook.xml.rels').toString('utf8')
    for (const m of xml.matchAll(/<Relationship\b[^>]*>/g)) {
      const a = atributos(m[0])
      if (a.Id && a.Target) relaciones.set(a.Id, a.Target.replace(/^\/?xl\//, ''))
    }
  }

  const wbXml = zip.get('xl/workbook.xml')?.toString('utf8') || ''
  const hojas = []
  for (const m of wbXml.matchAll(/<sheet\b[^>]*>/g)) {
    const a = atributos(m[0])
    const id = a['r:id'] || a['relationship:id']
    const destino = id ? relaciones.get(id) : null
    const archivo = destino
      ? `xl/${destino.replace(/^\.\//, '')}`
      : zip.has(`xl/worksheets/sheet${hojas.length + 1}.xml`)
        ? `xl/worksheets/sheet${hojas.length + 1}.xml`
        : null
    if (!archivo || !zip.has(archivo)) continue
    hojas.push({ nombre: a.name || `Hoja ${hojas.length + 1}`, archivo })
  }

  return {
    compartidas,
    hojas: hojas.map((h) => ({ nombre: h.nombre, filas: leerHoja(zip.get(h.archivo).toString('utf8'), compartidas) })),
  }
}

/** Devuelve las filas de una hoja como arrays de celdas (con `null` en los huecos). */
function leerHoja(xml, compartidas) {
  const filas = []
  for (const m of xml.matchAll(/<row\b([^>]*?)(\/>|>([\s\S]*?)<\/row>)/g)) {
    const a = atributos(`<row${m[1]}>`)
    const numFila = Number(a.r) || filas.length + 1
    const cuerpo = m[3] || ''
    const fila = []
    let colActual = 0
    for (const c of cuerpo.matchAll(/<c\b([^>]*?)(\/>|>([\s\S]*?)<\/c>)/g)) {
      const ca = atributos(`<c${c[1]}>`)
      const idx = ca.r ? colIndex(ca.r) : colActual
      colActual = idx + 1
      const tipo = ca.t || 'n'
      const interior = c[3] || ''
      let valor = null
      if (tipo === 's') {
        const v = interior.match(/<v>([\s\S]*?)<\/v>/)?.[1]
        valor = v === undefined ? null : (compartidas[Number(v)] ?? null)
      } else if (tipo === 'inlineStr') {
        valor = textoDe(interior)
      } else {
        const v = interior.match(/<v>([\s\S]*?)<\/v>/)?.[1]
        valor = v === undefined ? null : desescapar(v)
      }
      fila[idx] = valor ?? null
    }
    const largo = fila.length
    filas[numFila - 1] = Array.from({ length: largo }, (_, i) => fila[i] ?? null)
  }
  for (let i = 0; i < filas.length; i += 1) if (!filas[i]) filas[i] = []
  return filas
}

/* ------------------------------------------------------------------ *
 * Normalización de la tabla de planes
 * ------------------------------------------------------------------ */

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/**
 * Clave de comparación de planes: ignora la palabra "Megas", porque el Excel
 * la omite en los packs ("Internet 500 + Disney+") y el catálogo la mantiene
 * ("Internet 500 Megas + Disney+"). Es el mismo producto.
 */
const normPlan = (s) => norm(s).replace(/\bmegas\b/g, ' ').replace(/\s+/g, ' ').trim()

/** "$21.990" | "$21,990" | "21990" → 21990. "-" o vacío → null */
function precio(valor) {
  if (valor === null || valor === undefined) return null
  const txt = String(valor).trim()
  if (!txt || txt === '-') return null
  const n = Number(txt.replace(/[^\d]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Extrae la tabla de planes de una hoja (header en la fila 4, datos desde la 5). */
function tablaPlanes(filas) {
  const encabezado = filas[3] || []
  const planes = []
  for (const fila of filas.slice(4)) {
    const [pack, plan, red, megas, pNormal, pPromo, tipoTv, canales, streaming] = fila
    if (!plan) continue
    const ch = String(canales || '').trim()
    const m = ch.match(/^(\d+)\s*(?:\/\s*(\d+))?/)
    planes.push({
      pack: String(pack || '').trim(),
      plan: String(plan).trim(),
      red: String(red || '').trim(),
      megas: String(megas || '').trim(),
      precioNormal: precio(pNormal),
      precioPromo: precio(pPromo),
      tipoTv: String(tipoTv || '').trim(),
      canales: m ? Number(m[1]) : null,
      hd: m && m[2] ? Number(m[2]) : null,
      streaming: String(streaming || '').trim(),
    })
  }
  return { encabezado, planes }
}

/* ------------------------------------------------------------------ *
 * Comparación con el catálogo de la web
 * ------------------------------------------------------------------ */

const CATALOGOS = {
  VTR: PLANES_SEED.map((p) => ({
    comercial: p.comercial,
    andes: p.andes,
    normal: precio(p.normal),
    promo: precio(p.promo),
    grupo: p.grupo,
  })),
  Claro: PLANES_CLARO.map((p) => ({
    comercial: p.comercial,
    andes: p.andes,
    normal: precio(p.precio),
    promo: precio(p.promo === '-' ? null : p.promo),
    grupo: `${p.tecnologia} ${p.pack}`,
  })),
}

/**
 * Clave de comparación de planes:
 *  · ignora la palabra "Megas" (el Excel la omite en los packs),
 *  · "Telefonía" ≡ "Fono",
 *  · "TV Premium I" ≡ "TV Premium" (el Excel usa el nombre comercial corto).
 */
const clavePlan = (s) =>
  normPlan(s)
    .replace(/\btv premium i\b/g, 'tv premium')
    .replace(/\btelefonia\b/g, 'fono')
    .replace(/\s+/g, ' ')
    .trim()

/** Busca el plan del catálogo que corresponde a la fila del Excel. */
function buscarEnCatalogo(catalogo, plan) {
  const clave = clavePlan(plan)
  const exacto = catalogo.find((c) => clavePlan(c.comercial) === clave)
  if (exacto) return { item: exacto, exacto: true }

  // Fallback tolerante: mismo producto con otro nombre (tokens en común).
  const tokens = (s) => new Set(clavePlan(s).split(' ').filter(Boolean))
  const tkPlan = tokens(plan)
  const candidatos = catalogo
    .map((c) => {
      const tk = tokens(c.comercial)
      const comunes = [...tk].filter((t) => tkPlan.has(t)).length
      return { c, comunes, extra: Math.max(tk.size, tkPlan.size) - comunes }
    })
    .filter((x) => x.comunes >= 3 && x.extra <= 1)
    .sort((a, b) => b.comunes - a.comunes || a.extra - b.extra)
  if (!candidatos.length) return null
  return { item: candidatos[0].c, exacto: false }
}

function comparar(proveedor, planes) {
  const catalogo = CATALOGOS[proveedor] || []
  const usados = new Set()
  const nuevos = []
  const preciosDistintos = []
  const coincidencias = []

  for (const p of planes) {
    const hit = buscarEnCatalogo(catalogo, p.plan)
    if (!hit) {
      nuevos.push(p)
      continue
    }
    usados.add(hit.item.comercial)
    const fila = { excel: p, catalogo: hit.item, exacto: hit.exacto }
    const difNormal = hit.item.normal !== null && p.precioNormal !== null && hit.item.normal !== p.precioNormal
    // El catálogo VTR deja `promo = normal` cuando el plan no tiene descuento
    // (así la tarjeta muestra un solo precio). Eso NO es una diferencia real.
    const promoSinDescuento = hit.item.promo !== null && hit.item.promo === hit.item.normal
    const difPromo =
      (p.precioPromo === null && hit.item.promo !== null && !promoSinDescuento) ||
      (p.precioPromo !== null && hit.item.promo !== p.precioPromo)
    if (difNormal || difPromo) preciosDistintos.push({ ...fila, difNormal, difPromo })
    coincidencias.push(fila)
  }

  const sinReferencia = catalogo.filter((c) => !usados.has(c.comercial))
  return { proveedor, total: planes.length, nuevos, preciosDistintos, coincidencias, sinReferencia }
}

const money = (n) => (n === null ? '-' : `$${n.toLocaleString('es-CL')}`)

/* ------------------------------------------------------------------ *
 * Salida
 * ------------------------------------------------------------------ */

const libro = leerLibro(rutaXlsx)

console.log(`\n=== Plan Comercial ClaroVTR Hogar ===`)
console.log(`Archivo: ${rutaXlsx}`)
console.log(`Hojas: ${libro.hojas.map((h) => h.nombre).join(' | ')}\n`)

for (const hoja of libro.hojas) {
  const datos = hoja.filas.filter((f) => f.some((c) => c !== null && String(c).trim() !== ''))
  console.log(`--- ${hoja.nombre} (${datos.length} filas con contenido) ---`)
  for (const f of datos.slice(0, 4)) {
    console.log('   ', f.map((c) => (c === null ? '' : String(c))).join(' | ').slice(0, 200))
  }
  if (datos.length > 4) console.log(`    … (${datos.length - 4} filas más)`)
  console.log('')
}

const comparaciones = []
for (const [proveedor, hojaNombre] of [
  ['Claro', 'Claro - Planes'],
  ['VTR', 'VTR - Planes'],
]) {
  const hoja = libro.hojas.find((h) => h.nombre === hojaNombre)
  if (!hoja) continue
  const { planes } = tablaPlanes(hoja.filas)
  const cmp = comparar(proveedor, planes)
  comparaciones.push(cmp)

  console.log(`=== ${proveedor}: ${planes.length} planes en el Excel ===`)
  for (const p of planes) {
    console.log(
      `  ${String(p.pack).padEnd(3)} ${p.plan.padEnd(42)} ${p.red.padEnd(5)} ${p.megas.padEnd(11)} ` +
        `normal ${money(p.precioNormal).padEnd(11)} promo ${money(p.precioPromo).padEnd(11)} ` +
        `${p.tipoTv.padEnd(13)} ${String(p.canales ?? '-').padStart(3)}/${String(p.hd ?? '-').padEnd(3)} ${p.streaming}`
    )
  }
  console.log('')
}

for (const cmp of comparaciones) {
  console.log(`=== Diagnóstico ${cmp.proveedor} vs. catálogo de la web ===`)
  console.log(`  Coincidencias: ${cmp.coincidencias.length} (exactas: ${cmp.coincidencias.filter((c) => c.exacto).length})`)

  if (cmp.nuevos.length) {
    console.log(`  · NO ESTÁN en el catálogo (${cmp.nuevos.length}):`)
    for (const p of cmp.nuevos) {
      console.log(`      - ${p.plan} (${p.pack}, ${p.red}) normal ${money(p.precioNormal)} promo ${money(p.precioPromo)}`)
    }
  } else {
    console.log('  · No hay planes nuevos.')
  }

  if (cmp.preciosDistintos.length) {
    console.log(`  · PRECIO DISTINTO al catálogo (${cmp.preciosDistintos.length}):`)
    for (const d of cmp.preciosDistintos) {
      console.log(
        `      - ${d.excel.plan}${d.exacto ? '' : ' (match aproximado)'} → catálogo ${money(d.catalogo.normal)}/${money(d.catalogo.promo)}` +
          ` · Excel ${money(d.excel.precioNormal)}/${money(d.excel.precioPromo)}`
      )
    }
  } else {
    console.log('  · Los precios del Excel coinciden con el catálogo.')
  }

  console.log(`  · Planes del catálogo SIN fila en el Excel (${cmp.sinReferencia.length}) — el Excel es un subconjunto:`)
  for (const c of cmp.sinReferencia) {
    console.log(`      - ${c.comercial} (${c.grupo}) ${money(c.normal)}/${money(c.promo)}`)
  }
  console.log('')
}

if (rutaJson) {
  const salida = {
    archivo: rutaXlsx,
    hojas: libro.hojas.map((h) => ({ nombre: h.nombre, filas: h.filas })),
    planes: comparaciones.map((c) => ({
      proveedor: c.proveedor,
      planes: c.coincidencias.map((x) => x.excel).concat(c.nuevos),
      nuevos: c.nuevos,
      preciosDistintos: c.preciosDistintos.map((d) => ({
        plan: d.excel.plan,
        excel: { normal: d.excel.precioNormal, promo: d.excel.precioPromo },
        catalogo: { normal: d.catalogo.normal, promo: d.catalogo.promo },
      })),
    })),
  }
  const destino = path.resolve(rutaJson)
  fs.writeFileSync(destino, JSON.stringify(salida, null, 2), 'utf8')
  console.log(`JSON escrito en ${destino}`)
}
