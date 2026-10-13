import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { debeAprenderComoEjemplo, esTurnoMicroOEvasion } from './entrenamientoApex.js'

export const COL_MEMORIA = 'apex_memoria'
export const COL_APRENDIZAJE = 'apex_aprendizaje'

const KEY_CLIENT = 'vtr-apex-client-id'
const MAX_MEMORIA = 30
const MAX_EJEMPLOS = 24

/** Id estable por navegador (o email lector si existe). */
export function obtenerClaveUsuario() {
  try {
    const email = (localStorage.getItem('vtr-lector-email') || '').trim().toLowerCase()
    if (email && email.includes('@')) {
      return `email_${email.replace(/[^a-z0-9@._-]/g, '_').slice(0, 120)}`
    }
    let id = localStorage.getItem(KEY_CLIENT)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(KEY_CLIENT, id)
    }
    return `dev_${id}`
  } catch {
    return `dev_fallback_${Date.now()}`
  }
}

const INSULTO_RE =
  /\b(puta|puto|mierda|culiao|culiado|concha|weon\s+de\s+mierda|imbecil|idiota|estupido|estupida|maricon|hijo\s+de\s+puta|hijueputa|ctm|conchetumare|pendejo|gil)\b/i

export function textoEsOfensivo(texto) {
  return INSULTO_RE.test(String(texto || ''))
}

export function sanitizarMemoriaItems(items = []) {
  return (items || [])
    .filter((m) => m && m.texto && !textoEsOfensivo(m.texto))
    .map((m) => ({
      texto: String(m.texto).trim().slice(0, 180),
      actualizadoEn: m.actualizadoEn || null,
    }))
    .filter((m) => m.texto.length >= 3)
    .slice(-MAX_MEMORIA)
}

function esTurnoUtilParaAprender(pregunta, respuesta, meta = {}) {
  return debeAprenderComoEjemplo({
    pregunta,
    respuesta,
    tema: meta.tema,
    charla: meta.charla,
    conGuia: meta.conGuia,
    esCine: meta.esCine || meta.tema === 'cine',
  })
}

/** Carga memoria personal desde Firestore (+ merge local opcional). */
export async function cargarMemoriaFirestore(db, localMemoria = []) {
  if (!db) return sanitizarMemoriaItems(localMemoria)
  try {
    const clave = obtenerClaveUsuario()
    const snap = await getDoc(doc(db, COL_MEMORIA, clave))
    const remota = snap.exists() ? snap.data()?.memoria || [] : []
    const mapa = new Map()
    for (const m of [...sanitizarMemoriaItems(remota), ...sanitizarMemoriaItems(localMemoria)]) {
      const k = m.texto.toLowerCase()
      mapa.set(k, m)
    }
    return Array.from(mapa.values()).slice(-MAX_MEMORIA)
  } catch {
    return sanitizarMemoriaItems(localMemoria)
  }
}

/** Guarda memoria personal en Firestore. */
export async function guardarMemoriaFirestore(db, memoria) {
  if (!db) return false
  try {
    const clave = obtenerClaveUsuario()
    const limpia = sanitizarMemoriaItems(memoria)
    await setDoc(
      doc(db, COL_MEMORIA, clave),
      {
        memoria: limpia,
        clientId: clave,
        tono: 'respetuoso',
        actualizadoEn: serverTimestamp(),
      },
      { merge: true }
    )
    return true
  } catch {
    return false
  }
}

/**
 * Guarda un ejemplo de buena respuesta (compartido) para que Apex
 * aprenda cómo contestar temas similares — siempre tono respetuoso.
 */
export async function registrarAprendizajeTurno(db, { pregunta, respuesta, tema, fuente, charla, conGuia, esCine }) {
  if (!db) return false
  if (
    !esTurnoUtilParaAprender(pregunta, respuesta, {
      tema,
      charla,
      conGuia,
      esCine,
      fuente,
    })
  ) {
    return false
  }
  // Micro/evasión nunca ensucia el corpus de few-shots
  if (esTurnoMicroOEvasion(pregunta)) return false
  try {
    const payload = {
      pregunta: String(pregunta).trim().slice(0, 400),
      respuesta: String(respuesta).trim().slice(0, 1200),
      tema: String(tema || 'general').slice(0, 80),
      tono: 'respetuoso',
      util: true,
      calidad: 'entrenable',
      clientId: obtenerClaveUsuario(),
      creadoEn: serverTimestamp(),
    }
    if (fuente) payload.fuente = String(fuente).slice(0, 40)
    await addDoc(collection(db, COL_APRENDIZAJE), payload)
    return true
  } catch {
    return false
  }
}

/** Últimos ejemplos compartidos para inyectar en el prompt. */
export async function cargarEjemplosAprendidos(db, max = 8) {
  if (!db) return []
  try {
    const q = query(
      collection(db, COL_APRENDIZAJE),
      orderBy('creadoEn', 'desc'),
      limit(MAX_EJEMPLOS)
    )
    const snap = await getDocs(q)
    const out = []
    snap.forEach((s) => {
      const d = s.data() || {}
      if (d.tono !== 'respetuoso') return
      if (textoEsOfensivo(d.pregunta) || textoEsOfensivo(d.respuesta)) return
      if (!d.pregunta || !d.respuesta) return
      out.push({
        pregunta: String(d.pregunta).slice(0, 200),
        respuesta: String(d.respuesta).slice(0, 500),
        tema: d.tema || '',
        fuente: d.fuente || '',
      })
    })
    const cine = out.filter((e) => e.tema === 'cine')
    const sc = out.filter((e) => e.tema === 'somosclave' || e.fuente === 'somosclave-km')
    const stream = out.filter(
      (e) =>
        /streaming|tnt|max|contactese|ott|netflix|disney/i.test(
          `${e.tema || ''} ${e.pregunta || ''} ${e.fuente || ''}`
        ) && e.tema !== 'somosclave'
    )
    const portal = out.filter(
      (e) =>
        e.tema !== 'cine' &&
        e.tema !== 'charla' &&
        e.tema !== 'evasion' &&
        e.tema !== 'somosclave' &&
        e.fuente !== 'somosclave-km' &&
        !stream.includes(e)
    )
    const tono = out.filter((e) => e.tema === 'charla' || e.tema === 'evasion')
    // Evitar inundar el prompt con Somos Clave (p. ej. LOS) y tapar streaming/OTT
    const mix = [
      ...stream.slice(0, 2),
      ...cine.slice(0, 2),
      ...portal.slice(0, 2),
      ...sc.slice(0, 1),
      ...tono.slice(0, 1),
    ]
    return mix.slice(0, max)
  } catch {
    return []
  }
}

export function formatearEjemplosParaPrompt(ejemplos) {
  const items = (ejemplos || [])
    .filter((e) => e && e.pregunta && e.respuesta && !esTurnoMicroOEvasion(e.pregunta))
    .slice(0, 6)
  if (!items.length) return ''
  return (
    '\n\nFew-shots aprendidos (inspírate; no copies literal). Prioriza hechos de portal/cine sobre charla:\n' +
    items
      .map((e, i) => {
        const tag =
          e.tema === 'cine'
            ? ' [cine]'
            : e.tema === 'somosclave' || e.fuente === 'somosclave-km'
              ? ' [Somos Clave]'
              : e.tema === 'charla'
                ? ' [tono]'
                : ' [portal]'
        return `${i + 1}.${tag} Usuario: "${e.pregunta}"\n   Apex: "${e.respuesta}"`
      })
      .join('\n')
  )
}

