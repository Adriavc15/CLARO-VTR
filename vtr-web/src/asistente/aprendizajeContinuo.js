/**
 * Aprendizaje continuo controlado para ChatbotAndes.
 * - Registra conversaciones
 * - Detecta baja confianza → knowledge_candidates (NO publica solo)
 * - Admin aprueba/edita/rechaza → conocimiento_portal
 */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { obtenerClaveUsuario, textoEsOfensivo } from './chatAprendizajeLive.js'
import { slugId } from './conocimientoLive.js'

export const COL_CONVERSATIONS = 'chat_conversations'
export const COL_CANDIDATES = 'knowledge_candidates'
export const COL_CONOCIMIENTO = 'conocimiento_portal'

export const UMBRAL_CONFIANZA = 0.7

const normQ = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:()"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function claveCluster(pregunta) {
  const n = normQ(pregunta)
  // clave estable corta para agrupar variantes cercanas
  const toks = n
    .split(' ')
    .filter((t) => t.length > 2)
    .slice(0, 8)
  return toks.join('_').slice(0, 80) || `q_${Date.now()}`
}

/**
 * Confianza 0–1 a partir del ranking / modo de respuesta.
 * No inventa: baja si no hay guía o score débil.
 */
export function calcularConfianza({ charla, conGuia, empate, scoreTop = 0, docs = [] }) {
  if (charla) return 0.85
  if (empate) return 0.55
  if (!conGuia) {
    if (scoreTop >= 4) return 0.45
    if (scoreTop > 0) return 0.32
    return 0.2
  }
  // conGuia
  let c = Math.min(0.98, 0.55 + scoreTop / 40)
  if (docs[0]?.fuente === 'kb-andes-vtr' || docs[0]?.fuente === 'kb-andes-nl') c = Math.max(c, 0.78)
  if (docs[0]?.fuente === 'admin' || docs[0]?.fuente === 'admin-aprobado') c = Math.max(c, 0.82)
  return Number(c.toFixed(3))
}

function detectarCategoria(pregunta, docs = []) {
  const fromDoc = docs[0]?.categoria || docs[0]?.intent || ''
  if (fromDoc) return String(fromDoc).slice(0, 60)
  const q = normQ(pregunta)
  if (/peli|pelicula|serie|sinopsis|reparto|actor|donde ver/.test(q)) return 'cine'
  if (/hbo|max|netflix|disney|prime|streaming|ott/.test(q)) return 'streaming'
  if (/fibra|megas|600|800|940|plan/.test(q)) return 'planes'
  if (/ont|los|modem|wifi|visita/.test(q)) return 'soporte_tecnico'
  if (/boleta|factura|pago|ciclo/.test(q)) return 'facturacion'
  return 'general'
}

/** Registra el turno y, si confidence baja, acumula candidato pendiente. */
export async function registrarTurnoAprendizajeContinuo(
  db,
  {
    pregunta,
    respuesta,
    confidence,
    conGuia,
    empate,
    charla,
    docs = [],
    scoreTop = 0,
  }
) {
  if (!db) return { ok: false }
  const q = String(pregunta || '').trim()
  const r = String(respuesta || '').trim()
  if (!q || q.length < 3) return { ok: false }
  if (textoEsOfensivo(q) || textoEsOfensivo(r)) return { ok: false }

  const conf = typeof confidence === 'number' ? confidence : 0
  const categoria = detectarCategoria(q, docs)
  const sinRespuesta = !conGuia && !charla && conf < UMBRAL_CONFIANZA
  const estado = sinRespuesta ? 'sin_respuesta' : conf >= UMBRAL_CONFIANZA ? 'respondido' : 'baja_confianza'

  try {
    await addDoc(collection(db, COL_CONVERSATIONS), {
      pregunta: q.slice(0, 400),
      respuesta: r ? r.slice(0, 1200) : null,
      categoria,
      confidence: conf,
      scoreTop: Number(scoreTop) || 0,
      conGuia: Boolean(conGuia),
      empate: Boolean(empate),
      charla: Boolean(charla),
      respondio_correctamente: !sinRespuesta && conf >= UMBRAL_CONFIANZA,
      estado,
      topDocId: docs[0]?.id || null,
      topTitulo: docs[0]?.titulo || docs[0]?.nombre || null,
      clientId: obtenerClaveUsuario(),
      creadoEn: serverTimestamp(),
      dia: new Date().toISOString().slice(0, 10),
    })
  } catch {
    // Conversaciones: best-effort
  }

  if (conf < UMBRAL_CONFIANZA && !charla) {
    try {
      await acumularCandidato(db, {
        pregunta: q,
        categoria,
        confidence: conf,
        respuestaPropuesta: r && r.length > 20 ? r.slice(0, 1200) : null,
        topDocId: docs[0]?.id || null,
      })
    } catch {
      // candidatos: best-effort
    }
  }

  return { ok: true, estado, confidence: conf }
}

