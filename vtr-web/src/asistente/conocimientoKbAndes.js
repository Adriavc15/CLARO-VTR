/**
 * Base de conocimiento estructurada Andes/VTR (IA PARA VTR).
 * Se mapea al formato de `conocimiento_portal` que usa ChatbotAndes.
 */
import { doc, writeBatch, setDoc } from 'firebase/firestore'
import kbRaw from './data/andes_vtr_ia_knowledge_base.json'
import {
  generarTrainingExamplesCatalogo,
  docsDesdeTrainingNl,
  expandirSinonimosPlan,
  metaTrainingNl,
} from './trainingEjemplosNl.js'

const COL_CONOCIMIENTO = 'conocimiento_portal'
export const COL_TRAINING_EXAMPLES = 'training_examples'

export const FUENTE_KB = 'kb-andes-vtr'
export const FUENTE_KB_TRAINING = 'kb-andes-training'
export const FUENTE_KB_RULES = 'kb-andes-rules'
export const FUENTE_KB_NL = 'kb-andes-nl'

const normTok = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

function uniq(arr) {
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const t = String(x || '').trim()
    if (!t) continue
    const k = normTok(t)
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(t)
  }
  return out
}

function tipoDesdeItem(item) {
  const cat = normTok(item.categoria)
  const intent = normTok(item.intent)
  if (cat === 'planes' || intent.includes('consulta_plan') || intent.includes('equivalencia')) return 'plan'
  if (cat === 'tv' || intent.includes('streaming') || intent.includes('canales') || intent.includes('caracteristicas_tv'))
    return 'streaming'
  if (intent.includes('ont') || intent.includes('los') || intent.includes('mesh') || intent.includes('fibra'))
    return 'soporte'
  if (cat.includes('retencion') || intent.includes('retencion') || intent.includes('fuente_pdf')) return 'retencion'
  if (cat.includes('facturacion') || intent.includes('ciclo')) return 'facturacion'
  return 'kb'
}

function contenidoDesdeItem(item) {
  const lines = []
  if (item.respuesta) lines.push(String(item.respuesta).trim())
  if (item.plan && typeof item.plan === 'object') {
    const p = item.plan
    if (p.comercial) lines.push(`Nombre comercial: ${p.comercial}`)
    if (p.andes) lines.push(`Nombre en Andes: ${p.andes}`)
    if (p.normal) lines.push(`Precio normal: ${p.normal}`)
    if (p.promo) lines.push(`Precio promo: ${p.promo}`)
  }
  if (item.subcategoria) lines.push(`Subcategoría: ${item.subcategoria}`)
  if (item.intent) lines.push(`Intención: ${item.intent}`)
  return lines.filter(Boolean)
}

/** Convierte un registro KB → documento del índice del chat */
export function kbItemADoc(item, { idOverride } = {}) {
  if (!item?.id) return null
  const extrasPlan =
    String(item.categoria || '').toLowerCase() === 'planes' || item.plan
      ? expandirSinonimosPlan(item.titulo || item.plan?.comercial || '')
      : []
  const sinonimos = uniq([
    item.titulo,
    item.intent,
    item.categoria,
    item.subcategoria,
    ...(Array.isArray(item.preguntas) ? item.preguntas : []),
    item.plan?.comercial,
    item.plan?.andes,
    ...extrasPlan,
  ])
  const baseId = idOverride || (String(item.id).startsWith('KB-') ? String(item.id) : `KB-${item.id}`)
  return {
    id: baseId,
    titulo: item.titulo || item.id,
    categoria: String(item.categoria || 'KB').toUpperCase(),
    tipo: tipoDesdeItem(item),
    seccionPortal: [item.categoria, item.subcategoria].filter(Boolean).join(' · ') || 'Base Andes/VTR',
    sinonimos,
    contenido: contenidoDesdeItem(item),
    fuente: FUENTE_KB,
    enlace: null,
    imagenes: [],
    intent: item.intent || '',
    versionKb: item.version || kbRaw.version || '',
    fuenteDato: item.fuente_dato || item.source || '',
  }
}

export function trainingItemADoc(item) {
  if (!item?.id) return null
  return {
    id: String(item.id).startsWith('TR-') ? String(item.id) : `TR-${item.id}`,
    titulo: item.input || item.id,
    categoria: String(item.categoria || 'ENTRENAMIENTO').toUpperCase(),
    tipo: 'ejemplo',
    seccionPortal: `Entrenamiento · ${item.intent || 'general'}`,
    sinonimos: uniq([item.input, item.intent, item.categoria, ...(item.tags || [])]),
    contenido: [item.answer || item.respuesta].filter(Boolean),
    fuente: FUENTE_KB_TRAINING,
    enlace: null,
    imagenes: [],
    intent: item.intent || '',
    versionKb: kbRaw.version || '',
  }
}

