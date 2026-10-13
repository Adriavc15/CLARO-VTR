/**
 * Verifica matches + alternativas (FAQ, SC, KB) de forma amplia.
 * node scripts/verificar-respuestas-match.mjs
 */
import fs from 'fs'
import { buscarConocimiento, respuestaLocal, esCharlaCasual, respuestaCasualLocal } from '../src/asistente/conocimientoAndes.js'
import { INDICE_PORTAL_LOCAL } from '../src/asistente/indicePortal.js'
import { DOCS_FAQ_AMPLIADAS } from '../src/asistente/faqAmpliadas.js'
import { docsDesdeTrainingNl } from '../src/asistente/trainingEjemplosNl.js'

const kbRaw = JSON.parse(
  fs.readFileSync(new URL('../src/asistente/data/andes_vtr_ia_knowledge_base.json', import.meta.url), 'utf8')
)

function uniq(arr) {
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const t = String(x || '').trim()
    if (!t) continue
    const k = t.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(t)
  }
  return out
}

function kbItemADoc(item) {
  return {
    id: String(item.id).startsWith('KB-') ? String(item.id) : `KB-${item.id}`,
    titulo: item.titulo || item.id,
    categoria: String(item.categoria || 'KB').toUpperCase(),
    tipo: 'kb',
    seccionPortal: [item.categoria, item.subcategoria].filter(Boolean).join(' · ') || 'Base Andes/VTR',
    sinonimos: uniq([
      item.titulo,
      item.intent,
      item.categoria,
      item.subcategoria,
      ...(item.preguntas || []),
    ]),
    contenido: [item.respuesta].filter(Boolean),
    fuente: 'kb-andes-vtr',
    intent: item.intent || '',
  }
}

function trainingItemADoc(item) {
  return {
    id: String(item.id).startsWith('TR-') ? String(item.id) : `TR-${item.id}`,
    titulo: item.input || item.id,
    categoria: 'ENTRENAMIENTO',
    tipo: 'ejemplo',
    seccionPortal: `Entrenamiento · ${item.intent || 'general'}`,
    sinonimos: uniq([item.input, item.intent, item.categoria, ...(item.tags || [])]),
    contenido: [item.answer || item.respuesta].filter(Boolean),
    fuente: 'kb-andes-training',
    intent: item.intent || '',
  }
}

const porId = new Map(INDICE_PORTAL_LOCAL.map((d) => [d.id, d]))
for (const item of kbRaw.knowledge || []) {
  const d = kbItemADoc(item)
  porId.set(d.id, d)
}
for (const item of kbRaw.training_examples || []) {
  const d = trainingItemADoc(item)
  porId.set(d.id, d)
}
for (const d of docsDesdeTrainingNl()) porId.set(d.id, d)
const corpus = [...porId.values()]

