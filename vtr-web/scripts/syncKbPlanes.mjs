/**
 * Sincroniza los ítems de "planes" de la base de conocimiento Andes/VTR con el
 * catálogo que usa la web (`src/asistente/planesSeed.js`).
 *
 * La KB (`src/asistente/data/andes_vtr_ia_knowledge_base.json`) se generaba a
 * mano desde un volcado de texto y quedó desalineada con el plan comercial de
 * Octubre 2026 (precios viejos y planes HFC 500 / TV Premium que faltaban).
 * Este script la regenera para que el asistente nunca cite un precio que no
 * está en la sección Planes del portal.
 *
 * No borra ítems que no estén en el seed: solo los reporta (pueden ser planes
 * que el portal no muestra, por ejemplo cable o legacy).
 *
 * Uso:
 *   node scripts/syncKbPlanes.mjs           # escribe el JSON
 *   node scripts/syncKbPlanes.mjs --check   # solo informa qué cambiaría
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { PLANES_SEED, PLANES_GRUPOS, STREAM_NAMES } from '../src/asistente/planesSeed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(__dirname, '..')
const RUTA_KB = path.join(RAIZ, 'src', 'asistente', 'data', 'andes_vtr_ia_knowledge_base.json')
const VERSION_KB = '2026-10'
const FUENTE_PLAN_COMERCIAL = 'Plan Comercial ClaroVTR Hogar — Octubre 2026 (V04)'

const soloCheck = process.argv.includes('--check')

/** Subcategoría de la KB según el grupo del catálogo. */
const SUBCATEGORIA = {
  '1p-internet': 'Internet HFC/FTTH',
  '1p-stream': 'Internet + Streaming',
  '1p-tv': 'TV',
  '1p-fono': 'Telefonía',
  '2p-tv': 'Internet + TV',
  '2p-fono': 'Internet + Telefonía',
  '3p': 'Internet + TV + Telefonía',
}

/** Grupos que la KB cubre (cable y legacy no se documentan acá). */
const GRUPOS_CUBIERTOS = new Set(Object.keys(SUBCATEGORIA))

const normalizar = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const preguntasDe = (comercial) => [
  `precio de ${comercial}`,
  `cuanto cuesta ${comercial}`,
  `cuánto sale ${comercial}`,
  `valor ${comercial}`,
  `${comercial} precio normal y promo`,
  `qué plan es ${comercial}`,
]

/** Red del plan (Octubre 2026): HFC o Fibra Óptica FTTH. */
const RED_LABEL = {
  HFC: 'HFC',
  FTTH: 'Fibra Óptica (FTTH)',
}

function respuestaDe(plan) {
  const partes = []
  if (plan.normal) partes.push(`precio normal ${plan.normal}`)
  if (plan.promo) partes.push(`precio promo ${plan.promo}`)
  const precios = partes.length ? partes.join('; ') : 'sin precio en la tarjeta del plan'
  const texto = `${plan.comercial}: ${precios}.`
  const red = RED_LABEL[plan.red] ? ` Red: ${RED_LABEL[plan.red]}.` : ''
  const andes = plan.andes ? ` Nombre en Andes: ${plan.andes}.` : ''
  const plataformas = (plan.streams || []).map((s) => STREAM_NAMES[s] || s).filter(Boolean)
  const streaming = plataformas.length ? ` Streaming incluido: ${plataformas.join(', ')}.` : ''
  const nota = plan.nota ? ` Aviso: ${plan.nota}` : ''
  return `${texto}${red}${andes}${streaming}${nota}`
}

/** Objeto `plan` de la KB a partir de una fila del catálogo. */
function planDeKb(plan) {
  const out = {
    comercial: plan.comercial,
    andes: plan.andes || '',
    normal: plan.normal || '',
    promo: plan.promo || '',
  }
  if (plan.red) out.red = plan.red
  if ((plan.tags || []).length) out.tags = [...plan.tags]
  if ((plan.streams || []).length) out.streams = [...plan.streams]
  return out
}

const kb = JSON.parse(fs.readFileSync(RUTA_KB, 'utf8'))
const knowledge = Array.isArray(kb.knowledge) ? kb.knowledge : []

// --- ids disponibles -------------------------------------------------------
const idsUsados = new Set(knowledge.map((it) => String(it.id || '')))
let ultimoNum = knowledge.reduce((max, it) => {
  const n = Number(String(it.id || '').replace(/\D/g, ''))
  return Number.isFinite(n) ? Math.max(max, n) : max
}, 0)
const siguienteId = () => {
  ultimoNum += 1
  let id = `KB-${String(ultimoNum).padStart(4, '0')}`
  while (idsUsados.has(id)) {
    ultimoNum += 1
    id = `KB-${String(ultimoNum).padStart(4, '0')}`
  }
  idsUsados.add(id)
  return id
}