export function rulesADoc() {
  const rules = Array.isArray(kbRaw.rules) ? kbRaw.rules : []
  if (!rules.length) return null
  return {
    id: 'KB-RULES',
    titulo: 'Reglas de respuesta Andes/VTR',
    categoria: 'REGLAS',
    tipo: 'reglas',
    seccionPortal: 'Base Andes/VTR · reglas',
    sinonimos: ['reglas ia', 'no inventar', 'usar evidencia', 'rag'],
    contenido: rules.map((r) => String(r)),
    fuente: FUENTE_KB_RULES,
    enlace: null,
    imagenes: [],
  }
}

/** Todos los docs locales listos para el chat (sin Firestore). */
export function docsKbAndesLocales() {
  const knowledge = Array.isArray(kbRaw.knowledge) ? kbRaw.knowledge : []
  const training = Array.isArray(kbRaw.training_examples) ? kbRaw.training_examples : []
  const docs = []
  const rules = rulesADoc()
  if (rules) docs.push(rules)
  for (const item of knowledge) {
    const d = kbItemADoc(item)
    if (d) docs.push(d)
  }
  for (const item of training) {
    const d = trainingItemADoc(item)
    if (d) docs.push(d)
  }
  for (const d of docsDesdeTrainingNl()) {
    docs.push(d)
  }
  return docs
}

export function metaKbAndes() {
  const nl = metaTrainingNl()
  return {
    name: kbRaw.name || 'andes_vtr_ia_knowledge_base',
    version: kbRaw.version || '',
    generatedAt: kbRaw.generated_at || '',
    knowledge: Array.isArray(kbRaw.knowledge) ? kbRaw.knowledge.length : 0,
    training: Array.isArray(kbRaw.training_examples) ? kbRaw.training_examples.length : 0,
    trainingNlIntents: nl.intents,
    trainingNlEjemplos: nl.ejemplos,
    rules: Array.isArray(kbRaw.rules) ? kbRaw.rules.length : 0,
  }
}

/** Importa un JSON ya parseado (p.ej. subido desde admin). */
export function docsDesdeKbJson(parsed) {
  if (!parsed || typeof parsed !== 'object') return []
  const knowledge = Array.isArray(parsed.knowledge)
    ? parsed.knowledge
    : Array.isArray(parsed)
      ? parsed
      : []
  const training = Array.isArray(parsed.training_examples) ? parsed.training_examples : []
  const out = []
  for (const item of knowledge) {
    const d = kbItemADoc(item)
    if (d) out.push(d)
  }
  for (const item of training) {
    const d = trainingItemADoc(item)
    if (d) out.push(d)
  }
  return out
}

/** Sube la base embebida a Firestore `conocimiento_portal`. */
export async function sincronizarKbAndesVtr(db, { docs } = {}) {
  if (!db) throw new Error('Firestore no disponible')
  const lista = docs?.length ? docs : docsKbAndesLocales()
  const CHUNK = 400
  for (let i = 0; i < lista.length; i += CHUNK) {
    const batch = writeBatch(db)
    const slice = lista.slice(i, i + CHUNK)
    for (const d of slice) {
      const { id, ...rest } = d
      batch.set(
        doc(db, COL_CONOCIMIENTO, id),
        {
          id,
          ...rest,
          actualizadoEn: new Date().toISOString(),
        },
        { merge: true }
      )
    }
    await batch.commit()
  }
  const trainingRes = await sincronizarTrainingExamples(db)
  return {
    ok: true,
    total: lista.length,
    trainingExamples: trainingRes.total,
    meta: metaKbAndes(),
  }
}

/** Colección dedicada `training_examples` (intents + user_examples). */
export async function sincronizarTrainingExamples(db) {
  if (!db) throw new Error('Firestore no disponible')
  const packs = generarTrainingExamplesCatalogo()
  const CHUNK = 200
  for (let i = 0; i < packs.length; i += CHUNK) {
    const batch = writeBatch(db)
    for (const p of packs.slice(i, i + CHUNK)) {
      batch.set(
        doc(db, COL_TRAINING_EXAMPLES, p.id),
        {
          ...p,
          actualizadoEn: new Date().toISOString(),
          version: kbRaw.version || '2026-09',
        },
        { merge: true }
      )
    }
    await batch.commit()
  }
  return { ok: true, total: packs.length, meta: metaTrainingNl(packs) }
}

export async function sincronizarKbAndesVtrSimple(db, docs) {
  if (!db) throw new Error('Firestore no disponible')
  const lista = docs?.length ? docs : docsKbAndesLocales()
  for (const d of lista) {
    const { id, ...rest } = d
    await setDoc(
      doc(db, COL_CONOCIMIENTO, id),
      { id, ...rest, actualizadoEn: new Date().toISOString() },
      { merge: true }
    )
  }
  await sincronizarTrainingExamples(db)
  return { ok: true, total: lista.length }
}
