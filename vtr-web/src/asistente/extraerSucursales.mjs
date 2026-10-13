/**
 * Extrae sucursales + horarios desde la API pública de vtr.com/sucursales
 * Fuente: migracion.clarochilepromociones.com/sucursales-tabla/
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = 'https://migracion.clarochilepromociones.com/sucursales-tabla'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 ApexBot/1.0',
      Referer: 'https://vtr.com/sucursales/',
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

function normHorario(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function slug(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

function formatearSucursal(s, regionNombre, comunaNombre) {
  const nombre = String(s.nombre || s.name || 'Sucursal').trim()
  const direccion = String(s.direccion || '').trim()
  const lineas = [
    `**${nombre}**`,
    regionNombre ? `Región: ${regionNombre}` : null,
    comunaNombre ? `Comuna: ${comunaNombre}` : null,
    direccion ? `Dirección: ${direccion}` : null,
  ].filter(Boolean)

  const pares = [
    [s.dia, s.horario],
    [s.dia_2, s.horario_2],
    [s.dia_3, s.horario_3],
    [s.dia_4, s.horario_4],
  ]
  for (const [dia, hor] of pares) {
    if (dia || hor) lineas.push(`${normHorario(dia)} ${normHorario(hor)}`.trim())
  }

  if (Array.isArray(s.atencion) && s.atencion.length) {
    lineas.push(`Atención: ${s.atencion.join(', ')}`)
  }

  const comunaClean = String(comunaNombre || '').trim()
  return {
    id: `sucursal-${slug(comunaClean)}-${slug(nombre)}-${s.id_sucursal || ''}`,
    titulo: `Sucursal ${nombre} (${comunaClean})`,
    categoria: 'SUCURSALES',
    tipo: 'micro',
    seccionPortal: 'vtr.com → Sucursales',
    enlace: 'https://vtr.com/sucursales/',
    sinonimos: [
      'sucursal',
      'horario sucursal',
      nombre.toLowerCase(),
      comunaClean.toLowerCase(),
      regionNombre?.toLowerCase(),
      `sucursal ${comunaClean}`.toLowerCase(),
      `horario ${comunaClean}`.toLowerCase(),
    ].filter(Boolean),
    contenido: lineas,
    fuente: 'vtr-sucursales',
    region: regionNombre,
    comuna: comunaClean,
  }
}

async function main() {
  console.log('Descargando regiones…')
  const regiones = await getJson(`${BASE}/getRegion.php`)
  const listaRegiones = Array.isArray(regiones) ? regiones : regiones?.data || regiones?.regiones || []
  console.log('regiones', listaRegiones.length, listaRegiones[0])

  const todas = []
  const porComuna = new Map()

  for (const reg of listaRegiones) {
    const idRegion = reg.id_region || reg.id || reg.ID || reg.value
    const nomRegion = reg.nombre || reg.name || reg.region || `Región ${idRegion}`
    if (!idRegion) continue

    let comunas = []
    try {
      comunas = await getJson(`${BASE}/getComuna.php?id_region=${idRegion}`)
      comunas = Array.isArray(comunas) ? comunas : comunas?.data || []
    } catch (e) {
      console.warn('comunas fail', nomRegion, e.message)
      continue
    }

    for (const com of comunas) {
      const idComuna = com.id_comuna || com.id || com.ID || com.value
      const nomComuna = com.nombre || com.name || com.comuna || `Comuna ${idComuna}`
      if (!idComuna) continue

      let sucs = []
      try {
        sucs = await getJson(`${BASE}/getDataSucursal.php?id_comuna=${idComuna}`)
        sucs = Array.isArray(sucs) ? sucs : sucs?.data || sucs?.sucursales || []
      } catch (e) {
        console.warn('suc fail', nomComuna, e.message)
        await sleep(120)
        continue
      }

      const docs = []
      for (const s of sucs) {
        const doc = formatearSucursal(s, nomRegion, nomComuna)
        todas.push(doc)
        docs.push(doc)
      }
      if (docs.length) {
        porComuna.set(nomComuna, docs)
        // Doc resumen por comuna
        todas.push({
          id: `sucursales-comuna-${slug(nomComuna)}`,
          titulo: `Sucursales y horarios en ${nomComuna}`,
          categoria: 'SUCURSALES',
          tipo: 'micro',
          seccionPortal: 'vtr.com → Sucursales',
          enlace: 'https://vtr.com/sucursales/',
          sinonimos: [
            'horario sucursal',
            'sucursales',
            nomComuna.toLowerCase(),
            `sucursal ${nomComuna}`.toLowerCase(),
            `horarios ${nomComuna}`.toLowerCase(),
          ],
          contenido: docs.flatMap((d) => ['', ...d.contenido]),
          fuente: 'vtr-sucursales',
          region: nomRegion,
          comuna: nomComuna,
        })
      }
      await sleep(80)
    }
    console.log(nomRegion, '→', comunas.length, 'comunas · acumulado', todas.length)
  }

  // Overview
  const overview = {
    id: 'sucursales-overview',
    titulo: 'Sucursales VTR: horarios y ubicaciones',
    categoria: 'SUCURSALES',
    tipo: 'guia',
    seccionPortal: 'vtr.com → Sucursales',
    enlace: 'https://vtr.com/sucursales/',
    sinonimos: [
      'sucursal',
      'sucursales',
      'horario sucursal',
      'horarios sucursales',
      'donde hay sucursal',
      'atencion presencial',
    ],
    contenido: [
      'Puedes buscar sucursales y horarios en https://vtr.com/sucursales/ (elige región y comuna).',
      `En esta base hay ${todas.filter((d) => d.id.startsWith('sucursal-')).length} sucursales indexadas.`,
      'Pregunta por comuna o nombre (ej. “horario sucursal Providencia”, “sucursales Maipú”).',
      'Los horarios pueden variar; si el cliente necesita lo más actual, confirma en vtr.com/sucursales/.',
    ],
    fuente: 'vtr-sucursales',
  }

  const docsFinal = [overview, ...todas]
  const limpios = docsFinal

  const outJson = path.join(__dirname, 'sucursalesHorarios.json')
  const outJs = path.join(__dirname, 'sucursalesHorarios.js')
  fs.writeFileSync(outJson, JSON.stringify(limpios))
  fs.writeFileSync(
    outJs,
    `// Auto-generado desde https://vtr.com/sucursales/\n// API: migracion.clarochilepromociones.com/sucursales-tabla/\n// Regenerar: node src/asistente/extraerSucursales.mjs\nexport const SUCURSALES_HORARIOS = ${JSON.stringify(limpios)}\n`
  )
  console.log('OK', limpios.length, 'docs →', outJs)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
