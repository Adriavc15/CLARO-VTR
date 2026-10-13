import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore'
import { IDS_CLAVE_SEED } from './idsClaveSeed.js'

export const COL_IDS_CLAVE = 'ids_clave_vtr'

const catFromPath = (pathCat) => {
  const c = String(pathCat || 'actualizado').toLowerCase()
  const map = {
    actualizado: null,
    transversal: 'FACTURACIÓN',
    hogar: 'FACTURACIÓN',
    retencion: 'FACTURACIÓN',
    movil: 'MOVIL',
    empresa: 'INFORMATIVO PARA EL ASESOR',
  }
  return map[c] ?? null
}

export function enlaceSomosClave(id, categoriaPath = 'actualizado') {
  return `https://somosclave.cl/respuesta.php?q=${categoriaPath}/${id}`
}

/** Normaliza un ítem de ID */
export function normalizarIdClave(raw) {
  const id = String(raw.id || raw.dataId || '').trim()
  if (!id || !/^\d+$/.test(id)) return null
  const nombre = String(raw.nombre || raw.title || raw.titulo || `Artículo ${id}`)
    .replace(/^\[[\d\-]+\]\s*/, '')
    .trim()
  const catPath = String(raw.categoriaPath || raw.categoriaSlug || raw.category || 'actualizado')
    .toLowerCase()
    .trim() || 'actualizado'
  const categoria =
    raw.categoria ||
    raw.categoriaLabel ||
    catFromPath(catPath) ||
    undefined
  return {
    id,
    nombre,
    enlace: raw.enlace || enlaceSomosClave(id, catPath),
    ...(categoria ? { categoria } : {}),
    categoriaPath: catPath,
    actualizadoEn: raw.actualizadoEn || new Date().toISOString(),
    fuente: raw.fuente || 'seed',
  }
}

/** Extrae IDs desde HTML guardado de Somos Clave (portal privado) */
export function extraerIdsDesdeHtml(html) {
  const text = String(html || '')
  const byId = new Map()

  const reFaq =
    /<div class="inbenta-km__faq"[^>]*data-id="(\d+)"[^>]*data-category="([^"]*)"[^>]*>/gi
  let m
  const starts = []
  while ((m = reFaq.exec(text)) !== null) {
    starts.push({ id: m[1], category: m[2], index: m.index, end: m.index + m[0].length })
  }

  for (let i = 0; i < starts.length; i++) {
    const cur = starts[i]
    const chunkEnd = i + 1 < starts.length ? starts[i + 1].index : Math.min(text.length, cur.end + 8000)
    const chunk = text.slice(cur.end, chunkEnd)
    const titleMatch = chunk.match(/class="title__faq__text">([\s\S]*?)<\/span>/i)
    const title = String(titleMatch ? titleMatch[1] : '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const item = normalizarIdClave({
      id: cur.id,
      nombre: title,
      categoriaPath: cur.category || 'actualizado',
      fuente: 'html-somosclave',
    })
    if (item) byId.set(item.id, item)
  }

  // Fallback: enlaces respuesta.php (con título del <a> si existe)
  const reLinkTitle =
    /<a[^>]+href="[^"]*respuesta\.php\?q=([a-z0-9_-]+)\/(\d+)"[^>]*>([\s\S]*?)<\/a>/gi
  while ((m = reLinkTitle.exec(text)) !== null) {
    const catPath = m[1]
    const id = m[2]
    const title = String(m[3] || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const prev = byId.get(id)
    const prevDebil = !prev || !prev.nombre || /^Artículo\s+\d+$/i.test(prev.nombre)
    if (prev && !prevDebil) continue
    const item = normalizarIdClave({
      id,
      nombre: title || `Artículo ${id}`,
      categoriaPath: catPath,
      fuente: title ? 'html-enlace-titulo' : 'html-enlace',
    })
    if (item) byId.set(id, item)
  }

  const reLink = /respuesta\.php\?q=([a-z0-9_-]+)\/(\d+)/gi
  while ((m = reLink.exec(text)) !== null) {
    const catPath = m[1]
    const id = m[2]
    if (byId.has(id)) continue
    const item = normalizarIdClave({
      id,
      nombre: `Artículo ${id}`,
      categoriaPath: catPath,
      fuente: 'html-enlace',
    })
    if (item) byId.set(id, item)
  }

  return Array.from(byId.values()).sort((a, b) => Number(a.id) - Number(b.id))
}

export async function cargarIdsClave(db) {
  if (!db) return IDS_CLAVE_SEED.map((x) => ({ ...x }))
  try {
    const snap = await getDocs(collection(db, COL_IDS_CLAVE))
    if (snap.empty) return IDS_CLAVE_SEED.map((x) => ({ ...x }))
    const out = []
    snap.forEach((s) => {
      const d = s.data() || {}
      const item = normalizarIdClave({ ...d, id: d.id || s.id })
      if (item) out.push(item)
    })
    return out.length ? out.sort((a, b) => Number(a.id) - Number(b.id)) : IDS_CLAVE_SEED.map((x) => ({ ...x }))
  } catch {
    return IDS_CLAVE_SEED.map((x) => ({ ...x }))
  }
}

export async function sincronizarIdsClave(db, lista) {
  if (!db) throw new Error('Firestore no disponible')
  const items = (lista || IDS_CLAVE_SEED).map(normalizarIdClave).filter(Boolean)
  const CHUNK = 400
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = writeBatch(db)
    for (const item of items.slice(i, i + CHUNK)) {
      batch.set(doc(db, COL_IDS_CLAVE, item.id), item, { merge: true })
    }
    await batch.commit()
  }
  return { ok: true, total: items.length }
}

export async function guardarIdClave(db, raw) {
  const item = normalizarIdClave(raw)
  if (!item) throw new Error('ID inválido')
  await setDoc(doc(db, COL_IDS_CLAVE, item.id), item, { merge: true })
  return item
}

export async function eliminarIdClave(db, id) {
  if (!db || !id) throw new Error('Falta id')
  await deleteDoc(doc(db, COL_IDS_CLAVE, String(id)))
  return { ok: true }
}

export { IDS_CLAVE_SEED }