/** Casos: expectId opcional; must/mustNot sobre el texto de respuesta */
const casos = [
  // Asistencia (el bug reportado)
  {
    q: 'Quién puede contratar Asistencia VTR',
    expectId: 'faq-asistencia-quien',
    must: [/titular|poder notarial|residencial/i],
    mustNot: [/inhibici[oó]n|los en rojo|luz roja|ont no est[aá]/i],
  },
  {
    q: 'quien puede contratar asistencia vtr',
    expectId: 'faq-asistencia-quien',
    must: [/titular|residencial|poder notarial/i],
    mustNot: [/inhibici[oó]n|los en rojo/i],
  },
  {
    q: 'quién puede contratar asistencia',
    expectId: 'faq-asistencia-quien',
    must: [/titular|residencial/i],
    mustNot: [/inhibici[oó]n/i],
  },
  {
    q: 'requisitos para contratar asistencia vtr',
    expectId: 'faq-asistencia-quien',
    must: [/titular|residencial/i],
    mustNot: [/inhibici[oó]n/i],
  },
  {
    q: 'cuanto cuesta asistencia vtr',
    expectId: 'faq-asistencia-precio',
    must: [/1\.?990|1990/i],
    mustNot: [/inhibici[oó]n|los rojo/i],
  },
  {
    q: 'que cubre asistencia vtr',
    must: [/asistencia|cubre|red interior|extensi/i],
    mustNot: [/inhibici[oó]n|contactese con vtr/i],
  },

  // Regresiones previas
  {
    q: 'Que hago si contrate TNT Sports en Max pero me sale el mensaje CONTACTESE CON VTR',
    must: [/sucursal virtual|credencial|ott|contacte/i],
    mustNot: [/los rojo|luz roja|señal optica|senal optica|inhibici/i],
  },
  {
    q: 'Luz LOS en rojo que significa',
    must: [/los|optica|señal|senal|fibra/i],
    mustNot: [/asistencia vtr|inhibici[oó]n|contactese/i],
  },
  {
    q: 'problemas con netflix dbox smart error 001',
    expectId: 'faq-netflix-dbox-error',
    must: [/netflix|1111|d-?box|c[oó]digo/i],
    mustNot: [/inhibici[oó]n|quien puede contratar asistencia/i],
  },
  {
    q: 'busca cliente por rut',
    must: [/rut|cliente/i],
    mustNot: [/inhibici[oó]n|tnt sports/i],
  },
  {
    q: 'como hago una inhibición',
    must: [/inhibici[oó]n|6 d[ií]as|facturaci[oó]n/i],
    mustNot: [/quien puede contratar asistencia|titular.*asistencia/i],
  },

  // FAQs SC / operativos (id + alternativas)
  { q: 'activar hbo max', expectId: 'faq-hbo-max', must: [/hbo|1116|activar/i], mustNot: [/inhibici/i] },
  { q: 'hbo max no funciona', expectId: 'faq-hbo-max', must: [/hbo|1116/i] },
  { q: 'disney plus no funciona', expectId: 'faq-disney-plus', must: [/disney|1010/i] },
  { q: 'activar prime video', expectId: 'faq-prime-video', must: [/prime|1110/i] },
  { q: 'problemas con crunchyroll', expectId: 'faq-crunchyroll', must: [/crunchy|1113/i] },
  { q: 'olvidé la clave wifi', expectId: 'faq-clave-wifi', must: [/wifi|1026|sucursal virtual|etiqueta|m[oó]dem/i] },
  { q: 'cuál es la contraseña del wifi', expectId: 'faq-clave-wifi', must: [/wifi|clave|1026/i] },
  { q: 'quiero un extensor wifi', expectId: 'faq-extensores-wifi', must: [/extensor|1033/i] },
  { q: 'teléfono fijo no funciona', expectId: 'faq-telefonia-fija', must: [/telefon|1052/i] },
  { q: 'dbox mensaje de bloqueo', expectId: 'faq-dbox-bloqueo', must: [/bloqueo|1459|serie/i] },
  { q: 'reagendar visita técnica', expectId: 'faq-visitas-tecnicas', must: [/visita|1036/i] },
  { q: 'cuánto cuesta la visita técnica', expectId: 'faq-valores-visitas', must: [/20\.?000|0|1342|visita/i] },
  { q: 'horarios de visita técnica', expectId: 'faq-bloques-visita', must: [/bloque|horario|1353|visita/i] },
  { q: 'explicar la boleta', expectId: 'faq-explicacion-boleta', must: [/boleta|billing|1028/i] },
  { q: 'pagué y no se refleja', expectId: 'faq-inconveniente-pago', must: [/pago|1303|comprobante/i] },
  { q: 'portal cautivo', expectId: 'faq-portal-cautivo', must: [/cautivo|1356|pago express|sucursal virtual/i] },
  { q: 'traslado de servicios mudanza', expectId: 'faq-traslado-servicios', must: [/traslado|1058|factible/i] },
  { q: 'corte de acometida', expectId: 'faq-corte-acometida', must: [/acometida|1329/i] },
  { q: 'migración a fibra', expectId: 'faq-migracion-fibra', must: [/fibra|138|migraci/i] },
  { q: 'cliente quiere anular el servicio', expectId: 'faq-retencion-anulacion', must: [/retenci|1006|anul/i] },
]

let fails = 0
for (const c of casos) {
  const ranked = buscarConocimiento(c.q, 8, corpus)
  const top = ranked[0]
  const texto = respuestaLocal(c.q, ranked)
  const idOk = !c.expectId || top?.id === c.expectId || ranked.some((d) => d.id === c.expectId && d.score >= (top?.score || 0) * 0.9)
  const miss = (c.must || []).filter((r) => !r.test(texto))
  const bad = (c.mustNot || []).filter((r) => r.test(texto))
  const ok = idOk && !miss.length && !bad.length
  if (!ok) fails++
  console.log(`${ok ? 'OK' : 'FAIL'} | ${c.q}`)
  console.log(`  top: ${top?.id} (${Math.round(top?.score || 0)})`)
  if (c.expectId && top?.id !== c.expectId) console.log(`  want: ${c.expectId}`)
  if (miss.length) console.log(`  FALTA: ${miss}`)
  if (bad.length) console.log(`  SOBRA: ${bad}`)
  if (!ok) console.log(`  resp: ${texto.replace(/\s+/g, ' ').slice(0, 220)}`)
}

for (const q of ['nada', 'que te importa', 'hola']) {
  console.log(`CHARLA ${q} => ${esCharlaCasual(q)} | ${(respuestaCasualLocal(q) || '').slice(0, 60)}`)
}

console.log(`\nFALLAS: ${fails} / ${casos.length}`)
console.log(`Corpus: ${corpus.length} | FAQs: ${DOCS_FAQ_AMPLIADAS.length}`)
process.exit(fails ? 1 : 0)
