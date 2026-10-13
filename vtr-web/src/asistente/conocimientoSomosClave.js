/**
 * Convierte artículos Somos Clave (Inbenta) en docs de conocimiento para el chatbot.
 */
import { collection, doc, writeBatch } from 'firebase/firestore'
import { COL_CONOCIMIENTO, textoAContenido } from './conocimientoLive.js'

const MAX_CHARS = 12000

export function htmlRespuestaATexto(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' | ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/add_circle_outline|record_voice_over|folder_special|expand_more|expand_less|receipt|dvr/gi, '')
    .replace(/Contraseña:\s*\S+/gi, 'Contraseña: [consultar con supervisor]')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

/** URLs de imágenes usables en el chat (locales /sc-assets o http) */
export function extraerImagenesDesdeHtml(html, { limite = 12 } = {}) {
  const raw = String(html || '')
  if (!raw) return []
  const out = []
  const seen = new Set()
  const push = (src) => {
    let u = String(src || '')
      .trim()
      .replace(/&amp;/g, '&')
    if (!u || u.startsWith('data:')) return
    // Normalizar rutas relativas del catálogo local
    if (u.startsWith('sc-assets/')) u = `/${u}`
    if (u.startsWith('./sc-assets/')) u = u.replace(/^\./, '')
    if (!/^https?:\/\//i.test(u) && !u.startsWith('/')) return
    // Evitar iconos/basura tipicos
    if (/spacer|pixel|blank|1x1|icon[_-]?arrow|favicon/i.test(u)) return
    if (seen.has(u)) return
    seen.add(u)
    out.push(u)
  }
  for (const m of raw.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)) push(m[1])
  // srcset: tomar primera URL
  for (const m of raw.matchAll(/srcset=["']([^"']+)["']/gi)) {
    const first = String(m[1] || '')
      .split(',')[0]
      ?.trim()
      .split(/\s+/)[0]
    if (first) push(first)
  }
  return out.slice(0, limite)
}

/**
 * Detecta HTML guardado de una página respuesta.php de Somos Clave
 * (faq-title + faq-content) y lo convierte en artículo indexable.
 */
export function extraerArticuloDesdeHtmlSomosClave(html) {
  const raw = String(html || '')
  if (!/id=["']faq-title["']|id=["']faq-content["']/i.test(raw)) return null

  const nombre = htmlRespuestaATexto((raw.match(/id=["']faq-title["'][^>]*>([\s\S]*?)<\/b>/i) || [])[1] || '')
    .replace(/\s+/g, ' ')
    .trim()
  const qMatch =
    raw.match(/saved from url=\([^)]*\)https?:\/\/[^/]+\/respuesta\.php\?q=([a-z0-9_-]+)\/(\d+)/i) ||
    raw.match(/respuesta\.php\?q=([a-z0-9_-]+)\/(\d+)/i)
  const categoriaPath = (qMatch && qMatch[1]) || 'actualizado'
  const id = (qMatch && qMatch[2]) || ''

  const start = raw.search(/id=["']faq-content["']/i)
  const endUseful = raw.search(/Respuestas que otros encontraron útiles/i)
  const chunk =
    start >= 0
      ? raw.slice(start, endUseful > start ? endUseful : undefined)
      : raw
  const texto = htmlRespuestaATexto(chunk)
  if (!id || !texto || texto.length < 40) return null

  return {
    id,
    nombre: nombre || `Artículo ${id}`,
    enlace: `https://somosclave.cl/respuesta.php?q=${categoriaPath}/${id}`,
    categoriaPath,
    texto,
  }
}

/** Si el archivo es una página respuesta de Somos Clave, devuelve el doc RAG. */
export function docDesdeHtmlSomosClave(html) {
  const art = extraerArticuloDesdeHtmlSomosClave(html)
  if (!art) return null
  return articuloSomosClaveADoc(art)
}

/** Un artículo → 1 doc RAG (id sc-{id}) */
export function articuloSomosClaveADoc({ id, nombre, enlace, categoriaPath, html, texto }) {
  const sid = String(id || '').trim()
  if (!sid || !/^\d+$/.test(sid)) return null
  const titulo = String(nombre || `Artículo ${sid}`).replace(/\s+/g, ' ').trim()
  let body = texto || htmlRespuestaATexto(html)
  if (!body || body.length < 40) return null
  if (body.length > MAX_CHARS) body = body.slice(0, MAX_CHARS) + '\n…[contenido truncado]'

  const lineas = textoAContenido(body)
  if (lineas.length < 2) return null

  const cat = String(categoriaPath || 'actualizado').toLowerCase()
  const imagenes = extraerImagenesDesdeHtml(html, { limite: 16 })
  return {
    id: `sc-${sid}`,
    titulo,
    categoria: 'SOMOS CLAVE',
    tipo: 'somosclave',
    seccionPortal: `Somos Clave · ${cat}`,
    sinonimos: [sid, titulo, `id ${sid}`, cat].filter(Boolean),
    contenido: lineas,
    fuente: 'somosclave-km',
    enlace: enlace || `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
    scId: sid,
    imagenes,
    actualizadoEn: new Date().toISOString(),
  }
}

export async function guardarDocsSomosClave(db, docs) {
  if (!db) throw new Error('Firestore no disponible')
  const list = (docs || []).filter(Boolean)
  const CHUNK = 200
  for (let i = 0; i < list.length; i += CHUNK) {
    const batch = writeBatch(db)
    for (const d of list.slice(i, i + CHUNK)) {
      const { id, ...rest } = d
      batch.set(doc(db, COL_CONOCIMIENTO, id), { id, ...rest }, { merge: true })
    }
    await batch.commit()
  }
  return { ok: true, total: list.length }
}

/**
 * Publica todo el catálogo local Somos Clave (~348) a conocimiento_portal.
 * Requiere Auth admin (rules).
 */
export async function sincronizarSomosClaveLocalAFirestore(db, docsLocales) {
  if (!db) throw new Error('Firestore no disponible')
  const list = (docsLocales || []).filter(Boolean)
  if (!list.length) throw new Error('No hay artículos Somos Clave locales para publicar')
  return guardarDocsSomosClave(db, list)
}

/**
 * Few-shots en apex_aprendizaje desde títulos/extractos SC (create-only).
 * No sustituye el RAG: refuerza tono de tip con hechos reales.
 */
export async function nutrirSomosClaveAprendizaje(db, docsLocales, { limite = 120 } = {}) {
  if (!db) throw new Error('Firestore no disponible')
  const { getDoc, setDoc, serverTimestamp } = await import('firebase/firestore')
  const { COL_APRENDIZAJE } = await import('./chatAprendizajeLive.js')

  const list = (docsLocales || [])
    .filter((d) => d?.titulo && Array.isArray(d.contenido) && d.contenido.length >= 2)
    .slice(0, limite)

  let creados = 0
  let omitidos = 0
  for (const d of list) {
    const sid = String(d.scId || d.id || '').replace(/^sc-/, '')
    const id = `scseed_${sid}`.slice(0, 100)
    const ref = doc(db, COL_APRENDIZAJE, id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      omitidos += 1
      continue
    }
    const pregunta = String(d.titulo).trim().slice(0, 400)
    const respuesta = d.contenido.join('\n').trim().slice(0, 1200)
    if (pregunta.length < 8 || respuesta.length < 40) {
      omitidos += 1
      continue
    }
    await setDoc(ref, {
      pregunta,
      respuesta,
      tema: 'somosclave',
      tono: 'respetuoso',
      util: true,
      calidad: 'entrenable',
      clientId: 'seed_somos_clave',
      fuente: 'somosclave-km',
      scId: sid,
      creadoEn: serverTimestamp(),
    })
    creados += 1
  }
  return { ejemplos: creados, omitidos, totalDocs: list.length }
}

export async function contarDocsSomosClave(db) {
  if (!db) return 0
  const snap = await getDocsSafe(db)
  return snap
}

async function getDocsSafe(db) {
  const { getDocs } = await import('firebase/firestore')
  const snap = await getDocs(collection(db, COL_CONOCIMIENTO))
  let n = 0
  snap.forEach((s) => {
    const d = s.data() || {}
    if (d.tipo === 'somosclave' || String(d.id || s.id).startsWith('sc-')) n++
  })
  return n
}