async function acumularCandidato(db, { pregunta, categoria, confidence, respuestaPropuesta, topDocId }) {
  const cluster = claveCluster(pregunta)
  const id = `cand_${cluster}`.slice(0, 100)
  const ref = doc(db, COL_CANDIDATES, id)
  const variante = normQ(pregunta)

  // Intento de merge atómico
  try {
    await setDoc(
      ref,
      {
        id,
        cluster,
        preguntaCanon: String(pregunta).trim().slice(0, 400),
        variantes: [variante].filter(Boolean),
        categoria_detectada: categoria || 'general',
        frecuencia: increment(1),
        confidence_avg: confidence,
        confidence_last: confidence,
        respuesta_propuesta: respuestaPropuesta || null,
        topDocId: topDocId || null,
        estado: 'pendiente',
        actualizadoEn: serverTimestamp(),
        creadoEn: serverTimestamp(),
      },
      { merge: true }
    )
  } catch {
    // Si increment falla en create, set plano
    await setDoc(
      ref,
      {
        id,
        cluster,
        preguntaCanon: String(pregunta).trim().slice(0, 400),
        variantes: [variante],
        categoria_detectada: categoria || 'general',
        frecuencia: 1,
        confidence_avg: confidence,
        confidence_last: confidence,
        respuesta_propuesta: respuestaPropuesta || null,
        topDocId: topDocId || null,
        estado: 'pendiente',
        actualizadoEn: serverTimestamp(),
        creadoEn: serverTimestamp(),
      },
      { merge: true }
    )
  }

  // Agregar variante sin duplicar (lectura-escritura simple)
  try {
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const d = snap.data() || {}
    if (d.estado && d.estado !== 'pendiente') return
    const vars = Array.isArray(d.variantes) ? d.variantes.map(normQ) : []
    if (variante && !vars.includes(variante) && vars.length < 40) {
      await updateDoc(ref, {
        variantes: [...vars, variante].slice(0, 40),
        confidence_last: confidence,
        actualizadoEn: serverTimestamp(),
      })
    }
  } catch {
    // ok
  }
}

export async function listarCandidatosPendientes(db, max = 40) {
  if (!db) return []
  try {
    const qy = query(
      collection(db, COL_CANDIDATES),
      where('estado', '==', 'pendiente'),
      orderBy('frecuencia', 'desc'),
      limit(max)
    )
    const snap = await getDocs(qy)
    const out = []
    snap.forEach((s) => out.push({ id: s.id, ...s.data() }))
    return out
  } catch {
    // fallback sin índice compuesto
    try {
      const snap = await getDocs(query(collection(db, COL_CANDIDATES), limit(80)))
      const out = []
      snap.forEach((s) => {
        const d = s.data() || {}
        if (d.estado === 'pendiente') out.push({ id: s.id, ...d })
      })
      return out.sort((a, b) => (b.frecuencia || 0) - (a.frecuencia || 0)).slice(0, max)
    } catch {
      return []
    }
  }
}