// --- índice del catálogo ---------------------------------------------------
const porComercial = new Map()
for (const p of PLANES_SEED) {
  if (!GRUPOS_CUBIERTOS.has(p.grupo)) continue
  porComercial.set(normalizar(p.comercial), p)
}

const cambios = []
const agregados = []
const sinEquivalente = []

for (const item of knowledge) {
  if (item.categoria !== 'planes') continue
  const clave = normalizar(item.plan?.comercial || item.titulo)
  const plan = porComercial.get(clave)
  if (!plan) {
    sinEquivalente.push(item.id + ' · ' + (item.plan?.comercial || item.titulo))
    continue
  }
  const nuevoPlan = planDeKb(plan)
  const antes = JSON.stringify(item.plan || {})
  const despues = JSON.stringify(nuevoPlan)
  const respuestaAntes = item.respuesta || ''
  const respuestaDespues = respuestaDe(plan)
  const cambioPrecio =
    (item.plan?.normal || '') !== (nuevoPlan.normal || '') ||
    (item.plan?.promo || '') !== (nuevoPlan.promo || '')
  if (
    antes !== despues ||
    respuestaAntes !== respuestaDespues ||
    item.version !== VERSION_KB ||
    item.source !== FUENTE_PLAN_COMERCIAL
  ) {
    cambios.push({
      id: item.id,
      comercial: plan.comercial,
      cambioPrecio,
      antes: `${item.plan?.normal || '—'} / ${item.plan?.promo || '—'}`,
      despues: `${nuevoPlan.normal || '—'} / ${nuevoPlan.promo || '—'}`,
    })
  }
  item.titulo = plan.comercial
  item.subcategoria = SUBCATEGORIA[plan.grupo] || item.subcategoria
  item.plan = nuevoPlan
  item.respuesta = respuestaDespues
  item.preguntas = preguntasDe(plan.comercial)
  item.version = VERSION_KB
  item.fuente_dato = 'portal/app'
  item.source = FUENTE_PLAN_COMERCIAL
}

// --- planes del catálogo que todavía no están en la KB ---------------------
const yaCubiertos = new Set(
  knowledge
    .filter((it) => it.categoria === 'planes')
    .map((it) => normalizar(it.plan?.comercial || it.titulo))
)
for (const p of PLANES_SEED) {
  if (!GRUPOS_CUBIERTOS.has(p.grupo)) continue
  const clave = normalizar(p.comercial)
  if (yaCubiertos.has(clave)) continue
  yaCubiertos.add(clave)
  const item = {
    id: siguienteId(),
    categoria: 'planes',
    subcategoria: SUBCATEGORIA[p.grupo],
    intent: 'consulta_plan',
    titulo: p.comercial,
    respuesta: respuestaDe(p),
    preguntas: preguntasDe(p.comercial),
    source: FUENTE_PLAN_COMERCIAL,
    version: VERSION_KB,
    plan: planDeKb(p),
    fuente_dato: 'portal/app',
  }
  knowledge.push(item)
  agregados.push(`${item.id} · ${p.comercial}`)
}

console.log(`KB de planes → ${VERSION_KB}`)
console.log(`  Planes en el catálogo (grupos cubiertos): ${porComercial.size}`)
const conPrecio = cambios.filter((c) => c.cambioPrecio)
console.log(`  Ítems sincronizados: ${cambios.length} (${conPrecio.length} con cambio de precio)`)
for (const c of conPrecio) {
  console.log(`    ~ ${c.id} ${c.comercial}: ${c.antes} → ${c.despues}`)
}
console.log(`  Ítems nuevos: ${agregados.length}`)
for (const a of agregados) console.log(`    + ${a}`)
if (sinEquivalente.length) {
  console.log(`  Ítems sin equivalente en el catálogo (se conservan): ${sinEquivalente.length}`)
  for (const s of sinEquivalente) console.log(`    ! ${s}`)
}

if (soloCheck) {
  console.log('\nModo --check: no se escribió el archivo.')
  process.exit(0)
}

kb.generated_at = new Date().toISOString().slice(0, 10)
kb.knowledge = knowledge
fs.writeFileSync(RUTA_KB, `${JSON.stringify(kb, null, 2)}\n`, 'utf8')
console.log(`\nKB escrita en ${RUTA_KB}`)
console.log('Recordar publicar la base en el admin para actualizar `conocimiento_portal`.')