export async function metricasAprendizaje(db) {
  if (!db) return null
  try {
    const [conv, cands] = await Promise.all([
      getDocs(query(collection(db, COL_CONVERSATIONS), orderBy('creadoEn', 'desc'), limit(500))),
      getDocs(query(collection(db, COL_CANDIDATES), limit(200))),
    ])
    let respondidas = 0
    let sinRespuesta = 0
    let total = 0
    conv.forEach((s) => {
      total++
      const d = s.data() || {}
      if (d.estado === 'sin_respuesta' || d.estado === 'baja_confianza') sinRespuesta++
      else respondidas++
    })
    let pendientes = 0
    let aprobados = 0
    let rechazados = 0
    cands.forEach((s) => {
      const e = s.data()?.estado
      if (e === 'pendiente') pendientes++
      else if (e === 'aprobado') aprobados++
      else if (e === 'rechazado') rechazados++
    })
    return {
      preguntasRecibidas: total,
      respondidas,
      sinRespuesta,
      pendientesRevision: pendientes,
      conocimientoAprobado: aprobados,
      rechazados,
      muestraConversaciones: total,
    }
  } catch {
    return null
  }
}

/** Aprueba candidato → conocimiento oficial (RAG). Nunca precios inventados sin edición humana. */
export async function aprobarCandidato(db, candidato, { titulo, respuesta, sinonimos, categoria } = {}) {
  if (!db || !candidato?.id) throw new Error('Candidato inválido')
  const resp = String(respuesta || candidato.respuesta_propuesta || '').trim()
  if (!resp || resp.length < 12) throw new Error('Falta una respuesta validada (no se aprueba vacío)')

  const tituloFinal = String(titulo || candidato.preguntaCanon || 'Conocimiento aprobado').trim().slice(0, 160)
  const cat = String(categoria || candidato.categoria_detectada || 'APRENDIZAJE').toUpperCase()
  const sins = [
    candidato.preguntaCanon,
    ...(Array.isArray(candidato.variantes) ? candidato.variantes : []),
    ...(Array.isArray(sinonimos) ? sinonimos : String(sinonimos || '').split(/[,;]/)),
  ]
    .map((x) => String(x || '').trim())
    .filter(Boolean)
    .slice(0, 60)

  const id = `admin-aprobado-${slugId(tituloFinal)}`.slice(0, 100)
  await setDoc(
    doc(db, COL_CONOCIMIENTO, id),
    {
      id,
      titulo: tituloFinal,
      categoria: cat,
      tipo: 'faq',
      seccionPortal: `Aprendizaje aprobado · ${cat}`,
      sinonimos: sins,
      contenido: resp.split(/\n+/).map((l) => l.trim()).filter(Boolean).slice(0, 40),
      fuente: 'admin-aprobado',
      estado: 'aprobado',
      enlace: null,
      imagenes: [],
      candidatoId: candidato.id,
      actualizadoEn: new Date().toISOString(),
    },
    { merge: true }
  )

  await updateDoc(doc(db, COL_CANDIDATES, candidato.id), {
    estado: 'aprobado',
    conocimientoId: id,
    respuesta_final: resp.slice(0, 1200),
    aprobadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  })

  return { ok: true, conocimientoId: id }
}

export async function rechazarCandidato(db, candidatoId, motivo = '') {
  if (!db || !candidatoId) throw new Error('ID inválido')
  await updateDoc(doc(db, COL_CANDIDATES, candidatoId), {
    estado: 'rechazado',
    motivo: String(motivo || '').slice(0, 200),
    actualizadoEn: serverTimestamp(),
  })
  return { ok: true }
}

export async function actualizarCandidatoBorrador(db, candidatoId, { respuesta_propuesta, preguntaCanon }) {
  if (!db || !candidatoId) throw new Error('ID inválido')
  const patch = { actualizadoEn: serverTimestamp() }
  if (respuesta_propuesta != null) patch.respuesta_propuesta = String(respuesta_propuesta).slice(0, 1200)
  if (preguntaCanon != null) patch.preguntaCanon = String(preguntaCanon).slice(0, 400)
  await updateDoc(doc(db, COL_CANDIDATES, candidatoId), patch)
  return { ok: true }
}
